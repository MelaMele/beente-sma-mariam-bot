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

    // በጁላይ (July) ወር ውስጥ ከሆንን (ዛሬ ጁላይ 5 = ሰኔ 28)
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

// 3. የዕለታዊ ስንክሳር፣ ግጻዌ እና የአበው ምክር ዳታቤዝ (ለሚኒ አፑ አጠር ያለ)
const dailySpiritualData = {
    "10-28": {
        date: "ሰኔ 28 ቀን 2018 ዓ.ም",
        holiday: "የአማኑኤል እና የቅዱስ ቴዎድሮስ በዓል",
        sinksar: "<b>📖 ዕለታዊ ስንክሳር፦</b> በዚህች ዕለት ጌታችን መድኃኒታችን ኢየሱስ ክርስቶስ ለአለም የገባውን የምሕረት ቃልኪዳን ያሰበበት እና ታላቁ ሰማዕት ቅዱስ ቴዎድሮስ በሰማዕትነት ያረፈበት ዕለት ነው።",
        gitsawe: "<b>📜 የዕለቱ ግጻዌ፦</b> ዲያቆን፦ ዕብ. 8:1 | ንፍቅ፦ 1ኛ ጴጥ. 2:1 | ወንጌል፦ ማቴ. 1:21",
        quote: "🔍 ዝርዝር ትምህርቱንና የወንጌል አንድምታውን በኢንፎ መላ ቻናላችን ላይ በሰፊው ይማሩ!"
    }
};

// 4. የዕለቱን መረጃ በራስ-ሰር አውጥቶ አፕሊኬሽኑ ላይ የሚቀይር አሠራር
function updateDailyContent() {
    const ethDate = getEthiopianDate();
    const dataKey = `${ethDate.month}_${ethDate.day}`;
    
    // ዳታው ከሌለ እንደ ነባሪ የሰኔ 28ን ዳታ እንዲያሳይ ማድረግ
    const todayData = dailySpiritualData[dataKey] ? dailySpiritualData[dataKey] : dailySpiritualData["10_28"];

    if (document.getElementById('ethiopian-date')) document.getElementById('ethiopian-date').innerText = todayData.date;
    if (document.getElementById('holiday-title')) document.getElementById('holiday-title').innerText = todayData.holiday;
    if (document.getElementById('sinksar-text')) document.getElementById('sinksar-text').innerHTML = todayData.sinksar;
    if (document.getElementById('gitsawe-text')) document.getElementById('gitsawe-text').innerHTML = todayData.gitsawe;
    if (document.getElementById('scripture-quote')) document.getElementById('scripture-quote').innerText = todayData.quote;
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

// 11. 🔗 የሪፈራል ግብዣ ሊንክ (ሰዎችን ቀጥታ ወደ ቻናሉ የሚወስድ ስልት)
if (shareBtn) {
    shareBtn.addEventListener('click', () => {
        // ✨ በትዕምርተ ጥቅስ የተስተካከለ የቻናል መጋበዣ ሊንክ
        const inviteLink = "https://t.me/infomela06";
        const shareText = "ወደ ቤተሳይዳ መንፈሳዊ በጎ አድራጎት መድረክ ይግቡና የበረከት ተሳታፊ ይሁኑ! ✨";
        
        if (tg) {
            // የቴሌግራም share ሊንክ አጠቃቀም ሥርዓት
            tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`);
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
    const el = document.createElement('div');
    el.className = 'floating-plus-one';
    el.innerText = '+1 🪙';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}
