import os
import datetime
from ethiopian_date import EthiopianDateConverter
from supabase import create_client, Client

# የ GitHub Secrets መረጃዎችን ማንበብ
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("ስህተት: Supabase URL ወይም Key አልተገኘም! እባክህ GitHub Secrets ላይ አረጋግጥ።")
    exit(1)

supabase: Client = create_client(url, key)

def get_ethiopian_day():
    """የዛሬውን የኢትዮጵያ ቀን (ከ1-30) ያወጣል"""
    now = datetime.datetime.now()
    # የጎርጎርዮሳዊያኑን ቀን ወደ ኢትዮጵያ ይቀይራል
    eth_date = EthiopianDateConverter.to_ethiopian(now.year, now.month, now.day)
    return eth_date[2] # ቀኑን ብቻ (day) ይመልሳል

def check_and_update_today():
    eth_day = get_ethiopian_day()
    print(f"የዛሬው የኢትዮጵያ ቀን: ቀን {eth_day} ነው")
    
    # ከ Supabase ላይ የእለቱን በዓል መረጃ መፈለግ
    response = supabase.table("daily_blessings").select("*").eq("day_number", eth_day).execute()
    
    if response.data:
        today_data = response.data[0]
        print(f"ዛሬ የሚከበረው በዓል: {today_data['holiday_name']}")
        print(f"የዕለቱ ጥቅስ: {today_data['scripture_quote']}")
        # እዚህ ጋር ለቴሌግራም ቻናልህ አውቶማቲክ መልዕክት መላክ ከፈለግክ የቴሌግራም API ማገናኘት ይቻላል
    else:
        print(f"ማስጠንቀቂያ: ለቀን {eth_day} በዳታቤዙ ላይ የተጫነ መረጃ የለም!")

if __name__ == "__main__":
    check_and_update_today()
