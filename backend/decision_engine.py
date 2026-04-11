import hashlib
from database import db
from datetime import datetime, timezone

def handle_error(file_name: str, raw_text: str, error_message: str, ai_output: dict = None, company_id: str = None):
    db.table("error_logs").insert({
        "company_id": company_id,
        "file_name": file_name,
        "raw_text": raw_text,
        "error_message": error_message,
        "ai_output": ai_output
    }).execute()

def handle_duplicate(file_name: str, file_hash: str, reason: str, company_id: str = None):
    db.table("duplicate_logs").insert({
        "company_id": company_id,
        "file_name": file_name,
        "hash": file_hash,
        "reason": reason
    }).execute()

def check_anomalies(parsed_data: dict, updated_tx: dict, company_id: str):
    # Detect huge weight differences
    gross = updated_tx.get('gross_weight') or 0
    tare = updated_tx.get('tare_weight') or 0
    if gross > 0 and tare > 0:
        if (gross - tare) > 60000: # Example logic for heavy duty trucks, metric depends on material
            db.table("alerts").insert({
                "company_id": company_id,
                "type": "anomaly",
                "message": f"Suspiciously high net weight calculation ({gross - tare} kg) for {updated_tx.get('vehicle_number')}",
                "severity": "high"
            }).execute()

def process_weighment_transaction(parsed_data: dict, file_id: str, company_id: str):
    vehicle_number = parsed_data.get("vehicle_number")
    if not vehicle_number:
        return

    gross = parsed_data.get("gross_weight")
    tare = parsed_data.get("tare_weight")
    if gross is not None and tare is not None and parsed_data.get("net_weight") is None:
        parsed_data["net_weight"] = abs(gross - tare)

    res = db.table("weighment_transactions").select("*").eq("company_id", company_id).eq("vehicle_number", vehicle_number).eq("status", "open").execute()
    open_tx = res.data[0] if res.data else None

    current_time = datetime.now(timezone.utc)
    current_time_str = current_time.isoformat()

    if not open_tx:
        # If both weights are provided instantly (like manual entry), mark as closed automatically
        is_complete = bool(parsed_data.get("gross_weight") and parsed_data.get("tare_weight"))
        
        g = parsed_data.get("gross_weight") or 0
        t = parsed_data.get("tare_weight") or 0
        # Always make gross the larger value
        first_w  = max(g, t) if is_complete else (g or t)
        second_w = min(g, t) if is_complete else None
        net_w    = abs(g - t) if is_complete else None
        
        rate    = parsed_data.get("rate_per_ton")
        amount  = round((net_w / 1000) * rate, 2) if (net_w and rate) else None
        
        new_tx = {
            "company_id":   company_id,
            "vehicle_number": vehicle_number,
            "gross_weight": first_w,
            "tare_weight":  second_w,
            "net_weight":   net_w,
            "material":     parsed_data.get("material"),
            "party_name":   parsed_data.get("party_name"),
            "slip_number":  parsed_data.get("slip_number"),
            "gross_time":   current_time_str,
            "tare_time":    current_time_str if is_complete else None,
            "status":       "closed" if is_complete else "open"
        }
        db.table("weighment_transactions").insert(new_tx).execute()
    else:
        # Check time window difference (e.g. 4 hours)
        gross_time_str = open_tx.get("gross_time")
        if gross_time_str:
            gross_time = datetime.fromisoformat(gross_time_str.replace("Z", "+00:00"))
            time_diff = (current_time - gross_time).total_seconds() / 3600
            
            if time_diff > 4:
                db.table("weighment_transactions").update({"status": "error"}).eq("id", open_tx["id"]).execute()
                new_tx = {
                    "company_id": company_id,
                    "vehicle_number": vehicle_number,
                    "gross_weight": parsed_data.get("gross_weight"),
                    "gross_time": current_time_str,
                    "status": "open"
                }
                db.table("weighment_transactions").insert(new_tx).execute()
                return

        updated_tx = {
            "tare_weight": parsed_data.get("tare_weight") or parsed_data.get("gross_weight"),
            "status": "closed",
            "tare_time": current_time_str,
            "updated_at": current_time_str
        }
        
        final_gross = open_tx.get('gross_weight') or 0
        final_tare = updated_tx.get('tare_weight') or 0
        
        if final_gross and final_tare:
            if final_tare > final_gross:
                final_gross, final_tare = final_tare, final_gross
                updated_tx['gross_weight'] = final_gross
                updated_tx['tare_weight'] = final_tare
            updated_tx['net_weight'] = final_gross - final_tare
            rate = parsed_data.get("rate_per_ton") or open_tx.get("rate_per_ton")
            if rate and updated_tx['net_weight'] > 0:
                updated_tx['amount'] = round((updated_tx['net_weight'] / 1000) * float(rate), 2)
                if not open_tx.get("rate_per_ton"):
                    updated_tx["rate_per_ton"] = rate

        if not open_tx.get("material") and parsed_data.get("material"):
            updated_tx["material"] = parsed_data.get("material")
            
        check_anomalies(parsed_data, updated_tx, company_id)    
        db.table("weighment_transactions").update(updated_tx).eq("id", open_tx["id"]).execute()
