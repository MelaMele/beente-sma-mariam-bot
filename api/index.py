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

# 📢 ያንተ ትክክለኛ የቴሌግራም ቻናል ዩዘርኔም
CHANNEL_USERNAME = "infomela06" 
CHANNEL_URL = f"https://t.me/{CHANNEL_USERNAME}"

# 🤖 የቦትህ ዩዘርኔም
BOT_USERNAME = os.environ.get("TELEGRAM_BOT_USERNAME", "BeenteSmaMariam_bot")
BOT_URL = f"https://t.me/{BOT_USERNAME}?start=true"

# 📅 የሰርቨሩን ሰዓት ወደ ትክክለኛው የኢትዮጵያ ቀን መቀየሪያ (የተስተካከለ)
def get_ethiopian_date():
    utc_now = datetime.utcnow() + timedelta(hours=3) # የአዲስ አበባ ሰዓት
    
    # የኢትዮጵያ ወራት ስም ዝርዝር
    month_names = {10: "ሰኔ", 11: "ሐምሌ", 12: "ነሐሴ", 13: "ጳጉሜ"}
    
    if utc_now.month == 7: # ጁላይ
        eth_month = 10 # ሰኔ
        eth_day = utc_now.day + 23 # ጁላይ 1 = ሰኔ 24 ስለሆነ (1 + 23 = 24)
        if eth_day > 30:
            eth_month = 11 # ሐምሌ
            eth_day = eth_day - 30
    elif utc_now.month == 6: # ጁኔ
        eth_month = 10 # ሰኔ
        eth_day = utc_now.day - 8
    else:
        # ለሌሎች ወራት ጊዜያዊ ነባሪ (ሰኔ)
        eth_month = 10
        eth_day = utc_now.day
        
    return eth_month, eth_day, month_names.get(eth_month, "ሰኔ")

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

# 💡 ተጨማሪ የአበው ምክሮች ስብስብ (በ JSON ውስጥ ከሌለ እንደ ማሟያ የሚሆን)
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

# 🎨 በሚኒ አፑ ላይ ከሥዕሉ በታች አጭር የየዕለቱ ስንክሳር እና ግጻዌ ብቻ የሚሰጥ API
@app.route('/api/daily-blessing', methods=['GET'])
def get_daily_blessing():
    eth_month, eth_day, eth_month_name = get_ethiopian_date()
    calendar_data = load_calendar_data()
    key = f"{eth_month}-{eth_day}"
    
    day_info = calendar_data.get(key, calendar_data.get("10-28", {
        "holiday": "የአማኑኤል እና የቅዱስ ቴዎድሮስ በዓል",
        "sinksar": "በዚህች ዕለት ጌታችን መድኃኒታችን ኢየሱስ ክርስቶስ ለአለም የገባውን የምሕረት ቃልኪዳን ያሰበበት ዕለት ነው።",
        "gitsawe": "ዲያቆን፦ ዕብ. 8:1 | ወንጌል፦ ማቴ. 1:21"
    }))
    
    return jsonify({
        "ethiopian_date": f"{eth_month_name} {eth_day} ቀን 2018 ዓ.ም",
        "holiday_name": day_info["holiday"],
        "image_url": "mary.jpg",
        "sinksar": day_info["sinksar"],
        "gitsawe": day_info["gitsawe"],
        "quote": "🔍 ዝርዝር ትምህርቱን፣ ሰፊ የወንጌል አንድምታውንና ጸሎቱን በቻናላችን ላይ በሰፊው ይማሩ!"
    })

# 🔔 በየ 30 ደቂቃው ሰፋፊ ማብራሪያዎችንና ልዩ ልዩ ይዘቶችን ወደ ቻናል የሚያስተላልፈው ዋናው ክሮን ጆብ
@app.route('/api/cron-reminder', methods=['GET'])
def cron_reminder():
    if not CHAT_ID:
        return jsonify({"status": "error", "message": "NOTIFICATION_CHAT_ID አልተገኘም"}), 400
        
    eth_month, eth_day, eth_month_name = get_ethiopian_date()
    calendar_data = load_calendar_data()
    key = f"{eth_month}-{eth_day}"
    
    day_info = calendar_data.get(key, calendar_data.get("10-28"))
    
    if not day_info:
        return jsonify({"status": "error", "message": "የዕለቱ ዳታ በ JSON ውስጥ አልተገኘም"}), 404

    # 🔄 አራት የተለያዩ የይዘት ዓይነቶች (የአበው ትምህርትን ጨምሮ)
    content_type = random.choice(["sinksar_gitsawe", "wongel_zirzir", "tseolot", "abew_timhirt"])
    base_header = f"✨ <b>የዕለቱ መንፈሳዊ ማነቂያ (ቤተሳይዳ)</b> ✨\n📅 <b>ዕለት፦ {eth_month_name} {eth_day} ቀን</b>\n\n"
    
    if content_type == "sinksar_gitsawe":
        body = (
            f"📜 <b>የዕለቱ ስንክሳር መታሰቢያ፦</b>\n{day_info['sinksar']}\n\n"
            f"☦️ <b>የዕለቱ ቅዱስ ግጻዌ፦</b>\n{day_info['gitsawe']}"
        )
    elif content_type == "wongel_zirzir":
        zirzir_text = day_info.get('wongel_zirzir', day_info.get('terguame', 'ሕይወታችንን በኦርቶዶክሳዊት ተዋሕዶ ሥርዓት እናቅና።'))
        body = (
            f"📖 <b>የዕለቱ በዓል፦</b> {day_info['holiday']}\n\n"
            f"✨ <b>የወንጌል ሰፊ አንድምታ ትርጓሜና ትምህርት፦</b>\n{zirzir_text}"
        )
    elif content_type == "tseolot":
        tseolot_text = day_info.get('tseolot', "አቤቱ አምላካችን ሆይ! የዕለቱን በረከት እንድናገኝ፥ ከክፉ ነገር ሁሉ እንድንጠበቅ በቸርነትህ ጠብቀን።")
        body = (
            f"🙏 <b>የዕለቱ የጸሎት ማዕድ፦</b>\n{tseolot_text}"
        )
    else: # abew_timhirt
        # በመጀመሪያ ከ JSON ውስጥ አዲሱን 'abew_timhirt' ይፈልጋል፣ ከሌለ ከ GENERAL_ADVICE በዘፈቀደ ይመርጣል
        advice_text = day_info.get('abew_timhirt', random.choice(GENERAL_ADVICE))
        body = (
            f"💡 <b>የአበው ምክርና መንፈሳዊ ተግሣጽ፦</b>\n{advice_text}"
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
        return jsonify({"status": "success", "message": f"{key} ቀን {content_type} ይዘት ወደ ቻናል ተልኳል"}), 200
    else:
        send_message(CHAT_ID, formatted_msg, reply_markup)
        return jsonify({"status": "fallback", "message": "በጽሑፍ ብቻ ተልኳል"}), 200

def send_message(chat_id, text, reply_markup=None):
    url = f"{TELEGRAM_API}/sendMessage"
    payload = {"chat_id": chat_id, "text": text, "parse_mode": "HTML"}
    if reply_markup: payload["reply_markup"] = reply_markup
    try: return requests.post(url, json=payload).status_code == 200
    except: return False

audio_url = f"https://{request.host}/mary.mp3"
    
    # መጀመሪያ ኦዲዮውን ለመላክ ይሞክራል
    success = send_audio(CHAT_ID, audio_url, formatted_msg, reply_markup)
    
    if success:
        return jsonify({"status": "success", "message": f"{key} ቀን {content_type} ይዘት ከነመዝሙሩ ወደ ቻናል ተልኳል"}), 200
    else:
        # ኦዲዮው እምቢ ካለው ወዲያውኑ በጽሑፍ ብቻ ይልካል
        fallback_success = send_message(CHAT_ID, formatted_msg, reply_markup)
        if fallback_success:
            return jsonify({"status": "fallback", "message": "ኦዲዮው አልሰራም ግን በጽሑፍ ብቻ ወደ ቻናል ተልኳል"}), 200
        else:
            return jsonify({"status": "error", "message": "ወደ ቻናሉ መላክ አልተቻለም። እባክህ ቦቱ Admin መሆኑን እና CHAT_ID ትክክል መሆኑን አረጋግጥ"}), 500
