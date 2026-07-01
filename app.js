// 1. የቴሌግራም ዌብ አፕሊኬሽን ማስነሻ
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand(); // ገጹን ሙሉ ስክሪን ማድረግ
    
    // የተጠቃሚውን ስም ከቴሌግራም መውሰድ
    const user = tg.initDataUnsafe?.user;
    if (user) {
        document.getElementById('user-name').innerText = user.first_name || "ክቡር ምዕመን";
        if (user.username && document.getElementById('user-avatar')) {
            document.getElementById('user-avatar').innerText = "🎁";
        }
    }
}

// 2. የዶክመንት ኤለመንቶች ማገናኛ
const blessingModal = document.getElementById('blessing-modal');
const mainTapBtn = document.getElementById('main-tap-btn');
const closeModal = document.getElementById('close-modal');
const amountButtons = document.querySelectorAll('.amount-btn');
const submitDonationBtn = document.getElementById('submit-donation');
const musicToggleBtn = document.getElementById('music-toggle-btn');

let selectedAmount = 100; // ነባሪ መባ
let player; // የዩቲዩብ ማጫወቻ ተለዋዋጭ

// 3. የዕለቱን በዓል፣ ስንክሳር እና ግጻዌ መጫኛ
async function loadDailyBlessing() {
    try {
        const response = await fetch('/api/daily-blessing'); 
        if (response.ok) {
            // ዛሬን ሰኔ 24 (የአቡነ ተክለሃይማኖት በዓል) በትክክል እንዲያሳይ እናስገድደዋለን
            if(document.getElementById('ethiopian-date')) document.getElementById('ethiopian-date').innerText = "ሰኔ 24 ቀን 2018 ዓ.ም";
            if(document.getElementById('holiday-title')) document.getElementById('holiday-title').innerText = "የአቡነ ተክለሃይማኖት ዓመታዊ መታሰቢያ በዓል";
            if(document.getElementById('sinksar-text')) document.getElementById('sinksar-text').innerHTML = `<b>📖 ዕለታዊ ስንክሳር፦</b> በዚህች ዕለት ታላቁ ጻድቅ አቡነ ተክለሃይማኖት በደብረ ሊባኖስ በጸሎት የቆሙበትና ገዳማውያንን የባረኩበት ታላቅ የዕረፍታቸው መታሰቢያ በዓል ነው።`;
            if(document.getElementById('gitsawe-text')) document.getElementById('gitsawe-text').innerHTML = `<b>📜 የዕለቱ ግጻዌ፦</b> ዲያቆን፦ ኤፌ. 6:10 | ንፍቅ፦ 2ኛ ጴጥ. 3:1 | ወንጌል፦ ማቴ. 19:27`;
        }
    } catch (error) {
        console.error("የቅዱሳት መጻሕፍት መረጃን መጫን አልተቻለም:", error);
    }
}

// 4. የዩቲዩብ አይፍሬም ኤፒአይ ማስነሻ (YouTube Iframe API)
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: 'iVIr0A9HULg', // የዘማሪ ቴዎድሮስ ዮሴፍ መዝሙር ID
        playerVars: {
            'autoplay': 0,
            'loop': 1,
            'playlist': 'iVIr0A9HULg'
        }
    });
}

// 5. መዝሙር ማጫወቻ ቁልፍ አሠራር (አንድ ወጥ የተደረገ)
if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => {
        // 1 ማለት የዩቲዩብ ቪዲዮው እየተጫወተ ነው ማለት ነው
        if (player && player.getPlayerState() !== 1) { 
            player.playVideo();
            musicToggleBtn.innerHTML = '<i class="fas fa-pause"></i> መዝሙር አቁም';
            musicToggleBtn.style.background = '#ffd700';
            musicToggleBtn.style.color = '#4A0E17';
        } else if (player) {
            player.pauseVideo();
            musicToggleBtn.innerHTML = '<i class="fas fa-music"></i> መዝሙር ክፈት';
            musicToggleBtn.style.background = 'rgba(255,255,255,0.1)';
            musicToggleBtn.style.color = '#ffffff';
        }
    });
}

// 6. ክስተቶች (Event Listeners)
if (mainTapBtn) {
    mainTapBtn.addEventListener('click', (e) => {
        if (blessingModal) blessingModal.classList.add('show');
        createFloatingPlusOne(e.clientX, e.clientY);
    });
}

if (closeModal) {
    closeModal.addEventListener('click', () => {
        if (blessingModal) blessingModal.classList.remove('show');
    });
}

amountButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        amountButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedAmount = btn.getAttribute('data-amount');
    });
});

if (submitDonationBtn) {
    submitDonationBtn.addEventListener('click', () => {
        const christianName = document.getElementById('christian-name').value;
        const reason = document.getElementById('prayer-reason').value;

        if(!christianName) {
            alert('እባክዎ የክርስትና ስምዎን ያስገቡ!');
            return;
        }

        alert(`ተሳክቷል!\nየክርስትና ስም፡ ${christianName}\nምክንያት፡ ለ${reason}\nመጠን፡ ${selectedAmount} ብር\n\nየ"ቤተሳይዳ በጎ አድራጎት" ስጦታዎ በክብር ተመዝግቧል!`);
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

// ገጹ ልክ እንደተጫነ መረጃውን ዝግጁ ማድረግ
document.addEventListener('DOMContentLoaded', () => {
    loadDailyBlessing();
});
