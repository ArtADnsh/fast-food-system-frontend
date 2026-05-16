// ==========================================
// منطق احراز هویت و مدیریت توکن (JWT Auth)
// ==========================================

/**
 * تابع تنظیم کوکی
 */
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    // در پروژه‌های واقعی، بک‌اند کوکی را با فلگ‌های امنیتی مثل HttpOnly ست می‌کند
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

/**
 * تابع خواندن کوکی
 */
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

/**
 * تابع حذف کوکی (برای خروج)
 */
function deleteCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}


/**
 * تابع لاگین کاربر (متصل به فرم ورود)
 */
function loginUser(e) {
    e.preventDefault();

    console.log("در حال ارسال درخواست به سرور...");

    // یک توکن JWT فرضی (Mock) برای تست فرانت‌اند
    const mockAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_payload.mock_signature";
    
    // ذخیره توکن در کوکی
    setCookie('access_token', mockAccessToken, 7);
    
    // --> ذخیره اطلاعات فرضی کاربر برای نمایش در منو (در آینده از سرور گرفته می‌شود)
    const userInfo = {
        name: "آرتا",
        phone: "09123456789"
    };
    localStorage.setItem('user_info', JSON.stringify(userInfo));
    
    // آپدیت کردن نوبار
    checkAuth();
    
    // هدایت کاربر به صفحه اصلی
    window.location.hash = 'home';
}


/**
 * تابع خروج کاربر
 */
function logoutUser() {
    deleteCookie('access_token');
    localStorage.removeItem('user_info'); // --> پاک کردن اطلاعات کاربر
    checkAuth(); 
    window.location.hash = 'home'; 
}


/**
 * بررسی وضعیت لاگین و تغییر داینامیک نوبار
 * این تابع هنگام لود صفحه و بعد از لاگین/لاگ‌اوت اجرا می‌شود
 */
/**
 * بررسی وضعیت لاگین و تغییر داینامیک نوبار
 */
function checkAuth() {
    const token = getCookie('access_token');
    const authButtonsContainer = document.getElementById('auth-buttons');
    
    if (!authButtonsContainer) return;

    if (token) {
        // --> خواندن اطلاعات کاربر از حافظه
        const savedUser = localStorage.getItem('user_info');
        const user = savedUser ? JSON.parse(savedUser) : { name: "کاربر", phone: "---" };

        // کاربر لاگین است: نمایش دراپ‌داون با اطلاعات کاربر
        authButtonsContainer.innerHTML = `
            <div class="dropdown d-inline-block">
                <button class="btn glass-btn rounded-pill px-4 dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    پروفایل من
                </button>
                <ul class="dropdown-menu dropdown-menu-end glass-effect border-0 shadow mt-2 p-2" style="min-width: 220px;">
                    
                    <!-- بخش هدر پروفایل شامل نام و شماره -->
                    <li class="px-3 py-2 text-center border-bottom border-secondary mb-2">
                        <span class="fw-bold d-block text-dark fs-6">${user.name}</span>
                        <span class="text-muted small">${user.phone}</span>
                    </li>
                    
                    <li><a class="dropdown-item text-dark fw-bold rounded" href="#orders">سفارشات من</a></li>
                    <li><a class="dropdown-item text-dark fw-bold rounded" href="#profile">تنظیمات</a></li>
                    <li><hr class="dropdown-divider border-secondary"></li>
                    <li><button class="dropdown-item text-danger fw-bold rounded" onclick="logoutUser()">خروج</button></li>
                </ul>
            </div>
        `;
    } else {
        // کاربر لاگین نیست: نمایش دکمه ورود
        authButtonsContainer.innerHTML = `
            <a href="#login" class="btn glass-btn rounded-pill px-4">ورود</a>
        `;
    }
}

// اجرای بررسی لاگین به محض لود شدن سایت
document.addEventListener('DOMContentLoaded', checkAuth);