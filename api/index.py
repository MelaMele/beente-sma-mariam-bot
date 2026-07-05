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

# 📢 የቻናልዎን ትክክለኛ ዩዘርኔም እዚህ ያስገቡ (ያለ @ ምልክት)
CHANNEL_USERNAME = os.environ.get("TELEGRAM_CHANNEL_USERNAME", "BeenteSmaMariam_Channel") 
CHANNEL_URL = f"https://t.me/{CHANNEL_USERNAME}"

# 🤖 የቦትዎ ትክክለኛ ዩዘርኔም (ያለ @ ምልክት)
BOT_USERNAME = os.environ.get("TELEGRAM_BOT_USERNAME", "BeenteSmaMariam_bot")

# 📅 የሰርቨሩን ሰዓት ወደ ትክክለኛው የኢትዮጵያ ቀን መቀየሪያ (ዛሬ ጁላይ 5 = ሰኔ 28)
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

# 💡 የአበው ምክሮች ስብስብ
GENERAL_ADVICE = [
    "“ምጽዋት ሰጪውን እንጂ ተቀባዩን ብቻ አይጠቅምም። ለሰጪው የጽድቅም መክፈቻ ናት።” — ቅዱስ ዮሐንስ አፈወርቅ",
    "“የተራበውን ሰው ስታይ ሰብአዊነትህ ይንቀሳቀስ፤ መለገስ የሃይማኖት ልዩነት አይጠይቅም።” — የአበው ምክር",
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

    # ተጠቃሚው ቦቱ ላይ /start ሲል መጀመሪያ ወደ ቻናሉ እንዲሄድ ማድረግ (ሪፈራል ስልት)
    if text.startswith("/start"):
        welcome_text = (
            f"እንኳን ወደ <b>ቤተሳይዳ መንፈሳዊ በጎ አድራጎት</b> መድረክ በደህና መጡ! 🎉\n\n"
            f"የዕለቱን ሙሉ ስንክሳር፣ ግጻዌ፣ የወንጌል ትርጓሜና ያማሩ መንፈሳዊ መዝሙሮችን ለማግኘት "
            f"እባክዎ መጀመሪያ ይፋዊ ቻናላችንን ይቀላቀሉ፦"
        )
        reply_markup = {
            "inline_keyboard": [[
                {"text": "📢 ቻናላችንን ይቀላቀሉ", "url": CHANNEL_URL}
            ]]
        }
        send_message(chat_id, welcome_text, reply_markup)
    return "OK", 200

@app.route('/api/daily-blessing', methods=['GET'])
def get_daily_blessing():
    eth_month, eth_day = get_ethiopian_date()
    calendar_data = load_calendar_data()
    key = f"{eth_month}-{eth_day}"
    
    day_info = calendar_data.get(key, calendar_data.get("10-28", {
        "holiday": "የአማኑኤል እና የቅዱስ ቴዎድሮስ በዓል",
        "sinksar": "በዚህች ዕለት ጌታችን መድኃኒታችን ኢየሱስ ክርስቶስ ለአለም የገባውን የምሕረት ቃልኪዳን ያሰበበት ዕለት ነው።",
        "gitsawe": "ዲያቆን፦ ዕብ. 8:1 | ወንጌል፦ ማቴ. 1:21"
    }))
    
    return jsonify({
        "ethiopian_date": f"ሰኔ {eth_day} ቀን 2018 ዓ.ም",
        "holiday_name": day_info["holiday"],
        "image_url": "mary.jpg",
        "sinksar": day_info["sinksar"],
        "gitsawe": day_info["gitsawe"],
        "quote": day_info.get("terguame", "እግዚአብሔር ከእኛ ጋር ነው።")
    })

# 🔔 በየ 30 ደቂቃው ከ calendar_data.json እያነበበ ወደ ቻናል የሚልክ ዋናው ክሮን ጆብ
@app.route('/api/cron-reminder', methods=['GET'])
def cron_reminder():
    if not CHAT_ID:
        return jsonify({"status": "error", "message": "NOTIFICATION_CHAT_ID አልተገኘም"}), 400
        
    eth_month, eth_day = get_ethiopian_date()
    calendar_data = load_calendar_data()
    key = f"{eth_month}-{eth_day}"
    
    day_info = calendar_data.get(key, calendar_data.get("10-28"))
    
    if not day_info:
        return jsonify({"status": "error", "message": "የዕለቱ ዳታ በ JSON ውስጥ አልተገኘም"}), 404

    content_type = random.choice(["sinksar_gitsawe", "wongel_terguame", "advice"])
    base_header = f"✨ <b>የዕለቱ መንፈሳዊ ማነቂያ (ቤተሳይዳ)</b> ✨\n📅 <b>ዕለት፦ ሰኔ {eth_day} ቀን</b>\n\n"
    
    if content_type == "sinksar_gitsawe":
        body = (
            f"📜 <b>የዕለቱ ስንክሳር፦</b>\n{day_info['sinksar']}\n\n"
            f"☦️ <b>የዕለቱ ግጻዌ፦</b>\n{day_info['gitsawe']}"
        )
    elif content_type == "wongel_terguame":
        body = (
            f"📖 <b>የዕለቱ በዓል፦</b> {day_info['holiday']}\n\n"
            f"✨ <b>የዕለቱ ትምህርት/ትርጓሜ፦</b>\n{day_info.get('terguame', 'ሕይወታችንን በኦርቶዶክሳዊት ተዋሕዶ ሥርዓት እናቅና።')}"
        )
    else:
        body = (
            f"💡 <b>የአበው ትምህርት፦</b>\n{random.choice(GENERAL_ADVICE)}\n\n"
            f"📜 <b>የዕለቱ የዳዊት መዝሙር፦</b>\n“እግዚአብሔር ብርሃኔና መድኃኒቴ ነው፤ የሚያስፈራኝ ማን ነው?” (መዝሙር 26:1)"
        )
        
    formatted_msg = base_header + body + "\n\n🕊️ <i>በእንተ ስማ ለማርያም እያልን የተራቡትን የምንመግብበት የቤተሳይዳ በጎ አድራጎት አባል ይሁኑ።</i>"
    
    # 🔗 ➔ የተስተካከለ የቦት መግቢያ ሊንክ (t.me ይላል፣ ወደ ቦቱ ይወስዳል)
    reply_markup = {
        "inline_keyboard": [[{
            "text": "💎 ማንም ሳይጸጸት በደስታ ይስጥ ➔ [ ወደ ቦቱ ግባ ] 💎",
            "url": f"https://t.me/{BOT_USERNAME}?start=true"
        }]]
    }
    
    audio_url = f"https://{request.host}/mary.mp3"
    
    success = send_audio(CHAT_ID, audio_url, formatted_msg, reply_markup)
    if success:
        return jsonify({"status": "success", "message": f"{key} ቀን {content_type} ይዘት ከ JSON ተነቦ ተልኳል"}), 200
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
