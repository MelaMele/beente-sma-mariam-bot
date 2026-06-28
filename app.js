// ቴሌግራም ሚኒ አፕሊኬሽን ማስነሳት
const tg = window.Telegram.WebApp;
tg.expand(); // ገጹን ሙሉ ስክሪን ማድረግ

// የተጠቃሚውን መረጃ ከቴሌግራም መውሰድ
const initDataUnsafe = tg.initDataUnsafe;

if (initDataUnsafe && initDataUnsafe.user) {
    const user = initDataUnsafe.user;
    document.getElementById('user-name').innerText = user.first_name + (user.last_name ? ' ' + user.last_name : '');
    // እዚህ ጋር ከ Supabase ላይ የተጠቃሚውን የሪፈራል ብዛት መሳብ ይቻላል
}

// ቁልፉ ሲነካ የሚሰራው ተግባር (Tap Action)
const tapBtn = document.getElementById('main-tap-btn');
tapBtn.addEventListener('click', () => {
    // ስልኩ ላይ ረቂቅ ንዝረት (Haptic Feedback) ለመፍጠር
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
    
    // ለወደፊቱ እዚህ ላይ ተጠቃሚው ሲነካ የነጥብ አኒሜሽን መጨመር ይቻላል
    alert("ስለ ስሟ የሰጡትን አታሳጣን! የዕለቱ የበረከት ተሳትፎ ገጽ ተከፍቷል።");
});
