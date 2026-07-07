// 1. የቴሌግራም ዌብ አፕሊኬชั่น ማስነሻ እና የተጠቃሚ ስም ማውጫ
const tg = window.Telegram?.WebApp;
let telegramUserId = "member";

if (tg) {
    tg.ready();
    tg.expand();
    const user = tg.initDataUnsafe?.user;
    if (user) {
        telegramUserId = user.id;
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) userNameEl.innerText = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "ክቡር ምዕመን";
    } else {
        if (document.getElementById('user-name')) document.getElementById('user-name').innerText = "ክቡር ምዕመን";
    }
}

// 2. 💡 የተስተካከለ የኢትዮጵያ ቀን መቀየሪያ ቀመር (ሐምሌን ጨምሮ)
function getEthiopianDate() {
    const now = new Date();
    let gYear = now.getFullYear();
    let gMonth = now.getMonth() + 1;
    let gDay = now.getDate();

    let ethMonth = 10; // ሰኔ 
    let ethDay = 1;
    let ethYear = gYear - 8;

    // በጁላይ (July) ወር ውስጥ ከሆንን
    if (gMonth === 7) {
        ethDay = gDay + 23; 
        if (ethDay > 30) {
            ethDay = ethDay - 30;
            ethMonth = 11; // ሐምሌ
        }
    } 
    // በጁን (June) ወር ውስጥ ከሆንን
    else if (gMonth === 6) {
        if (gDay >= 8) {
            ethDay = gDay - 7;
        } else {
            ethMonth = 9; // ግንቦት
            ethDay = gDay + 24;
        }
    }

    return { month: ethMonth, day: ethDay, year: ethYear };
}

// 3. 📚 የዕለታዊ ስንክሳር፣ ግጻዌ እና የአበው ምክር ዳታቤዝ (ሰኔ 30 እና ሐምሌ 1 - 10)
const dailySpiritualData = {
    "10_30": {
        "holiday": "የቅዱስ ዮሐንስ መጥምቅ መታሰቢያ",
        "sinksar": "በዚህች ዕለት የነቢያት መደምደሚያና የጌታ መንገድ ጠራጊ የሆነው ቅዱስ ዮሐንስ መጥምቅ የተወለደበት ዓመታዊ ታላቅ በዓል ነው።",
        "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ ሐዋ. 13:24-32\n• ካቶሊክ፦ 1ኛ ዮሐ. 3:1-3\n• ሐዋ. ሥራ፦ ሐዋ. 19:1-7\n• ምስባክ፦ መዝ. 71:6 «እንደ ዝናብ በበግ ፀጉር ላይ ይወርዳል፥ በምድር ላይ እንደሚጠብጥ ጠብታ።»\n• ወንጌል፦ ሉቃስ 1:57-80",
        "wongel_zirzir": "📖 የዕለቱ ወንጌል ሰፊ አንድምታ፦ ከሴቶች ከተወለዱት መካከል እንደ ዮሐንስ መጥምቅ ያለ አልተነሳም፤ እርሱ የእውነትና የንስሐ መምህር ነው።",
        "abew_timhirt": "💡 የአበው ትምህርት፦ «ዮሐንስ መጥምቅ 'እርሱ ሊልቅ እኔ ግን ላንስ ያስፈልጋል' በማለት የትሕትናን ጥልቅ ምሥጢር አስተምሮናል።» — ቅዱስ ዮሐንስ አፈወርቅ",
        "tseolot": "🙏 የጸሎት ማዕድ፦ በቅዱስ ዮሐንስ መጥምቅ ጸሎትና አማላጅነት የንስሐ ዕድሜን ስጠን።"
    },
    "11_1": {
        "holiday": "ቅድስት ሥላሴ እና ቅዱስ ራጉኤል ሊቀ መላእክት",
        "sinksar": "በዚህች ዕለት ዓለምን በቸርነታቸው የሚያስተዳድሩ የቅድስት ሥላሴ ወርሃዊ በዓል እና የፍትሕና የብርሃን መልአክ የቅዱስ ራጉኤል መታሰቢያ ነው።",
        "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ ሮሜ 11:33-36\n• ካቶሊክ፦ 1ኛ ዮሐ. 5:1-12\n• ሐዋ. ሥራ፦ ሐዋ. 17:22-31\n• ምስባክ፦ መዝ. 2:11 «ለእግዚአብሔር በፍርሃት ተገዙ፥ በረዓድም ደስ ይበላችሁ።»\n• ወንጌል፦ ማቴ. 28:16-20",
        "wongel_zirzir": "📖 የዕለቱ ትምህርት፦ አምላካችን ሥላሴ በረከትንና ሰላምን የሚሰጥ አባት ነው። በትሕትና ወደ እርሱ የምንቀርብበት አዲስ ወር ይሁንልን።",
        "abew_timhirt": "💡 የአበው ትምህርት፦ «ሥላሴን ስናምን በአንድነትና በሦስትነት ነው፤ ፍቅር የእነርሱ መገለጫ እንደሆነ ሁሉ እኛም እርስ በርሳችን በፍቅር ልንኖር ይገባል።» — ቅዱስ አትናቴዎስ",
        "tseolot": "🙏 የጸሎት ማዕድ፦ ቅድስት ሥላሴ ሆይ! በምሕረትዎ ጎብኙን።"
    },
    "11_2": {
        "holiday": "ቅዱስ ታዴዎስ ሐዋርያ",
        "sinksar": "በዚህች ዕለት ከ72ቱ አርድእት አንዱ የሆነውና ስለ ወንጌል እውነት መከራን የተቀበለው ቅዱስ ታዴዎስ ሐዋርያ መታሰቢያው ነው።",
        "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ 1ኛ ቆሮ. 4:9-16\n• ካቶሊክ፦ ይሁዳ 1:1-8\n• ሐዋ. ሥራ፦ ሐዋ. 15:22-31\n• ምስባክ፦ መዝ. 18:4 «ድምፃቸው ወደ ምድር ሁሉ ቃላቸውም እስከ ዓለም ዳርቻ ወጣ።»\n• ወንጌል፦ ማቴ. 10:1-15",
        "wongel_zirzir": "📖 የወንጌል አንድምታ፦ ሐዋርያት ዓለምን የዞሩት በፍቅርና በእምነት ኃይል ነው። የእነርሱ አገልግሎት የቤተክርስቲያን መሠረት ነው።",
        "abew_timhirt": "💡 የአበው ትምህርት፦ «የእግዚአብሔር ቃል በልብህ ሲታተም፣ ምድራዊ ፍርሃት ለአንተ ስፍራ አይኖረውም።» — የአበው ምክር",
        "tseolot": "🙏 የጸሎት ማዕድ፦ አቤቱ በሐዋርያት እምነት አጽናን።"
    },
    "11_3": {
        "holiday": "የቅዱስ ዜና ማርቆስ ጻድቅ በዓል",
        "sinksar": "በዚህች ዕለት ታላቁ ገዳማዊና ጻድቅ አባታችን አቡነ ዜና ማርቆስ በቅድስናና በተጋድሎ የኖሩበት ወርሃዊ መታሰቢያቸው በክብር ይታሰባል።",
        "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ ገላ. 5:16-26\n• ካቶሊክ፦ ያዕቆብ 4:1-10\n• ሐዋ. ሥራ፦ ሐዋ. 21:15-26\n• ምስባክ፦ መዝ. 33:19 «የጻድቃን መከራቸው ብዙ ነው፥ እግዚአብሔርም ከሁሉ ያድናቸዋል።»\n• ወንጌል፦ ሉቃስ 12:32-40",
        "wongel_zirzir": "📖 የወንጌል ትርጓሜ፦ ጻድቃን የመንግሥተ ሰማያትን ክብር በመናፈቅ ሕይወታቸውን ለጸሎትና ለጾም አሳልፈው ሰጥተዋል።",
        "abew_timhirt": "💡 የአበው ትምህርት፦ «እውነተኛ ዕረፍት የሚገኘው ከምድራዊ ምኞት ርቀህ ልብህን ለእግዚአብሔር ስትሰጥ ብቻ ነው።» — ቅዱስ መቃርስ",
        "tseolot": "🙏 የጸሎት ማዕድ፦ በጻድቁ አባታችን ጸሎት ሕይወታችንን ባርክ።"
    },
    "11_4": {
        "holiday": "ቅዱስ ዮሐንስ አፈወርቅ",
        "sinksar": "በዚህች ዕለት የቤተክርስቲያን ዓምድና የእውነት መምህር የሆነው ታላቁ ሊቅ ቅዱስ ዮሐንስ አፈወርቅ ወርሃዊ መታሰቢያው ነው።",
        "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ 2ኛ ጢሞ. 4:1-8\n• ካቶሊክ፦ 1ኛ ጴጥ. 5:1-11\n• ሐዋ. ሥራ፦ ሐዋ. 20:28-38\n• ምስባክ፦ መዝ. 48:3 «አፌ ጥበብን ይናገራል፥ የልቤም አሳብ ማስተዋልን።»\n• ወንጌል፦ ማቴ. 5:13-19",
        "wongel_zirzir": "📖 የዕለቱ ሰፊ ትምህርት፦ ዮሐንስ አፈወርቅ ያለ ፍርሃት እውነትን በመመስከሩ የተነሳ ተሰዷል። እኛም ለእውነት መቆም እንዳለብን ያስተምረናል።",
        "abew_timhirt": "💡 የአበው ትምህርት፦ «ሀብትና ሥልጣን ያልፋሉ፣ በቅድስና የተመሰረተ ሕይወት ግን ለዘላለም ጸንቶ ይኖራል።» — ቅዱስ ዮሐንስ አፈወርቅ",
        "tseolot": "🙏 የጸሎት ማዕድ፦ የእውነትን ቃል እንድንከተል ጸጋውን ስጠን።"
    },
    "11_5": {
        "holiday": "አቡነ ገብረ መንፈስ ቅዱስ ጻድቅ",
        "sinksar": "በዚህች ዕለት በምድረ ከብድ ታላቅ ተጋድሎን ያደረጉት መላእክትን የሚመስሉአቸው ጻድቁ አባታችን የአቡነ ገብረ መንፈስ ቅዱስ ወርሃዊ በዓላቸው ነው።",
        "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ ኤፌ. 6:10-18\n• ካቶሊክ፦ 2ኛ ጴጥ. 1:1-11\n• ሐዋ. ሥራ፦ ሐዋ. 28:16-24\n• ምስባክ፦ መዝ. 96:11 «ብርሃን ለጻድቃን ወጣ፥ ደስታም ለልበ ቅኖች።»\n• ወንጌል፦ ማቴ. 19:27-30",
        "wongel_zirzir": "📖 የወንጌል አንድምታ፦ አባታችን ለአገራችን ሰላምና ምሕረት ዘወትር የጸለዩ አባት ናቸው። የእነርሱ በረከት ከእኛ ጋር ነው።",
        "abew_timhirt": "💡 የአበው ትምህርት፦ «እንስሳትንና ፍጥረታትን በቅድስና ማስተዳደር የንጹሕ ልብ ውጤት ነው። ፍቅር ሁሉን ያሸንፋል።» — የአበው ምክር",
        "tseolot": "🙏 የጸሎት ማዕድ፦ በጻድቁ አባታችን ጸሎት ሀገራችንን ጠብቅልን።"
    },
    "11_6": {
        "holiday": "ቅዱስ አርሴማ ሰማዕት",
        "sinksar": "በዚህች ዕለት ስለ ንጽሕናዋና ስለ ክርስቶስ ፍቅር አንገቷን ለሰይፍ የሰጠችው ድንግሊቱና ኃያሊቱ ቅድስት አርሴማ ወርሃዊ መታሰቢያዋ ነው።",
        "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ 2ኛ ቆሮ. 10:1-6\n• ካቶሊክ፦ 1ኛ ዮሐ. 2:1-6\n• ሐዋ. ሥራ፦ ሐዋ. 16:11-15\n• ምስባክ፦ መዝ. 44:14 «የንግሥት ልጅ በውስጥ ክብር ናት፥ ልብስዋም በወርቅ የተሸለመ ነው።»\n• ወንጌል፦ ማቴ. 25:1-13",
        "wongel_zirzir": "📖 የዕለቱ ትምህርት፦ ቅድስት አርሴማ የወጣቶች የንጽሕናና የጽናት አርአያ ናት። ዓለምን በቅድስና ማሸነፍ እንደሚቻል ምስክር ናት።",
        "abew_timhirt": "💡 የአበው ትምህርት፦ «ንጽሕና የነፍስ መስታወት ነው፤ እግዚአብሔርን ለማየት ልብን ከክፋት ማጽዳት ቀዳሚው ተግባር ነው።» — ቅዱስ ቄርሎስ",
        "tseolot": "🙏 የጸሎት ማዕድ፦ ለወጣቶቻችን የንጽሕናን ሕይወት ስጣቸው።"
    },
    "11_7": {
        "holiday": "ቅዱስ ዲዮስቆሮስ ሊቀ ጳጳሳት",
        "sinksar": "በዚህች ዕለት ስለ ቀናች ሃይማኖት መከራን የተቀበለውና በኬልቄዶን ጉባኤ እውነትን የመሰከረው ቅዱስ ዲዮስቆሮስ መታሰቢያው ነው።",
        "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ 2ኛ ጢሞ. 1:6-14\n• ካቶሊክ፦ 1ኛ ጴጥ. 3:13-18\n• ሐዋ. ሥራ፦ ሐዋ. 23:1-11\n• ምስባክ፦ መዝ. 131:9 «ካህናቶችህ ጽድቅን ይልበሱ፥ ቅዱሳኖችህም ሐሴትን ያድርጉ።»\n• ወንጌል፦ ዮሐ. 10:11-18",
        "wongel_zirzir": "📖 የወንጌል ትርጓሜ፦ እውነተኛ እረኛ ስለ በጎቹ ሕይወቱን አሳልፎ ይሰጣል። ቅዱስ ዲዮስቆሮስ ስለ እውነት ጽኑ መከራን ታግሷል።",
        "abew_timhirt": "💡 የአበው ትምህርት፦ «የአባቶቻችንን እምነት ጠብቆ ማቆየት የትውልድ ሁሉ ታላቅ አደራና ክብር ነው።» — ቅዱስ አትናቴዎስ",
        "tseolot": "🙏 የጸሎት ማዕድ፦ በቀናች ሃይማኖት ላይ አጽናን።"
    },
    "11_8": {
        "holiday": "ቅዱስ ኪሩቤል (ባለ አራት ገጽ መላእክት)",
        "sinksar": "በዚህች ዕለት የእግዚአብሔርን መንበር የሚሸከሙና ቅዱስ ቅዱስ ቅዱስ እያሉ የሚያመሰግኑ የኪሩቤል መላእክት መታሰቢያ በዓል ነው።",
        "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ ዕብ. 1:1-14\n• ካቶሊክ፦ 1ኛ ጴጥ. 1:10-12\n• ሐዋ. ሥራ፦ ሐዋ. 10:1-8\n• ምስባክ፦ መዝ. 98:1 «እግዚአብሔር ነገሠ፥ ሕዝቦች ይደንግጡ፤ በኪሩቤል ላይ ይቀመጣል፥ ምድር ትናወጥ።»\n• ወንጌል፦ ዮሐ. 1:43-51",
        "wongel_zirzir": "📖 የዕለቱ ሰፊ ትምህርት፦ መላእክት የቅድስናና የምስጋና ምሳሌዎች ናቸው። እኛም በምድር ላይ ስንኖር ልባችንን ወደ ምስጋና ማቅናት ይገባናል።",
        "abew_timhirt": "💡 የአበው ትምህርት፦ «ምስጋና የልብን በር ይከፍታል፤ አምላካቸውን ዘወትር የሚያመሰግኑ ሰዎች የመላእክትን ሕይወት ይለማመዳሉ።» — ቅዱስ ባስልዮስ",
        "tseolot": "🙏 የጸሎት ማዕድ፦ ከመላእክት ጋር የምስጋና ልብ ስጠን።"
    },
    "11_9": {
        "holiday": "የእመቤታችን የብሥራት በዓል መታሰቢያ",
        "sinksar": "በዚህች ዕለት ቅዱስ ገብርኤል መልአክ ለእመቤታችን ለቅድስት ድንግል ማርያም የድኅነትን የምሥራች ያበሰረበት ወርሃዊ በዓል ነው።",
        "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ ገላ. 4:1-7\n• ካቶሊክ፦ 1ኛ ዮሐ. 4:1-6\n• ሐዋ. ሥራ፦ ሐዋ. 1:12-14\n• ምስባክ፦ መዝ. 44:10 «በወርቅ ልብስ ተጎናጽፋና ተሸልማ ንግሥቲቱ በቀኝህ ትቆማለች።»\n• ወንጌል፦ ሉቃስ 1:26-38",
        "wongel_zirzir": "📖 የወንጌል አንድምታ፦ ይህች ዕለት የሰው ልጅ የድኅነት ጉዞ የጀመረባት፣ የደስታና የብርሃን የምሥራች ለዓለም የተሰጠባት ዕለት ናት።",
        "abew_timhirt": "💡 የአበው ትምህርት፦ «የእመቤታችን ትሕትና ለአምላክ ማደሪያ እንድትሆን አደረጋት። እኛም በትሕትና ብንኖር ጸጋው ያድርብናል።» — ቅዱስ ኤፍሬም ሶርያዊ",
        "tseolot": "🙏 የጸሎት ማዕድ፦ የእመቤታችን ሰላምና በረከት አይለየን።"
    },
    "11_10": {
        "holiday": "የቅዱስ መስቀል ወርሃዊ በዓል",
        "sinksar": "በዚህች ዕለት ጌታችን መድኃኒታችን ኢየሱስ ክርስቶስ ዓለምን ያዳነበትና ድልን የሰጠንበት የክቡር መስቀሉ ወርሃዊ መታሰቢያ በዓል ነው።",
        "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ ገላ. 6:11-18\n• ካቶሊክ፦ 1ኛ ጴጥ. 2:21-25\n• ሐዋ. ሥራ፦ ሐዋ. 14:8-18\n• ምስባክ፦ መዝ. 59:4 «ከቀስት ፊት ያመልጡ ዘንድ ለሚፈሩህ ምልክትን ሰጠሃቸው።»\n• ወንጌል፦ ማቴ. 24:23-31",
        "wongel_zirzir": "📖 የዕለቱ ሰፊ ትምህርት፦ መስቀል የድል መሣሪያችንና የክርስትናችን መለያ ምልክት ነው። በመስቀሉ ፍቅር ዓለም ከኃጢአት ባርነት ነጻ ወጥታለች።",
        "abew_timhirt": "💡 የአበው ትምህርት፦ «መስቀል ለሚያምኑት የእግዚአብሔር ኃይል ነው፤ ፈተና ሲበዛብህ በመስቀሉ ምልክት ራስህን ጠብቅ።» — ቅዱስ ዮሐንስ አፈወርቅ",
        "tseolot": "🙏 የጸሎት ማዕድ፦ በኃይለ መስቀሉ ከክፉ ነገር ሁሉ ጠብቀን።"
    }
};

// 4. የዕለቱን መረጃ በራስ-ሰር አውጥቶ አፕሊኬሽኑ ላይ የሚቀይር አሠራር
function updateDailyContent() {
    const ethDate = getEthiopianDate();
    const dataKey = `${ethDate.month}_${ethDate.day}`;
    
    // ዳታው በዳታቤዙ ውስጥ ከሌለ እንደ ነባሪ የዛሬውን ሰኔ 30ን (10_30) ዳታ ያሳያል
    const todayData = dailySpiritualData[dataKey] ? dailySpiritualData[dataKey] : dailySpiritualData["10_30"];

    // የወራት ስሞችን ለመጻፍ
    const monthNames = { 9: "ግንቦት", 10: "ሰኔ", 11: "ሐምሌ" };
    const formattedDate = `${monthNames[ethDate.month] || "ወር"} ${ethDate.day} ቀን ${ethDate.year} ዓ.ም`;

    if (document.getElementById('ethiopian-date')) document.getElementById('ethiopian-date').innerText = formattedDate;
    if (document.getElementById('holiday-title')) document.getElementById('holiday-title').innerText = todayData.holiday;
    if (document.getElementById('sinksar-text')) document.getElementById('sinksar-text').innerText = todayData.sinksar;
    if (document.getElementById('gitsawe-text')) document.getElementById('gitsawe-text').innerText = todayData.gitsawe;
    if (document.getElementById('scripture-quote')) document.getElementById('scripture-quote').innerText = todayData.wongel_zirzir;
}

updateDailyContent();

// 5. ሁሉንም የዶክመንት ኤለመንቶች ከላይ ማገናኛ
const blessingModal = document.getElementById('blessing-modal');
const mainTapBtn = document.getElementById('main-tap-btn');
const closeModal = document.getElementById('close-modal');
const musicToggleBtn = document.getElementById('music-toggle-btn');
const mezmur = document.getElementById('bg-mezmur');
const submitDonationBtn = document.getElementById('submit-donation');
const fileInput = document.getElementById('receipt-screenshot');
const fileText = document.getElementById('file-chosen-text');

const cbeBtn = document.getElementById('cbe-pay-btn');
const teleBtn = document.getElementById('tele-pay-btn');
const cbeModalBtn = document.getElementById('cbe-pay-btn-modal');
const teleModalBtn = document.getElementById('tele-pay-btn-modal');
const shareBtn = document.getElementById('share-invite-btn');

let points = parseInt(localStorage.getItem('user_points')) || 0;
let referrals = parseInt(localStorage.getItem('user_referrals')) || 0;

if (document.getElementById('user-points')) document.getElementById('user-points').innerText = points;
if (document.getElementById('referral-count')) document.getElementById('referral-count').innerText = referrals;

// 6. ፋይል (ስክሪንሾት) ሲመረጥ ስሙን እንዲያሳይ ማድረግ
if (fileInput && fileText) {
    fileInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            fileText.innerText = "📸 የተመረጠው ፋይል፦ " + this.files[0].name;
        } else {
            fileText.innerText = "";
        }
    });
}

// 7. አበርክት የሚለው ቁልፍ ሲነካ መረጃ መመዝገቢያ
if (submitDonationBtn) {
    submitDonationBtn.addEventListener('click', () => {
        const christianName = document.getElementById('christian-name').value;
        const reason = document.getElementById('prayer-reason').value;
        const hasFile = fileInput && fileInput.files.length > 0 ? "አባሪ ተያይዟል 📸" : "አልተያያዘም";

        if (!christianName) {
            alert('እባክዎ የክርስትና ስምዎን ያስገቡ!');
            return;
        }

        alert(`ተሳክቷል!\nየክርስትና ስም፡ ${christianName}\nምክንያት፡ ለ${reason}\nማረጋገጫ ስክሪንሾት፡ ${hasFile}\n\nየ"ቤተሳይዳ በጎ አድራጎት" ስጦታዎ በክብር ተመዝግቧል!`);
        
        if (blessingModal) blessingModal.classList.remove('show');
        if (fileInput) fileInput.value = "";
        if (fileText) fileText.innerText = "";
    });
}

// 8. መዝሙር ማጫወቻ አሠራር
function updateMusicButtonState() {
    if (!mezmur || !musicToggleBtn) return;
    if (mezmur.paused) {
        musicToggleBtn.innerHTML = '<i class="fas fa-music"></i> መዝሙር ክፈት';
        musicToggleBtn.style.background = 'rgba(255,255,255,0.1)';
        musicToggleBtn.style.color = '#ffffff';
    } else {
        musicToggleBtn.innerHTML = '<i class="fas fa-pause"></i> መዝሙር አቁም';
        musicToggleBtn.style.background = '#ffd700';
        musicToggleBtn.style.color = '#4A0E17';
    }
}

if (musicToggleBtn && mezmur) {
    musicToggleBtn.addEventListener('click', () => {
        if (mezmur.paused) {
            mezmur.play()
                .then(updateMusicButtonState)
                .catch(() => { 
                    console.log("የኦዲዮ ማስነሳት ቆይቷል"); 
                });
        } else {
            mezmur.pause();
            updateMusicButtonState();
        }
    });
}

// 9. Touch/Tap አሠራር ለዋናው ቁልፍ (Tap-to-Bless)
if (mainTapBtn) {
    mainTapBtn.addEventListener('pointerdown', (e) => {
        points += 1;
        if (document.getElementById('user-points')) document.getElementById('user-points').innerText = points;
        localStorage.setItem('user_points', points);
        
        const userBadge = document.getElementById('user-badge');
        if (userBadge) {
            if (points > 500) userBadge.innerText = "የበረከት ሊቅ";
            else if (points > 100) userBadge.innerText = "የበረከት ታጋይ";
        }

        createFloatingPlusOne(e.clientX, e.clientY);
    });
    
    mainTapBtn.addEventListener('dblclick', () => {
        if (blessingModal) blessingModal.classList.add('show');
    });
}

// 10. የክፍያ አካውንቶችን ኮፒ ማድረጊያ ዘዴ
const copyCBE = () => {
    navigator.clipboard.writeText('1000379314396');
    if (tg) tg.showPopup({title: 'የኢትዮጵያ ንግድ ባንክ', message: 'የአካውንት ቁጥር 1000379314396 ወደ ስልክዎ ኮፒ ተደርጓል!'});
    else alert('CBE አካውንት ኮፒ ተደርጓል!');
};

const copyTele = () => {
    navigator.clipboard.writeText('0920628769');
    if (tg) tg.showPopup({title: 'ቴሌብር', message: 'የአቅራቢው ስልክ ቁጥር 0920628769 ወደ ስልክዎ ኮፒ ተደርጓል!'});
    else alert('የቴሌብር ስልክ ኮፒ ተደርጓል!');
};

if (cbeBtn) cbeBtn.addEventListener('click', copyCBE);
if (cbeModalBtn) cbeModalBtn.addEventListener('click', copyCBE);
if (teleBtn) teleBtn.addEventListener('click', copyTele);
if (teleModalBtn) teleModalBtn.addEventListener('click', copyTele);

// 11. 🔗 የሪፈራል ግብዣ ሊንክ
if (shareBtn) {
    shareBtn.addEventListener('click', () => {
        const inviteLink = "https://t.me/infomela06";
        const shareText = "ወደ ቤተሳይዳ መንፈሳዊ በጎ አድራጎት መድረክ ይግቡና የበረከት ተሳታፊ ይሁኑ! ✨";
        const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`;
        
        if (tg) {
            tg.openLink(telegramShareUrl);
        } else {
            navigator.clipboard.writeText(inviteLink);
            alert("የመጋበዣ የቻናል ሊንክዎ ኮፒ ሆኗል፦ " + inviteLink);
        }
    });
}

if (closeModal) {
    closeModal.addEventListener('click', () => {
        if (blessingModal) blessingModal.classList.remove('show');
    });
}

function createFloatingPlusOne(x, y) {
    if (!x || !y) return; 
    const el = document.createElement('div');
    el.className = 'floating-plus-one';
    el.innerText = '+1 🪙';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.position = 'absolute'; 
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}
