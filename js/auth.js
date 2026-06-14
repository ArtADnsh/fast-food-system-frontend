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
async function loginUser(e) {
    e.preventDefault();
    
    // Select the input fields (first is phone/email, second is password)
    const inputs = e.target.querySelectorAll('input');
    const username = inputs[0].value;
    const password = inputs[1].value;

    try {
        const response = await fetch('http://localhost:8000/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            // Throw the error message sent from the Django backend
            throw new Error(data.error || 'ورود ناموفق'); 
        }
        
        // Save the real token and user data from the backend
        setCookie('access_token', data.access_token, 7);
        localStorage.setItem('user_info', JSON.stringify(data.user_info));
        localStorage.setItem('is_admin', data.is_admin);
        
        // Update the UI and redirect
        checkAuth();
        window.location.hash = 'home';
        
    } catch (error) {
        alert(error.message); // Show error to the user (e.g. wrong password)
    }
}


/**
 * تابع خروج کاربر
 */
function logoutUser() {
    deleteCookie('access_token');
    localStorage.removeItem('user_info'); // --> پاک کردن اطلاعات کاربر
    localStorage.removeItem('is_admin');
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

        const isAdmin = localStorage.getItem('is_admin') === 'true';
        const adminBtnHTML = isAdmin ? 
            `<a href="#admin" class="btn btn-warning rounded-pill px-4 me-2 shadow-sm fw-bold">👨‍🍳 پنل رستوران</a>` : '';

        // کاربر لاگین است: نمایش دراپ‌داون با اطلاعات کاربر
        authButtonsContainer.innerHTML = `
            <div class="d-flex align-items-center">
                ${adminBtnHTML} 
                <div class="dropdown d-inline-block">
                    <button class="btn glass-btn rounded-pill px-4 dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        پروفایل من
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end glass-effect border-0 shadow mt-2 p-2" style="min-width: 220px;">
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
            </div>
        `;
    } else {
        // کاربر لاگین نیست: نمایش دکمه ورود
        authButtonsContainer.innerHTML = `
            <a href="#login" class="btn glass-btn rounded-pill px-4">ورود</a>
        `;
    }
}


async function registerUser(e) {
    e.preventDefault();
    
    // Select the input fields from your registration form
    // Assuming the order is: Name, Phone, Email (optional), Password
    const inputs = e.target.querySelectorAll('input');
    const name = inputs[0].value;
    const phone = inputs[1].value;
    const email = inputs[2].value || null; // Allow empty email
    const password = inputs[3].value;

    try {
        const response = await fetch('http://localhost:8000/api/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                phone: phone,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            // DRF sends validation errors as objects (e.g., {"phone": ["This field must be unique."]})
            // Let's format them nicely for the user
            let errorMessage = 'خطا در ثبت‌نام:\n';
            for (const key in data) {
                errorMessage += `- ${data[key]}\n`;
            }
            throw new Error(errorMessage);
        }
        
        alert("ثبت‌نام با موفقیت انجام شد! حالا می‌توانید وارد شوید.");
        
        // Redirect to the login page so they can log in
        window.location.hash = 'login';
        
    } catch (error) {
        alert(error.message);
    }
}

// ==========================================
// منطق پروفایل کاربری (Profile Logic)
// ==========================================

/**
 * دریافت اطلاعات کاربر از سرور و پر کردن فرم
 */
async function fetchProfile() {
    const token = getCookie('access_token');
    if (!token) return;

    try {
        const response = await fetch('http://localhost:8000/api/profile/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // توکن امنیتی
            }
        });

        if (!response.ok) {
            // اگر توکن منقضی یا نامعتبر بود، کاربر را خارج کن
            logoutUser();
            throw new Error('نشست شما منقضی شده است. لطفا دوباره وارد شوید.');
        }

        const userData = await response.json();
        
        // پر کردن فیلدهای فرم با دیتای واقعی
        document.getElementById('profile-name').value = userData.name;
        document.getElementById('profile-phone').value = userData.phone;
        document.getElementById('profile-email').value = userData.email || '';

    } catch (error) {
        alert(error.message);
    }
}

/**
 * ارسال تغییرات جدید به سرور
 */
async function updateProfile(e) {
    e.preventDefault();
    const token = getCookie('access_token');

    const newName = document.getElementById('profile-name').value;
    const newEmail = document.getElementById('profile-email').value || null;

    try {
        // استفاده از متد PATCH برای آپدیت جزئی اطلاعات
        const response = await fetch('http://localhost:8000/api/profile/', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: newName,
                email: newEmail
            })
        });

        if (!response.ok) throw new Error('خطا در ذخیره تغییرات');

        const updatedData = await response.json();

        // آپدیت کردن اطلاعات نوبار
        const userInfo = JSON.parse(localStorage.getItem('user_info'));
        userInfo.name = updatedData.name;
        localStorage.setItem('user_info', JSON.stringify(userInfo));
        checkAuth(); // رفرش کردن نوبار

        alert('تغییرات با موفقیت ذخیره شد!');
        window.location.hash = 'home'; // هدایت به صفحه خانه
        window.location.reload();

    } catch (error) {
        alert(error.message);
    }
}

// اجرای بررسی لاگین به محض لود شدن سایت
document.addEventListener('DOMContentLoaded', checkAuth);