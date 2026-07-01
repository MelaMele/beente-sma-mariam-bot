const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    const user = tg.initDataUnsafe?.user;
    if (user) {
        document.getElementById('user-name').innerText = user.first_name || "ክቡር ምዕመን";
    }
}

const blessingModal = document.getElementById('blessing-modal');
const mainTapBtn = document.getElementById('main-tap-btn');
const closeModal = document.getElementById('close-modal');
const musicToggleBtn = document.getElementById('music-toggle-btn');
const mezmur = document.getElementById('bg-mezmur');

// የክፍያ ቁልፎች
const cbeBtn = document.getElementById('cbe-pay-btn');
const teleBtn = document.getElementById('tele-pay-btn');
const shareBtn = document.getElementById('share-invite-btn');

let points = parseInt(localStorage.getItem('user_points')) || 0;
let referrals = parseInt(localStorage.getItem('user_referrals')) || 0;

document.getElementById('user-points').innerText = points;
document.getElementById('referral-count').innerText = referrals;

// 1. መዝሙር ማጫወቻ አሠራር
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

// 2. Touch/Tap አሠራር ለዋናው ቁልፍ (ልክ እንደ Notcoin)
if (mainTapBtn) {
    mainTapBtn.addEventListener('click', (e) => {
        points += 1;
        document.getElementById('user-points').innerText = points;
        localStorage.setItem('user_points', points);
        
        // የደረጃ ማሻሻያ (Rank Level up)
        if (points > 500) document.getElementById('user-badge').innerText = "የበረከት ሊቅ";
        else if (points > 100) document.getElementById('user-badge').innerText = "የበረከት ታጋይ";

        createFloatingPlusOne(e.clientX, e.clientY);
    });
    
    // በረጅሙ ሲጫኑት ወይም በሁለተኛ አማራጭ ፎርሙን ለመክፈት (Double Click) ካስፈለገ
    mainTapBtn.addEventListener('dblclick', () => {
        if (blessingModal) blessingModal.classList.add('show');
    });
}

// 3. የክፍያ አካውንቶችን ኮፒ ማድረጊያ ዘዴ
if (cbeBtn) {
    cbeBtn.addEventListener('click', () => {
        navigator.clipboard.writeText('1000379314396');
        if(tg) tg.showPopup({title: 'የኢትዮጵያ ንግድ ባንክ', message: 'የአካውንት ቁጥር 1000379314396 ወደ ስልክዎ ኮፒ ተደርጓል!'});
        else alert('CBE አካውንት ኮፒ ተደርጓል!');
        if (blessingModal) blessingModal.classList.add('show');
    });
}

if (teleBtn) {
    teleBtn.addEventListener('click', () => {
        navigator.clipboard.writeText('0920628769');
        if(tg) tg.showPopup({title: 'ቴሌብር', message: 'የአቅራቢው ስልክ ቁጥር 0920628769 ወደ ስልክዎ ኮፒ ተደርጓል!'});
        else alert('የቴሌብር ስልክ ኮፒ ተደርጓል!');
        if (blessingModal) blessingModal.classList.add('show');
    });
}

// 4. የሪፈራል ግብዣ ሊንክ መፍጠሪያ ቁልፍ
if (shareBtn) {
    shareBtn.addEventListener('click', () => {
        const botUsername = "beente_sma_mariam_bot"; // የቦትህ ትክክለኛ ዩዘርኔም
        const userId = tg.initDataUnsafe?.user?.id || "member";
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
        blessingModal.classList.remove('show');
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
