import os
import random
import json
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)
handler = app 
application = app

TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_API = f"https://api.telegram.org/bot{TOKEN}"
CHAT_ID = os.environ.get("NOTIFICATION_CHAT_ID")

CHANNEL_USERNAME = "infomela06" 
CHANNEL_URL = f"https://t.me/{CHANNEL_USERNAME}"

BOT_USERNAME = os.environ.get("TELEGRAM_BOT_USERNAME", "BeenteSmaMariam_bot")
BOT_URL = f"https://t.me/{BOT_USERNAME}?start=true"

# 📅 የፈረንጆቹን ጁላይ ወር ቀኖች በቀጥታ ወደ እውነተኛው የሰኔ/ሐምሌ ቀን መmapping ማድረጊያ
def get_exact_ethiopian_info():
    utc_now = datetime.utcnow() + timedelta(hours=3) # የአዲስ አበባ ሰዓት
    current_day = utc_now.day
    current_month = utc_now.month
    
    if current_month == 7:
        if current_day <= 7:
            eth_month = 10
            eth_day = current_day + 23  # ጁላይ 6 = ሰኔ 29
            eth_month_name = "ሰኔ"
        else:
            eth_month = 11
            eth_day = current_day - 7   # ጁላይ 8 = ሐምሌ 1
            eth_month_name = "ሐምሌ"
    elif current_month == 6:
        eth_month = 10
        eth_day = current_day - 8
        eth_month_name = "ሰኔ"
    else:
        eth_month = 10
        eth_day = 29
        eth_month_name = "ሰኔ"
        
    return eth_month, eth_day, eth_month_name

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

# 💡 ተጨማሪ የአበው ምክሮች ስብስብ
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
            f"የዕለቱን ሙሉ ስንክሳር፣ ግጻዌ፣ የወንጌል ትርጓሜና ያማሩ መንፈሳዊ መዝሙሮችን በሰፊው ለማግኘትና ለመማር "
            f"እባክዎ መጀመሪያ ይፋዊ ቻናላችንን ይቀላቀሉ፦"
        )
        reply_markup = {
            "inline_keyboard": [[
                {"text": "📢 ቻናላችንን ይቀላቀሉ", "url": CHANNEL_URL}
            ]]
        }
        send_message(chat_id, welcome_text, reply_markup)
    return "OK", 200

# 🎨 ሚኒ አፕ ኤፒአይ
@app.route('/api/daily-blessing', methods=['GET'])
def get_daily_blessing():
    eth_month, eth_day, eth_month_name = get_exact_ethiopian_info()
    calendar_data = load_calendar_data()
    key = f"{eth_month}-{eth_day}"
    
    day_info = calendar_data.get(key)
    if not day_info:
        day_info = calendar_data.get("10-28", {
            "holiday": "የዕለቱ ቅዱስ በዓል",
            "sinksar": "በዚህች ዕለት የሚታሰቡ ቅዱሳንን ታሪክ በጸሎትና በምስጋና እናስባቸዋለን።",
            "gitsawe": "የዕለቱን ግጻዌ በቤተክርስቲያን በመገኘት ይከታተሉ።"
        })
    
    return jsonify({
        "ethiopian_date": f"{eth_month_name} {eth_day} ቀን 2018 ዓ.ም",
        "holiday_name": day_info.get("holiday", "የዕለቱ በዓል"),
        "image_url": "mary.jpg",
        "sinksar": day_info.get("sinksar", ""),
        "gitsawe": day_info.get("gitsawe", ""),
        "quote": "🔍 ዝርዝር ትምህርቱን፣ ሰፊ የወንጌል አንድምታውንና ጸሎቱን በቻናላችን ላይ በሰፊው ይማሩ!"
    })

# 🔔 ክሮን ጆብ - በየተራ ሰፋፊ ይዘቶችን ወደ ቻናል የሚያስተላልፍ
@app.route('/api/cron-reminder', methods=['GET'])
def cron_reminder():
    if not CHAT_ID:
        return jsonify({"status": "error", "message": "NOTIFICATION_CHAT_ID አልተገኘም"}), 400
        
    eth_month, eth_day, eth_month_name = get_exact_ethiopian_info()
    calendar_data = load_calendar_data()
    key = f"{eth_month}-{eth_day}"
    
    day_info = calendar_data.get(key)
    if not day_info:
        day_info = calendar_data.get("10-28")
        
    if not day_info:
        day_info = {
            "holiday": "የዕለቱ መንፈሳዊ በዓል",
            "sinksar": "በዚህች ዕለት የሚታሰቡ ቅዱሳንን ታሪክ በጸሎትና በምስጋና እናስባቸዋለን።",
            "gitsawe": "የዕለቱን ግጻዌ በቤተክርስቲያን በመገኘት ይከታተሉ።",
            "wongel_zirzir": "የወንጌልን ሰፊ ትምህርት በሕይወታችን እንተርጉመው።",
            "abew_timhirt": "“ምጽዋት ሰጪውን እንጂ ተቀባዩን ብቻ አይጠቅምም።” — ቅዱስ ዮሐንስ አፈወርቅ",
            "tseolot": "አቤቱ አምላካችን ሆይ! በቸርነትህ ጠብቀን።"
        }

    # 🔄 በየሰዓቱ የተለያየ ይዘት እንዲወጣ በዘፈቀደ (Random) አንዱን ይመርጣል
    content_type = random.choice(["sinksar", "wongel", "abew", "tseolot"])
    
    base_header = f"✨ <b>የዕለቱ መንፈሳዊ ማነቂያ (ቤተሳይዳ)</b> ✨\n📅 <b>ዕለት፦ {eth_month_name} {eth_day} ቀን 2018 ዓ.ም</b>\n\n"
    
    if content_type == "sinksar":
        body = (
            f"📖 <b>የዕለቱ በዓል፦</b> {day_info.get('holiday', 'የዕለቱ ቅዱስ በዓል')}\n\n"
            f"📜 <b>የዕለቱ ስንክሳር መታሰቢያና ታሪክ፦</b>\n{day_info.get('sinksar', 'የለም')}\n\n"
            f"☦️ <b>የዕለቱ ቅዱስ ግጻዌ፦</b>\n{day_info.get('gitsawe', 'የለም')}"
        )
    elif content_type == "wongel":
        zirzir_text = day_info.get('wongel_zirzir', day_info.get('terguame', 'ሕይወታችንን በኦርቶዶክሳዊት ተዋሕዶ ሥርዓት እናቅና።'))
        body = (
            f"📖 <b>የዕለቱ በዓል፦</b> {day_info.get('holiday', 'የዕለቱ ቅዱስ በዓል')}\n\n"
            f"✨ <b>የወንጌል ሰፊ አንድምታ ትርጓሜና ትምህርት፦</b>\n{zirzir_text}"
        )
    elif content_type == "abew":
        advice_text = day_info.get('abew_timhirt', random.choice(GENERAL_ADVICE))
        body = (
            f"💡 <b>የአበው ምክርና መንፈሳዊ ተግሣጽ፦</b>\n{advice_text}"
        )
    else: # tseolot
        tseolot_text = day_info.get('tseolot', "አቤቱ አምላካችን ሆይ! በቸርነትህ ጠብቀን።")
        body = (
            f"🙏 <b>የዕለቱ የጸሎት ማዕድ፦</b>\n{tseolot_text}"
        )
        
    formatted_msg = base_header + body + "\n\n🕊️ <i>በእንተ ስማ ለማርያም እያልን የተራቡትን የምንመግብበት የቤተሳይዳ በጎ አድራጎት አባል ይሁኑ።</i>"
    
    reply_markup = {
        "inline_keyboard": [[{
            "text": "💎 ማንም ሳይጸጸት በደስታ ይስጥ ➔ [ ወደ ቦቱ ግባ ] 💎",
            "url": BOT_URL
        }]]
    }
    
    audio_url = f"https://{request.host}/mary.mp3"
    
    success = send_audio(CHAT_ID, audio_url, formatted_msg, reply_markup)
    
    if success:
        return jsonify({"status": "success", "message": f"{content_type} ይዘት ከነመዝሙሩ ተልኳል"}), 200
    else:
        fallback_success = send_message(CHAT_ID, formatted_msg, reply_markup)
        if fallback_success:
            return jsonify({"status": "fallback", "message": f"{content_type} ይዘት በጽሑፍ ብቻ ተልኳል"}), 200
        else:
            return jsonify({"status": "error", "message": "መላክ አልተቻለም"}), 500

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
