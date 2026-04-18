import time
import os
import json
import sqlite3
import threading
import traceback
import requests
from pathlib import Path
from supabase import create_client
from dotenv import load_dotenv

# Load env
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

class NeuralHealer:
    def __init__(self):
        self.url = os.environ.get('SUPABASE_URL')
        self.key = os.environ.get('SUPABASE_SERVICE_KEY')
        self.db = create_client(self.url, self.key) if self.url and self.key else None
        self.ai_endpoint = os.environ.get('LOCAL_AI_ENDPOINT', 'http://localhost:11434/v1')
        self.ai_model = os.environ.get('LOCAL_MODEL_NAME', 'llama3')
        self.running = False
        self.base_path = Path(__file__).parent.parent

    def start(self):
        if not self.db:
            print("[NeuralHealer] WARNING: Supabase credentials missing. Healer inactive.")
            return
        
        print("[NeuralHealer] Neural Link established. Monitoring for systemic glitches...")
        self.running = True
        self.thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.thread.start()

    def _monitor_loop(self):
        while self.running:
            try:
                self._check_and_heal()
            except Exception as e:
                print(f"[NeuralHealer] Monitor error: {e}")
            time.sleep(60) # Scan every minute

    def _check_and_heal(self):
        # 1. Fetch recent unresolved errors
        res = self.db.table("error_logs").select("*").eq("resolved", False).limit(5).execute()
        errors = res.data or []
        
        for err in errors:
            print(f"[NeuralHealer] Intercepted Glitch: {err['error_message']}")
            self._attempt_heal(err)

    def _attempt_heal(self, error_record):
        msg = error_record.get('error_message', '')
        file_hint = error_record.get('file_name', '')
        
        print(f"[NeuralHealer] Analyzing anomaly: {msg}")
        
        # Call Local AI for repair instruction
        payload = {
            "model": self.ai_model,
            "messages": [
                {"role": "system", "content": "You are the LogiCrate Neural Sovereign Agent. You have full write-access to the codebase. When given an error and a file name, analyze the fix and provide a SEARCH/REPLACE block. Format: \nSEARCH\n<original code>\nREPLACE\n<fixed code>\nEND"},
                {"role": "user", "content": f"Error: {msg}\nFile: {file_hint}\nPlease suggest a surgical fix."}
            ],
            "stream": False
        }
        
        try:
            resp = requests.post(f"{self.ai_endpoint}/chat/completions", json=payload, timeout=12)
            ai_raw = resp.json()['choices'][0]['message']['content']
            
            # Active Repair Logic (Level 3)
            if "SEARCH" in ai_raw and "REPLACE" in ai_raw:
                success = self.apply_surgical_patch(file_hint, ai_raw)
                resolution = f"Autonomous Repair SUCCESS: {ai_raw[:100]}" if success else "Autonomous Repair FAILED: Path resolution error."
            else:
                resolution = f"Neural Analysis: {ai_raw[:200]}"
                
        except Exception as e:
            resolution = f"Neural Analysis Failure: {str(e)}"

        # Mark as resolved and log history
        self.db.table("error_logs").update({
            "resolved": True, 
            "resolution_notes": resolution
        }).eq("id", error_record['id']).execute()
        
        # Log to local history for audit trail
        history_file = self.base_path / "neural_history.log"
        with open(history_file, "a") as f:
            f.write(f"\n[{time.ctime()}] INTERVENTION in {file_hint}\nREASON: {msg}\nACTIONS: {resolution}\n{'-'*50}\n")

    def apply_surgical_patch(self, file_path_str, patch_text):
        """Level 3: Parse and apply SEARCH/REPLACE patches from AI."""
        try:
            # Simple path resolution (checks backend and frontend)
            potential_paths = [
                self.base_path / "backend" / file_path_str,
                self.base_path / "frontend" / "src" / file_path_str,
                self.base_path / "frontend" / "src" / "pages" / file_path_str,
                self.base_path / "frontend" / "src" / "components" / file_path_str
            ]
            
            target_path = None
            for p in potential_paths:
                if p.exists():
                    target_path = p
                    break
            
            if not target_path:
                print(f"[NeuralHealer] FAILED: Could not resolve path for {file_path_str}")
                return False

            # Parse patch_text for SEARCH/REPLACE
            import re
            match = re.search(r"SEARCH\n(.*?)\nREPLACE\n(.*?)\nEND", patch_text, re.DOTALL)
            if not match:
                return False
                
            search_block = match.group(1).strip()
            replace_block = match.group(2).strip()
            
            content = target_path.read_text(encoding='utf-8')
            if search_block in content:
                new_content = content.replace(search_block, replace_block)
                target_path.write_text(new_content, encoding='utf-8')
                print(f"[NeuralHealer] SUCCESS: Applied patch to {target_path.name}")
                return True
            else:
                print(f"[NeuralHealer] FAILED: SEARCH block not found in {target_path.name}")
                return False
                
        except Exception as e:
            print(f"[NeuralHealer] Patching Exception: {e}")
            return False

# Singleton instance
healer = NeuralHealer()
