import asyncio
import os
from fastapi import FastAPI, BackgroundTasks, Query, Header, HTTPException
from pydantic import BaseModel
from database import db
from ai_engine import extract_weighment_data
from decision_engine import process_weighment_transaction, handle_duplicate, handle_error
from models import WeighmentData, CorrectionRequest
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from neural_healer import healer

print("STARTING LOGICRATE BACKEND...")
print(f"Current Directory: {os.getcwd()}")
print(f"PYTHONPATH: {os.environ.get('PYTHONPATH')}")

SUPER_ADMIN_EMAIL = os.environ.get("SUPER_ADMIN_EMAIL", "sanjeevinick09@gmail.com")

app = FastAPI(title="LogiRate AI SaaS")

# Ensure static directory exists
if not os.path.exists("static"):
    os.makedirs("static")

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/health")
def health_check():
    return {"status": "online", "version": "1.1.0", "engine": "Gemini Neural Link"}

@app.get("/healer/status")
def healer_status():
    return {"status": "active" if healer.is_running else "idle"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

process_queue = None

class UploadPayload(BaseModel):
    file_name: str
    file_hash: str
    raw_text: str

class ChatRequest(BaseModel):
    message: str
    company_id: Optional[str] = None
    company_name: Optional[str] = None

class OperatorCodeRequest(BaseModel):
    name: str
    contact: str
    message: Optional[str] = ""

async def verify_api_key(x_api_key: str):
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API Key missing")
    res = db.table("companies").select("id").eq("api_key", x_api_key).execute()
    if not res.data:
        raise HTTPException(status_code=401, detail="Invalid API Key")
    return res.data[0]["id"]

async def process_pdf_worker(queue: asyncio.Queue):
    while True:
        payload, company_id = await queue.get()
        filename = payload.file_name
        file_hash = payload.file_hash
        raw_text = payload.raw_text
        
        try:
            res = db.table("duplicate_logs").select("id").eq("hash", file_hash).execute()
            if res.data: continue 

            dup_res = db.table("weighment_files").select("id").eq("file_hash", file_hash).execute()
            if dup_res.data:
                handle_duplicate(filename, file_hash, "Binary exact match", company_id)
                continue

            corrections_res = []
            try:
                c_res = db.table("corrections").select("*").eq("company_id", company_id).order("created_at", desc=True).limit(5).execute()
                corrections_res = c_res.data
            except Exception: pass

            try:
                parsed_data = await extract_weighment_data(raw_text, past_corrections=corrections_res)
            except Exception as e:
                handle_error(filename, raw_text, str(e), None, company_id)
                continue

            file_record = {
                "company_id": company_id,
                "file_name": filename,
                "file_hash": file_hash,
                "raw_text": raw_text,
                "parsed_json": parsed_data,
                "status": "processed"
            }
            
            inserted = db.table("weighment_files").insert(file_record).execute()
            file_id = inserted.data[0]["id"]
            process_weighment_transaction(parsed_data, file_id, company_id)
            print(f"Successfully processed {filename} for company {company_id}")
            
        except Exception as e:
            handle_error(filename, "", f"Catastrophic failure: {str(e)}", None, company_id)
        finally:
            queue.task_done()

@app.on_event("startup")
async def startup_event():
    global process_queue
    print("LogiCrate Neural Backend Starting...")
    healer.start()
    if db is None:
        print("CRITICAL: Database not initialized. Backend may fail.")
    
    loop = asyncio.get_running_loop()
    process_queue = asyncio.Queue()
    loop.create_task(process_pdf_worker(process_queue))

@app.post("/api/upload")
async def api_upload(payload: UploadPayload, x_api_key: Optional[str] = Header(None)):
    company_id = await verify_api_key(x_api_key)
    await process_queue.put((payload, company_id))
    return {"status": "queued", "message": "Payload accepted for processing"}

@app.get("/weighments")
def get_weighments(company_id: str = None, company_name: str = None, search: str = None, status: str = None):
    """
    Returns weighments for a company. 
    Searches both by company_id (station's own records) AND by party_name matching company_name
    so that client companies can see their weighments from any station.
    If both are omit, returns all weighments (for Super Admin).
    """
    results = []
    
    if not company_id and not company_name:
        query = db.table("weighment_transactions").select("*")
        if status: query = query.eq("status", status)
        if search: query = query.ilike("vehicle_number", f"%{search}%")
        res = query.order("created_at", desc=True).limit(200).execute()
        results.extend(res.data or [])
    else:
        # 1. Get weighments owned by this station (company_id match)
        if company_id:
            query = db.table("weighment_transactions").select("*").eq("company_id", company_id)
            if status:
                query = query.eq("status", status)
            if search:
                query = query.ilike("vehicle_number", f"%{search}%")
            res = query.order("created_at", desc=True).limit(50).execute()
            results.extend(res.data or [])
        
        # 2. Also get weighments where this company is the party/client (from other stations)
        if company_name:
            query2 = db.table("weighment_transactions").select("*").ilike("party_name", f"%{company_name}%")
            if company_id:
                query2 = query2.neq("company_id", company_id)  # avoid duplicates
            if status:
                query2 = query2.eq("status", status)
            if search:
                query2 = query2.ilike("vehicle_number", f"%{search}%")
            res2 = query2.order("created_at", desc=True).limit(50).execute()
            results.extend(res2.data or [])
    
    # Sort combined results by created_at desc
    results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return {"data": results[:200]}

@app.get("/dashboard")
def get_dashboard_stats(company_id: str = None, company_name: str = None):
    try:
        all_tx = []
        if not company_id and not company_name:
            res = db.table("weighment_transactions").select("*").execute()
            all_tx.extend(res.data or [])
        else:
            if company_id:
                res = db.table("weighment_transactions").select("*").eq("company_id", company_id).execute()
                all_tx.extend(res.data or [])

            if company_name:
                res2 = db.table("weighment_transactions").select("*").ilike("party_name", f"%{company_name}%")
                if company_id:
                    res2 = res2.neq("company_id", company_id)
                res2 = res2.execute()
                all_tx.extend(res2.data or [])

        total_net = 0
        for t in all_tx:
            val = t.get("net_weight")
            if val is not None: total_net += float(val)

        open_tx   = [t for t in all_tx if t.get("status") == "open"]
        closed_tx = [t for t in all_tx if t.get("status") == "closed"]

        total_amount = 0.0
        for t in closed_tx:
            amt = t.get("amount")
            if amt is None:
                amt = t.get("rate_per_ton")
            if amt is not None:
                total_amount += float(amt)

        alerts_count = 0
        if company_id:
            try:
                alerts_res = db.table("alerts").select("*").eq("company_id", company_id).eq("resolved", False).execute()
                alerts_count = len(alerts_res.data or [])
            except: pass

        recent_errors = []
        if company_id:
            try:
                errors_res = db.table("error_logs").select("*").eq("company_id", company_id).order("created_at", desc=True).limit(5).execute()
                recent_errors = errors_res.data or []
            except: pass

        join_code = "—"
        if company_id:
            try:
                comp_res = db.table("companies").select("join_code").eq("id", company_id).single().execute()
                if comp_res.data:
                    join_code = comp_res.data.get("join_code", "—")
            except: pass

        return {
            "total_transactions": len(all_tx),
            "total_net_weight":   round(total_net, 2),
            "open_transactions":  len(open_tx),
            "closed_transactions": len(closed_tx),
            "total_amount":       round(total_amount, 2),
            "active_alerts":      alerts_count,
            "recent_errors":      recent_errors,
            "join_code":         join_code
        }
    except Exception as e:
        import traceback
        return {"error": str(e), "traceback": traceback.format_exc()}


@app.get("/analytics")
def get_analytics(company_id: str = None, company_name: str = None):
    from datetime import datetime
    from collections import defaultdict

    try:
        all_tx = []
        if not company_id and not company_name:
            res = db.table("weighment_transactions").select("*").execute()
            all_tx.extend(res.data or [])
        else:
            if company_id:
                res = db.table("weighment_transactions").select("*").eq("company_id", company_id).execute()
                all_tx.extend(res.data or [])

            if company_name:
                res2 = db.table("weighment_transactions").select("*").ilike("party_name", f"%{company_name}%")
                if company_id:
                    res2 = res2.neq("company_id", company_id)
                res2 = res2.execute()
                all_tx.extend(res2.data or [])

        daily_counts = defaultdict(lambda: {"vehicles": 0, "amount": 0.0})
        monthly_counts = defaultdict(lambda: {"vehicles": 0, "amount": 0.0})
        yearly_counts = defaultdict(lambda: {"vehicles": 0, "amount": 0.0})
        quarterly_counts = defaultdict(lambda: {"vehicles": 0, "amount": 0.0})

        for t in all_tx:
            dt_str_raw = t.get("created_at")
            if not dt_str_raw: continue
            
            dt_str = dt_str_raw[:10]  # 'YYYY-MM-DD'
            try:
                dt = datetime.strptime(dt_str, "%Y-%m-%d")
            except:
                continue
                
            month_str = dt.strftime("%Y-%m")
            year_str = dt.strftime("%Y")
            q = (dt.month - 1) // 3 + 1
            quarter_str = f"{year_str}-Q{q}"

            amt = t.get("amount")
            if amt is None: amt = t.get("rate_per_ton")
            try:
                amt = float(amt) if amt is not None else 0.0
            except:
                amt = 0.0

            daily_counts[dt_str]["vehicles"] += 1
            daily_counts[dt_str]["amount"] += amt
            
            monthly_counts[month_str]["vehicles"] += 1
            monthly_counts[month_str]["amount"] += amt

            yearly_counts[year_str]["vehicles"] += 1
            yearly_counts[year_str]["amount"] += amt

            quarterly_counts[quarter_str]["vehicles"] += 1
            quarterly_counts[quarter_str]["amount"] += amt

        # Format for Recharts
        def to_array(d, label_key):
            sorted_keys = sorted(d.keys())
            return [{label_key: k, "vehicles": d[k]["vehicles"], "amount": round(d[k]["amount"], 2)} for k in sorted_keys]

        return {
            "daily": to_array(daily_counts, "date"),
            "monthly": to_array(monthly_counts, "month"),
            "quarterly": to_array(quarterly_counts, "quarter"),
            "yearly": to_array(yearly_counts, "year"),
        }
    except Exception as e:
        import traceback
        return {"error": str(e), "traceback": traceback.format_exc()}


@app.post("/correction")
def post_correction(req: CorrectionRequest):
    file_res = db.table("weighment_files").select("parsed_json").eq("id", req.file_id).execute()
    if not file_res.data:
        return {"error": "File not found"}
        
    original = file_res.data[0]["parsed_json"]
    
    correction = {
        "company_id": req.company_id,
        "weighment_file_id": req.file_id,
        "original_data": original,
        "corrected_data": req.corrected_data.dict(exclude_unset=True),
        "pattern_notes": req.pattern_notes
    }
    db.table("corrections").insert(correction).execute()
    return {"status": "success"}

@app.get("/errors")
def get_errors(company_id: str):
    res = db.table("error_logs").select("*").eq("company_id", company_id).order("created_at", desc=True).limit(20).execute()
    return {"data": res.data}

@app.get("/duplicates")
def get_duplicates(company_id: str):
    res = db.table("duplicate_logs").select("*").eq("company_id", company_id).order("created_at", desc=True).execute()
    return {"data": res.data}


# ─────────────────────────────────────────────────────────────
# SUPER ADMIN ENDPOINTS — restricted to SUPER_ADMIN_EMAIL
# ─────────────────────────────────────────────────────────────

def verify_super_admin(x_admin_email: Optional[str] = None):
    if not x_admin_email or x_admin_email.strip().lower() != SUPER_ADMIN_EMAIL.lower():
        raise HTTPException(status_code=403, detail="Super admin access denied")

@app.get("/super/stats")
def super_stats(x_admin_email: Optional[str] = Header(None)):
    verify_super_admin(x_admin_email)
    companies = db.table("companies").select("id,name,created_at").execute()
    transactions = db.table("weighment_transactions").select("id,status,net_weight").execute()
    errors = db.table("error_logs").select("id").execute()
    total_net = sum(t.get("net_weight", 0) or 0 for t in transactions.data)
    return {
        "total_companies": len(companies.data),
        "total_transactions": len(transactions.data),
        "total_errors": len(errors.data),
        "total_net_weight": total_net,
    }

@app.get("/super/companies")
def super_companies(x_admin_email: Optional[str] = Header(None)):
    verify_super_admin(x_admin_email)
    res = db.table("companies").select("id,name,api_key,join_code,created_at").order("created_at", desc=True).execute()
    return {"data": res.data}

@app.get("/super/company/{company_id}/transactions")
def super_company_transactions(company_id: str, x_admin_email: Optional[str] = Header(None)):
    verify_super_admin(x_admin_email)
    res = db.table("weighment_transactions").select("*").eq("company_id", company_id).order("created_at", desc=True).limit(100).execute()
    return {"data": res.data}

@app.get("/super/errors")
def super_errors(x_admin_email: Optional[str] = Header(None)):
    verify_super_admin(x_admin_email)
    res = db.table("error_logs").select("*").order("created_at", desc=True).limit(50).execute()
    return {"data": res.data}

@app.delete("/super/company/{company_id}")
def super_delete_company(company_id: str, x_admin_email: Optional[str] = Header(None)):
    verify_super_admin(x_admin_email)
    db.table("companies").delete().eq("id", company_id).execute()
    return {"status": "deleted"}

class CreateCompanyRequest(BaseModel):
    name: str

@app.post("/super/company/create")
def super_create_company(req: CreateCompanyRequest, x_admin_email: Optional[str] = Header(None)):
    """Super Admin creates a new company and generates all codes."""
    verify_super_admin(x_admin_email)
    import secrets, string
    join_code = "JOIN-" + "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
    api_key = "logi_" + secrets.token_hex(16)
    res = db.table("companies").insert({
        "name": req.name,
        "api_key": api_key,
        "join_code": join_code
    }).execute()
    return {"data": res.data[0]}

class UpdateJoinCodeRequest(BaseModel):
    join_code: str

@app.post("/super/company/{company_id}/join-code")
def super_update_join_code(company_id: str, req: UpdateJoinCodeRequest, x_admin_email: Optional[str] = Header(None)):
    verify_super_admin(x_admin_email)
    res = db.table("companies").update({"join_code": req.join_code.upper()}).eq("id", company_id).execute()
    return {"data": res.data[0]}

class UpdatePlanRequest(BaseModel):
    company_id: str
    plan: str

@app.post("/company/update-plan")
def update_company_plan(req: UpdatePlanRequest):
    """Update company table plan when checking out from UI. (Test mode only - no signature validation)"""
    res = db.table("companies").update({"plan": req.plan}).eq("id", req.company_id).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Company not found")
    return {"status": "success", "data": res.data[0]}

class SuperUpdatePlanRequest(BaseModel):
    plan: str

@app.post("/super/company/{company_id}/plan")
def super_update_company_plan(company_id: str, req: SuperUpdatePlanRequest, x_admin_email: Optional[str] = Header(None)):
    verify_super_admin(x_admin_email)
    res = db.table("companies").update({"plan": req.plan}).eq("id", company_id).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Company not found")
    return {"status": "success", "data": res.data[0]}

@app.get("/super/users")
def super_get_users(x_admin_email: Optional[str] = Header(None)):
    verify_super_admin(x_admin_email)
    # Note: Supabase Auth users aren't directly in a public table, 
    # but we can fetch them via the GoTrue admin API if needed.
    # For now, we return companies as they are the primary entity.
    res = db.table("companies").select("id, name, created_at").execute()
    return {"data": res.data}

class ManualWeighmentRequest(WeighmentData):
    company_id: str

@app.post("/weighment/manual")
def create_manual_weighment(data: ManualWeighmentRequest):
    """Manually insert a weighment record (bypassing AI)."""
    from decision_engine import process_weighment_transaction
    
    # Pass arguments in correct order: parsed_data (dict), file_id (str), company_id (str)
    process_weighment_transaction(data.dict(), "MANUAL_ENTRY", data.company_id)
    return {"status": "success"}

@app.get("/super/join-codes")
def super_get_join_codes(x_admin_email: Optional[str] = Header(None)):
    verify_super_admin(x_admin_email)
    res = db.table("companies").select("id, name, join_code").execute()
    return {"data": res.data}

@app.get("/super/all-weighments")
def super_get_all_weighments(x_admin_email: Optional[str] = Header(None)):
    verify_super_admin(x_admin_email)
    res = db.table("weighment_transactions").select("*, companies(name)").order("created_at", desc=True).limit(50).execute()
    return {"data": res.data}

# ─────────────────────────────────────────────────────────────
# PUBLIC: Join code validation (uses service_role, bypasses RLS)
# ─────────────────────────────────────────────────────────────
@app.get("/validate-join-code")
def validate_join_code(code: str):
    """Publicly accessible endpoint to verify a join code is valid."""
    if not code or len(code) < 4:
        raise HTTPException(status_code=400, detail="Invalid code format")
    code = code.strip().upper()
    res = db.table("companies").select("id, name, join_code").eq("join_code", code).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Join code not found")
    company = res.data[0]
    return {"valid": True, "company_id": company["id"], "company_name": company["name"]}

@app.get("/weighment/active/{vehicle_number}")
def get_active_weighment(vehicle_number: str, company_id: str = Query(...)):
    """Check if there is an open transaction for a vehicle at a specific company."""
    res = db.table("weighment_transactions") \
            .select("*") \
            .eq("company_id", company_id) \
            .eq("vehicle_number", vehicle_number.upper()) \
            .eq("status", "open") \
            .execute()
    
    if not res.data:
        return {"active": False}
    return {"active": True, "transaction": res.data[0]}

class RegisterCompanyRequest(BaseModel):
    name: str
    phone: Optional[str] = None
    plan: Optional[str] = "standard"
    custom_join_code: Optional[str] = None

@app.post("/company/register")
def register_company(req: RegisterCompanyRequest):
    """Create a new company/station. Uses service_role key so RLS is bypassed."""
    import secrets, string
    name = req.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Station name is required")
    
    # Use custom code if provided, otherwise auto-generate
    if req.custom_join_code:
        join_code = req.custom_join_code.strip().upper()
    else:
        join_code = "GOLD-" + "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
    
    api_key = "logi_" + secrets.token_hex(16)
    
    try:
        res = db.table("companies").insert({
            "name": name,
            "api_key": api_key,
            "join_code": join_code,
            "plan": req.plan,
            "phone": req.phone
        }).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to create station in database")
        company = res.data[0]
        return {
            "company_id": company["id"],
            "company_name": company["name"],
            "join_code": company["join_code"],
            "api_key": company["api_key"]
        }
    except Exception as e:
        error_msg = str(e)
        if "column companies.phone does not exist" in error_msg:
            raise HTTPException(status_code=500, detail="Database Error: Missing 'phone' column in companies table. Please run the SQL fix.")
        raise HTTPException(status_code=500, detail=f"Database Error: {error_msg}")

@app.get("/agent/config/{company_id}")
def get_agent_config(company_id: str):
    """Generates the config.json for the PC Agent."""
    res = db.table("companies").select("api_key").eq("id", company_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Company not found")
    
    api_key = res.data[0]["api_key"]
    config = {
        "api_url": os.environ.get("VITE_API_URL", "https://logicrate-backend.onrender.com"),
        "api_key": api_key,
        "company_id": company_id,
        "watch_path": "C:\\Weighments",
        "sync_interval": 30
    }
    
    from fastapi.responses import JSONResponse
    return JSONResponse(
        content=config,
        headers={"Content-Disposition": 'attachment; filename="config.json"'}
    )

@app.post("/api/chat")
async def api_chat(req: ChatRequest):
    """Simple AI Support logic that provides context-aware answers."""
    msg = req.message.lower()
    
    # Context gathering
    count = 0
    if req.company_id:
        res = db.table("weighment_transactions").select("id", count="exact").eq("company_id", req.company_id).execute()
        count = res.count or 0
    
    # Simple logic-based response (simulation of an LLM agent)
    if "hello" in msg or "hi" in msg:
        return {"response": f"Hello! I am LogiBot. I see you have processed {count} weighments so far. How can I assist you today?"}
    elif "status" in msg or "working" in msg:
        return {"response": "The LogiCrate Neural Link is fully operational. All systems green."}
    elif "agent" in msg or "pc" in msg or "download" in msg:
        return {"response": "You can download the PC Agent from the 'PC Agent Hub' in your sidebar. Ensure you also download the config.json file!"}
    elif "weighment" in msg or "slip" in msg:
        return {"response": f"Your station has recorded {count} transactions. You can view them in the Global Weighments tab."}
    elif "help" in msg:
        return {"response": "I can help you with agent setup, finding weighments, or checking system status. What's on your mind?"}
    else:
        return {"response": "I'm not sure about that, but our command centre is available 24/7 on WhatsApp (+91 95005 93997). Shall I link you to them?"}

@app.get("/healer/status")
def get_healer_status():
    """Check the health of the autonomous healing agent."""
    return {
        "active": healer.running,
        "interventions": 0, # Could count from log if needed
        "status": "Neural Sovereign: ONLINE" if healer.running else "Neural Sovereign: OFFLINE",
        "mode": "Sovereign Autonomy (Level 3)"
    }

@app.get("/healer/history")
def get_healer_history(x_admin_email: Optional[str] = Header(None)):
    """Fetch the neural audit trail for review."""
    from database import db
    # verify_super_admin(x_admin_email)
    
    log_file = healer.base_path / "neural_history.log"
    if not log_file.exists():
        return {"history": "No interventions recorded in this epoch."}
    
    return {"history": log_file.read_text()}
