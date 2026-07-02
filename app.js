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

// 2. 💡 አዲሱ የፈረንጅ ቀንን ወደ ኢትዮጵያ ቀን መቀየሪያ ቀመር (Simple Gregorian to Ethiopian Converter)
function getEthiopianDate() {
    const now = new Date();
    let gYear = now.getFullYear();
    let gMonth = now.getMonth() + 1;
    let gDay = now.getDate();

    // ለአሁኑ (ለ2026 እ.ኤ.አ) የሰኔ ወርን ለማስላት የሚያገለግል ቀመር
    // June 8 = ሰኔ 1 | June 25 = ሰኔ 18 | July 1 = ሰኔ 24 | July 2 = ሰኔ 25 | July 3 = ሰኔ 26
    let ethMonth = 10; // ሰኔ መደበኛ 10ኛ ወር ነው
    let ethDay = 1;
    let ethYear = gYear - 8; // በተለምዶ 8 ዓመት ወደኋላ

    // በጁላይ (July) ወር ውስጥ ከሆንን
    if (gMonth === 7) {
        ethDay = gDay + 23; // July 1 = ሰኔ 24 (1 + 23)
        if (ethDay > 30) {
            ethDay = ethDay - 30;
            ethMonth = 11; // ሐምሌ
        }
    } 
    // በጁን (June) ወር ውስጥ ከሆንን
    else if (gMonth === 6) {
        if (gDay >= 8) {
            ethDay = gDay - 7; // June 8 = ሰኔ 1 (8 - 7)
        } else {
            ethMonth = 9; // ግንቦት
            ethDay = gDay + 24;
        }
    }

    return { month: ethMonth, day: ethDay, year: ethYear };
}

// 3. የዕለታዊ ስንክሳር፣ ግጻዌ እና የአበው ምክር ዳታቤዝ (Array)
// ማስታወሻ፦ እዚህ ላይ "10_24" ማለት 10ኛ ወር (ሰኔ) 24 ቀን ማለት ነው
const dailySpiritualData = {
    "10_24": {
        date: "ሰኔ 24 ቀን 2018 ዓ.ም",
        holiday: "የአቡነ ተክለሃይማኖት በዓል",
        sinksar: "<b>📖 ዕለታዊ ስንክሳር፦</b> በዚህች ዕለት ታላቁ ጻድቅ አቡነ ተክለሃይማኖት በደብረ ሊባኖስ በጸሎት የቆሙበትና ገዳማውያንን የባረኩበት ታላቅ የዕረፍታቸው መታሰቢያ በዓል ነው።",
        gitsawe: "<b>📜 የዕለቱ ግጻዌ፦</b> ዲያቆን፦ ኤፌ. 6:10 | ንፍቅ፦ 2ኛ ጴጥ. 3:1 | ወንጌል፦ ማቴ. 19:27",
        quote: "“ምጽዋት ሰጪውን እንጂ ተቀባዩን ብቻ አይጠቅምም። ለሰጪው የጽድቅም መክፈቻ ናት።” — ቅዱስ ዮሐንስ አፈወርቅ"
    },
    "10_25": {
        date: "ሰኔ 25 ቀን 2018 ዓ.ም",
        holiday: "ቅዱስ ይሁዳ ሐዋርያ",
        sinksar: "<b>📖 ዕለታዊ ስንክሳር፦</b> በዚህች ዕለት ከ72ቱ አርድእት አንዱ የሆነውና ጌታችንን በታማኝነት ያገለገለው ቅዱስ ይሁዳ ሐዋርያ የሰማዕትነት አክሊል የተቀበለበት ዕለት ነው።",
        gitsawe: "<b>📜 የዕለቱ ግጻዌ፦</b> ዲያቆን፦ ይሁዳ 1:1 | ንፍቅ፦ 1ኛ ዮሐ. 2:1 | ወንጌል፦ ሉቃ. 10:1",
        quote: "“በፈተና ውስጥ ስትሆን ተስፋ አትቁረጥ፤ ይልቁንም ወደ እግዚአብሔር ጩኽ። እርሱ ቅርብ ነውና።” — ቅዱስ ኤፍሬም ሶርያዊ"
    },
    "10_26": {
        date: "ሰኔ 26 ቀን 2018 ዓ.ም",
        holiday: "ቅዱስ ያዕቆብ ዘንሲቢን",
        sinksar: "<b>📖 ዕለታዊ ስንክሳር፦</b> የታላቁ የንሲቢን ኤጲስቆጶስ ቅዱስ ያዕቆብ መታሰቢያ ነው። በጸሎቱ ድንቆችን ያደረገ እና የኒቅያ ጉባኤ ተካፋይ የነበረ አባት ነው።",
        gitsawe: "<b>📜 የዕለቱ ግጻዌ፦</b> ዲያቆን፦ 1ኛ ቆሮ. 4:9 | ንፍቅ፦ ያዕ. 5:13 | ወንጌል፦ ዮሐ. 10:11",
        quote: "“ጸሎት ማለት ከእግዚአብሔር ጋር መነጋገር ነው። በጸሎት ጊዜ ልብህ ከምድር ይልቅ ወደ ሰማይ ይቅረብ።” — ቅዱስ ባስልዮስ ዘቂሳሪያ"
    }
};

// 4. የዕለቱን መረጃ በራስ-ሰር አውጥቶ አፕሊኬሽኑ ላይ የሚቀይር አሠራር
function updateDailyContent() {
    const ethDate = getEthiopianDate();
    const dataKey = `${ethDate.month}_${ethDate.day}`;
    
    // የዛሬው ቀን በዳታቤዛችን ውስጥ ካለ እሱን ያሳያል፣ ከሌለ ግን መደበኛውን የሰኔ 24 ያሳያል
    const todayData = dailySpiritualData[dataKey] ? dailySpiritualData[dataKey] : dailySpiritualData["10_24"];

    if (document.getElementById('ethiopian-date')) document.getElementById('ethiopian-date').innerText = todayData.date;
    if (document.getElementById('holiday-title')) document.getElementById('holiday-title').innerText = todayData.holiday;
    if (document.getElementById('sinksar-text')) document.getElementById('sinksar-text').innerHTML = todayData.sinksar;
    if (document.getElementById('gitsawe-text')) document.getElementById('gitsawe-text').innerHTML = todayData.gitsawe;
    if (document.getElementById('scripture-quote')) document.getElementById('scripture-quote').innerText = todayData.quote;
}

// አፑ ሲከፈት ቀኑን ቀይር
updateDailyContent();

// 5. ሁሉንም የዶክመንት ኤለመንቶች ከላይ በቅደም ተከተል ማገናኛ
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

// 9. Touch/Tap አሠራር ለዋናው ቁልፍ (Tap-to-Bless)
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

// 10. የክፍያ አካውንቶችን ኮፒ ማድረጊያ ዘዴ
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

// 11. የሪፈራል ግብዣ ሊንክ መፍጠሪያ ቁልፍ
if (shareBtn) {
    shareBtn.addEventListener('click', () => {
        const botUsername = "BeenteSmaMariam_bot"; 
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
