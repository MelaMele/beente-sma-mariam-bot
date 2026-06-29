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
