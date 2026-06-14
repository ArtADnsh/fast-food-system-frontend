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
                <h1 class="display-4 fw-bold mb-2 text-dark">${menuData.restaurant.name}</h1>
                <div class="d-flex justify-content-center gap-3 fs-5 mt-3 mb-4">
                    <span class="badge bg-success rounded-pill px-3 py-2 shadow-sm">${menuData.restaurant.rating} ★</span>
                    <span class="badge glass-effect text-dark px-3 py-2 shadow-sm border-0">${deliveryText}</span>
                </div>
                <button onclick="showRestaurantInfo()" class="btn btn-outline-dark rounded-pill px-4 glass-btn fw-bold shadow-sm">
                    ℹ️ مشاهده اطلاعات کامل
                </button>
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
 * نمایش اطلاعات کامل رستوران در مُدال
 */
function showRestaurantInfo() {
    if (!currentRestaurantInfo) {
        showToast("اطلاعات رستوران هنوز در دسترس نیست.", "bg-danger");
        return;
    }

    const tbody = document.getElementById('restaurant-info-body');
    
    // تزریق اطلاعات به صورت لیست
    tbody.innerHTML = `
        <ul class="list-group list-group-flush bg-transparent">
            <li class="list-group-item bg-transparent text-dark d-flex justify-content-between p-3">
                <span class="fw-bold">📍 آدرس:</span> 
                <span class="text-end" style="max-width: 60%;">${currentRestaurantInfo.address || 'ثبت نشده'}</span>
            </li>
            <li class="list-group-item bg-transparent text-dark d-flex justify-content-between p-3">
                <span class="fw-bold">📞 تلفن:</span> 
                <span dir="ltr">${currentRestaurantInfo.phone || 'ثبت نشده'}</span>
            </li>
            <li class="list-group-item bg-transparent text-dark d-flex justify-content-between p-3">
                <span class="fw-bold">⏰ ساعت کاری:</span> 
                <span dir="ltr">${currentRestaurantInfo.opening_hour} - ${currentRestaurantInfo.closing_hour}</span>
            </li>
            <li class="list-group-item bg-transparent text-dark d-flex justify-content-between p-3">
                <span class="fw-bold">🛍️ مجموع سفارشات:</span> 
                <span>${(currentRestaurantInfo.total_orders || 0).toLocaleString()} سفارش موفق</span>
            </li>
        </ul>
    `;

    // نمایش مُدال بوت‌استرپ
    const infoModal = new bootstrap.Modal(document.getElementById('infoModal'));
    infoModal.show();
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

// متغیر سراسری برای ذخیره موقت سفارشات جهت نمایش در فاکتور و نظر
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

            // آپدیت: مدیریت هوشمند دکمه ثبت یا مشاهده نظر بر اساس وضعیت سفارش
            let reviewBtnHTML = '';
            if (order.status === 'Delivered') {
                if (order.has_review) {
                    reviewBtnHTML = `<button onclick="openViewReviewModal(${order.id})" class="btn btn-outline-success btn-sm rounded-pill px-3 shadow-sm w-100">مشاهده نظر ⭐</button>`;
                } else {
                    reviewBtnHTML = `<button onclick="openAddReviewModal(${order.id})" class="btn btn-warning btn-sm rounded-pill px-3 shadow-sm fw-bold w-100">ثبت نظر 📝</button>`;
                }
            }

            const cardHTML = `
                <div class="glass-card p-4 mb-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 shadow-sm">
                    <div>
                        <h5 class="fw-bold text-dark mb-2">سفارش #${order.id}</h5>
                        <span class="text-muted small me-3">📅 ${persianDate} - ⏰ ${persianTime}</span>
                    </div>
                    <div class="d-flex align-items-center flex-wrap gap-3 gap-md-4 mt-2 mt-md-0">
                        <span class="fw-bold fs-5 text-dark">${order.total_price.toLocaleString()} <span class="small fw-normal">تومان</span></span>
                        <span class="badge ${badgeClass} rounded-pill px-3 py-2 shadow-sm">${statusText}</span>
                        
                        <div class="d-flex flex-column gap-2" style="min-width: 120px;">
                            <button onclick="viewInvoice(${order.id})" class="btn btn-outline-dark btn-sm rounded-pill px-3 glass-btn">مشاهده فاکتور</button>
                            ${reviewBtnHTML}
                        </div>
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
    const order = userOrdersHistory.find(o => o.id === orderId);
    if (!order) return;

    document.getElementById('invoiceModalTitle').innerText = `فاکتور سفارش #${order.id}`;
    document.getElementById('invoiceTotalAmount').innerText = `${order.total_price.toLocaleString()} تومان`;

    const tbody = document.getElementById('invoice-items-body');
    tbody.innerHTML = ''; 

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
// توابع جدید: مدیریت پاپ‌آپ‌های نظرات
// ==========================================

/**
 * باز کردن مُدال ثبت نظر جدید
 */
function openAddReviewModal(orderId) {
    document.getElementById('review-order-id').value = orderId;
    document.getElementById('review-rating').value = '5'; 
    document.getElementById('review-comment').value = '';
    
    const modal = new bootstrap.Modal(document.getElementById('addReviewModal'));
    modal.show();
}

/**
 * باز کردن مُدال نمایش نظر ثبت شده قبلی
 */
function openViewReviewModal(orderId) {
    const order = userOrdersHistory.find(o => o.id === orderId);
    if (!order || !order.review_data) return;

    const ratingNum = order.review_data.rating;
    // تولید ستاره‌های پر و خالی متناسب با امتیاز
    document.getElementById('view-review-rating').innerText = '★'.repeat(ratingNum) + '☆'.repeat(5 - ratingNum);
    document.getElementById('view-review-comment').innerText = order.review_data.comment || 'متنی برای این نظر ثبت نشده است.';
    
    if (order.review_data.created_at) {
        const d = new Date(order.review_data.created_at);
        document.getElementById('view-review-date').innerText = 'ثبت شده در: ' + new Intl.DateTimeFormat('fa-IR').format(d);
    } else {
        document.getElementById('view-review-date').innerText = '';
    }

    const modal = new bootstrap.Modal(document.getElementById('viewReviewModal'));
    modal.show();
}

/**
 * ارسال درخواست POST برای ثبت نظر جدید در بک‌اند
 */
async function submitReview() {
    const orderId = document.getElementById('review-order-id').value;
    const rating = document.getElementById('review-rating').value;
    const comment = document.getElementById('review-comment').value;
    const token = getCookie('access_token');

    try {
        const response = await fetch(`http://localhost:8000/api/reviews/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                order: parseInt(orderId),
                rating: parseInt(rating),
                comment: comment
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            // اگر خطایی در بخش validate سریالایزر رخ داده باشد
            throw new Error(errorData.error || errorData.non_field_errors?.[0] || 'خطا در ثبت نظر');
        }

        bootstrap.Modal.getInstance(document.getElementById('addReviewModal')).hide();
        showToast("نظر شما با موفقیت ثبت شد!", "bg-success");
        
        // رفرش مجدد کامپوننت سفارشات برای تغییر ظاهر دکمه به "مشاهده نظر"
        fetchAndRenderOrders(); 

    } catch (error) {
        showToast(error.message, "bg-danger");
    }
}


// ==========================================
// منطق پنل مدیریت (Admin Dashboard)
// ==========================================

async function fetchAndRenderAdminMenu() {
    const tbody = document.getElementById('admin-menu-body');
    if (!tbody) return;

    //  گرفتن توکن برای احراز هویت ادمین
    const token = getCookie('access_token');

    try {
        //  ارسال درخواست به اندپوینت امن my-menu همراه با توکن
        const response = await fetch(`http://localhost:8000/api/restaurants/my-menu/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 403) throw new Error("شما مدیر هیچ رستورانی نیستید.");
            throw new Error("خطا در دریافت منو");
        }
        
        const menuData = await response.json();
        
        const items = menuData.results || menuData; 
        
        tbody.innerHTML = ''; // پاک کردن متن "در حال بارگذاری..."

        if (items.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-dark">هیچ غذایی در منو ثبت نشده است.</td></tr>`;
            return;
        }

        // رندر کردن هر ردیف از جدول
        items.forEach(item => {
            const desc = item.description ? item.description.replace(/'/g, "\\'") : '';
            
            tbody.innerHTML += `
                <tr>
                    <td class="fw-bold text-dark">${item.name}</td>
                    <td><span class="badge bg-secondary rounded-pill px-3 py-2">${item.category}</span></td>
                    <td class="text-dark fw-bold">${item.price.toLocaleString()}</td>
                    <td class="text-center">
                        <button onclick="editFood(${item.id}, '${item.name}', '${item.category}', ${item.price}, '${desc}')" class="btn btn-sm btn-outline-dark rounded-pill px-3 me-2 glass-btn">ویرایش</button>
                        <button onclick="deleteFood(${item.id}, '${item.name}')" class="btn btn-sm btn-outline-danger rounded-pill px-3 glass-btn">حذف</button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Admin Error:", error);
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger fw-bold py-4">${error.message}</td></tr>`;
        showToast(error.message, "bg-danger");
    }
}


// متغیرهای سراسری برای تشخیص حالت فرم (ساخت جدید یا ویرایش)
let isEditingFood = false;
let editingFoodId = null;

/**
 * باز کردن مدال برای اضافه کردن غذای جدید
 */
function openAddFoodModal() {
    isEditingFood = false;
    editingFoodId = null;
    
    // فرم را خالی کن و عنوان را تغییر بده
    document.getElementById('foodForm').reset();
    document.getElementById('foodModalTitle').innerText = 'افزودن غذای جدید 🍔';
    
    const modal = new bootstrap.Modal(document.getElementById('foodModal'));
    modal.show();
}

/**
 * باز کردن مدال برای ویرایش یک غذای موجود
 */
function editFood(id, name, category, price, description) {
    isEditingFood = true;
    editingFoodId = id;
    
    // پر کردن فیلدها با اطلاعات قبلی
    document.getElementById('food-name').value = name;
    document.getElementById('food-category').value = category;
    document.getElementById('food-price').value = price;
    // اگر توضیحاتی بود آن را بگذار، وگرنه خالی بماند
    document.getElementById('food-description').value = description !== 'undefined' ? description : '';
    
    document.getElementById('foodModalTitle').innerText = 'ویرایش غذا ✏️';
    
    const modal = new bootstrap.Modal(document.getElementById('foodModal'));
    modal.show();
}


/**
 * ارسال اطلاعات به بک‌اند (POST برای ساخت، PUT برای ویرایش)
 */
async function saveFood() {
    const name = document.getElementById('food-name').value;
    const category = document.getElementById('food-category').value;
    const price = document.getElementById('food-price').value;
    const description = document.getElementById('food-description').value;

    if (!name || !category || !price) {
        showToast("لطفا تمام فیلدهای ستاره‌دار را پر کنید.", "bg-danger");
        return;
    }

    const payload = { name, category, price, description };
    const token = getCookie('access_token');
    
    // اگر در حال ویرایش هستیم، آیدی غذا را به URL اضافه می‌کنیم
    const url = isEditingFood 
        ? `http://localhost:8000/api/restaurants/my-menu/${editingFoodId}/` 
        : `http://localhost:8000/api/restaurants/my-menu/`;
    
    const method = isEditingFood ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("خطا در ذخیره اطلاعات");

        // بستن پاپ‌آپ
        const modalElement = document.getElementById('foodModal');
        bootstrap.Modal.getInstance(modalElement).hide();
        
        showToast("تغییرات با موفقیت ذخیره شد!", "bg-success");
        
        // رفرش کردن جدول برای نمایش دیتای جدید
        fetchAndRenderAdminMenu();

    } catch (error) {
        showToast("مشکلی در ارتباط با سرور پیش آمد.", "bg-danger");
    }
}

/**
 * حذف یک غذا
 */
async function deleteFood(id, name) {
    if (!confirm(`آیا از حذف "${name}" مطمئن هستید؟ این عمل غیرقابل بازگشت است.`)) return;

    const token = getCookie('access_token');
    try {
        const response = await fetch(`http://localhost:8000/api/restaurants/my-menu/${id}/`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("خطا در حذف");

        showToast(`${name} با موفقیت حذف شد.`, "bg-success");
        fetchAndRenderAdminMenu(); // رفرش جدول

    } catch (error) {
        showToast("خطا در حذف آیتم.", "bg-danger");
    }
}


// متغیر سراسری برای نگهداری لیست پیک‌های این رستوران
let availableDeliveryStaff = [];

/**
 * بارگذاری سفارشات و لیست پیک‌ها از سرور
 */
async function loadAdminOrders() {
    const token = getCookie('access_token');
    if (!token) return;

    try {
        // ۱. دریافت لیست پیک‌های واجد شرایط (Role = DeliveryPerson)
        const staffRes = await fetch('http://localhost:8000/api/admin/delivery-staff/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (staffRes.ok) {
            availableDeliveryStaff = await staffRes.json();
        }

        // ۲. دریافت لیست سفارشات رستوران
        const ordersRes = await fetch('http://localhost:8000/api/admin/orders/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!ordersRes.ok) throw new Error('خطا در دریافت سفارشات');
        
        const orders = await ordersRes.json();
        renderOrdersTable(orders);

    } catch (error) {
        console.error(error);
        document.getElementById('admin-orders-container').innerHTML = 
            `<div class="alert alert-danger">خطا در بارگذاری پنل مدیریت.</div>`;
    }
}

/**
 * ساخت جدول و دراپ‌داون‌ها
 */
function renderOrdersTable(orders) {
    const container = document.getElementById('admin-orders-container');
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = `<div class="alert alert-info">سفارشی برای نمایش وجود ندارد.</div>`;
        return;
    }

    let tableHTML = `
        <table class="table table-hover align-middle glass-effect shadow-sm rounded">
            <thead class="table-dark">
                <tr>
                    <th>سفارش</th>
                    <th>مشتری</th>
                    <th>وضعیت آماده‌سازی</th>
                    <th>وضعیت ارسال</th>
                    <th>انتساب پیک</th>
                </tr>
            </thead>
            <tbody>
    `;

    orders.forEach(order => {
        // ساخت دراپ‌داون پیک‌ها برای این سفارش خاص
        let staffOptions = `<option value="">انتخاب پیک...</option>`;
        availableDeliveryStaff.forEach(staff => {
            const isSelected = (order.delivery_staff === staff.staff_id) ? 'selected' : '';
            staffOptions += `<option value="${staff.staff_id}" ${isSelected}>${staff.name}</option>`;
        });

        tableHTML += `
            <tr>
                <td class="fw-bold">#${order.order_id}</td>
                <td>${order.user_name || 'کاربر سیستم'}</td>
                
                <td>
                    <select class="form-select form-select-sm" onchange="updateOrder(${order.order_id}, 'preparation_status', this.value)">
                        <option value="Pending" ${order.preparation_status === 'Pending' ? 'selected' : ''}>در صف بررسی</option>
                        <option value="Cooking" ${order.preparation_status === 'Cooking' ? 'selected' : ''}>در حال پخت</option>
                        <option value="Ready" ${order.preparation_status === 'Ready' ? 'selected' : ''}>آماده ارسال</option>
                    </select>
                </td>

                <td>
                    <select class="form-select form-select-sm" onchange="updateOrder(${order.order_id}, 'status', this.value)">
                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>در انتظار</option>
                        <option value="Delivering" ${order.status === 'Delivering' ? 'selected' : ''}>در حال ارسال</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>تحویل داده شده</option>
                        <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>لغو شده</option>
                    </select>
                </td>

                <td>
                    <select class="form-select form-select-sm border-warning" onchange="updateOrder(${order.order_id}, 'delivery_staff', this.value)">
                        ${staffOptions}
                    </select>
                </td>
            </tr>
        `;
    });

    tableHTML += `</tbody></table>`;
    container.innerHTML = tableHTML;
}

/**
 * ارسال درخواست PATCH به بک‌اند با هر تغییر در منوها
 */
async function updateOrder(orderId, field, value) {
    const token = getCookie('access_token');
    const payload = {};
    
    // اگر ادمین گزینه "انتخاب پیک..." را زد، مقدار null بفرست
    payload[field] = value === "" ? null : value; 

    try {
        const res = await fetch(`http://localhost:8000/api/admin/orders/${orderId}/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorData = await res.json();
            // اگر ارور Validation مربوط به نقش پیک بود
            let errorMsg = "خطا در اعمال تغییرات.";
            if (errorData.delivery_staff) errorMsg = errorData.delivery_staff[0];
            throw new Error(errorMsg);
        }
        
        // می‌توانید اینجا یک Toast یا Alert کوچک موفقیت نشان دهید
        console.log(`سفارش ${orderId} با موفقیت آپدیت شد.`);
        
    } catch (error) {
        alert(error.message);
        // در صورت خطا، جدول را رفرش می‌کنیم تا مقادیر به حالت قبل برگردند
        loadAdminOrders(); 
    }
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
        else if (pageName === 'admin') {
            fetchAndRenderAdminMenu();
            loadAdminOrders();
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