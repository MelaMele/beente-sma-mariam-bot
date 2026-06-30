import os
import random
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
# ቪርሴል ላይ በራስ-ሰር የሚሰራ የቴሌግራም ሊንክ
TELEGRAM_API = f"https://api.telegram.org/bot{TOKEN}"

# 1. የቅዱሳን፣ የድርሳናት እና የመጽሐፍ ቅዱስ የማንቂያ ጥቅሶች ስብስብ (ያለ ዳታቤዝ የሚሰራ)
SPIRITUAL_QUOTES = [
    {
        "text": "“ስጡ ይሰጣችኋል፤... በምትሰፍሩበት መስፈሪያ ተመልሶ ይሰፈርላችኋልና።”",
        "source": "ጌታችን ኢየሱስ ክርስቶስ (ሉቃስ 6:36)"
    },
    {
        "text": "“ለነዳያን የምትሰጠው ገንዘብ አትጥፋብኝ ብለህ የምትቀብረው ሳይሆን፣ ወደ ሰማይ የምታስቀድመው እውነተኛ ሀብትህ ነው።”",
        "source": "ቅዱስ ዮሐንስ አፈወርቅ"
    },
    {
        "text": "“ምጽዋት ሰጪውን እንጂ ተቀባዩን ብቻ አይጠቅምም። ለሰጪው የኃጢአት መደምሰሻ፣ የጽድቅም መክፈቻ ናት።”",
        "source": "ቅዱስ ባስልዮስ ታላቁ"
    },
    {
        "text": "“የተራበውን ሰው ስታይ ክርስቶስን እንዳየህ ቁጠረው፤ ምክንያቱም እርሱ 'በነዚህ ከሁሉ ለሚያንሱ ካደረጋችሁት ለእኔ አደረጋችሁት' ብሏል።”",
        "source": "ቅዱስ ኤፍሬም ሶርያዊ"
    },
    {
        "text": "“ሰብአዊነት ለሰው ልጅ ማዘንና መድረስ የሃይማኖት ልዩነት አይጠይቅም። ልብህ ለሌላው ሲራራ አንተ እውነተኛ የፈጣሪ ምስል ነህ።”",
        "source": "ከአבות መንፈሳዊ ምክር"
    },
    {
        "text": "“የማስተሰረያ ቀን ሳይመጣብህ በፊት እጅህን ለመስጠት ዘርጋ፤ ምጽዋት ከሞት ታድናለችና።”",
        "source": "መጽሐፈ ጦቢት (ድርሳነ ሚካኤል)"
    }
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
        # የተጠቃሚውን ስም መውሰድ
        first_name = message["chat"].get("first_name", "ክቡር ምዕመን")
        
        welcome_text = (
            f"እንኳን ወደ <b>ቤተሳይዳ መንፈሳዊ በጎ አድራጎት</b> መድረክ በደህና መጡ፣ {first_name}!\n\n"
            f"ይህ መድረክ የተቸገሩትን ለመርዳት፣ ለገዳማት መባ ለማቅረብ እና በየ 30 ደቂቃው "
            f"የቅዱሳን አባቶችን ትምህርት የምናገኝበት የምሕረት ቤት ነው።\n\n"
            f"እባክዎ ከታች ያለውን ቁልፍ በመንካት ይሳተፉ፦"
        )
        
        reply_markup = {
            "inline_keyboard": [[
                {
                    "text": "❤️ ቤተሳይዳን ክፈት",
                    "web_app": {"url": "https://beente-sma-mariam-bot.vercel.app/"}
                }
            ]]
        }
        
        send_message(chat_id, welcome_text, reply_markup)

    return "OK", 200

# 2. በየ 30 ደቂቃው ለሚኒ አፑ ጥቅስ የሚያቀርበው አዲሱ መስመር (Route)
@app.route('/api/daily-blessing', methods=['GET'])
def get_daily_blessing():
    # ከዝርዝሩ ውስጥ በዘፈቀደ (Random) አንድ ጥቅስ መርጦ ለድረ-ገጹ ይሰጣል
    quote = random.choice(SPIRITUAL_QUOTES)
    return jsonify({
        "holiday_name": "የቤተሳይዳ ዕለታዊ ማንቂያ",
        "image_url": "mary.jpg", # እኛ የጫንነው እውነተኛ ስዕል
        "quote": f"{quote['text']} — {quote['source']}"
    })

def send_message(chat_id, text, reply_markup=None):
    url = f"{TELEGRAM_API}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML"
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup
    requests.post(url, json=payload)
