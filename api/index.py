import os
import random
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)
handler = app # 👈 ቪርሴል ሰርቨሩን በቀላሉ እንዲያገኘው ይህንን ጨምረናል!

TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_API = f"https://api.telegram.org/bot{TOKEN}"

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
        reply_markup = {
            "inline_keyboard": [[
                {
                    "text": "❤️ ቤተሳይዳን ክፈት",
                    "web_app": {"url": f"https://{request.host}/"}
                }
            ]]
        }
        send_message(chat_id, welcome_text, reply_markup)
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

def send_message(chat_id, text, reply_markup=None):
    url = f"{TELEGRAM_API}/sendMessage"
    payload = {"chat_id": chat_id, "text": text, "parse_mode": "HTML"}
    if reply_markup:
        payload["reply_markup"] = reply_markup
    requests.post(url, json=payload)
