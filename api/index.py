import os
import json
from http.server import BaseHTTPRequestHandler
import requests
from supabase import create_client, Client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")

supabase: Client = create_client(url, key) if (url and key) else None

def handle_telegram_message(message):
    if not supabase or not BOT_TOKEN:
        return
        
    chat_id = message['chat']['id']
    text = message.get('text', '')
    user = message.get('from', {})
    
    username = user.get('username', '')
    full_name = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()

    # ተጠቃሚው በሪፈራል ሊንክ ከገባ (ለምሳሌ /start 1234567)
    if text.startswith('/start'):
        parts = text.split()
        referrer_id = parts[1] if len(parts) > 1 else None
        
        # የተጠቃሚውን መኖር በዳታቤዝ ማረጋገጥ[cite: 1]
        existing = supabase.table("users").select("*").eq("telegram_id", chat_id).execute()[cite: 1]
        
        if not existing.data:[cite: 1]
            # አዲስ ተጠቃሚ መመዝገብ[cite: 1]
            user_data = {
                "telegram_id": chat_id,
                "username": username,
                "full_name": full_name,
                "referred_by": int(referrer_id) if (referrer_id and referrer_id.isdigit()) else None[cite: 1]
            }
            supabase.table("users").insert(user_data).execute()[cite: 1]
            
            # ጋባዡ ካለ የሪፈራል ቁጥሩን በ 1 ማሳደግ
            if referrer_id and referrer_id.isdigit() and int(referrer_id) != chat_id:
                # በ Supabase ላይ የሪፈራል ቁጥር ማሳደጊያ RPC መጥራት
                supabase.rpc("increment_referral_count", {"user_id": int(referrer_id)}).execute()
                
            # የእንኳን አደረሰህ መልዕክት እና የራሱ ማጋሪያ ሊንክ መስጠት
            bot_username = "YOUR_BOT_USERNAME" # የቦትህን ዩዘርኔም እዚህ ትተካዋለህ
            share_link = f"https://t.me/{bot_username}?start={chat_id}"
            
            welcome_msg = (
                f"እንኳን በደህና መጡ {full_name}!\n\n"
                f"ይህ 'በእንተ ስማ ለማርያም' ዕለታዊ የበረከት መድረክ ነው።\n"
                f"የእርስዎ ልዩ የማጋሪያ ሊንክ፦ {share_link}\n\n"
                f"ይህንን ሊንክ ለ7 ወዳጅዎ በማጋራት የበረከት አምባሳደር ይሁኑ!"
            )
            requests.post(f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage", json={
                "chat_id": chat_id,
                "text": welcome_msg
            })

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        update = json.loads(post_data.decode('utf-8'))
        
        if 'message' in update:
            handle_telegram_message(update['message'])
            
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"status": "ok"}).encode())
