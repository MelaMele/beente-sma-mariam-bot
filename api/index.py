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

GENERAL_ADVICE = [
    {"msg": "“የተራበውን ሰው ስታይ ሰብአዊነትህ ይንቀሳቀስ፤ መለገስ የሃይማኖት ልዩነት አይጠይቅም።”", "author": "የአበው ምክር"},
    {"msg": "“ምጽዋት ሰጪውን እንጂ ተቀባዩን ብቻ አይጠቅምም። ለሰጪው የጽድቅም መክፈቻ ናት።”", "author": "ቅዱስ ዮሐንስ አፈወርቅ"},
    {"msg": "“እግዚአብሔር በደስታ የሚሰጠውን ይወዳልና።”", "author": "2ኛ ቆሮንቶስ 9:7"},
    {"msg": "“ለደሃ የሚሰጥ ለእግዚአብሔር ያበድራል፤ ማንም ልቡን ክፍት አድርጎ ለሌላው ሊራራ ይገባል።”", "author": "መጽሐፈ ምሳሌ"}
]

SPIRITUAL_TEACHINGS = [
    "“ጸሎት ማለት ከእግዚአብሔር ጋር መነጋገር ነው። እስትንፋስ ለሥጋ እንደሚያስፈልገው ሁሉ፣ ጸሎትም ለነፍስ እንዲሁ ያስፈልጋታል።” — ቅዱስ ዮሐንስ አፈወርቅ",
    "“በቤተክርስቲያን ሥርዓት መሠረት፣ ንስሐ የሌለው ሕይወት ፍሬ የሌለው ዛፍ ነው። ሁልጊዜ ከንስሐ አባትዎ ጋር በመገናኘት ነፍስዎን ያነጹ።” — የአበው ትምህርት",
    "“ምጽዋት ስታደርግ ቀኝህ የምታደርገውን ግራህ አያውቀው የተባለው ለትዕቢት እንዳይሆንብህ ነው። በፍቅርና በትሕትና የተደረገ ስጦታ በእግዚአብሔር ዘንድ ተወዳጅ ነው።” — ቅዱስ ባስልዮስ ዘቂሳሪያ"
]

# 📅 የፈረንጅን ቀን ወደ ኢትዮጵያ ቀን ለመቀየር የሚያስችል ቀመር (ቀላል ስልተ-ቀመር)
def get_ethiopian_date():
    now = datetime.utcnow() + timedelta(hours=3) # የኢትዮጵያ ሰዓት
    # ለሰኔ ወር ጊዜያዊ ቀመር (እውነተኛውን የ365 ቀን መቀየሪያ algorithm ማካተት ይቻላል)
    # አሁን ጁላይ 2026 ላይ ስንሆን ሰኔን ለማስላት፡
    eth_month = 10  # ሰኔ
    eth_day = now.day + 21 - 28 # የሰኔን ቀናት ለማስተካከል
    if eth_day <= 0:
        eth_day = 21
    return eth_month, eth_day

# 📁 መረጃዎችን ከ JSON ፋይል ለማንበብ
def load_calendar_data():
    try:
        with open('calendar_data.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return {}

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
            f"ይህ መድረክ 'በእንተ ስማ ለማርያም' እያልን የተቸገሩትን የምንረዳበት የምሕረት ቤት ነው።\n"
            f"እባክዎ ከታች ያለውን ቁልፍ ተጭነው መድረኩን ይክፈቱ፦"
        )
        reply_markup = {"inline_keyboard": [[{"text": "❤️ ቤተሳይዳን ክፈት", "web_app": {"url": f"https://{request.host}/"}}]]}
        send_message(chat_id, welcome_text, reply_markup)
    else:
        reminder_text = f"የተወደዱ ምዕመን! 🕊\n\nእባክዎ ከታች ያለውን ቁልፍ ተጭነው ወደ መተግበሪያችን ይግቡ፦"
        reply_markup = {"inline_keyboard": [[{"text": "❤️ ወደ ቤተሳይዳ መድረክ ግባ", "web_app": {"url": f"https://{request.host}/"}}]]}
        send_message(chat_id, reminder_text, reply_markup)
        
    return "OK", 200

@app.route('/api/daily-blessing', methods=['GET'])
def get_daily_blessing():
    eth_month, eth_day = get_ethiopian_date()
    calendar_data = load_calendar_data()
    key = f"{eth_month}-{eth_day}"
    
    # ከ JSON መፈለግ፣ ከጠፋ ነባሪውን ሰኔ 21 መስጠት
    day_info = calendar_data.get(key, calendar_data.get("10_21", {
        "holiday": "የቅድስት ድንግል ማርያም ዓመታዊ መታሰቢያ",
        "sinksar": "በዚህች ዕለት እመቤታችን ቅድስት ድንግል ማርያም ለዓለም ሁሉ መድኃኒት የሆነውን ጌታችንን የወለደችበት ታላቅ በዓል ነው።",
        "gitsawe": "ዲያቆን፦ ገላ. 4:4 | ወንጌል፦ ሉቃስ 1:26"
    }))
    
    advice = random.choice(GENERAL_ADVICE)
    return jsonify({
        "ethiopian_date": f"ሰኔ {eth_day} ቀን 2018 ዓ.ም",
        "holiday_name": day_info["holiday"],
        "image_url": "mary.jpg",
        "sinksar": day_info["sinksar"],
        "gitsawe": day_info["gitsawe"],
        "quote": f"{advice['msg']} — {advice['author']}"
    })

@app.route('/api/cron-reminder', methods=['GET'])
def cron_reminder():
    if not CHAT_ID:
        return jsonify({"status": "error", "message": "NOTIFICATION_CHAT_ID አልተገኘም"}), 400
        
    selected_teaching = random.choice(SPIRITUAL_TEACHINGS)
    formatted_msg = (
        f"✨ <b>የዕለቱ መንፈሳዊ ማነቂያ (ቤተሳይዳ)</b> ✨\n\n"
        f"{selected_teaching}\n\n"
        f"🕊️ <i>ሕይወታችንን በኦርቶዶክሳዊት ተዋሕዶ ሥርዓትና በትምህርተ አበው እናቅና።</i>"
    )
    
    reply_markup = {
        "inline_keyboard": [[{
            "text": "❤️ ማንም ሳይጸጸት በደስታ ይስጥ (ወደ ቦቱ ግባ)",
            "url": f"https://t.me/{BOT_USERNAME}?start=true"
        }]]
    }
    
    # 🎵 መዝሙሩን (Audio) ከጽሑፉ ጋር አብሮ መላክ
    # በ Vercel ላይ የተቀመጠውን mary.mp3 ሙሉ ሊንክ መጠቀም
    audio_url = f"https://{request.host}/mary.mp3"
    
    success = send_audio(CHAT_ID, audio_url, formatted_msg, reply_markup)
    if success:
        return jsonify({"status": "success", "message": "መዝሙርና ማነቂያ መልእክት ተልኳል"}), 200
    else:
        # ኦዲዮው ካልሰራ በጽሑፍ ብቻ እንዲሞክር ማድረግ
        send_message(CHAT_ID, formatted_msg, reply_markup)
        return jsonify({"status": "fallback", "message": "በጽሑፍ ብቻ ተልኳል"}), 200

def send_message(chat_id, text, reply_markup=None):
    url = f"{TELEGRAM_API}/sendMessage"
    payload = {"chat_id": chat_id, "text": text, "parse_mode": "HTML"}
    if reply_markup: payload["reply_markup"] = reply_markup
    try: return requests.post(url, json=payload).status_code == 200
    except: return False

# 🎤 አዲሱ ድምፅ/መዝሙር መላኪያ ፋንክሽን
def send_audio(chat_id, audio_url, caption, reply_markup=None):
    url = f"{TELEGRAM_API}/sendAudio"
    payload = {
        "chat_id": chat_id,
        "audio": audio_url,
        "caption": caption,
        "parse_mode": "HTML"
    }
    if reply_markup: payload["reply_markup"] = reply_markup
    try: return requests.post(url, json=payload).status_code == 200
    except: return False
