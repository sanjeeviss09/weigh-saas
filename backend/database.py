import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

def get_supabase() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("CRITICAL ERROR: Supabase credentials not found in env!")
        return None
    
    # Validation for the new opaque key format vs old JWT format
    if not (SUPABASE_KEY.startswith("eyJ") or SUPABASE_KEY.startswith("sb_secret_")):
        print(f"CRITICAL ERROR: Invalid Supabase Key format detected. Expected 'eyJ...' or 'sb_secret_...'. Found: '{SUPABASE_KEY[:15]}...'")
        
    try:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"DB Error: {str(e)}")
        return None

db = get_supabase()
