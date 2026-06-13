// ==========================================
// منطق مدیریت سبد خرید (Cart State Management)
// ==========================================

// متغیر سراسری برای نگهداری وضعیت فعلی سبد خرید
let cart = [];

/**
 * خواندن اطلاعات سبد از حافظه مرورگر
 * این تابع هنگام لود اولیه سایت اجرا می‌شود
 */
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    
    if (savedCart) {
        // تبدیل رشته JSON به آرایه جاوا اسکریپت
        cart = JSON.parse(savedCart);
    } else {
        // اگر چیزی ذخیره نشده بود، سبد خالی می‌ماند
        cart = [];
    }
}

/**
 * ذخیره اطلاعات سبد در حافظه مرورگر و آپدیت UI
 */
function saveCart() {
    // تبدیل آرایه به رشته JSON برای ذخیره‌سازی
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // هر بار که چیزی ذخیره می‌شود، عدد روی نوبار هم باید آپدیت شود
    updateCartBadge();
}

/**
 * اضافه کردن یک آیتم جدید به سبد خرید یا افزایش تعداد آن
 */
function addToCart(id, name, price) {
    // جستجو در آرایه برای پیدا کردن آیتم تکراری
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        // اگر آیتم قبلاً در سبد بود، فقط تعدادش را یکی زیاد می‌کنیم
        existingItem.quantity += 1;
    } else {
        // اگر آیتم جدید بود، یک آبجکت جدید به آرایه پوش می‌کنیم
        cart.push({
            id: id,
            name: name,
            price: price,
            quantity: 1
        });
    }

    // ذخیره تغییرات در حافظه
    saveCart();

    // یک لاگ برای دیباگ در کنسول
    console.log(`آیتم ${name} به سبد خرید اضافه شد. وضعیت فعلی:`, cart);
}

/**
 * محاسبه مجموع آیتم‌ها و نمایش روی آیکون سبد خرید در نوبار
 */
function updateCartBadge() {
    const badge = document.getElementById('cart-count');
    
    if (badge) {
        // استفاده از متد reduce برای جمع زدن فیلد quantity تمام آبجکت‌های داخل آرایه
        const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
        
        // قرار دادن عدد جدید داخل تگ HTML
        badge.innerText = totalQuantity;
    }
}

// ==========================================
// توابع مربوط به صفحه سبد خرید (Cart Page)
// ==========================================

/**
 * رندر کردن صفحه سبد خرید (نمایش آیتم‌ها و محاسبه فاکتور)
 */
function renderCartPage() {
    const itemsContainer = document.getElementById('cart-items-container');
    const emptyMsg = document.getElementById('empty-cart-msg');
    const cartContent = document.getElementById('cart-content');
    
    // اگر اصلا در صفحه سبد خرید نیستیم، این تابع نباید کاری کند و خارج می‌شود
    if (!itemsContainer) return;

    // بررسی خالی بودن سبد خرید
    if (cart.length === 0) {
        emptyMsg.classList.remove('d-none'); // نمایش پیام خالی
        cartContent.classList.add('d-none'); // مخفی کردن ساختار فاکتور
        return;
    }

    // اگر سبد پر بود، محتوا را نمایش بده
    emptyMsg.classList.add('d-none');
    cartContent.classList.remove('d-none');

    // پاک کردن محتوای قبلی کانتینر
    itemsContainer.innerHTML = '';
    
    let subtotal = 0;
    const DELIVERY_FEE = 25000; // هزینه ارسال (فعلاً ثابت)

    // تولید HTML برای هر آیتم در سبد
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal; // اضافه کردن به جمع کل

        const itemHTML = `
            <div class="glass-card p-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
                <!-- اطلاعات غذا -->
                <div class="d-flex align-items-center gap-3">
                    <div style="width: 60px; height: 60px; background-color: rgba(0,0,0,0.1);" class="rounded d-flex align-items-center justify-content-center">
                        <span class="small text-secondary">عکس</span>
                    </div>
                    <div>
                        <h6 class="fw-bold mb-1 text-dark">${item.name}</h6>
                        <span class="text-dark small">${item.price.toLocaleString()} تومان</span>
                    </div>
                </div>
                
                <!-- کنترل‌ها و قیمت کل ردیف -->
                <div class="d-flex align-items-center gap-4">
                    <!-- کنترل تعداد -->
                    <div class="d-flex align-items-center glass-effect rounded-pill px-2 py-1">
                        <button onclick="decreaseQuantity(${item.id})" class="btn btn-sm btn-link text-dark text-decoration-none fw-bold fs-5 px-2 pb-2">-</button>
                        <span class="fw-bold px-3 text-dark">${item.quantity}</span>
                        <button onclick="increaseQuantity(${item.id})" class="btn btn-sm btn-link text-dark text-decoration-none fw-bold fs-5 px-2 pb-2">+</button>
                    </div>
                    
                    <!-- قیمت کل این آیتم -->
                    <span class="fw-bold text-dark" style="min-width: 90px;">${itemTotal.toLocaleString()} <span class="small fw-normal">تومان</span></span>
                    
                    <!-- دکمه حذف -->
                    <button onclick="removeFromCart(${item.id})" class="btn btn-outline-danger btn-sm rounded-circle px-2 pb-1" title="حذف">
                        ✖
                    </button>
                </div>
            </div>
        `;
        itemsContainer.innerHTML += itemHTML;
    });

    // آپدیت کردن مبالغ فاکتور در صفحه
    document.getElementById('cart-subtotal').innerHTML = `${subtotal.toLocaleString()} <span class="small fw-normal">تومان</span>`;
    document.getElementById('cart-delivery').innerHTML = `${DELIVERY_FEE.toLocaleString()} <span class="small fw-normal">تومان</span>`;
    document.getElementById('cart-total').innerHTML = `${(subtotal + DELIVERY_FEE).toLocaleString()} <span class="small fw-normal text-dark">تومان</span>`;
}

/**
 * افزایش تعداد یک آیتم
 */
function increaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += 1;
        saveCart();       // ذخیره در حافظه و آپدیت نوبار
        renderCartPage(); // رندر مجدد صفحه سبد خرید برای نمایش تغییرات
    }
}

/**
 * کاهش تعداد یک آیتم
 */
function decreaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity -= 1;
        // اگر تعداد به صفر رسید، آیتم را کلاً حذف کن
        if (item.quantity <= 0) {
            removeFromCart(id); 
        } else {
            saveCart();
            renderCartPage();
        }
    }
}

/**
 * حذف کامل یک آیتم از سبد
 */
function removeFromCart(id) {
    // با استفاده از filter، آرایه جدیدی می‌سازیم که شامل همه آیتم‌ها به جز آیتم حذف شده است
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCartPage();
}

/**
 * ارسال سبد خرید به سرور و ثبت سفارش نهایی
 */
async function submitOrder() {
    // ۱. بررسی ورود کاربر (استفاده از تابعی که در auth.js نوشتیم)
    const token = getCookie('access_token');
    if (!token) {
        alert("برای ثبت سفارش ابتدا باید وارد حساب کاربری خود شوید.");
        window.location.hash = 'login';
        return;
    }

    // ۲. دریافت اطلاعات سبد خرید از حافظه مرورگر
    const cartData = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cartData.length === 0) {
        alert("سبد خرید شما خالی است!");
        return;
    }

    try {
        // ۳. ارسال درخواست POST به بک‌اند
        const response = await fetch('http://localhost:8000/api/checkout/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // توکن امنیتی
            },
            body: JSON.stringify({ cart: cartData }) // ارسال آرایه آیتم‌ها
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "خطا در ثبت سفارش");
        }

        // ۴. موفقیت‌آمیز بود! سبد خرید را خالی کن
        localStorage.removeItem('cart');
        
        // ۵. نمایش پاپ‌آپ شیشه‌ای موفقیت
        const popup = document.createElement('div');
        popup.className = 'glass-card p-3 text-center text-success fw-bold shadow-lg';
        popup.style.position = 'fixed';
        popup.style.top = '30px';
        popup.style.left = '50%';
        popup.style.transform = 'translateX(-50%)';
        popup.style.zIndex = '9999';
        popup.style.minWidth = '300px';
        popup.innerHTML = `سفارش با موفقیت ثبت شد!<br><small class="text-dark">شماره سفارش: ${data.order_id}</small>`;
        
        document.body.appendChild(popup);

        // ۶. بعد از ۲ ثانیه، هدایت به صفحه تاریخچه سفارشات
        setTimeout(() => {
            document.body.removeChild(popup);
            window.location.hash = 'orders';
        }, 2000);

    } catch (error) {
        alert(error.message);
    }
}

// ==========================================
// اجرای کدهای اولیه هنگام بالا آمدن سایت
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadCart();         // ۱. لود کردن دیتا از حافظه
    updateCartBadge();  // ۲. آپدیت کردن عدد نوبار بر اساس دیتای لود شده
});