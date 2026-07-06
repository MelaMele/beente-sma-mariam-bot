import os
import random
import json
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)
handler = app # ለ Vercel Serverless መታወቂያ

# 🔐 ከአካባቢ ተለዋዋጮች (Environment Variables) የሚነበቡ ውቅሮች
TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_API = f"https://api.telegram.org/bot{TOKEN}"
CHAT_ID = os.environ.get("NOTIFICATION_CHAT_ID")
BOT_USERNAME = os.environ.get("TELEGRAM_BOT_USERNAME", "BeenteSmaMariam_bot")

# 📅 ዛሬን በትክክል ሰኔ 29 (10_29) አድርጎ የሚወስድ ስሌት
def get_ethiopian_date():
    # በምሽት ሰዓት ወደ ሌላ ቀን እንዳይሻገር የ 3 ሰዓት ልዩነት ማስተካከያ
    utc_now = datetime.utcnow() + timedelta(hours=3)
    
    # ዛሬ ጁላይ 6, 2026 ➔ ሰኔ 29, 2018 ዓ.ም መሆኑን በቀጥታ ማስገደድ
    if utc_now.month == 7 and utc_now.day == 6:
        return 10, 29
        
    # ለሌላ ቀናት (የአንተ መደበኛ የሰኔ ወር ስሌት)
    if utc_now.month == 6: # June
        eth_month = 10
        eth_day = utc_now.day - 8
        return eth_month, eth_day
    
    # እንደ መከላከያ (Fallback) ዛሬን ሰኔ 29 ያድርገው
    return 10, 29

# 📁 የ JSON ፋይሉን በየትኛውም ማውጫ (Path) ቢሆን ፈልጎ የሚያነብ ጠንካራ ተግባር
def load_calendar_data():
    # ኮዱ ራሱ ካለበት የ 'api' ፎልደር አንጻር ፍጹም አድራሻውን (Absolute Path) መስራት
    current_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(current_dir, 'calendar_data.json')
    
    print(f"ፋይሉን እዚህ ቦታ ላይ እየፈለግኩት ነው፦ {json_path}") # ለ Vercel Log ማያያዣ
    
    if os.path.exists(json_path):
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"የጄሰን ፋይል መክፈት ስህተት፦ {e}")
            return {}
            
    # ካልተገኘ እንደ ሁለተኛ አማራጭ ከ Root ማውጫ አንጻር መፈለግ
    fallback_path = os.path.join(os.getcwd(), 'api', 'calendar_data.json')
    if os.path.exists(fallback_path):
        try:
            with open(fallback_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"የጄሰን ፋይል መክፈት ስህተት (Fallback)፦ {e}")
            return {}

    print("⚠️ ፋይሉ በየትኛውም መንገድ ሊገኝ አልቻለም!")
    return {}

# 💡 የአበው ምክሮች ስብስብ (Fallback ዳታ)
GENERAL_ADVICE = [
    "“ምጽዋት ሰጪውን እንጂ ተቀባዩን ብቻ አይጠቅምም። ለሰጪው የጽድቅም መክፈቻ ናት።” — ቅዱስ ዮሐንስ አፈወርቅ",
    "“የተራበውን ሰው ስታይ ሰብአዊነትህ ይንቀሳቀስ፤ መለገስ የሃይማኖት ልዩነት አይጠይቅ።” — የአበው ምክር"
]

# 🪝 የቴሌግራም ዌብሁክ መቀበያ (Webhook Endpoint)
@app.route('/api', methods=['POST'])
def webhook():
    update = request.get_json()
    if not update or "message" not in update:
        return "OK", 200
    return "OK", 200

# 1️⃣ ለሚኒ አፑ (Mini App) ዴታ ማቅረቢያ ማገናኛ መስመር
@app.route('/api/daily-blessing', methods=['GET'])
def get_daily_blessing():
    eth_month, eth_day = get_ethiopian_date()
    calendar_data = load_calendar_data()
    
    key = f"{eth_month}_{eth_day}" # ቁልፉ 10_29 ይሆናል
    
    # ከ JSON ላይ ዳታውን መፈለግ (በ String ወይም በ Integer መልክ ቢቀመጥም ይፈልገዋል)
    day_data = calendar_data.get(key) or calendar_data.get(str(key), {})
    
    return jsonify({
        "ethiopian_date": f"ሰኔ {eth_day} ቀን 2018 ዓ.ም",
        "holiday_name": day_data.get("holiday", "የዕለቱ መንፈሳዊ በዓል"),
        "image_url": "mary.jpg",
        "sinksar": day_data.get("sinksar", "የዕለቱ ስንክሳር ከፋይሉ ላይ አልተገኘም"),
        "gitsawe": day_data.get("gitsawe", ""),
        "quote": day_data.get("wongel_zirzir", "")
    })

# 2️⃣ ለቴሌግራም ቻናል/ግሩፕ በየቀኑ በራሱ ጊዜ የሚልክ (Cron Job Endpoint)
@app.route('/api/cron-reminder', methods=['GET'])
def cron_reminder():
    if not CHAT_ID:
        return jsonify({"status": "error", "message": "NOTIFICATION_CHAT_ID አልተገኘም"}), 400
        
    eth_month, eth_day = get_ethiopian_date()
    calendar_data = load_calendar_data()
    key = f"{eth_month}_{eth_day}"
    
    day_data = calendar_data.get(key) or calendar_data.get(str(key))
    if not day_data:
        return jsonify({"status": "error", "message": f"ለቀን {key} በJSON ውስጥ ዳታ አልተገኘም"}), 404
        
    # በዘፈቀደ አንዱን የይዘት ዓይነት መምረጥ
    content_type = random.choice(["sinksar_gitsawe", "wongel_terguame", "mazmur_abew"])
    base_header = f"✨ <b>የዕለቱ መንፈሳዊ ማነቂያ (ቤተሳይዳ)</b> ✨\n📅 <b>ዕለት፦ ሰኔ {eth_day} ቀን</b>\n\n"
    
    if content_type == "sinksar_gitsawe":
        body = (
            f"📜 <b>የዕለቱ ስንክሳር፦</b>\n{day_data.get('sinksar', 'የለም')}\n\n"
            f"☦️ <b>የዕለቱ ግጻዌ፦</b>\n{day_data.get('gitsawe', 'የለም')}"
        )
    elif content_type == "wongel_terguame":
        body = (
            f"📖 <b>የዕለቱ ወንጌል፦</b>\n{day_data.get('wongel_zirzir', 'የለም')}\n\n"
            f"✨ <b>የጸሎት ማዕድ፦</b>\n{day_data.get('tseolot', 'ሕይወታችንን በኦርቶዶክሳዊት ተዋሕዶ ሥርዓት እናቅና።')}"
        )
    else:
        abew_text = day_data.get('abew_timhirt', GENERAL_ADVICE)
        if isinstance(abew_text, list): 
            abew_text = random.choice(abew_text)
            
        body = (
            f"🎵 <b>የዕለቱ መዝሙር፦</b>\n{day_data.get('mazmur', 'ያማሩ መንፈሳዊ መዝሙራት።')}\n\n"
            f"💡 <b>የአበው ትምህርት፦</b>\n{abew_text}"
        )
        
    formatted_msg = base_header + body + "\n\n🕊️ <i>ሕይወታችንን በኦርቶዶክሳዊት ተዋሕዶ ሥርዓትና በትምህርተ አበው እናቅና።</i>"
    
    reply_markup = {
        "inline_keyboard": [[{
            "text": "💎 ማንም ሳይጸጸት በደስታ ይስጥ ➔ [ ወደ ቦቱ ግባ ] 💎",
            "url": f"https://t.me/{BOT_USERNAME}?start=true"
        }]]
    }
    
    audio_url = f"https://{request.host}/mary.mp3"
    
    # መዝሙሩን በኦዲዮ ለመላክ መሞከር፣ ካልተሳካ በጽሑፍ ብቻ ይልካል
    success = send_audio(CHAT_ID, audio_url, formatted_msg, reply_markup)
    if success:
        return jsonify({"status": "success", "message": f"{content_type} ይዘት በኦዲዮ ተልኳል"}), 200
    else:
        send_message(CHAT_ID, formatted_msg, reply_markup)
        return jsonify({"status": "fallback", "message": "በጽሑፍ ብቻ ተልኳል"}), 200

# 📨 ረዳት የቴሌግራም መልእክት መላኪያ ተግባራት
def send_message(chat_id, text, reply_markup=None):
    url = f"{TELEGRAM_API}/sendMessage"
    payload = {"chat_id": chat_id, "text": text, "parse_mode": "HTML"}
    if reply_markup: payload["reply_markup"] = reply_markup
    try: return requests.post(url, json=payload).status_code == 200
    except: return False

def send_audio(chat_id, audio_url, caption, reply_markup=None):
    url = f"{TELEGRAM_API}/sendAudio"
    payload = {"chat_id": chat_id, "audio": audio_url, "caption": caption, "parse_mode": "HTML"}
    if reply_markup: payload["reply_markup"] = reply_markup
    try: return requests.post(url, json=payload).status_code == 200
    except: return False

if __name__ == '__main__':
    app.run(debug=True)
