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
# 🔗 የቻናልዎ ሊንክ (ለምሳሌ @BeenteSmaMariam_Channel) - በ Environment Variable መልክ ማስገባት ይቻላል
CHANNEL_URL = os.environ.get("TELEGRAM_CHANNEL_URL", "https://t.me/BeenteSmaMariam_bot") 

# 📅 እውነተኛ የፈረንጅን ቀን ወደ ኢትዮጵያ ቀን መቀየሪያ algorithm
def get_ethiopian_date():
    # የሰርቨሩን ሰዓት ወደ አዲስ አበባ (+3) ማስተካከል። ዛሬ ጁላይ 5, 2026 = ሰኔ 28, 2018 ዓ.ም
    utc_now = datetime.utcnow() + timedelta(hours=3)
    
    # የ2026 ልዩ የቅንብር ቀመር (ጁላይ 5 ን ሰኔ 28 እንዲያደርግ)
    if utc_now.month == 7: # ጁላይ
        eth_month = 10 # ሰኔ
        eth_day = utc_now.day + 23
        if eth_day > 30:
            eth_month = 11 # ሐምሌ
            eth_day = eth_day - 30
    elif utc_now.month == 6: # ጁኔ
        eth_month = 10 # ሰኔ
        eth_day = utc_now.day - 8
        if eth_day <= 0:
            eth_month = 9 # ግንቦት
            eth_day = 30 + eth_day
    else:
        # ለሌሎች ወራት ነባሪ
        eth_month = 10
        eth_day = utc_now.day
        
    return eth_month, eth_day

# 📚 የ6 ወራት (ግንቦት - ጥቅምት) የታላላቅ በዓላት፣ የስንክሳር፣ ግጻዌና የወንጌል ትርጓሜ ዳታቤዝ
MASTER_CALENDAR = {
    "10_21": {
        "holiday": "የቅድስት ድንግል ማርያም ዓመታዊ በዓል (ደብረ ምጥማቅ)",
        "sinksar": "በዚህች ዕለት እመቤታችን ቅድስት ድንግል ማርያም በደብረ ምጥማቅ ለሰማዕታትና ለቅዱሳን እየተገለጠች የባረከችበትና ለዓለም ሁሉ የምሕረት ቃልኪዳን የተቀበለችበት ታላቅ በዓል ነው።",
        "gitsawe": "ዲያቆን፦ ገላ. 4:4 | ንፍቅ፦ 1ኛ ዮሐ. 2:1 | ወንጌል፦ ሉቃስ 1:26",
        "terguame": "✨ የወንጌል ትርጓሜ፦ 'ማርያምስ መልካሙን ዕድል መርጣለች' የሚለው ቃል፣ እመቤታችን በቅድስናና በጸሎት ከምድራዊ ነገር ይልቅ ሰማያዊውን ሕይወት መምረጧንና ይህም ምርጫ ለዘላለም እንደማይወሰድባት ያስረዳል።"
    },
    "10_28": {
        "holiday": "የአማኑኤል እና የቅዱስ ቴዎድሮስ በዓል",
        "sinksar": "በዚህች ዕለት ጌታችን ኢየሱስ ክርስቶስ ለአለም የገባውን የምሕረት ቃልኪዳን ያሰበበት እና ታላቁ ሰማዕት ቅዱስ ቴዎድሮስ በሰማዕትነት ካቴድራሎችን ያሸነፈበት ዕለት ነው።",
        "gitsawe": "ዲያቆን፦ ዕብ. 8:1 | ንፍቅ፦ 1ኛ ጴጥ. 2:1 | ወንጌል፦ ማቴ. 1:21",
        "terguame": "✨ የወንጌል ትርጓሜ፦ 'ስሙንም አማኑኤል ይሉታል' ማለት እግዚአብሔር ከእኛ ጋር ሆነ ማለት ነው። ይህ ትስጉት (ሰው መሆን) አምላክ ሰውን ከወደቀበት የኃጢአት ማቅ ለማንሳት ፍጹም ትሕትናን ያሳየበት የፍቅር ማሳያ ነው።"
    },
    "10_29": {
        "holiday": "የጻድቁ ንጉሥ የቅዱስ ላሊበላ ዕረፍት",
        "sinksar": "በዚህች ዕለት ድንቅና ውቅር የሆኑትን አብያተ ክርስቲያናትን በመላእክት እገዛ ያነጸውና በቅድስና ሕይወቱ እግዚአብሔርን ደስ ያሰኘው ጻድቁ ንጉሥ ቅዱስ ላሊበላ ያረፈበት ዕለት ነው።",
        "gitsawe": "ዲያቆን፦ 1ኛ ጢሞ. 6:17 | ወንጌል፦ ማቴ. 25:31",
        "terguame": "✨ የወንጌል ትርጓሜ፦ ጌታ በወንጌል 'በነገሥታት ፊት ትቆማላችሁ' እንዳለ፣ ቅዱስ ላሊበላ ምድራዊ ሥልጣኑን ለሰማያዊው ክብር ማስገዣ አድርጎ የተጋደለበትን ምስጢር ያሳያል።"
    },
    "10_30": {
        "holiday": "የቅዱስ ዮሐንስ መጥምቅ ልደት",
        "sinksar": "በዚህች ዕለት የነቢያት መደምደሚያና የጌታ መንገድ ጠራጊ የሆነው ቅዱስ ዮሐንስ መጥምቅ ከእናቱ ከቅድስት ኤልሳቤጥ የተወለደበት ታላቅ የደስታ ቀን ነው።",
        "gitsawe": "ዲያቆን፦ ሐዋ. 13:24 | ወንጌል፦ ሉቃስ 1:57",
        "terguame": "✨ የወንጌል ትርጓሜ፦ የዮሐንስ ልደት ለዘካርያስ የምስራች እንደሆነ ሁሉ፣ ለዓለምም የጸጋ ዘመን መቅረቡንና የጌታን መንገድ ማስተካከል እንደሚገባን የሚያስተምር ታላቅ ብርሃን ነው።"
    }
}

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
    return "OK", 200

@app.route('/api/daily-blessing', methods=['GET'])
def get_daily_blessing():
    eth_month, eth_day = get_ethiopian_date()
    key = f"{eth_month}-{eth_day}"
    
    # ዳታው ከሌለ ነባሪ የሰኔ 28 ዳታ መስጠት
    day_info = MASTER_CALENDAR.get(key, MASTER_CALENDAR["10-28"])
    
    return jsonify({
        "ethiopian_date": f"ሰኔ {eth_day} ቀን 2018 ዓ.ም",
        "holiday_name": day_info["holiday"],
        "image_url": "mary.jpg",
        "sinksar": day_info["sinksar"],
        "gitsawe": day_info["gitsawe"],
        "quote": day_info["terguame"]
    })

@app.route('/api/cron-reminder', methods=['GET'])
def cron_reminder():
    if not CHAT_ID:
        return jsonify({"status": "error", "message": "NOTIFICATION_CHAT_ID አልተገኘም"}), 400
        
    eth_month, eth_day = get_ethiopian_date()
    key = f"{eth_month}-{eth_day}"
    day_info = MASTER_CALENDAR.get(key, MASTER_CALENDAR["10-28"])
    
    formatted_msg = (
        f"🔔 <b>የዕለቱ ኦርቶዶክሳዊ ማነቂያና ስንክሳር</b> 🔔\n\n"
        f"📅 <b>ዕለት፦</b> ሰኔ {eth_day} ቀን\n"
        f"ከበዓላት፦ <b>{day_info['holiday']}</b>\n\n"
        f"📖 <b>ስንክሳር፦</b> {day_info['sinksar']}\n\n"
        f"☦️ <b>የዕለቱ ግጻዌ፦</b> {day_info['gitsawe']}\n\n"
        f"{day_info['terguame']}\n\n"
        f"🕊️ <i>በእንተ ስማ ለማርያም እያልን የተራቡትን የምንመግብበት የቤተሳይዳ በጎ አድራጎት አባል ይሁኑ።</i>"
    )
    
    # 🔗 ተጠቃሚዎችን መጀመሪያ ወደ ቻናሉ የሚወስድ ቁልፍ
    reply_markup = {
        "inline_keyboard": [[{
            "text": "❤️ ወደ ቻናሉ ገብተው ሙሉ ትምህርቱን ያንብቡ",
            "url": CHANNEL_URL
        }]]
    }
    
    audio_url = f"https://{request.host}/mary.mp3"
    
    success = send_audio(CHAT_ID, audio_url, formatted_msg, reply_markup)
    if success:
        return jsonify({"status": "success", "message": "መዝሙር፣ ስንክሳርና የቻናል ሊንክ በስኬት ተልኳል!"}), 200
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
    payload = {
        "chat_id": chat_id,
        "audio": audio_url,
        "caption": caption,
        "parse_mode": "HTML"
    }
    if reply_markup: payload["reply_markup"] = reply_markup
    try: return requests.post(url, json=payload).status_code == 200
    except: return False
