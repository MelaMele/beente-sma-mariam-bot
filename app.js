// 1. የቴሌግራም ዌብ አፕሊኬชั่น ማስነሻ
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    const user = tg.initDataUnsafe?.user;
    if (user) {
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) userNameEl.innerText = user.first_name || "ክቡር ምዕመን";
    }
}

// 2. ሁሉንም የዶክመንት ኤለመንቶች ከላይ በቅደም ተከተል ማገናኛ
const blessingModal = document.getElementById('blessing-modal');
const mainTapBtn = document.getElementById('main-tap-btn');
const closeModal = document.getElementById('close-modal');
const musicToggleBtn = document.getElementById('music-toggle-btn');
const mezmur = document.getElementById('bg-mezmur');
const submitDonationBtn = document.getElementById('submit-donation');
const fileInput = document.getElementById('receipt-screenshot');
const fileText = document.getElementById('file-chosen-text');

// የክፍያ እና የሪፈራል ቁልፎች
const cbeBtn = document.getElementById('cbe-pay-btn');
const teleBtn = document.getElementById('tele-pay-btn');
const shareBtn = document.getElementById('share-invite-btn');

// የነጥብ እና የሪፈራል መረጃዎችን ከሊንኩ ማውጫ
let points = parseInt(localStorage.getItem('user_points')) || 0;
let referrals = parseInt(localStorage.getItem('user_referrals')) || 0;

if (document.getElementById('user-points')) document.getElementById('user-points').innerText = points;
if (document.getElementById('referral-count')) document.getElementById('referral-count').innerText = referrals;

// 3. ፋይል (ስክሪንሾት) ሲመረጥ ስሙን እንዲያሳይ ማድረግ
if (fileInput && fileText) {
    fileInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            fileText.innerText = "📸 የተመረጠው ፋይል፦ " + this.files[0].name;
        } else {
            fileText.innerText = "";
        }
    });
}

// 4. አበርክት የሚለው ቁልፍ ሲነካ መረጃ መመዝገቢያ
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
        
        // ፎርሙን መዝጋት እና ፋይሉን ማጽዳት
        if (blessingModal) blessingModal.classList.remove('show');
        if (fileInput) fileInput.value = "";
        if (fileText) fileText.innerText = "";
    });
}

// 5. መዝሙር ማጫወቻ አሠራር
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

// 6. Touch/Tap አሠራር ለዋናው ቁልፍ (Tap-to-Bless)
if (mainTapBtn) {
    mainTapBtn.addEventListener('click', (e) => {
        points += 1;
        if (document.getElementById('user-points')) document.getElementById('user-points').innerText = points;
        localStorage.setItem('user_points', points);
        
        // የደረጃ ማሻሻያ (Rank Level up)
        const userBadge = document.getElementById('user-badge');
        if (userBadge) {
            if (points > 500) userBadge.innerText = "የበረከት ሊቅ";
            else if (points > 100) userBadge.innerText = "የበረከት ታጋይ";
        }

        createFloatingPlusOne(e.clientX, e.clientY);
    });
    
    // በሁለተኛ አማራጭ ፎርሙን ለመክፈት (Double Click)
    mainTapBtn.addEventListener('dblclick', () => {
        if (blessingModal) blessingModal.classList.add('show');
    });
}

// 7. የክፍያ አካውንቶችን ኮፒ ማድረጊያ ዘዴ
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

// 8. የሪፈራል ግብዣ ሊንክ መፍጠሪያ ቁልፍ
if (shareBtn) {
    shareBtn.addEventListener('click', () => {
        const botUsername = "beente_sma_mariam_bot"; 
        const userId = tg?.initDataUnsafe?.user?.id || "member";
        const inviteLink = `https://t.me/${botUsername}?start=ref_${userId}`;
        
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

// የ +1 ፍሎቲንግ አኒሜሽን መስሪያ
function createFloatingPlusOne(x, y) {
    const el = document.createElement('div');
    el.className = 'floating-plus-one';
    el.innerText = '+1 🪙';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}
