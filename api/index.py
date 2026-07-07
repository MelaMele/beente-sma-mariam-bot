import os
import random
import json
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)
handler = app 

TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_API = f"https://api.telegram.org/bot{TOKEN}"
CHAT_ID = os.environ.get("NOTIFICATION_CHAT_ID")
BOT_USERNAME = os.environ.get("TELEGRAM_BOT_USERNAME", "BeenteSmaMariam_bot")

# 💡 የአበው ምክሮች ስብስብ
GENERAL_ADVICE = [
    "“ምጽዋት ሰጪውን እንጂ ተቀባዩን ብቻ አይጠቅምም። ለሰጪው የጽድቅም መክፈቻ ናት።” — ቅዱስ ዮሐንስ አፈወርቅ",
    "“የተራበውን ሰው ስታይ ሰብአዊነትህ ይንቀሳቀስ፤ መለገስ የሃይማኖት ልዩነት አይጠይቅም።” — የአበው ምክር",
    "“ምጽዋት ስታደርግ ቀኝህ የምታደርገውን ግራህ አያውቀው የተባለው ለትዕቢት እንዳይሆንብህ ነው።” — ቅዱስ ባስልዮስ ዘቂሳሪያ"
]

# 📅 የሰርቨሩን (UTC) ቀን ወደ ትክክለኛው የኢትዮጵያ ቀን መቀየሪያ
def get_ethiopian_date():
    utc_now = datetime.utcnow() + timedelta(hours=3) # የአዲስ አበባ ሰዓት
    if utc_now.month == 7: # ጁላይ
        eth_month = 10 # ሰኔ
        eth_day = utc_now.day + 23
        if eth_day > 30:
            eth_month = 11 # ሐምሌ
            eth_day = eth_day - 30
    elif utc_now.month == 6: # ጁኔ
        eth_month = 10 # ሰኔ
        eth_day = utc_now.day - 8
    else:
        eth_month = 10
        eth_day = utc_now.day
    return eth_month, eth_day

# 📁 በ Repository ውስጥ ያለውን calendar_data.json ፋይል የሚያነብ ፋንክሽን
def load_calendar_data():
    possible_paths = [
        os.path.join(os.path.dirname(__file__), '..', 'calendar_data.json'),
        'calendar_data.json'
    ]
    for path in possible_paths:
        if os.path.exists(path):
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                continue
    return {}

# 🛠️ ማዕከላዊ የዕለቱን ዳታ ማግኛ ፋንክሽን (Fallback መረጃን ጨምሮ)
def get_today_calendar_data(day_str):
    calendar_data = load_calendar_data()
    return calendar_data.get(day_str, {
        "holiday": "የዕለቱ በዓል",
        "sinksar": "የቅዱሳን ታሪክ እና ስንክሳር እዚህ ይገባል...",
        "gitsawe": "የዕለቱ መልዕክት/ምንባብ...",
        "wongel": "ማቴዎስ ወንጌል...",
        "terguame": "የወንጌል ትርጓሜ...",
        "mazmur": "የዕለቱ መዝሙር ግጥም...",
        "abew": GENERAL_ADVICE,
        "wongel_zirzir": "ዝርዝር የወንጌል ትምህርት...",
        "abew_timhirt": "የአበው ምክር...",
        "tseolot": "የዕለቱ ጸሎት..."
    })

@app.route('/api', methods=['POST'])
def webhook():
    update = request.get_json()
    if not update or "message" not in update:
        return "OK", 200

    message = update["message"]
    chat_id = message["chat"]["id"]
    text = message.get("text", "")

    if text.startswith("/start"):
        welcome_text = (
            f"እንኳን ወደ <b>ቤተሳይዳ መንፈሳዊ በጎ አድራጎት</b> መድረክ በደህና መጡ! 🎉\n\n"
            f"ይህ መድረክ 'በእንተ ስማ ለማርያም' እያልን የተቸገሩትን የምንረዳበት የምሕረት ቤት ነው።\n\n"
            f"እባክዎ ከታች ያለውን ቁልፍ ተጭነው መድረኩን ይክፈቱ፦"
        )
        reply_markup = {"inline_keyboard": [[{"text": "❤️ ቤተሳይዳን ክፈት", "web_app": {"url": f"https://{request.host}/"}}]]}
        send_message(chat_id, welcome_text, reply_markup)
    return "OK", 200

@app.route('/api/daily-blessing', methods=['GET'])
def get_daily_blessing():
    _, eth_day = get_ethiopian_date()
    today_data = get_today_calendar_data(str(eth_day)) # 🔄 አሁን ዳይናሚክ ሆኗል!
    
    return jsonify({
        "ethiopian_date": f"ሰኔ {eth_day} ቀን 2018 ዓ.ም",
        "holiday_name": today_data.get("holiday", "የአማኑኤል እና የቅዱስ ቴዎድሮስ በዓል"),
        "image_url": "mary.jpg",
        "sinksar": today_data["sinksar"],
        "gitsawe": today_data["gitsawe"],
        "quote": today_data["wongel"]
    })

# 🔔 በየ 30 ደቂቃው ይዘቱን እየቀያየረ ወደ ቻናል የሚልክ ዋናው ክሮን ጆብ
@app.route('/api/cron-reminder', methods=['GET'])
def cron_reminder():
    if not CHAT_ID:
        return jsonify({"status": "error", "message": "NOTIFICATION_CHAT_ID አልተገኘም"}), 400
        
    _, eth_day = get_ethiopian_date()
    today_data = get_today_calendar_data(str(eth_day)) # 🔄 ዳይናሚክ የዕለቱ ዳታ
    
    content_type = random.choice(["sinksar_gitsawe", "wongel_terguame", "mazmur_abew"])
    base_header = f"✨ <b>የዕለቱ መንፈሳዊ ማነቂያ (ቤተሳይዳ)</b> ✨\n📅 <b>ዕለት፦ ሰኔ {eth_day} ቀን</b>\n\n"
    
    if content_type == "sinksar_gitsawe":
        body = (
            f"📜 <b>የዕለቱ ስንክሳር፦</b>\n{today_data['sinksar']}\n\n"
            f"☦️ <b>የዕለቱ ግጻዌ፦</b>\n{today_data['gitsawe']}"
        )
    elif content_type == "wongel_terguame":
        body = (
            f"{today_data['wongel']}\n\n"
            f"{today_data['terguame']}"
        )
    else:
        body = (
            f"{today_data['mazmur']}\n\n"
            f"💡 <b>የአበው ትምህርት፦</b>\n{random.choice(today_data['abew'])}"
        )
        
    formatted_msg = base_header + body + "\n\n🕊️ <i>ሕይወታችንን በኦርቶዶክሳዊት ተዋሕዶ ሥርዓትና በትምህርተ አበው እናቅና።</i>"
    
    reply_markup = {
        "inline_keyboard": [[{
            "text": "💎 ማንም ሳይጸጸት በደስታ ይስጥ ➔ [ ወደ ቦቱ ግባ ] 💎",
            "url": f"https://t.me/{BOT_USERNAME}?start=true"
        }]]
    }
    
    audio_url = f"https://{request.host}/mary.mp3"
    
    success = send_audio(CHAT_ID, audio_url, formatted_msg, reply_markup)
    if success:
        return jsonify({"status": "success", "message": f"{content_type} ይዘት ከነመዝሙሩ ተልኳል"}), 200
    else:
        send_message(CHAT_ID, formatted_msg, reply_markup)
        return jsonify({"status": "fallback", "message": "በጽሑፍ ብቻ ተልኳል"}), 200

def format_daily_message(day_data):
    message = (
        f"📅 **ዕለታዊ የቤተክርስቲያን ዓውደ አዋጅ**\n"
        f"━━━━━━━━━━━━━━━━━━━━━━\n\n"
        f"🌟 **የዕለቱ በዓል፦** {day_data.get('holiday', 'ያልተገለጸ')}\n\n"
        f"📜 **ስንክሳር (የቅዱሳን ታሪክ)፦**\n{day_data['sinksar']}\n\n"
        f"{day_data['gitsawe']}\n\n"
        f"📖 **የዕለቱ ሰፊ ትምህርት፦**\n{day_data['wongel_zirzir']}\n\n"
        f"💡 **የአበው ምክር (ትምህርት)፦**\n{day_data['abew_timhirt']}\n\n"
        f"🙏 **የጸሎት ማዕድ፦**\n{day_data['tseolot']}\n\n"
        f"━━━━━━━━━━━━━━━━━━━━━━\n"
        f"🔔 ለሌሎች ክርስቲያን ወንድሞችና እህቶች ያጋሩ!"
    )
    return message

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
