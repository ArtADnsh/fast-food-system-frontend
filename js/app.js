const appContainer = document.getElementById('app');


// ==========================================
// نمایش پاپ‌آپ
// ==========================================
function showToast(message, color = 'bg-success') {
    const container = document.getElementById('toast-container');
    if (!container) {
        console.error("Toast container not found!");
        return;
    }
    
    // تعیین آیکون بر اساس رنگ
    let icon = '✅';
    if (color === 'bg-danger') icon = '❌';
    if (color === 'bg-warning') icon = '⚠️';

    // استفاده از نام متغیر متفاوت برای جلوگیری از تداخل با Bootstrap
    const toastElement = document.createElement('div');
    
    toastElement.className = `${color} text-white px-4 py-3 rounded-pill shadow-lg mb-2 fw-bold d-flex align-items-center gap-2`;
    toastElement.style.minWidth = '250px';
    toastElement.style.transition = 'all 0.5s ease';
    toastElement.style.opacity = '0';
    toastElement.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    
    container.appendChild(toastElement);
    
    // انیمیشن ورود
    setTimeout(() => toastElement.style.opacity = '1', 10);
    
    // حذف خودکار بعد از ۳ ثانیه
    setTimeout(() => {
        toastElement.style.opacity = '0';
        setTimeout(() => toastElement.remove(), 500);
    }, 3000);
}


// ==========================================
// منطق صفحه اصلی (Home) - فیلتر و مرتب‌سازی
// ==========================================

let currentPage = 1;
let searchTimeout = null;

async function fetchAndRenderRestaurants(page = 1) {
    const container = document.getElementById('restaurants-container');
    currentPage = page;

    try {
        // ۱. دریافت مقادیر از فرم‌های HTML
        const searchQuery = document.getElementById('search-input')?.value.trim() || '';
        const city = document.getElementById('filter-city')?.value || '';
        const minRating = document.getElementById('filter-min-rating')?.value || '';
        const maxRating = document.getElementById('filter-max-rating')?.value || '';
        const freeDelivery = document.getElementById('filter-free-delivery')?.checked || false;
        const ordering = document.getElementById('sort-options')?.value || '';

        // ۲. ساخت داینامیک URL با URLSearchParams
        const params = new URLSearchParams();
        params.append('page', page);
        
        if (searchQuery) params.append('search', searchQuery);
        if (city) params.append('city', city);
        if (minRating) params.append('min_rating', minRating);
        if (maxRating) params.append('max_rating', maxRating);
        if (freeDelivery) params.append('free_delivery', 'true');
        if (ordering) params.append('ordering', ordering);

        // ۳. ارسال درخواست به بک‌اند
        const response = await fetch(`http://localhost:8000/api/restaurants/?${params.toString()}`);
        if (!response.ok) throw new Error("خطا در دریافت اطلاعات");
        
        const data = await response.json();

        // ۴. رندر کردن دیتا
        renderRestaurantCards(data.results);
        renderPaginationControls(data.previous, data.next);

    } catch (error) {
        console.error(error);
        container.innerHTML = '<div class="col-12 text-center text-danger mt-4 fw-bold">خطا در دریافت اطلاعات.</div>';
    }
}

// تابع Debounce برای سرچ متنی
function handleSearchInput(e) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => fetchAndRenderRestaurants(1), 500);
}

// تابعی که با تغییر هر فیلتر (مثل شهر یا مرتب‌سازی) فراخوانی می‌شود
function applyFilters() {
    fetchAndRenderRestaurants(1);
}

function renderPaginationControls(hasPrev, hasNext) {
    const container = document.getElementById('pagination-container');
    if (!container) return;

    // تعیین وضعیت غیرفعال بودن و رنگ دکمه قبلی
    const prevDisabled = !hasPrev ? 'disabled' : '';
    const prevBtnClass = !hasPrev ? 'btn-secondary opacity-75' : 'btn-dark glass-btn';

    // تعیین وضعیت غیرفعال بودن و رنگ دکمه بعدی
    const nextDisabled = !hasNext ? 'disabled' : '';
    const nextBtnClass = !hasNext ? 'btn-secondary opacity-75' : 'btn-warning';

    container.innerHTML = `
        <div class="d-flex align-items-center justify-content-center gap-3">
            
            <button onclick="fetchAndRenderRestaurants(${currentPage - 1})" 
                    class="btn ${prevBtnClass} rounded-pill px-4 shadow-sm" 
                    ${prevDisabled}>
                قبلی
            </button>

            <div class="glass-card text-dark fw-bold px-4 py-2 rounded-pill shadow-sm border border-secondary border-opacity-25" style="min-width: 110px; text-align: center;">
                صفحه ${currentPage}
            </div>

            <button onclick="fetchAndRenderRestaurants(${currentPage + 1})" 
                    class="btn ${nextBtnClass} rounded-pill px-4 shadow-sm" 
                    ${nextDisabled}>
                بعدی
            </button>
            
        </div>
    `;
}

// تابع کمکی برای رسم کارت‌های رستوران
function renderRestaurantCards(restaurantsToRender) {
    const container = document.getElementById('restaurants-container');
    if (!container) return; // ایمنی برای جلوگیری از ارور اگر کانتینر لود نشده باشد
    container.innerHTML = ''; 

    if (restaurantsToRender.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center mt-5">
                <div class="glass-card p-4 d-inline-block shadow-sm">
                    <h5 class="text-dark fw-bold mb-0">رستورانی با این مشخصات یافت نشد 🔍</h5>
                </div>
            </div>`;
        return;
    }

    restaurantsToRender.forEach(rest => {
        const deliveryText = rest.delivery_fee === 0 
            ? '<span class="text-success fw-bold small">ارسال رایگان</span>' 
            : `<span class="text-muted small">هزینه ارسال: ${rest.delivery_fee.toLocaleString()} تومان</span>`;

        const cardHTML = `
            <div class="col">
                <div class="card glass-card h-100 border-0 shadow-sm transition-hover">
                    <div style="height: 200px; background-color: rgba(0,0,0,0.1);" class="w-100 d-flex align-items-center justify-content-center">
                        <span class="text-secondary fw-bold">عکس رستوران ${rest.id}</span>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="card-title fw-bold mb-0 text-dark">${rest.name}</h5>
                            <span class="badge bg-success rounded-pill shadow-sm">${rest.rating} ★</span>
                        </div>
                        <p class="card-text text-muted small">${rest.description}</p>
                        <div class="mt-auto d-flex justify-content-between align-items-center">
                            ${deliveryText}
                            <a href="#menu/${rest.id}" class="btn btn-dark rounded-pill px-4 btn-sm shadow-sm glass-btn text-white">مشاهده منو</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}


// ==========================================
// توابع مربوط به صفحه منوی رستوران (Menu)
// ==========================================

// متغیر سراسری برای نگهداری آیتم‌های منو جهت فیلتر کردن سریع
let currentRestaurantItems = [];
let currentRestaurantInfo = null;

async function fetchAndRenderMenu(restaurantId) {
    const infoContainer = document.getElementById('restaurant-info');
    const categoriesContainer = document.getElementById('categories-container');

    try {
        const response = await fetch(`http://localhost:8000/api/restaurants/${restaurantId}/menu/`);
        if (!response.ok) throw new Error("خطا در دریافت اطلاعات منو");
        
        const menuData = await response.json();
        
        // ذخیره آیتم‌ها در متغیر سراسری برای استفاده در فیلتر
        currentRestaurantItems = menuData.items;
        currentRestaurantInfo = menuData.restaurant;

        // ۱. رندر کردن هدر رستوران
        const deliveryText = menuData.restaurant.delivery_fee === 0 
            ? 'ارسال رایگان' 
            : `هزینه ارسال: ${menuData.restaurant.delivery_fee.toLocaleString()} تومان`;
        
        infoContainer.innerHTML = `
            <h1 class="display-4 fw-bold mb-2">${menuData.restaurant.name}</h1>
            <div class="d-flex justify-content-center gap-3 fs-5 mt-3">
                <span class="badge bg-success rounded-pill px-3 py-2 shadow-sm">${menuData.restaurant.rating} ★</span>
                <span class="badge glass-effect text-white px-3 py-2 shadow-sm border-0">${deliveryText}</span>
            </div>
        `;

        // ۲. رندر کردن دکمه‌های دسته‌بندی (اضافه کردن دکمه "همه")
        // دکمه "همه" به صورت پیش‌فرض فعال (نارنجی) است
        let categoriesHTML = `<button onclick="filterMenu('all')" class="btn btn-warning rounded-pill px-4 fw-bold shadow-sm category-btn" data-category="all">همه</button>`;
        
        menuData.categories.forEach(cat => {
            // بقیه دکمه‌ها شیشه‌ای هستند
            categoriesHTML += `<button onclick="filterMenu('${cat}')" class="btn glass-btn rounded-pill px-4 fw-bold shadow-sm category-btn" data-category="${cat}">${cat}</button>`;
        });
        categoriesContainer.innerHTML = categoriesHTML;

        // ۳. رندر اولیه تمام آیتم‌ها
        renderMenuItems(currentRestaurantItems);

    } catch (error) {
        console.error("خطا:", error);
        infoContainer.innerHTML = '<h3 class="text-danger mt-4">خطا در بارگذاری اطلاعات رستوران.</h3>';
    }
}

/**
 * تابع فیلتر کردن منو بر اساس دسته‌بندی
 */
function filterMenu(selectedCategory) {
    // ۱. تغییر استایل دکمه‌ها (خاموش کردن بقیه، روشن کردن دکمه کلیک شده)
    const allButtons = document.querySelectorAll('.category-btn');
    allButtons.forEach(btn => {
        if (btn.getAttribute('data-category') === selectedCategory) {
            btn.classList.replace('glass-btn', 'btn-warning'); // روشن
        } else {
            btn.classList.replace('btn-warning', 'glass-btn'); // خاموش
        }
    });

    // ۲. فیلتر کردن آرایه غذاها
    if (selectedCategory === 'all') {
        renderMenuItems(currentRestaurantItems); // نمایش همه
    } else {
        const filteredItems = currentRestaurantItems.filter(item => item.category === selectedCategory);
        renderMenuItems(filteredItems); // نمایش فیلتر شده
    }
}

/**
 * تابع کمکی برای رسم کارت‌های غذا
 */
function renderMenuItems(itemsToRender) {
    const itemsContainer = document.getElementById('menu-items-container');
    itemsContainer.innerHTML = ''; // پاک کردن محتوای قبلی
    
    if (itemsToRender.length === 0) {
        itemsContainer.innerHTML = '<div class="col-12 text-center text-dark mt-4">آیتمی در این دسته‌بندی یافت نشد.</div>';
        return;
    }

    itemsToRender.forEach(item => {
        const cardHTML = `
            <div class="col">
                <div class="card glass-card h-100 border-0 shadow-sm">
                    <div style="height: 180px; background-color: rgba(0,0,0,0.1);" class="w-100 d-flex align-items-center justify-content-center">
                        <span class="text-secondary fw-bold">عکس ${item.name}</span>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title fw-bold mb-0">${item.name}</h5>
                            <span class="badge bg-secondary rounded-pill">${item.category}</span>
                        </div>
                        <p class="card-text text-dark small mb-4">${item.description}</p>
                        
                        <div class="mt-auto d-flex justify-content-between align-items-center">
                            <span class="fw-bold fs-5 text-dark">${item.price.toLocaleString()} <span class="fs-6 text-muted">تومان</span></span>
                            <button onclick="addToCart(${item.id}, '${item.name}', ${item.price}, ${currentRestaurantInfo.id}, ${currentRestaurantInfo.delivery_fee})" class="btn btn-warning rounded-pill px-3 fw-bold shadow-sm">
                                افزودن +
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        itemsContainer.innerHTML += cardHTML;
    });
}


// ==========================================
// منطق صفحه تاریخچه سفارشات
// ==========================================

// متغیر سراسری برای ذخیره موقت سفارشات جهت نمایش در فاکتور
let userOrdersHistory = [];

async function fetchAndRenderOrders() {
    const container = document.getElementById('orders-container');
    if (!container) return;

    const token = getCookie('access_token');
    if (!token) return;

    try {
        const response = await fetch('http://localhost:8000/api/orders/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('خطا در دریافت لیست سفارشات');

        const orders = await response.json();
        userOrdersHistory = orders; // ذخیره دیتای دریافتی در متغیر سراسری
        
        container.innerHTML = ''; 

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="glass-card p-5 text-center shadow">
                    <h4 class="text-dark fw-bold">شما هنوز سفارشی ثبت نکرده‌اید.</h4>
                    <a href="#home" class="btn btn-warning mt-3 rounded-pill px-4 shadow-sm">مشاهده رستوران‌ها</a>
                </div>`;
            return;
        }

        orders.forEach(order => {
            const dateObj = new Date(order.created_at);
            const persianDate = new Intl.DateTimeFormat('fa-IR').format(dateObj);
            const persianTime = dateObj.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

            let badgeClass = 'bg-secondary';
            let statusText = 'در حال بررسی';
            if (order.status === 'Pending') { badgeClass = 'bg-warning text-dark'; statusText = 'در حال آماده‌سازی'; }
            else if (order.status === 'Delivering') { badgeClass = 'bg-info text-dark'; statusText = 'در مسیر (پیک)'; }
            else if (order.status === 'Delivered') { badgeClass = 'bg-success'; statusText = 'تحویل داده شده'; }

            // 🚨 آپدیت مهم: دکمه مشاهده فاکتور حالا تابع viewInvoice را صدا می‌زند 🚨
            const cardHTML = `
                <div class="glass-card p-4 mb-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 shadow-sm">
                    <div>
                        <h5 class="fw-bold text-dark mb-2">سفارش #${order.id}</h5>
                        <span class="text-muted small me-3">📅 ${persianDate} - ⏰ ${persianTime}</span>
                    </div>
                    <div class="d-flex align-items-center flex-wrap gap-3 gap-md-4 mt-2 mt-md-0">
                        <span class="fw-bold fs-5 text-dark">${order.total_price.toLocaleString()} <span class="small fw-normal">تومان</span></span>
                        <span class="badge ${badgeClass} rounded-pill px-3 py-2 shadow-sm">${statusText}</span>
                        <button onclick="viewInvoice(${order.id})" class="btn btn-outline-dark btn-sm rounded-pill px-3 glass-btn">مشاهده فاکتور</button>
                    </div>
                </div>
            `;
            container.innerHTML += cardHTML;
        });

    } catch (error) {
        container.innerHTML = '<div class="glass-card text-center p-4 text-danger fw-bold">خطا در برقراری ارتباط با سرور.</div>';
    }
}

/**
 * تابع نمایش فاکتور در مُدال بوت‌استرپ
 */
function viewInvoice(orderId) {
    // پیدا کردن سفارش مورد نظر از متغیر سراسری
    const order = userOrdersHistory.find(o => o.id === orderId);
    if (!order) return;

    // ۱. آپدیت هدر و قیمت کل
    document.getElementById('invoiceModalTitle').innerText = `فاکتور سفارش #${order.id}`;
    document.getElementById('invoiceTotalAmount').innerText = `${order.total_price.toLocaleString()} تومان`;

    // ۲. تولید ردیف‌های جدول برای محصولات
    const tbody = document.getElementById('invoice-items-body');
    tbody.innerHTML = ''; // پاک کردن محتوای قبلی

    order.items.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td class="fw-bold">${item.item_name}</td>
                <td class="text-center">
                    <span class="badge bg-secondary rounded-pill px-2 py-1">${item.quantity}x</span>
                </td>
                <td class="text-end">${item.unit_price.toLocaleString()} <span class="small">تومان</span></td>
            </tr>
        `;
    });

    const modalElement = document.getElementById('invoiceModal');
    const invoiceModal = new bootstrap.Modal(modalElement);
    invoiceModal.show();
}


// ==========================================
// منطق اصلی مسیریابی (Router) و محافظت از مسیرها
// ==========================================
async function loadPage() {
    let hash = window.location.hash.substring(1);
    if (!hash) hash = 'home';

    let pageName = hash.split('/')[0]; 
    let pageParam = hash.split('/')[1];

    // --- شروع Route Guard ---
    // چک کردن وجود توکن با استفاده از تابعی که در auth.js نوشتیم
    const token = getCookie('access_token');

    // جلوگیری از ورود کاربر لاگین‌شده به صفحه لاگین
    if (token && (pageName === 'login' || pageName === 'register')) {
        window.location.hash = 'home';
        return; // توقف اجرای تابع
    }

    // جلوگیری از ورود کاربر لاگین‌نشده به صفحات محافظت‌شده
    if (!token && (pageName === 'orders' || pageName === 'profile')) {
        window.location.hash = 'login';
        return; // توقف و هدایت به لاگین
    }
    // --- پایان Route Guard ---

    try {
        const response = await fetch(`views/${pageName}.html`);
        if (!response.ok) throw new Error('صفحه پیدا نشد');
        
        const htmlContent = await response.text();
        appContainer.innerHTML = htmlContent;

        // اجرا کردن کدهای مخصوص هر صفحه بعد از لود شدن HTML
        if (pageName === 'home') {
            fetchAndRenderRestaurants();
        } 
        else if (pageName === 'menu') {
            fetchAndRenderMenu(pageParam);
        }
        else if (pageName === 'cart') {
            renderCartPage();
        }
        else if (pageName === 'orders') {
            fetchAndRenderOrders(); // اجرای تابع رندر سفارشات
        }
        else if (pageName === 'profile') {
            fetchProfile();
        }

    } catch (error) {
        appContainer.innerHTML = `
            <div class="glass-card text-center p-5 mt-5">
                <h1 class="text-danger fw-bold">خطای ۴۰۴</h1>
                <p class="fs-4">متاسفانه صفحه‌ای که دنبال آن هستید وجود ندارد.</p>
                <a href="#home" class="btn btn-warning rounded-pill mt-3">بازگشت به خانه</a>
            </div>
        `;
    }
}

window.addEventListener('hashchange', loadPage);
window.addEventListener('DOMContentLoaded', loadPage);