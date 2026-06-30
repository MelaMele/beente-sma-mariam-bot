// 1. የቴሌግራም ዌብ አፕሊኬሽን ማስነሻ
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand(); // ገጹን ሙሉ ስክሪን ማድረግ
    
    // የተጠቃሚውን ስም ከቴሌግራም መውሰድ
    const user = tg.initDataUnsafe?.user;
    if (user) {
        document.getElementById('user-name').innerText = user.first_name || "ክቡር ምዕመን";
        if (user.username) {
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

let selectedAmount = 100; // ነባሪ መባ

// 3. የዕለቱን በዓል፣ ስንክሳር እና ግጻዌ ከፓይተን ሰርቨር መጫኛ
async function loadDailyBlessing() {
    try {
        const response = await fetch('/api/daily-blessing'); 
        if (response.ok) {
            const data = await response.json();
            
            // መረጃዎቹን በቅደም ተከተል በፍሮንት-ኤንዱ ላይ መተካት
            if(document.getElementById('ethiopian-date')) document.getElementById('ethiopian-date').innerText = data.ethiopian_date;
            if(document.getElementById('holiday-title')) document.getElementById('holiday-title').innerText = data.holiday_name;
            if(document.getElementById('sinksar-text')) document.getElementById('sinksar-text').innerHTML = `<b>📖 ዕለታዊ ስንክሳር፦</b> ${data.sinksar}`;
            if(document.getElementById('gitsawe-text')) document.getElementById('gitsawe-text').innerHTML = `<b>📜 የዕለቱ ግጻዌ፦</b> ${data.gitsawe}`;
            if(document.getElementById('scripture-quote')) document.getElementById('scripture-quote').innerText = data.quote;
        }
    } catch (error) {
        console.error("የቅዱሳት መጻሕፍት መረጃን መጫን አልተቻለም:", error);
    }
}

// 4. ክስተቶች (Event Listeners)
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
