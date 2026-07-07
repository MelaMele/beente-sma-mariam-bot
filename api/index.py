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

# 💡 የአበው ምክሮች ስብስብ (ዳታቤዝ ውስጥ 'abew' ለሌላቸው ቀናት ነባሪ የሚሆን)
GENERAL_ADVICE = [
    "“ምጽዋት ሰጪውን እንጂ ተቀባዩን ብቻ አይጠቅምም። ለሰጪው የጽድቅም መክፈቻ ናት።” — ቅዱስ ዮሐንስ አፈወርቅ",
    "“የተራበውን ሰው ስታይ ሰብአዊነትህ ይንቀሳቀስ፤ መለገስ የሃይማኖት ልዩነት አይጠይቅም።” — የአበው ምክር",
    "“ምጽዋት ስታደርግ ቀኝህ የምታደርገውን ግራህ አያውቀው የተባለው ለትዕቢት እንዳይሆንብህ ነው።” — ቅዱስ ባስልዮስ ዘቂሳሪያ"
]

# 📅 የሰርቨሩን (UTC) ቀን ወደ ትክክለኛው የኢትዮጵያ ወር እና ቀን መቀየሪያ
def get_ethiopian_date():
    utc_now = datetime.utcnow() + timedelta(hours=3) # የአዲስ አበባ ሰዓት
    g_month = utc_now.month
    g_day = utc_now.day

    eth_month = 10 # ሰኔ 
    eth_day = 1

    # በጁላይ (July) ወር ውስጥ ከሆንን
    if g_month == 7:
        eth_day = g_day + 23 
        if eth_day > 30:
            eth_day = eth_day - 30
            eth_month = 11 # ሐምሌ
    # በጁን (June) ወር ውስጥ ከሆንን
    elif g_month == 6:
        if g_day >= 8:
            eth_day = g_day - 7
        else:
            eth_month = 9 # ግንቦት
            eth_day = g_day + 24

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

# 🛠️ ማዕከላዊ የዕለቱን ዳታ ማግኛ ፋንክሽን (ቁልፉን ወር_ቀን አድርጎ ይፈልጋል)
def get_today_calendar_data(day_str):
    calendar_data = load_calendar_data()
    
    # በቁልፉ ካገኘው ቀጥታ ይመልሳል
    if day_str in calendar_data:
        return calendar_data[day_str]
        
    # ካላገኘው ግን ለ fallback መረጃ የዛሬውን "10_30" (ሰኔ 30) ዳታ ይፈልጋል
    return calendar_data.get("10_30", {
        "holiday": "የቅዱስ ዮሐንስ መጥምቅ መታሰቢያ",
        "sinksar": "በዚህች ዕለት የነቢያት መደምደሚያና የጌታ መንገድ ጠራጊ የሆነው ቅዱስ ዮሐንስ መጥምቅ የተወለደበት ዓመታዊ ታላቅ በዓል ነው።",
        "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ ሐዋ. 13:24-32\n• ምስባክ፦ መዝ. 71:6\n• ወንጌል፦ ሉቃስ 1:57-80",
        "wongel": "ማቴዎስ ወንጌል...",
        "terguame": "የወንጌል ትርጓሜ...",
        "mazmur": "የዕለቱ መዝሙር ግጥም...",
        "abew": GENERAL_ADVICE,
        "wongel_zirzir": "ከሴቶች ከተወለዱት መካከል እንደ ዮሐንስ መጥምቅ ያለ አልተነሳም፤ እርሱ የእውነትና የንስሐ መምህር ነው።",
        "abew_timhirt": "💡 የአበው ትምህርት፦ «ዮሐንስ መጥምቅ 'እርሱ ሊልቅ እኔ ግን ላንስ ያስፈልጋል' በማለት የትሕትናን ጥልቅ ምሥጢር አስተምሮናል።» — ቅዱስ ዮሐንስ አፈወርቅ",
        "tseolot": "🙏 የጸሎት ማዕድ፦ በቅዱስ ዮሐንስ መጥምቅ ጸሎትና አማላጅነት የንስሐ ዕድሜን ስጠን።"
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
    eth_month, eth_day = get_ethiopian_date()
    month_name = "ሐምሌ" if eth_month == 11 else "ሰኔ"
    
    data_key = f"{eth_month}_{eth_day}"
    today_data = get_today_calendar_data(data_key)
    
    return jsonify({
        "ethiopian_date": f"{month_name} {eth_day} ቀን 2018 ዓ.ም",
        "holiday_name": today_data.get("holiday", "የዕለቱ በዓል"),
        "image_url": "mary.jpg",
        "sinksar": today_data.get("sinksar", ""),
        "gitsawe": today_data.get("gitsawe", ""),
        "quote": today_data.get("wongel_zirzir", today_data.get("wongel", ""))
    })

# 🔔 በየ 30 ደቂቃው ይዘቱን እየቀያየረ ወደ ቻናል የሚልክ ዋናው ክሮን ጆብ
@app.route('/api/cron-reminder', methods=['GET'])
def cron_reminder():
    if not CHAT_ID:
        return jsonify({"status": "error", "message": "NOTIFICATION_CHAT_ID አልተገኘም"}), 400
        
    eth_month, eth_day = get_ethiopian_date()
    month_name = "ሐምሌ" if eth_month == 11 else "ሰኔ"
    
    data_key = f"{eth_month}_{eth_day}"
    today_data = get_today_calendar_data(data_key)
    
    # በዘፈቀደ የትኛው የዳታ ዓይነት ለቻናሉ እንደሚላክ መምረጫ
    content_type = random.choice(["sinksar_gitsawe", "wongel_zirzir", "abew_timhirt"])
    base_header = f"✨ <b>የዕለቱ መንፈሳዊ ማነቃቂያ (ቤተሳይዳ)</b> ✨\n📅 <b>ዕለት፦ {month_name} {eth_day} ቀን</b>\n\n"
    
    if content_type == "sinksar_gitsawe":
        body = (
            f"⛪ <b>የዕለቱ በዓል፦</b> {today_data.get('holiday', '')}\n\n"
            f"📜 <b>የዕለቱ ስንክሳር፦</b>\n{today_data.get('sinksar', '')}\n\n"
            f"☦️ <b>የዕለቱ ግጻዌ፦</b>\n{today_data.get('gitsawe', '')}"
        )
    elif content_type == "wongel_zirzir":
        body = (
            f"⛪ <b>የዕለቱ በዓል፦</b> {today_data.get('holiday', '')}\n\n"
            f"📖 <b>የወንጌል ሰፊ ትምህርት፦</b>\n{today_data.get('wongel_zirzir', today_data.get('wongel', ''))}"
        )
    else:
        # 'abew' በሊስት መልክ ካልተገኘ 'abew_timhirt'ን በጽሑፍ መልክ ይጠቀማል
        advice_list = today_data.get('abew', GENERAL_ADVICE)
        selected_advice = random.choice(advice_list) if isinstance(advice_list, list) else advice_list
        
        body = (
            f"💡 <b>የአበው ትምህርት፦</b>\n{today_data.get('abew_timhirt', selected_advice)}\n\n"
            f"🙏 <b>የጸሎት ማዕድ፦</b>\n{today_data.get('tseolot', '')}"
        )
        
    formatted_msg = base_header + body + "\n\n🕊️ <i>ሕይወታችንን በኦርቶዶክሳዊት ተዋሕዶ ሥርዓትና በትምህርተ አበው እናቅና። በእንተ ስማ ለማርያም ወገኖቻችንን እንርዳ!👩‍👩‍👦👇</i>"
    
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
        f"📜 **ስንክሳር (የቅዱሳን ታሪክ)፦**\n{day_data.get('sinksar', '')}\n\n"
        f"{day_data.get('gitsawe', '')}\n\n"
        f"📖 **የዕለቱ ሰፊ ትምህርት፦**\n{day_data.get('wongel_zirzir', '')}\n\n"
        f"💡 **የአበው ምክር (ትምህርት)፦**\n{day_data.get('abew_timhirt', '')}\n\n"
        f"🙏 **የጸሎት ማዕድ፦**\n{day_data.get('tseolot', '')}\n\n"
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
