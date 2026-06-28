// 1. ቴሌግራም ሚኒ አፕሊኬሽን ማስነሳት እና ማዘጋጀት
const tg = window.Telegram.WebApp;
tg.expand(); // ገጹን ሙሉ ስክሪን ማድረግ
tg.ready();  // ሚኒ አፑ ዝግጁ መሆኑን ለቴሌግራም ማሳወቅ

// የ Supabase ሊንኮች (እነዚህን በቪርሴል ወይም በኮድህ ውስጥ ባለው ትክክለኛ አድራሻ ተካቸው)
const SUPABASE_URL = "https://your-supabase-project.supabase.co"; // <-- ያንተን Supabase URL ተካ
const SUPABASE_ANON_KEY = "your-anon-key"; // <-- ያንተን Supabase Anon Key ተካ

// በመያዣነት የምንጠቀምባቸው ተለዋዋጮች
let telegramId = null;
let currentPoints = 0;

// 2. የተጠቃሚውን መረጃ ከቴሌግራም መውሰድ
const initDataUnsafe = tg.initDataUnsafe;

if (initDataUnsafe && initDataUnsafe.user) {
    const user = initDataUnsafe.user;
    telegramId = user.id;

    // የተጠቃሚውን ስም በስክሪኑ ላይ መጻፍ
    const fullName = user.first_name + (user.last_name ? ' ' + user.last_name : '');
    document.getElementById('user-name').innerText = fullName;

    // የተጠቃሚውን ነጥብ እና ሪፈራል ከ Supabase መሳብ
    loadUserData(telegramId);
} else {
    // ለሙከራ ያህል በብሮውዘር ስንከፍተው እንዳይበላሽ የሙከራ ID መስጠት
    telegramId = 123456789;
    loadUserData(telegramId);
}

// 3. መረጃዎችን ከ Supabase የመሳቢያ ፈንክሽን
async function loadUserData(userId) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/users?telegram_id=eq.${userId}`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        const data = await response.json();

        if (data && data.length > 0) {
            const userData = data[0];
            currentPoints = userData.points || 0;
            
            // በ HTML ላይ መረጃዎቹን ማሳየት (እነዚህ ID ያላቸው ታጎች በ html ውስጥ መኖራቸውን አረጋግጥ)
            document.getElementById('user-points').innerText = currentPoints;
            document.getElementById('referral-count').innerText = userData.referral_count || 0;
        }
    } catch (error) {
        console.error("ዳታ ከ Supabase ለመሳብ ሲሞከር ስህተት አጋጠመ:", error);
    }
}

// 4. ነጥብ ሲጨመር ወደ Supabase የማዘመኛ ፈንክሽን
async function updatePointsInDatabase(userId, newPoints) {
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/users?telegram_id=eq.${userId}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ points: newPoints })
        });
    } catch (error) {
        console.error("ነጥብ ለማዘመን ሲሞከር ስህተት አጋጠመ:", error);
    }
}

// 5. ቁልፉ ሲነካ የሚሰራው ተግባር (Tap Action)
const tapBtn = document.getElementById('main-tap-btn');
const pointsDisplay = document.getElementById('user-points');

if (tapBtn) {
    tapBtn.addEventListener('click', (e) => {
        // ሀ. ስልኩ ላይ ረቂቅ ንዝረት (Haptic Feedback) መፍጠር
        if (tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('medium');
        }
        
        // ለ. ነጥብን በ 1 መጨመር እና ስክሪን ላይ ማሳየት
        currentPoints += 1;
        if (pointsDisplay) {
            pointsDisplay.innerText = currentPoints;
        }

        // ሐ. ስክሪኑ ላይ የ +1 አኒሜሽን መፍጠር
        createFloatingPlusOne(e);

        // መ. ነጥቡን በየጊዜው ወደ ዳታቤዝ መላክ (Debounce ወይም በቀጥታ)
        updatePointsInDatabase(telegramId, currentPoints);
    });
}

// 6. የተንሳፋፊ +1 አኒሜሽን መፍጠሪያ ፈንክሽን
function createFloatingPlusOne(event) {
    const floatText = document.createElement('div');
    floatText.innerText = '+1';
    floatText.className = 'floating-plus-one';
    
    // ቁልፉ በተነካበት ልክ ቦታ ላይ ማቀናጀት
    floatText.style.left = `${event.clientX}px`;
    floatText.style.top = `${event.clientY}px`;
    
    document.body.appendChild(floatText);
    
    // አኒሜሽኑ ሲያልቅ ፋይሉን ከ HTML ላይ ማጥፋት
    setTimeout(() => {
        floatText.remove();
    }, 1000);
}
