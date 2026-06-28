import os
import datetime
import requests
from ethiopian_date import EthiopianDateConverter
from supabase import create_client, Client

# የ GitHub Secrets መረጃዎችን ማንበብ
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
# የቴሌግራም ቻናልህ ዩዘርኔም (ለምሳሌ፦ "@MyChannel") ወይም የግሩፑ ID
CHANNEL_ID = "@BeenteSmaMariam_Channel" # <-- እዚህ ላይ የቻናልህን ትክክለኛ ዩዘርኔም ተካው

if not url or not key:
    print("ስህተት: Supabase URL ወይም Key አልተገኘም! እባክህ GitHub Secrets ላይ አረጋግጥ።")
    exit(1)

supabase: Client = create_client(url, key)

def get_ethiopian_day():
    """የዛሬውን የኢትዮጵያ ቀን (ከ1-30) የሰዓት መዛባትን አስተካክሎ ያወጣል"""
    # የ GitHub ሰርቨርን UTC ሰዓት መውሰድ
    utc_now = datetime.datetime.utcnow()
    # የኢትዮጵያን ሰዓት ለማግኘት 3 ሰዓት መደመር (EAT = UTC + 3)
    eth_time = utc_now + datetime.timedelta(hours=3)
    
    print(f"የሰርቨር ሰዓት (UTC): {utc_now.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"የኢትዮጵያ ሰዓት (EAT): {eth_time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # የጎርጎርዮሳዊያኑን ቀን ወደ ኢትዮጵያ ይቀይራል
    eth_year, eth_month, eth_day = EthiopianDateConverter.to_ethiopian(eth_time.year, eth_time.month, eth_time.day)
    return eth_day

def send_telegram_blessing(holiday_name, scripture_quote):
    """የዕለቱን በዓል እና ጥቅስ ወደ ቴሌግራም ቻናል በራስ-ሰር ይልካል"""
    if not BOT_TOKEN:
        print("ማስጠንቀቂያ: TELEGRAM_BOT_TOKEN ስላልተዋቀረ መልዕክቱ አልተላከም።")
        return

    message_text = (
        f"✨ **የዕለቱ የበረከት መልዕክት** ✨\n\n"
        f"📅 **ዛሬ የኢትዮጵያ ቀን፦** ቀን {get_ethiopian_day()}\n"
        f"⛪ **የዕለቱ በዓል፦** {holiday_name}\n\n"
        f"📖 **የዕለቱ ጥቅስ፦**\n\"{scripture_quote}\"\n\n"
        f"👉 @BeenteSmaMariam_bot ውስጥ በመግባት ዕለታዊ ሪፖርትዎን እና በረከትዎን ይውሰዱ!"
    )
    
    payload = {
        "chat_id": CHANNEL_ID,
        "text": message_text,
        "parse_mode": "Markdown"
    }
    
    try:
        res = requests.post(f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage", json=payload)
        if res.status_code == 200:
            print("🚀 የዕለቱ መልዕክት በተሳካ ሁኔታ ወደ ቴሌግራም ተልኳል!")
        else:
            print(f"የቴሌግራም ስህተት: {res.text}")
    except Exception as e:
        print(f"ወደ ቴሌግራም ለመላክ ሲሞከር ስህተት አጋጠመ: {e}")

def check_and_update_today():
    eth_day = get_ethiopian_day()
    print(f"የተሰላው የኢትዮጵያ ቀን: ቀን {eth_day} ነው")
    
    # ከ Supabase ላይ የእለቱን በዓል መረጃ መፈለግ
    response = supabase.table("daily_blessings").select("*").eq("day_number", eth_day).execute()
    
    if response.data:
        today_data = response.data[0]
        holiday_name = today_data.get('holiday_name', 'የማርያም በዓል')
        scripture_quote = today_data.get('scripture_quote', 'በእንተ ስማ ለማርያም')
        
        print(f"ዛሬ የሚከበረው በዓል: {holiday_name}")
        print(f"የዕለቱ ጥቅስ: {scripture_quote}")
        
        # ወደ ቴሌግራም መልዕክት መላክ
        send_telegram_blessing(holiday_name, scripture_quote)
    else:
        print(f"ማስጠንቀቂያ: ለቀን {eth_day} በዳታቤዙ ላይ የተጫነ መረጃ የለም!")

if __name__ == "__main__":
    check_and_update_today()
