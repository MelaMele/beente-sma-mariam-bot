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

# 📁 በ Repository ውስጥ ያለውን calendar_data.json ፋይል በቀጥታ የሚያነብ ፋንክሽን
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

# 💡 የአበው ምክሮች ስብስብ (ከ JSON ፋይሉ ዳታ ከጠፋ እንደ መከላከያ የሚሆን)
GENERAL_ADVICE = [
    "“ምጽዋት ሰጪውን እንጂ ተቀባዩን ብቻ አይጠቅምም። ለሰጪው የጽድቅም መክፈቻ ናት።” — ቅዱስ ዮሐንስ አፈወርቅ",
    "“የተራበውን ሰው ስታይ ሰብአዊነትህ ይንቀሳቀስ፤ መለገስ የሃይማኖት ልዩነት አይጠይቅ።” — የአበው ምክር",
    "“ምጽዋት ስታደርግ ቀኝህ የምታደርገውን ግራህ አያውቀው የተባለው ለትዕቢት እንዳይሆንብህ ነው።” — ቅዱስ ባስልዮስ ዘቂሳሪያ"
]

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

# 1️⃣ ለሚኒ አፑ ዳታ ማቅረቢያ መንገድ (Route)
@app.route('/api/daily-blessing', methods=['GET'])
def get_daily_blessing():
    eth_month, eth_day = get_ethiopian_date()
    calendar_data = load_calendar_data()
    
    key = f"{eth_month}_{eth_day}" 
    eth_month_name = "ሰኔ" if eth_month == 10 else "ሐምሌ" if eth_month == 11 else "ግንቦት"
    
    day_data = calendar_data.get(key)
    if not day_data:
        day_data = calendar_data.get("10_29", {
            "holiday": "የዕለቱ ቅዱስ በዓል",
            "sinksar": "በዚህች ዕለት የሚታሰቡ ቅዱሳንን ታሪክ እናስባለን።",
            "gitsawe": "የዕለቱን ግጻዌ በቤተክርስቲያን ይከታተሉ።",
            "wongel_zirzir": "የወንጌልን ሰፊ ትምህርት በሕይወታችን እንተርጉመው።"
        })
    
    return jsonify({
        "ethiopian_date": f"{eth_month_name} {eth_day} ቀን 2018 ዓ.ም",
        "holiday_name": day_data.get("holiday", "የዕለቱ መንፈሳዊ በዓል"),
        "image_url": "mary.jpg",
        "sinksar": day_data.get("sinksar", ""),
        "gitsawe": day_data.get("gitsawe", ""),
        "quote": day_data.get("wongel_zirzir", "")  # ✅ ከ JSON ፋይልህ wongel_zirzir ን እንዲያነብ ተስተካክሏል
    })

# 2️⃣ በየ 30 ደቂቃው ወደ ቻናል መልእክት መላኪያ ክሮን ጆብ (Cron Job Route)
@app.route('/api/cron-reminder', methods=['GET'])
def cron_reminder():
    if not CHAT_ID:
        return jsonify({"status": "error", "message": "NOTIFICATION_CHAT_ID አልተገኘም"}), 400
        
    eth_month, eth_day = get_ethiopian_date()
    calendar_data = load_calendar_data()
    key = f"{eth_month}_{eth_day}"
    
    eth_month_name = "ሰኔ" if eth_month == 10 else "ሐምሌ" if eth_month == 11 else "ግንቦት"
    
    day_data = calendar_data.get(key)
    if not day_data:
        day_data = calendar_data.get("10_29", {
            "holiday": "የዕለቱ መንፈሳዊ በዓል",
            "sinksar": "የዕለቱን ስንክሳር በጸሎት እናስባለን።",
            "gitsawe": "የዕለቱን ግጻዌ በቤተክርስቲያን በመገኘት ይከታተሉ።",
            "wongel_zirzir": "የወንጌል ሰፊ አንድምታ።",
            "abew_timhirt": "ሕይወታችንን በኦርቶዶክሳዊት ተዋሕዶ ሥርዓት እናቅና።",
            "mazmur": "ያማሩ መንፈሳዊ መዝሙራት።"
        })
        
    content_type = random.choice(["sinksar_gitsawe", "wongel_terguame", "mazmur_abew"])
    base_header = f"✨ <b>የዕለቱ መንፈሳዊ ማነቂያ (ቤተሳይዳ)</b> ✨\n📅 <b>ዕለት፦ {eth_month_name} {eth_day} ቀን</b>\n\n"
    
    if content_type == "sinksar_gitsawe":
        body = (
            f"📜 <b>የዕለቱ ስንክሳር፦</b>\n{day_data.get('sinksar', 'የለም')}\n\n"
            f"☦️ <b>የዕለቱ ግጻዌ፦</b>\n{day_data.get('gitsawe', 'የለም')}"
        )
    elif content_type == "wongel_terguame":
        body = (
            f"📖 <b>የዕለቱ ወንጌል፦</b>\n{day_data.get('wongel_zirzir', 'የለም')}\n\n"  # ✅ ወደ wongel_zirzir ተቀይሯል
            f"✨ <b>የጸሎት ማዕድ፦</b>\n{day_data.get('tseolot', 'ሕይወታችንን በኦርቶዶክሳዊት ተዋሕዶ ሥርዓት እናቅና።')}"
        )
    else:
        # ✅ ከ JSON ፋይልህ abew_timhirt ን ፈልጎ እንዲያነብ ተስተካክሏል
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
    
    success = send_audio(CHAT_ID, audio_url, formatted_msg, reply_markup)
    if success:
        return jsonify({"status": "success", "message": f"{content_type} ይዘት ከነመዝሙሩ ተልኳል"}), 200
    else:
        send_message(CHAT_ID, formatted_msg, reply_markup)
        return jsonify({"status": "fallback", "message": "በጽሑፍ ብቻ ተልኳል"}), 200

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
