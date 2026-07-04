import os
import random
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)
handler = app 

TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_API = f"https://api.telegram.org/bot{TOKEN}"
CHAT_ID = os.environ.get("NOTIFICATION_CHAT_ID")

CHURCH_CALENDAR = {
    21: {
        "holiday": "የቅድስት ድንግል ማርያም ዓመታዊ መታሰቢያ",
        "sinksar": "በዚህች ዕለት እመቤታችን ቅድስት ድንግል ማርያም ለዓለም ሁሉ መድኃኒት የሆነውን ጌታችንን የወለደችበትና በደብረ ምጥማቅ የተገለጠችበት ታላቅ በዓል ነው።",
        "gitsawe": "ዲያቆን፦ ገላ. 4:4 | ንፍቅ፦ 1ኛ ዮሐ. 2:1 | ካህን፦ ሐዋ. 1:12 | ወንጌል፦ ሉቃስ 1:26",
        "quote": "“ትውልድ ሁሉ ብፅዕት ይሉኛል።” (ሉቃስ 1:48) — እመቤታችን ቅድስት ድንግል ማርያም"
    },
    22: {
        "holiday": "የቅዱስ ዑራኤል ሊቀ መላእክት በዓል",
        "sinksar": "በዚህች ዕለት ቅዱስ ዑራኤል መልአክ ለቅዱስ ዕዝራ የዕውቀትን ጽዋ ያጠጣበት እና የጌታችንን ደም ለአለም የረጨበት መታሰቢያው ነው።",
        "gitsawe": "ዲያቆን፦ ዕብ. 1:1 | ንፍቅ፦ 1ኛ ጴጥ. 1:10 | ካህን፦ ሐዋ. 12:6 | ወንጌል፦ ዮሐ. 5:1",
        "quote": "“የቅዱሳን መላእክት ጥበቃ ካላችሁ ከምንም አትፍሩ።” — ቅዱስ ዮሐንስ አፈወርቅ"
    },
    23: {
        "holiday": "የቅዱስ ጊዮርጊስ ሰማዕት መታሰቢያ",
        "sinksar": "በዚህች ዕለት የታላቁ ሰማዕት የኮከበ ኮከባን የቅዱስ ጊዮርጊስ አጥንቱ የተከሰከሰበትና ፈጣሪው መልሶ ያስነሳበት ድንቅ ዕለት ነው።",
        "gitsawe": "ዲያቆን፦ 2ኛ ጢሞ. 2:3 | ንፍቅ፦ ጃኮብ 1:12 | ካህን፦ ሐዋ. 23:10 | ወንጌል፦ ማቴ. 10:16",
        "quote": "“እምነትህን በምግባር ግለጠው፤ ሰማዕታት ሕይወታቸውን የሰጡት ለእውነት ነው።” — ቅዱስ ባስልዮስ ታላቁ"
    },
    24: {
        "holiday": "የአቡነ ተክለሃይማኖት መታሰቢያ",
        "sinksar": "በዚህች ዕለት ታላቁ ጻድቅ አቡነ ተክለሃይማኖት በደብረ ሊባኖስ በጸሎት የቆሙበትና ገዳማውያንን የባረኩበት ወርሃዊ መታሰቢያቸው ነው።",
        "gitsawe": "ዲያቆን፦ ኤፌ. 6:10 | ንፍቅ፦ 2ኛ ጴጥ. 3:1 | ካህን፦ ሐዋ. 20:17 | ወንጌል፦ ማቴ. 19:27",
        "quote": "“የጻድቅ መታሰቢያ ለበረከት ነው።” (ምሳሌ 10:7)"
    }
}

GENERAL_ADVICE = [
    {"msg": "“የተራበውን ሰው ስታይ ሰብአዊነትህ ይንቀሳቀስ፤ መለገስ የሃይማኖት ልዩነት አይጠይቅም።”", "author": "የአበው ምክር"},
    {"msg": "“ምጽዋት ሰጪውን እንጂ ተቀባዩን ብቻ አይጠቅምም። ለሰጪው የጽድቅም መክፈቻ ናት።”", "author": "ቅዱስ ዮሐንስ አፈወርቅ"},
    {"msg": "“እግዚአብሔር በደስታ የሚሰጠውን ይወዳልና።”", "author": "2ኛ ቆሮንቶስ 9:7"},
    {"msg": "“ለደሃ የሚሰጥ ለእግዚአብሔር ያበድራል፤ ማንም ልቡን ክፍት አድርጎ ለሌላው ሊራራ ይገባል።”", "author": "መጽሐፈ ምሳሌ"}
]

SPIRITUAL_TEACHINGS = [
    "“ጸሎት ማለት ከእግዚአብሔር ጋር መነጋገር ነው። እስትንፋስ ለሥጋ እንደሚያስፈልገው ሁሉ፣ ጸሎትም ለነፍስ እንዲሁ ያስፈልጋታል።” — ቅዱስ ዮሐንስ አፈወርቅ",
    "“በቤተክርስቲያን ሥርዓት መሠረት፣ ንስሐ የሌለው ሕይወት ፍሬ የሌለው ዛፍ ነው። ሁልጊዜ ከንስሐ አባትዎ ጋር በመገናኘት ነፍስዎን ያነጹ።” — የአበው ትምህርት",
    "“ምጽዋት ስታደርግ ቀኝህ የምታደርገውን ግራህ አያውቀው የተባለው ለትዕቢት እንዳይሆንብህ ነው። በፍቅርና በትሕትና የተደረገ ስጦታ በእግዚአብሔር ዘንድ ተወዳጅ ነው።” — ቅዱስ ባስልዮስ ዘቂሳሪያ",
    "“ቅዱስ ቁርባን የሕይወት ምግብ ነው። ራሳችንን በንስሐ አዘጋጅተን ቅዱስ ሥጋውንና ክቡር ደሙን መቀበል ዘላለማዊ ሕይወትን መውረስ ነው።” — ሥርዓተ ቤተክርስቲያን",
    "“ጠላትህን ውደድ የተባልከው እርሱ እንዲለወጥና አንተም የክርስቶስ እውነተኛ ተከታይ እንድትሆን ነው። በቀል የክርስቲያን ግብር አይደለም።” — ቅዱስ ኤፍሬም ሶርያዊ",
    "“ can't አማኝ ሳይሆን አይቶ ማመን የቶማስ ድንካሬ እንጂ ድክመት አልነበረም። እምነታችን በቅዱሳት መጻሕፍት ላይ የጸና ይሁን።” — ቅዱስ ቶማስ ሐዋርያ",
    "“ጾም ማለት ምግብ ከመከልከል አልፎ ዓይንን ከማየት፣ አንደበትን ከመናገር፣ ልብን ክፉ ከማሰብ መጠበቅ ነው። እውነተኛ ጾም ከፍቅር ጋር ይሠራል码።” — ቅዱስ ያዕቆብ ዘዕንጉግ",
    "“ክርስቲያን መሆን ማለት በቃል ብቻ ሳይሆን በኑሮ ክርስቶስን መምሰል ማለት ነው። ምግባር የሌለው እምነት የሞተ ነው።” — ቅዱስ አትናቴዎስ ሐዋርያዊ"
]

@app.route('/api', methods=['POST'])
def webhook():
    update = request.get_json()
    if not update or "message" not in update:
        return "OK", 200

    message = update["message"]
    chat_id = message["chat"]["id"]
    text = message.get("text", "")

    # 1. ተጠቃሚው መጀመሪያ ሲመጣ ወይም /start ሲል
    if text.startswith("/start"):
        welcome_text = (
            f"እንኳን ወደ <b>ቤተሳይዳ መንፈሳዊ በጎ አድራጎት</b> መድረክ በደህና መጡ! 🎉\n\n"
            f"ይህ መድረክ 'በእንተ ስማ ለማርያም' እያልን የተቸገሩትን የምንረዳበት የምሕረት ቤት ነው።\n\n"
            f"እባክዎ ከታች ያለውን ቁልፍ ተጭነው መድረኩን ይክፈቱ፦"
        )
        reply_markup = {
            "inline_keyboard": [[
                {
                    "text": "❤️ ቤተሳይዳን ክፈት",
                    "web_app": {"url": f"https://{request.host}/"}
                }
            ]]
        }
        send_message(chat_id, welcome_text, reply_markup)
        
    # 2. ተጠቃሚው ሌላ ማናቸውንም ጽሑፍ ወይም ሊንክ ሲልክ ዝም እንዳይል ማነቂያ ቁልፍ መመለስ
    else:
        reminder_text = (
            f"የተወደዱ ምዕመን! 🕊\n\n"
            f"የዕለቱን ስንክሳር ለማንበብ፣ የበረከት ነጥቦችን ለመሰብሰብ እና የበጎ አድራጎት ተሳትፎ ለማድረግ እባክዎ ከታች ያለውን ቁልፍ ተጭነው ወደ መተግበሪያችን ይግቡ፦"
        )
        reply_markup = {
            "inline_keyboard": [[
                {
                    "text": "❤️ ወደ ቤተሳይዳ መድረክ ግባ",
                    "web_app": {"url": f"https://{request.host}/"}
                }
            ]]
        }
        send_message(chat_id, reminder_text, reply_markup)
        
    return "OK", 200

@app.route('/api/daily-blessing', methods=['GET'])
def get_daily_blessing():
    now = datetime.utcnow() + timedelta(hours=3)
    eth_day = 21 + (now.day % 4) 
    
    day_info = CHURCH_CALENDAR.get(eth_day, CHURCH_CALENDAR[21])
    advice = random.choice(GENERAL_ADVICE)
    
    return jsonify({
        "ethiopian_date": f"ሰኔ {eth_day} ቀን 2018 ዓ.ም",
        "holiday_name": day_info["holiday"],
        "image_url": "mary.jpg",
        "sinksar": day_info["sinksar"],
        "gitsawe": day_info["gitsawe"],
        "quote": f"{advice['msg']} — {advice['author']}"
    })

# 🔔 በየ 30 ደቂቃው መልእክት ከማነቂያ ቁልፍ (Button) ጋር ወደ ቻናል የሚልክ መስመር
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
    
    BOT_USERNAME = os.environ.get("TELEGRAM_BOT_USERNAME", "beente_sma_mariam_bot")
    
    reply_markup = {
        "inline_keyboard": [[
            {
                "text": "❤️ ማንም ሳይጸጸት በደስታ ይስጥ (ወደ ቦቱ ግባ)",
                "url": f"https://t.me/@BeenteSmaMariam_bot?start=true"
            }
        ]]
    }
    
    success = send_message(CHAT_ID, formatted_msg, reply_markup)
    if success:
        return jsonify({"status": "success", "message": "ማነቂያ መልእክት ከነቁልፉ ተልኳል"}), 200
    else:
        return jsonify({"status": "error", "message": "መልእክት መላክ አልተቻለም"}), 500

def send_message(chat_id, text, reply_markup=None):
    url = f"{TELEGRAM_API}/sendMessage"
    payload = {"chat_id": chat_id, "text": text, "parse_mode": "HTML"}
    if reply_markup:
        payload["reply_markup"] = reply_markup
    try:
        response = requests.post(url, json=payload)
        return response.status_code == 200
    except:
        return False
