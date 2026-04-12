import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

def get_supabase() -> Client:
    # Use fallback empty string to avoid NoneType errors
    url = SUPABASE_URL or ""
    key = SUPABASE_KEY or ""

    if not url or not key:
        print("⚠️  WARNING: Supabase credentials (URL/KEY) not found in environment variables.")
        return None
    
    # Validation for the new opaque key format vs old JWT format
    if not (key.startswith("eyJ") or key.startswith("sb_secret_")):
        print(f"⚠️  NOTICE: Non-standard Supabase Key format detected. If requests fail, check your SERVICE_ROLE key.")
        
    try:
        return create_client(url, key)
    except Exception as e:
        print(f"❌ DATABASE CONNECTION ERROR: {str(e)}")
        return None

db = get_supabase()
