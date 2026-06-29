// ከላይ የድሮው የ Supabase እና የቲጂ መረጃ እንዳለ ሆኖ፣ ከታች ይህንን ጨምር፦

const blessingModal = document.getElementById('blessing-modal');
const mainTapBtn = document.getElementById('main-tap-btn');
const closeModal = document.getElementById('close-modal');
const amountButtons = document.querySelectorAll('.amount-btn');
const submitDonationBtn = document.getElementById('submit-donation');

let selectedAmount = 100; // ነባሪ መባ

// ክብ ቁልፉ ሲነካ ፎርሙ እንዲከፈት ማድረግ
mainTapBtn.addEventListener('click', (e) => {
    blessingModal.classList.add('show');
    
    // ያንን የ +1 ፍሎቲንግ አኒሜሽን ማሳየት
    createFloatingPlusOne(e.clientX, e.clientY);
});

// ፎርሙን መዝጊያ
closeModal.addEventListener('click', () => {
    blessingModal.classList.remove('show');
});

// የገንዘብ መጠን መምረጫ ቁልፎች ስራ
amountButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        amountButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedAmount = btn.getAttribute('data-amount');
    });
});

// "አበርክት" ሲል የሚፈጠረው ነገር (ለጊዜው መልዕክት ያሳያል፣ በኋላ ከ Chapa ጋር ይገናኛል)
submitDonationBtn.addEventListener('click', async () => {
    const christianName = document.getElementById('christian-name').value;
    const reason = document.getElementById('prayer-reason').value;

    if(!christianName) {
        alert('እባክዎ የክርስትና ስምዎን ያስገቡ!');
        return;
    }

    // መረጃውን ወደ Supabase መላክ (በሚቀጥለው እርምጃ ዳታቤዙን ስናስተካክለው ይገባል)
    alert(`ተሳክቷል! የክርስትና ስም፡ ${christianName}\nምክንያት፡ ለ${reason}\nመጠን፡ ${selectedAmount} ብር\n\nበቀጣይ ወደ ክፍያ ሥርዓት ይወስደዎታል!`);
    blessingModal.classList.remove('show');
});

function createFloatingPlusOne(x, y) {
    const el = document.createElement('div');
    el.className = 'floating-plus-one';
    el.innerText = '+1 🪙';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}
// የዕለቱን በዓል እና ስዕለ አድህኖ ከሰርቨር ላይ ለማምጣት (ይህንን በ app.js ውስጥ ጨምረው)
async function loadDailyBlessing() {
    try {
        // ለምሳሌ ዛሬ ሰኔ 22 ቢሆን የቅዱስ ሚካኤልን ስዕል እና ጥቅስ ያዘጋጃል
        // ወደፊት ይህ መረጃ በቀጥታ ከ Supabase ይመጣል
        const response = await fetch('/api/daily-blessing'); 
        if (response.ok) {
            const data = await response.json();
            document.getElementById('holiday-title').innerText = data.holiday_name;
            document.getElementById('holy-image').src = data.image_url;
            document.getElementById('scripture-quote').innerText = data.quote;
        } else {
            // ሰርቨሩ መረጃውን እስኪያዘጋጅ በነባሪ እውነተኛ መንፈሳዊ ሊንክ እዚህ እንተካለን
            document.getElementById('holiday-title').innerText = "የዕለቱ ቅዱስ መታሰቢያ";
            // አስተማማኝ እና ፈጣን የሆነ የስዕል ሊንክ (ለምሳሌ የዊኪፒዲያ ወይም የሕዝባዊ ሰርቨር ሊንክ)
            document.getElementById('holy-image').src = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Virgin_and_Child_with_Angels_and_Saints_-_Google_Art_Project.jpg/400px-Virgin_and_Child_with_Angels_and_Saints_-_Google_Art_Project.jpg";
        }
    } catch (error) {
        console.error("የዕለቱን ስዕል መጫን አልተቻለም:", error);
        // ኔትወርክ ቢጠፋ እንኳ የማይጠፋ ነባሪ ምስል
        document.getElementById('holy-image').src = "https://upload.wikimedia.org/wikipedia/commons/4/47/Icon_of_the_Mother_of_God_of_the_Sign_-_Google_Art_Project.jpg";
    }
}

// ገጹ ልክ እንደተከፈተ ስዕሉን እንዲያመጣ መጥራት
document.addEventListener('DOMContentLoaded', () => {
    loadDailyBlessing();
});
