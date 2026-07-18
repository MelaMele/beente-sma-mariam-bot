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
    "11_12": {
    "holiday": "የቅዱስ ሚካኤል ሊቀ መላእክት በዓል",
    "sinksar": "በዚህች ዕለት የታላቁ መልአክ የቅዱስ ሚካኤል ሰናክሬምን ድል ያደረገበትና ሕዝቡን ያዳነበት ታላቅ ወርሃዊ በዓል ነው።",
    "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ ዕብ. 1:14\n• ካቶሊክ፦ 1ኛ ጴጥ. 1:13-25\n• ሐዋ. ሥራ፦ ሐዋ. 12:1-11\n• ምስባክ፦ መዝ. 33:7 «የእግዚአብሔር መልአክ በሚፈሩት ዙሪያ ይሰፍራል፥ ያድናቸውማል።»\n• ወንጌል፦ ዮሐ. 5:4-12",
    "wongel_zirzir": "📖 የዕለቱ ሰፊ ትምህርት፦ ቅዱስ ሚካኤል ፈጣን ረዳት፣ የምሕረት መልአክ ነው። ለሚጠሩትና በስሙ ለሚማጸኑት ሁሉ ቅርብ በመሆን ከመከራ ያድናቸዋል።",
    "abew_timhirt": "💡 የአበው ትምህርት፦ «መላእክት እኛን ለመርዳትና ለመጠበቅ ዘወትር የተዘጋጁ ናቸው፤ እኛ ግን በበደላችንና በኃጢአታችን ከእነርሱ ጥበቃ እንዳንርቅ መጠንቀቅ አለብን።» — የአበው ምክር",
    "tseolot": "🙏 የጸሎት ማዕድ፦ በሚካኤል ጥበቃና አማላጅነት ከክፉ ነገር ሁሉ ሰውረን。"
  },
  "11_13": {
    "holiday": "የቅዱስ ሩፋኤል ሊቀ መላእክት ዓመታዊ በዓል",
    "sinksar": "በዚህች ዕለት ፈዋሹ መልአክ ቅዱስ ሩፋኤል ጦቢትን ከዓይን እውርነት የፈወሰበት እና አስማንድዮስን ያሰረው ድንቅ ዓመታዊ በዓሉ ነው።",
    "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ ዕብ. 12:22-29\n• ካቶሊክ፦ 1ኛ ጴጥ. 3:15-22\n• ሐዋ. ሥራ፦ ሐዋ. 5:12-16\n• ምስባክ፦ መዝ. 102:20 «ቃሉን የምታደርጉ ብርቱዎችና ኃያላን መላእክቱ ሁሉ፥ እግዚአብሔርን ባርኩት።»\n• ወንጌል፦ ዮሐ. 5:1-4",
    "wongel_zirzir": "📖 የወንጌል ትርጓሜ፦ ሩፋኤል የሰላምና የፈውስ መልአክ ነው። የታመሙትን ለመፈወስ፣ የተጨነቁትን ለማጽናናት ከእግዚአብሔር ዘንድ የተላከ እውነተኛ ባለሟል ነው።",
    "abew_timhirt": "💡 የአበው ትምህርት፦ «በሥጋም ሆነ በነፍስ ሕመም ውስጥ ስትሆን ወደ ምድራዊ ሐኪም ከመሄድህ በፊት፣ ወደ ታላቁ ፈዋሽ አምላክና ወደ ቅዱሳን መላእክቱ ጸልይ።» — ቅዱስ ዮሐንስ አፈወርቅ",
    "tseolot": "🙏 የጸሎት ማዕድ፦ በቅዱስ ሩፋኤል ፈዋሽነት ለሕመምተኞች ሁሉ ፈውስን ስጥ。"
  },
  "11_14": {
    "holiday": "አባ ገብረ ክርስቶስ (ሙሽራው)",
    "sinksar": "በዚህች ዕለት ምድራዊ ክብሩንና ሰርጉን ትቶ በንጽሕና በተጋድሎ የኖረው ጻድቁ አባ ገብረ ክርስቶስ መታሰቢያው ነው።",
    "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ 2ኛ ጢሞ. 4:7-8\n• ካቶሊክ፦ 1ኛ ዮሐ. 2:15-29\n• ሐዋ. ሥራ፦ ሐዋ. 20:17-24\n• ምስባክ፦ መዝ. 111:1 «እግዚአብሔርን የሚፈራ፥ ትእዛዙንም እጅግ የሚወድ ሰው ምስጉን ነው።»\n• ወንጌል፦ ማቴ. 19:29-30",
    "wongel_zirzir": "📖 የዕለቱ ትምህርት፦ ሰማያዊውን መንግሥት ለመውረስ ምድራዊ ፍላጎትን ድል ማድረግን ያስተምረናል። አባ ገብረ ክርስቶስ በትሕትናውና በትዕግሥቱ ድንቅ አባት ነው።",
    "abew_timhirt": "💡 የአበው ትምህርት፦ «እውነተኛ ሀብት በዚህ ዓለም የምታከማቸው ምድራዊ ቁሳቁስ ሳይሆን፣ በሰማይ ቤት በበጎ ምግባርና በትሕትና የምታስቀምጠው መንፈሳዊ ሀብት ነው።» — ቅዱስ ባስልዮስ",
    "tseolot": "🙏 የጸሎት ማዕድ፦ የጻድቁ ትሕትና ለልባችን ማስተማሪያ ይሁን。"
  },
  "11_15": {
    "holiday": "ቅዱስ ኤፍሬም ሶርያዊ",
    "sinksar": "በዚህች ዕለት የውዳሴ ማርያም ደራሲ፣ የዓይነ እርግብ አባት ቅዱስ ኤፍሬም ሶርያዊ ወርሃዊ መታሰቢያው ነው።",
    "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ ኤፌ. 3:14-21\n• ካቶሊክ፦ 1ኛ ዮሐ. 4:7-21\n• ሐዋ. ሥራ፦ ሐዋ. 18:24-28\n• ምስባክ፦ መዝ. 44:1 «ልበ መልካም ነገርን አወጣ፥ እኔ ስራዬን ለንጉሥ እገራለሁ።»\n• ወንጌል፦ ዮሐ. 15:1-11",
    "wongel_zirzir": "📖 የወንጌል አንድምታ፦ ቅዱስ ኤፍሬም እመቤታችንን በውዳሴ ያመሰገነ፣ በቅድስና ሕይወቱ ምስጢር የተገለትለት ታላቅ የቤተክርስቲያን መብራት ነው።",
    "abew_timhirt": "💡 የአበው ትምህርት፦ «አንደበትህ ዘወትር እግዚአብሔርን ማመስገኛና ቅዱሳንን ማወደሻ ይሁን እንጂ ሰዎችን ማማያና መርገሚያ እንዳይሆን ተጠንቀቅ።» — ቅዱስ ኤፍሬም ሶርያዊ",
    "tseolot": "🙏 የጸሎት ማዕድ፦ በቅዱስ ኤፍሬም ጸሎት ምሥጢረ ሃይማኖትን ግለጽልን。"
  },
  "11_16": {
    "holiday": "ኪዳነ ምሕረት (ወርሃዊ በዓል)",
    "sinksar": "በዚህች ዕለት እመቤታችን ቅድስት ድንግል ማርያም ከልጇ ዘንድ ስለ ሰው ልጆች ምሕረት የተቀበለችበት ቃልኪዳን ይታሰባል።",
    "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ ገላ. 4:4-7\n• ካቶሊክ፦ ያዕቆብ 2:14-26\n• ሐዋ. ሥራ፦ ሐዋ. 1:12-14\n• ምስባክ፦ መዝ. 131:8 «አቤቱ ወደ እረፍትህ ተነሥ፥ አንተና የመቅደስህ ታቦት።»\n• ወንጌል፦ ሉቃስ 1:46-56",
    "wongel_zirzir": "📖 የዕለቱ ሰፊ ትምህርት፦ ኪዳነ ምሕረት የእናታችን ቃልኪዳን ነው። በስሟ ለሚማጸኑ፣ ለሚመጸውቱ ሁሉ የዘላለም የድኅነት ቃልኪዳን ተሰጥቷታል።",
    "abew_timhirt": "💡 የአበው ትምህርት፦ «የእመቤታችን አማላጅነት ለሰው ልጆች ሁሉ የተሰጠ ታላቅ መጠለያ ነው። ወደ እርሷ የሚጮኽ ሁሉ በምሕረት እቅፍ ውስጥ ይጽናናል።» — ቅዱስ ቴኦፍሎስ",
    "tseolot": "🙏 የጸሎት ማዕድ፦ በእናትሽ ቃልኪዳን ማረን አምላካችን。"
  },
  "11_17": {
    "holiday": "ቅዱስ እስጢፋኖስ ሊቀ ዲያቆናት",
    "sinksar": "በዚህች ዕለት የመጀመሪያው ሰማዕት ቅዱስ እስጢፋኖስ በሰማዕትነት ያረፈበትና የወገረውን ሕዝብ ይቅር ያለበት ታላቅ ወርሃዊ መታሰቢያው ነው።",
    "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ 1ኛ ጢሞ. 3:8-13\n• ካቶሊክ፦ 1ኛ ጴጥ. 4:12-19\n• ሐዋ. ሥራ፦ ሐዋ. 6:8-15 | 7:54-60\n• ምስባክ፦ መዝ. 118:23 «አለቆች ተቀምጠው በእኔ ላይ ተናገሩ፥ ባሪያህ ግን በሥርዓትህ ይጨነቅ ነበር።»\n• ወንጌል፦ ማቴ. 23:34-39",
    "wongel_zirzir": "📖 የወንጌል ትርጓሜ፦ ቅዱስ እስጢፋኖስ ሲወገር 'አቤቱ ይህን ኃጢአት አትቁጠርባቸው' ብሎ በመጸለይ የፍቅርና የይቅርታ ትልቁን ምስክርነት ሰጥቷል።",
    "abew_timhirt": "💡 የአበው ትምህርት፦ «ለጠላቶችህ መጸለይና ይቅር ማለት የክርስቲያን ትልቁ መታወቂያው ነው። እስጢፋኖስ በጠላቶቹ ላይ አልተቆጣም።» — ቅዱስ ዮሐንስ አፈወርቅ",
    "tseolot": "🙏 የጸሎት ማዕድ፦ የቅዱስ እስጢፋኖስን ይቅር ባይነት በልባችን ውስጥ እረስልን。"
},
  "11_18": {
    "holiday": "ቅዱስ ዮስጦስ ሰማዕት",
    "sinksar": "በዚህች ዕለት ታላቁ ሰማዕት ቅዱስ ዮስጦስ ስለ ሃይማኖቱ ጽናት መከራን የተቀበለበት መታሰቢያ ዕለት ነው።",
    "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ 2ኛ ጢሞ. 2:1-13\n• ካቶሊክ፦ 1ኛ ዮሐ. 5:1-5\n• ሐዋ. ሥራ፦ ሐዋ. 7:54-60\n• ምስባክ፦ መዝ. 96:11 «ብርሃን ለጻድቃን ወጣ፥ ደስታም ለልበ ቅኖች።»\n• ወንጌል፦ ማቴ. 10:22-31",
    "wongel_zirzir": "📖 የዕለቱ ትምህርት፦ ሰማዕታት በመከራ ውስጥ ሆነው እምነታቸውን አልካዱም። እኛም በፈተና ወቅት መጽናት እንዳለብን ያስተምረናል።",
    "abew_timhirt": "💡 የአበው ትምህርት፦ «የእግዚአብሔር ፍቅር በልብህ ውስጥ ሲነድ፣ ምድራዊ መከራና ስቃይ ሁሉ ለአንተ እንደ ቀላል ነገር ይቆጠራል። ጽናት የክብር አክሊል ያሰጣል።» — ቅዱስ እንጦንስ",
    "tseolot": "🙏 የጸሎት ማዕድ፦ አቤቱ በሃይማኖት አጽናን።"
  },
  "11_19": {
    "holiday": "የቅዱስ ገብርኤል ሊቀ መላእክት በዓል",
    "sinksar": "በዚህች ዕለት ሕፃኑን ቅዱስ ቂርቆስንና እናቱን ቅድስት ኢየሉጣን ከእቶን እሳት ያዳነበት የታላቁ መልአክ የቅዱስ ገብርኤል ወርሃዊ በዓል ነው።",
    "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ ዕብ. 11:33-40\n• ካቶሊክ፦ ያዕቆብ 5:13-18\n• ሐዋ. ሥራ፦ ሐዋ. 12:1-11\n• ምስባክ፦ መዝ. 90:11 «በመንገድህ ሁሉ ይጠብቁህ ዘንድ መላእክቱን ስለ አንተ ያዝዛቸዋልና።»\n• ወንጌል፦ ሉቃስ 1:26-38",
    "wongel_zirzir": "📖 የዕለቱ ሰፊ ትምህርት፦ ቅዱስ ገብርኤል አብሳሪና ታዳጊ መልአክ ነው። እሳቱን ወደ በረጭ አውርዶ ቅዱሳንን እንዳዳነ ዛሬም እኛን ከሚነደው የኃጢአት እሳት ያድነናል።",
    "abew_timhirt": "💡 የአበው ትምህርት፦ «የቅዱስ ገብርኤል ስም 'የእግዚአብሔር ኃይል' ማለት ነው። እርሱ ለደካሞች ብርታትን፣ ለተጨነቁት ደግሞ የደስታ የምሥራች ሊሰጥ ዘወትር ይላካል።» — ቅዱስ ባስልዮስ",
    "tseolot": "🙏 የጸሎት ማዕድ፦ በቅዱስ ገብርኤል አማላጅነት ከክፉ ነገር ሁሉ ሰውረን።"
  },
  "11_20": {
    "holiday": "ሕፃኑ ቅዱስ ቂርቆስ እና ቅድስት ኢየሉጣ",
    "sinksar": "በዚህች ዕለት በንጉሡ በኃደገኛው መክስምያኖስ ፊት ስለ ክርስቶስ ስም ምስክርነታቸውን የሰጡት ሕፃኑ ቂርቆስና እናቱ ኢየሉጣ መታሰቢያቸው ነው።",
    "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ ዕብ. 12:1-11\n• ካቶሊክ፦ 1ኛ ጴጥ. 4:1-11\n• ሐዋ. ሥራ፦ ሐዋ. 7:54-60\n• ምስባክ፦ መዝ. 8:2 «ከሕፃናትና ከሚጠቡት አፍ ምስጋናን አዘጋጀህ ስለ ጠላት።»\n• ወንጌል፦ ማቴ. 18:1-10",
    "wongel_zirzir": "📖 የወንጌል አንድምታ፦ ሕፃኑ ቂርቆስ በዕድሜ ትንሽ ቢሆንም በእምነት ግን ትልቅ ነበር። የቅዱሳን ልጆች እምነት ለሁላችንም ትልቅ ትምህርት ነው።",
    "abew_timhirt": "💡 የአበው ትምህርት፦ «እግዚአብሔርን ለመምሰልና ለመመስከር ዕድሜ አያግድም፤ ልብህ በንጽሕና ከተሞላ በሕፃንነትህም ቢሆን መለኮታዊ ኃይሉ በአንተ ላይ ይገለጣል።» — የአበው ምክር",
    "tseolot": "🙏 የጸሎት ማዕድ፦ ለልጆቻችን የቅዱሳንን እምነት ስጣቸው።"
  },
  "11_21": {
    "holiday": "የቅድስት ድንግል ማርያም ታላቅ በዓል",
    "sinksar": "በዚህች ዕለት የዓለም ሁሉ እመቤት፣ የአምላክ እናት የቅድስት ድንግል ማርያም ወርሃዊ ታላቅ የበዓል ቀን ነው።",
    "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ ገላ. 4:4-9\n• ካቶሊክ፦ 1ኛ ዮሐ. 3:1-3\n• ሐዋ. ሥራ፦ ሐዋ. 1:12-14\n• ምስባክ፦ መዝ. 44:10 «በወርቅ ልብስ ተጎናጽፋና ተሸልማ ንግሥቲቱ በቀኝህ ትቆማለች።»\n• ወንጌል፦ ሉቃስ 1:39-56",
    "wongel_zirzir": "📖 የዕለቱ ሰፊ ትምህርት፦ እመቤታችን የድኅነታችን ምክንያት፣ የቅዱሳን ሁሉ እመቤት ናት። በአማላጅነቷና በንጽሕናዋ ዓለም ሁሉ ይባረካል።",
    "abew_timhirt": "💡 የአበው ትምህርት፦ «እመቤታችንን ማክበርና መውደድ የክርስትናችን መሠረት ነው። እርሷን ያላከበረ የክርስቶስን ሰው መሆን በምሉዕነት አልተረዳም።» — ቅዱስ ኤፍሬም ሶርያዊ",
    "tseolot": "🙏 የጸሎት ማዕድ፦ የእመቤታችን ፍቅርና አማላጅነት ፈጽሞ አይለየን።"
  },
  "11_22": {
    "holiday": "የቅዱስ ዑራኤል ሊቀ መላእክት በዓል",
    "sinksar": "በዚህች ዕለት ቅዱስ ዑራኤል መልአክ ለአለም ምሕረትን የሚለምንበትና የጌታችንን ደም የረጨበት ታላቅ ወርሃዊ በዓል ነው።",
    "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ ዕብ. 1:7-14\n• ካቶሊክ፦ 1ኛ ጴጥ. 1:13-22\n• ሐዋ. ሥራ፦ ሐዋ. 10:1-8\n• ምስባክ፦ መዝ. 103:4 «መላእክቱን መንፈስ የሚያደርግ፥ አገልጋዮቹንም የሚነድ እሳት።»\n• ወንጌል፦ ዮሐ. 5:1-12",
    "wongel_zirzir": "📖 የወንጌል ትርጓሜ፦ ዑራኤል የብርሃን መልአክ ነው። ልባችንን በእውቀትና በብርሃነ ወንጌል እንዲያበራ ዘወትር በጸሎቱ እንማጸናለን።",
    "abew_timhirt": "💡 የአበው ትምህርት፦ «እግዚአብሔር የጥበብንና የእውቀትን ምስጢር የሚገልጠው በትሕትና ለሚኖሩና ልባቸውን ከምድራዊ ክፋት ላነጹ ቅን ሰዎች ብቻ ነው።» — ቅዱስ ባስልዮስ ዘቂሳሪያ",
    "tseolot": "🙏 የጸሎት ማዕድ፦ በቅዱስ ዑራኤል ጸሎት ልባችንን በብርሃን ሙላው።"
  },
  "11_23": {
    "holiday": "የቅዱስ ጊዮርጊስ ሰማዕት በዓል",
    "sinksar": "በዚህች ዕለት የታላቁ ሰማዕት የኮከበ ኮከባን የቅዱስ ጊዮርጊስ ወርሃዊ መታሰቢያ በዓል በታላቅ ክብር ይከበራል።",
    "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ 2ኛ ጢሞ. 2:3-13\n• ካቶሊክ፦ 1ኛ ጴጥ. 5:1-11\n• ሐዋ. ሥራ፦ ሐዋ. 7:54-60\n• ምስባክ፦ መዝ. 91:12 «ጻድቅ እንደ ዘንባባ ያብባል፥ እንደ ሊባኖስ ዝግባም ያድጋል።»\n• ወንጌል፦ ማቴ. 10:16-22",
    "wongel_zirzir": "📖 የዕለቱ ሰፊ ትምህርት፦ ቅዱስ ጊዮርጊስ የሰማዕታት አለቃ ነው። በሃይማኖቱ ጽናት አረማውያንን ያሳፈረ፣ የክርስቶስን ድል የገለጠ ኃያል ሰማዕት ነው።",
    "abew_timhirt": "💡 የአበው ትምህርት፦ «ቅዱስ ጊዮርጊስ ሰይፍንና ሰባቱን ዓመታት መከራ ያሸነፈው በጦር መሣሪያ ሳይሆን በጽኑ ሃይማኖቱና በትሕትናው ኃይል ነው።» — ቅዱስ ዮሐንስ አፈወርቅ",
    "tseolot": "🙏 የጸሎት ማዕድ፦ በቅዱስ ጊዮርጊስ ተራዳኢነት ከጠላት ሰይጣን ጠብቀን።"
  },
  "11_24": {
    "holiday": "የአቡነ ተክለሃይማኖት በዓል",
    "sinksar": "በዚህች ዕለት ጻድቁ አባታችን አቡነ ተክለሃይማኖት በደብረ ሊባኖስ ያደረጉት ተጋድሎ የሚታሰብበት ወርሃዊ በዓላቸው ነው።",
    "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ ኤፌ. 6:10-20\n• ካቶሊክ፦ ያዕቆብ 5:13-20\n• ሐዋ. ሥራ፦ ሐዋ. 20:17-35\n• ምስባክ፦ መዝ. 132:1 «እነሆ፥ ወንድሞች በሕብረት ቢቀመጡ መልካም ነው፥ ማራኪም ነው።»\n• ወንጌል፦ ማቴ. 19:27-30",
    "wongel_zirzir": "📖 የወንጌል አንድምታ፦ ጻድቁ አባታችን የኢትዮጵያ ብርሃን ናቸው። በትጋት ጸሎታቸውና በቅድስና ሕይወታቸው ምድራችንን ባርከዋል።",
    "abew_timhirt": "💡 የአበው ትምህርት፦ «ጸሎትና ጾም የነፍስ ክንፎች ናቸው፤ ሰውን ከመሬት ወደ ሰማያዊው ክብር ከፍ የሚያደርጉ። አባታችን በዚህ ተጋድሎ አሸነፉ።» — የአበው ምክር",
    "tseolot": "🙏 የጸሎት ማዕድ፦ በጻድቁ አባታችን ጸሎት ሀገራችንን ሰላም አድርግልን።"
  },
  "11_25": {
    "holiday": "ቅዱስ መርቆሬዎስ ሰማዕት",
    "sinksar": "በዚህች ዕለት ባለ ሁለት ሰይፉ ታላቁ ሰማዕት ቅዱስ መርቆሬዎስ ወርሃዊ መታሰቢያው ነው።",
    "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ ዕብ. 11:32-40\n• ካቶሊክ፦ 1ኛ ጴጥ. 4:12-19\n• ሐዋ. ሥራ፦ ሐዋ. 12:1-11\n• ምስባክ፦ መዝ. 67:35 «እግዚአብሔር በቅዱሳኑ ላይ ድንቅ ነው፤ የእስራኤል አምላክ እርሱ ኃይልን ብርታትንም ለሕዝቡ ይሰጣል።»\n• ወንጌል፦ ሉቃስ 12:4-12",
    "wongel_zirzir": "📖 የዕለቱ ትምህርት፦ ቅዱስ መርቆሬዎስ በነገሥታት ፊት ሳይፈራ የክርስቶስን አምላክነት የመሰከረ ኃያል ሰማዕት ነው። እምነት ፍርሃትን ድል እንደሚያደርግ ያሳየናል።",
    "abew_timhirt": "💡 የአበው ትምህርት፦ «ቅዱሳንን ስናከብር ያደረገላቸውን አምላክ እያመሰገንን ነው። የእነርሱ ሕይወት ለእኛ የእምነትና የድል ትልቅ ማሳያ ነው።» — ቅዱስ ቄርሎስ",
    "tseolot": "🙏 የጸሎት ማዕድ፦ በቅዱስ መርቆሬዎስ አማላጅነት ከክፉ ጠላት ጠብቀን።"
  },
  "11_26": {
    "holiday": "አቡነ ሐራ ድንግል ጻድቅ",
    "sinksar": "በዚህች ዕለት ታላቁ ገዳማዊ ጻድቅ አቡነ ሐራ ድንግል ወርሃዊ መታሰቢያቸው በክብር ይታሰባል።",
    "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ ገላ. 5:22-26\n• ካቶሊክ፦ 1ኛ ዮሐ. 2:15-17\n• ሐዋ. ሥራ፦ ሐዋ. 14:19-23\n• ምስባክ፦ መዝ. 33:17 «ጻድቃን ጮኹ፥ እግዚአብሔርም ሰማቸው ከመከራቸውም ሁሉ አዳናቸው።»\n• ወንጌል፦ ማቴ. 11:28-30",
    "wongel_zirzir": "📖 የወንጌል ትርጓሜ፦ ጻድቃን ዓለምን ንቀው በበርሃ የኖሩት የሰማዩን ክብር ናፍቀው ነው። የእነርሱ ሕይወት ለእኛ የመንፈሳዊ ጽናት አርአያ ነው።",
    "abew_timhirt": "💡 የአበው ትምህርት፦ «እውነተኛ ሰላምና ዕረፍት የሚገኘው የዚህን ዓለም የሐሰት ደስታ ትተህ፣ በትሕትናና በየዋህነት የክርስቶስን ቃል ስትከተል ብቻ ነው።» — ቅዱስ መቃርስ",
    "tseolot": "🙏 የጸሎት ማዕድ፦ የጻድቁ አባታችን ጸሎትና በረከት ከሁላችን ጋር ይሁን።"
  },
  "11_27": {
    "holiday": "የመድኃኔዓለም ወርሃዊ በዓል",
    "sinksar": "በዚህች ዕለት የዓለም መድኃኒት ጌታችን ኢየሱስ ክርስቶስ ለአለም የሰጠውን የድኅነት ቃልኪዳን የምናስብበት ታላቅ ዕለት ነው።",
    "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ ሮሜ 5:8-11\n• ካቶሊክ፦ 1ኛ ዮሐ. 4:7-12\n• ሐዋ. ሥራ፦ ሐዋ. 4:8-12\n• ምስባክ፦ መዝ. 3:8 «ማዳን የእግዚአብሔር ነው፥ በረከትህም በሕዝብህ ላይ ነው።»\n• ወንጌል፦ ዮሐ. 3:16-21",
    "wongel_zirzir": "📖 የዕለቱ ሰፊ ትምህርት፦ መድኃኔዓለም ክርስቶስ በመስቀል ላይ የከፈለው መሥዋዕትነት ለአለም ሁሉ የዘላለም ሕይወትን ሰጥቷል። በእርሱ የሚያምን ሁሉ የዘላለም ሕይወት አለው።",
    "abew_timhirt": "💡 የአበው ትምህርት፦ «መድኃኔዓለም በመስቀል ላይ የከፈለው መሥዋዕትነት ያንተን የነፍስ ውድ ዋጋ ያሳያል። ራስህን በኃጢአት ረክሰህ አታቅልለው።» — ቅዱስ ኤፍሬም ሶርያዊ",
    "tseolot": "🙏 የጸሎት ማዕድ፦ አቤቱ መድኃኔዓለም ሆይ! በማይጠፋው ደምህ የዋጀኸንን ሕዝቦችህን ማረን።"
  },
  "11_28": {
    "holiday": "የአማኑኤል ወርሃዊ በዓል",
    "sinksar": "በዚህች ዕለት ጌታችን መድኃኒታችን ኢየሱስ ክርስቶስ 'እግዚአብሔር ከእኛ ጋር ነው' የተባለበት የአማኑኤል ወርሃዊ በዓል ነው።",
    "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ ዕብ. 8:1-13\n• ካቶሊክ፦ 1ኛ ጴጥ. 2:1-10\n• ሐዋ. ሥራ፦ ሐዋ. 3:12-26\n• ምስባክ፦ መዝ. 45:5 «የወንዝ ፈሳሾች የእግዚአብሔርን ከተማ ደስ ያሰኛሉ፤ ልዑል ማደሪያውን ቀደሰ።»\n• ወንጌል፦ ማቴ. 1:21-25",
    "wongel_zirzir": "📖 የወንጌል አንድምታ፦ አማኑኤል ወደ እኛ የመጣው እኛን ለመፈለግና ለማዳን ነው። እርሱ ዘወትር ከእኛ ጋር መሆኑን አምነን በቅድስና ልንኖር ይገባል።",
    "abew_timhirt": "💡 የአበው ትምህርት፦ «አማኑኤል አምላካችን ከእኛ ጋር ከሆነ የሚቃወመን የለም። ፍርሃት በልብህ ውስጥ ቦታ እንዳይኖረው እርሱን ሙጥኝ በል።» — ቅዱስ አትናቴዎስ",
    "tseolot": "🙏 የጸሎት ማዕድ፦ አማኑኤል አምላካችን ሆይ! ዘወትር ከእኛ ጋር ሁን፣ አትለየን።"
  },
  "11_29": {
    "holiday": "የቅዱስ ላሊበላ ንጉሥ መታሰቢያ",
    "sinksar": "በዚህች ዕለት ድንቅ የሆኑትን ውቅር አብያተ ክርስቲያናትን ያነጸው ጻድቁ ንጉሥ ቅዱስ ላሊበላ ወርሃዊ መታሰቢያው ነው።",
    "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ 1ኛ ጢሞ. 6:17-21\n• ካቶሊክ፦ ያዕቆብ 2:1-9\n• ሐዋ. ሥራ፦ ሐዋ. 13:23-31\n• ምስባክ፦ መዝ. 71:1 «አምላክ ሆይ፥ ፍርድህን ለንጉሥ ስጥ ጽድቅህንም ለንጉሥ ልጅ።»\n• ወንጌል፦ ማቴ. 25:31-46",
    "wongel_zirzir": "📖 የዕለቱ ትምህርት፦ ቅዱስ ላሊበላ በምድራዊ ሥልጣኑ ላይ ሳለ ሰማያዊውን ክብር የገነባ፣ በትሕትናው መላእክትን ያደነቀ ድንቅ አባት ነው።",
    "abew_timhirt": "💡 የአበው ትምህርት፦ «እውነተኛ መሪ ማለት በሰጠው ሥልጣን ላይ ሆኖ በትሕትና ሕዝብን የሚያገለግልና እግዚአብሔርን ዘወትር የሚፈራ ሰው ነው።» — የአበው ምክር",
    "tseolot": "🙏 የጸሎት ማዕድ፦ የጻድቁ ንጉሥ ጸሎትና በረከት ከሀገራችን ጋር ይሁን።"
  },
  "11_30": {
    "holiday": "የማርቆስ ሐዋርያ መታሰቢያ",
    "sinksar": "በዚህች ዕለት የመጀመሪያውን ወንጌል የጻፈውና በግብፅ አገር ወንጌልን የሰበከው የወንጌላዊው ቅዱስ ማርቆስ ወርሃዊ መታሰቢያው ነው።",
    "gitsawe": "📖 የዕለቱ ንባባት፦\n• ጳውሎስ፦ 2ኛ ጢሞ. 4:11-22\n• ካቶሊክ፦ 1ኛ ዮሐ. 3:1-3\n• ሐዋ. ሥራ፦ ሐዋ. 19:1-7\n• ምስባክ፦ መዝ. 71:6 «እንደ ዝናብ በበግ ፀጉር ላይ ይወርዳል፥ በምድር ላይ እንደሚጠብጥ ጠብታ።»\n• ወንጌል፦ ማርቆስ 1:1-8",
    "wongel_zirzir": "📖 የወንጌል ትርጓሜ፦ ቅዱስ ማርቆስ የጌታን ቃል በጽሑፍ በማስቀመጥ ለአለም ብርሃንን የፈነጠቀ ታላቅ ሐዋርያ ነው። የወንጌል ቃል ሕይወታችንን ይቀይራል።",
    "abew_timhirt": "💡 የአበው ትምህርት፦ «የወንጌል ቃል በቃላት ብቻ የሚቀመጥ ሳይሆን፣ በሰዎች ሕይወት ውስጥ ተተርጉሞ መንፈሳዊ ፍሬን የሚያፈራ መለኮታዊ ኃይል ነው።» — ቅዱስ ዮሐንስ አፈወርቅ",
    "tseolot": "🙏 የጸሎት ማዕድ፦ በቅዱስ ማርቆስ ጸሎት የወንጌልን ቃል በልባችን ያሳድርብን።"
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
