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
        // ተጠቃሚው የሊቀ ጳጳሳት ወይም የስም መደበቂያ ካለው first_name እና last_name በመጠቀም ሙሉ ስም ማሳየት
        if (userNameEl) userNameEl.innerText = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "ክቡር ምዕመን";
    } else {
        // በብሮውዘር ለሚሞክሩ ሰዎች ስህተት እንዳያሳይ
        if (document.getElementById('user-name')) document.getElementById('user-name').innerText = "ክቡር ምዕመን (ውጭ)";
    }
}

// 2. የዕለታዊ ስንክሳር፣ ግጻዌ እና የአበው ምክር ዳታቤዝ (Array)
const dailySpiritualData = {
    // ሰኔ 24 (ምሳሌ የነበረው)
    "6_24": {
        date: "ሰኔ 24 ቀን 2018 ዓ.ም",
        holiday: "የአቡነ ተክለሃይማኖት በዓል",
        sinksar: "<b>📖 ዕለታዊ ስንክሳር፦</b> በዚህች ዕለት ታላቁ ጻድቅ አቡነ ተክለሃይማኖት በደብረ ሊባኖስ በጸሎት የቆሙበትና ገዳማውያንን የባረኩበት ታላቅ የዕረፍታቸው መታሰቢያ በዓል ነው።",
        gitsawe: "<b>📜 የዕለቱ ግጻዌ፦</b> ዲያቆን፦ ኤፌ. 6:10 | ንፍቅ፦ 2ኛ ጴጥ. 3:1 | ወንጌል፦ ማቴ. 19:27",
        quote: "“ምጽዋት ሰጪውን እንጂ ተቀባዩን ብቻ አይጠቅምም። ለሰጪው የጽድቅም መክፈቻ ናት።” — ቅዱስ ዮሐንስ አፈወርቅ"
    },
    // ሰኔ 25
    "6_25": {
        date: "ሰኔ 25 ቀን 2018 ዓ.ም",
        holiday: "ቅዱስ ይሁዳ ሐዋርያ",
        sinksar: "<b>📖 ዕለታዊ ስንክሳር፦</b> በዚህች ዕለት ከ72ቱ አርድእት አንዱ የሆነውና ጌታችንን በታማኝነት ያገለገለው ቅዱስ ይሁዳ ሐዋርያ የሰማዕትነት አክሊል የተቀበለበት ዕለት ነው።",
        gitsawe: "<b>📜 የዕለቱ ግጻዌ፦</b> ዲያቆን፦ ይሁዳ 1:1 | ንፍቅ፦ 1ኛ ዮሐ. 2:1 | ወንጌል፦ ሉቃ. 10:1",
        quote: "“በፈተና ውስጥ ስትሆን ተስፋ አትቁረጥ፤ ይልቁንም ወደ እግዚአብሔር ጩኽ። እርሱ ቅርብ ነውና።” — ቅዱስ ኤፍሬም ሶርያዊ"
    },
    // ሰኔ 26
    "6_26": {
        date: "ሰኔ 26 ቀን 2018 ዓ.ም",
        holiday: "ቅዱስ ያዕቆብ ዘንሲቢን",
        sinksar: "<b>📖 ዕለታዊ ስንክሳር፦</b> የታላቁ የንሲቢን ኤጲስቆጶስ ቅዱስ ያዕቆብ መታሰቢያ ነው። በጸሎቱ ድንቆችን ያደረገ እና የኒቅያ ጉባኤ ተካፋይ የነበረ አባት ነው።",
        gitsawe: "<b>📜 የዕለቱ ግጻዌ፦</b> ዲያቆን፦ 1ኛ ቆሮ. 4:9 | ንፍቅ፦ ያዕ. 5:13 | ወንጌል፦ ዮሐ. 10:11",
        quote: "“ጸሎት ማለት ከእግዚአብሔር ጋር መነጋገር ነው። በጸሎት ጊዜ ልብህ ከምድር ይልቅ ወደ ሰማይ ይቅረብ።” — ቅዱስ ባስልዮስ ዘቂሳሪያ"
    }
    // 💡 ማስታወሻ፦ እዚህ ላይ የቀሩትን ቀኖች በተመሳሳይ መልክ መሙላት ይቻላል።
};

// 3. የዕለቱን መረጃ በራስ-ሰር አውጥቶ አፕሊኬሽኑ ላይ የሚቀይር አሠራር
function updateDailyContent() {
    const today = new Date();
    // ለጊዜው በፈረንጅ ቀን ላይ ተመስርቶ በየቀኑ እንዲቀያየር (ወደፊት በኢትዮጵያ ካላንደር ቀመር ይተካል)
    const day = today.getDate(); 
    const month = today.getMonth() + 1; // ጃቫስክሪፕት ወራትን ከ0 ነው የሚጀምረው
    
    // ለምሳሌ ዛሬ ሰኔ 25 (June 25) ከሆነ የ "6_25" ዳታን ይፈልጋል
    // ለአሁኑ ፈተና እንዲሆንህ ከሰኔ 24 እስከ 26 ባሉት ቀናት ይፈራረቃል፤ ከሌለ መደበኛውን ሰኔ 24 ያሳያል
    const dataKey = dailySpiritualData[`6_${day}`] ? `6_${day}` : "6_24";
    const todayData = dailySpiritualData[dataKey];

    if (document.getElementById('ethiopian-date')) document.getElementById('ethiopian-date').innerText = todayData.date;
    if (document.getElementById('holiday-title')) document.getElementById('holiday-title').innerText = todayData.holiday;
    if (document.getElementById('sinksar-text')) document.getElementById('sinksar-text').innerHTML = todayData.sinksar;
    if (document.getElementById('gitsawe-text')) document.getElementById('gitsawe-text').innerHTML = todayData.gitsawe;
    if (document.getElementById('scripture-quote')) document.getElementById('scripture-quote').innerText = todayData.quote;
}

// አፑ ሲከፈት ቀኑን ቀይር
updateDailyContent();


// 4. ሁሉንም የዶክመንት ኤለመንቶች ከላይ በቅደም ተከተል ማገናኛ
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
const shareBtn = document.getElementById('share-invite-btn');

let points = parseInt(localStorage.getItem('user_points')) || 0;
let referrals = parseInt(localStorage.getItem('user_referrals')) || 0;

if (document.getElementById('user-points')) document.getElementById('user-points').innerText = points;
if (document.getElementById('referral-count')) document.getElementById('referral-count').innerText = referrals;

// 5. ፋይል (ስክሪንሾት) ሲመረጥ ስሙን እንዲያሳይ ማድረግ
if (fileInput && fileText) {
    fileInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            fileText.innerText = "📸 የተመረጠው ፋይል፦ " + this.files[0].name;
        } else {
            fileText.innerText = "";
        }
    });
}

// 6. አበርክት የሚለው ቁልፍ ሲነካ መረጃ መመዝገቢያ
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

// 7. መዝሙር ማጫወቻ አሠራር
if (musicToggleBtn && mezmur) {
    musicToggleBtn.addEventListener('click', () => {
        if (mezmur.paused) {
            mezmur.play().catch(err => console.log("የኦዲዮ ስህተት:", err));
            musicToggleBtn.innerHTML = '<i class="fas fa-pause"></i> መዝሙር አቁም';
            musicToggleBtn.style.background = '#ffd700';
            musicToggleBtn.style.color = '#4A0E17';
        } else {
            mezmur.pause();
            musicToggleBtn.innerHTML = '<i class="fas fa-music"></i> መዝሙር ክፈት';
            musicToggleBtn.style.background = 'rgba(255,255,255,0.1)';
            musicToggleBtn.style.color = '#ffffff';
        }
    });
}

// 8. Touch/Tap አሠራር ለዋናው ቁልፍ (Tap-to-Bless)
if (mainTapBtn) {
    mainTapBtn.addEventListener('click', (e) => {
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

// 9. የክፍያ አካውንቶችን ኮፒ ማድረጊያ ዘዴ
if (cbeBtn) {
    cbeBtn.addEventListener('click', () => {
        navigator.clipboard.writeText('1000379314396');
        if (tg) tg.showPopup({title: 'የኢትዮጵያ ንግድ ባንክ', message: 'የአካውንት ቁጥር 1000379314396 ወደ ስልክዎ ኮፒ ተደርጓል!'});
        else alert('CBE አካውንት ኮፒ ተደርጓል!');
        if (blessingModal) blessingModal.classList.add('show');
    });
}

if (teleBtn) {
    teleBtn.addEventListener('click', () => {
        navigator.clipboard.writeText('0920628769');
        if (tg) tg.showPopup({title: 'ቴሌብር', message: 'የአቅራቢው ስልክ ቁጥር 0920628769 ወደ ስልክዎ ኮፒ ተደርጓል!'});
        else alert('የቴሌብር ስልክ ኮፒ ተደርጓል!');
        if (blessingModal) blessingModal.classList.add('show');
    });
}

// 10. የሪፈራል ግብዣ ሊንክ መፍጠሪያ ቁልፍ (ትክክለኛው የቦት ስም ተተክቷል)
if (shareBtn) {
    shareBtn.addEventListener('click', () => {
        const botUsername = "BeenteSmaMariam_bot"; // 👈 ካፒታል ሌተሮቹ በትክክል ተስተካክለዋል!
        const inviteLink = `https://t.me/${botUsername}?start=ref_${telegramUserId}`;
        
        if (tg) {
            tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent("ወደ ቤተሳይዳ መንፈሳዊ በጎ አድራጎት መድረክ ይግቡና የበረከት ተሳታፊ ይሁኑ! ✨")}`);
        } else {
            navigator.clipboard.writeText(inviteLink);
            alert("የመጋበዣ ሊንክዎ ኮፒ ሆኗል፦ " + inviteLink);
        }
    });
}

if (closeModal) {
    closeModal.addEventListener('click', () => {
        if (blessingModal) blessingModal.classList.remove('show');
    });
}

function createFloatingPlusOne(x, y) {
    const el = document.createElement('div');
    el.className = 'floating-plus-one';
    el.innerText = '+1 🪙';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}
