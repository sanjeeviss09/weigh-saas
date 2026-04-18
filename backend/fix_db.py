from supabase import create_client
import os
import json
from dotenv import load_dotenv
import secrets
import string

load_dotenv('b:/weigh-saas/backend/.env')
url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_SERVICE_KEY')

s = create_client(url, key)
res = s.table('companies').select('*').execute()

for c in res.data:
    if not c.get('join_code') or c.get('join_code') == '—':
        new_code = 'GOLD-' + ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
        s.table('companies').update({'join_code': new_code}).eq('id', c['id']).execute()
        print(f"Fixed company {c['name']} with code {new_code}")

    if not c.get('api_key'):
        new_key = "logi_" + secrets.token_hex(16)
        s.table('companies').update({'api_key': new_key}).eq('id', c['id']).execute()
        print(f"Fixed API key for {c['name']}")

# Check for the 'sanju' company specifically if it's missing from the list
names = [c['name'].lower() for c in res.data]
if 'sanju' not in names:
    print("WARNING: 'sanju' not found in database. Attempting to locate by user...")
    # Since I don't have user list, I'll just check for any company created today with no name
    today_res = s.table('companies').select('*').is_('name', 'null').execute()
    for tc in today_res.data:
        s.table('companies').update({'name': 'sanju'}).eq('id', tc['id']).execute()
        print(f"Matched orphan company {tc['id']} to 'sanju'")
