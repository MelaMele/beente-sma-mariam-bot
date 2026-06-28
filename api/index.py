import os
import json
import requests
from supabase import create_client, Client

# ሚስጥራዊ ቁልፎችን ከ environment መውሰድ
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")

supabase: Client = create_client(url, key) if (url and key) else None

def handle_telegram_message(message):
    chat_id = message['chat']['id']
    text = message.get('text', '')
    user = message.get('from', {})
    
    username = user.get('username', '')
    full_name = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()

    # ተጠቃሚው /start ሲል
    if text.startswith('/start'):
        parts = text.split()
        referrer_id = parts[1] if len(parts) > 1 else None
        
        # ተጠቃሚውን በ Supabase መመዝገብ
        if supabase:
            existing = supabase.table("users").select("*").eq("telegram_id", chat_id).execute()
            if not existing.data:
                user_data = {
                    "telegram_id": chat_id,
                    "username": username,
                    "full_name": full_name,
                    "referred_by": int(referrer_id) if (referrer_id and referrer_id.isdigit()) else None
                }
                supabase.table("users").insert(user_data).execute()
                
                # ጋባዡ ካለ ነጥብ መጨመር
                if referrer_id and referrer_id.isdigit() and int(referrer_id) != chat_id:
                    supabase.rpc("increment_referral_count", {"user_id": int(referrer_id)}).execute()

        # ለተጠቃሚው የሚላክ የምላሽ ጽሑፍ
        share_link = f"https://t.me/beente-sma-mariam-bot?start={chat_id}" # እዚህ ላይ የቦትህን ትክክለኛ username ተካው
        welcome_msg = (
            f"እንኳን በደህና መጡ {full_name}!\n\n"
            f"ይህ 'በእንተ ስማ ለማርያም' ዕለታዊ የበረከት መድረክ ነው።\n"
            f"የእርስዎ ልዩ የማጋሪያ ሊንክ፦ {share_link}\n\n"
            f"ይህንን ሊንክ ለወዳጅዎ በማጋራት የበረከት አምባሳደር ይሁኑ! ሚኒ አፑን ለመክፈት ከታች ያለውን ቁልፍ ይጫኑ።"
        )
        
        # መልዕክቱን በቴሌግራም API መላክ
        payload = {
            "chat_id": chat_id,
            "text": welcome_msg,
            "reply_markup": {
                "inline_keyboard": [[
                    {"text": "🎁 መድረኩን ክፈት", "web_app": {"url": "https://beente-sma-mariam-bot.vercel.app"}}
                ]]
            }
        }
        requests.post(f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage", json=payload)

# ቪርሴል ፋይሉን ሲጠራው የሚሰራው ዋናው ፈንክሽን
def handler(request):
    try:
        body = json.loads(request.body.decode('utf-8'))
        if 'message' in body:
            handle_telegram_message(body['message'])
    except Exception as e:
        print(f"Error: {e}")
        
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'status': 'ok'})
    }
