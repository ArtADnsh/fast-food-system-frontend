const appContainer = document.getElementById('app');

// ==========================================
// توابع مربوط به صفحه اصلی (Home)
// ==========================================

// این تابع در آینده به بک‌اند DRF متصل می‌شود
async function fetchAndRenderRestaurants() {
    const container = document.getElementById('restaurants-container');
    
    try {
        const response = await fetch('http://localhost:8000/api/restaurants/');
        const restaurants = await response.json();


        // پاک کردن پیام لودینگ
        container.innerHTML = '';

        // تولید داینامیک HTML برای هر رستوران
        restaurants.forEach(rest => {
            // بررسی هزینه ارسال
            const deliveryText = rest.delivery_fee === 0 
                ? '<span class="text-success fw-bold small">ارسال رایگان</span>' 
                : `<span class="text-muted small">هزینه ارسال: ${rest.delivery_fee.toLocaleString()} تومان</span>`;

            // ساخت کارت HTML
            const cardHTML = `
                <div class="col">
                    <div class="card glass-card h-100 border-0">
                        <div style="height: 200px; background-color: rgba(0,0,0,0.1);" class="w-100 d-flex align-items-center justify-content-center">
                            <span class="text-secondary">عکس رستوران ${rest.id}</span>
                        </div>
                        <div class="card-body d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h5 class="card-title fw-bold mb-0">${rest.name}</h5>
                                <span class="badge bg-success rounded-pill">${rest.rating} ★</span>
                            </div>
                            <p class="card-text text-muted small">${rest.description}</p>
                            <div class="mt-auto d-flex justify-content-between align-items-center">
                                ${deliveryText}
                                <a href="#menu/${rest.id}" class="btn btn-dark rounded-pill px-4 btn-sm">مشاهده منو</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            // تزریق کارت به کانتینر
            container.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error("خطا در دریافت اطلاعات رستوران‌ها:", error);
        container.innerHTML = '<div class="col-12 text-center text-white">خطا در برقراری ارتباط با سرور.</div>';
    }
}


// ==========================================
// توابع مربوط به صفحه منوی رستوران (Menu)
// ==========================================

async function fetchAndRenderMenu(restaurantId) {
    const infoContainer = document.getElementById('restaurant-info');
    const itemsContainer = document.getElementById('menu-items-container');
    const categoriesContainer = document.getElementById('categories-container');

    try {
        const response = await fetch(`http://localhost:8000/api/restaurants/${restaurantId}/menu/`);
        const mockData = await response.json();

        // ۱. رندر کردن هدر رستوران
        const deliveryText = mockData.restaurant.delivery_fee === 0 
            ? 'ارسال رایگان' 
            : `هزینه ارسال: ${mockData.restaurant.delivery_fee.toLocaleString()} تومان`;
        
        infoContainer.innerHTML = `
            <h1 class="display-4 fw-bold mb-2">${mockData.restaurant.name}</h1>
            <div class="d-flex justify-content-center gap-3 fs-5 mt-3">
                <span class="badge bg-success rounded-pill px-3 py-2 shadow-sm">${mockData.restaurant.rating} ★</span>
                <span class="badge glass-effect text-white px-3 py-2 shadow-sm border-0">${deliveryText}</span>
            </div>
        `;

        // ۲. رندر کردن دکمه‌های دسته‌بندی
        categoriesContainer.innerHTML = mockData.categories.map(cat => 
            `<button class="btn glass-btn rounded-pill px-4 fw-bold shadow-sm">${cat}</button>`
        ).join('');

        // ۳. رندر کردن آیتم‌های منو
        itemsContainer.innerHTML = ''; // پاک کردن محتوای قبلی
        
        mockData.items.forEach(item => {
            const cardHTML = `
                <div class="col">
                    <div class="card glass-card h-100 border-0">
                        <!-- جایگاه عکس غذا -->
                        <div style="height: 180px; background-color: rgba(0,0,0,0.2);" class="w-100 d-flex align-items-center justify-content-center">
                            <span class="text-white-shadow">عکس ${item.name}</span>
                        </div>
                        <div class="card-body d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="card-title fw-bold mb-0">${item.name}</h5>
                                <span class="badge bg-secondary rounded-pill">${item.category}</span>
                            </div>
                            <p class="card-text text-dark small mb-4">${item.description}</p>
                            
                            <!-- بخش قیمت و دکمه افزودن -->
                            <div class="mt-auto d-flex justify-content-between align-items-center">
                                <span class="fw-bold fs-5 text-dark">${item.price.toLocaleString()} <span class="fs-6 text-muted">تومان</span></span>
                                <!-- صدا زدن تابع addToCart با ارسال اطلاعات آیتم -->
                                <button onclick="addToCart(${item.id}, '${item.name}', ${item.price})" class="btn btn-warning rounded-pill px-3 fw-bold shadow-sm">
                                    افزودن +
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            itemsContainer.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error("خطا در دریافت اطلاعات منو:", error);
        infoContainer.innerHTML = '<h3 class="text-danger mt-4">خطا در بارگذاری اطلاعات رستوران.</h3>';
    }
}


// ==========================================
// منطق صفحه تاریخچه سفارشات
// ==========================================
async function fetchAndRenderOrders() {
    const container = document.getElementById('orders-container');
    if (!container) return;

    try {
        // در آینده: اطلاعات از API دریافت می‌شود
        // const response = await fetch('http://localhost:8000/api/orders/');

        // دیتای فرضی (Mock JSON) برای تست
        const mockOrders = [
            { id: 1054, date: "۱۴۰۲/۰۸/۲۵", time: "۲۰:۳۰", total: 450000, status: "delivered", statusText: "تحویل داده شده" },
            { id: 1089, date: "۱۴۰۲/۰۹/۱۲", time: "۱۹:۱۵", total: 320000, status: "preparing", statusText: "در حال آماده‌سازی" },
            { id: 1102, date: "امروز", time: "۲۱:۰۰", total: 580000, status: "delivering", statusText: "در مسیر (پیک)" }
        ];

        container.innerHTML = ''; // پاک کردن وضعیت لودینگ

        if (mockOrders.length === 0) {
            container.innerHTML = `
                <div class="glass-card p-5 text-center">
                    <h4 class="text-dark fw-bold">شما هنوز سفارشی ثبت نکرده‌اید.</h4>
                    <a href="#home" class="btn btn-warning mt-3 rounded-pill px-4">مشاهده رستوران‌ها</a>
                </div>`;
            return;
        }

        mockOrders.forEach(order => {
            // تعیین رنگ کلاس بوت‌استرپ بر اساس وضعیت سفارش
            let badgeClass = 'bg-secondary';
            if (order.status === 'delivered') badgeClass = 'bg-success';
            if (order.status === 'preparing') badgeClass = 'bg-warning text-dark';
            if (order.status === 'delivering') badgeClass = 'bg-info text-dark';

            // ساخت کارت افقی سفارش
            const cardHTML = `
                <div class="glass-card p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div>
                        <h5 class="fw-bold text-dark mb-2">سفارش #${order.id}</h5>
                        <span class="text-muted small me-3">📅 ${order.date} - ⏰ ${order.time}</span>
                    </div>
                    <div class="d-flex align-items-center flex-wrap gap-3 gap-md-4 mt-2 mt-md-0">
                        <span class="fw-bold fs-5 text-dark">${order.total.toLocaleString()} <span class="small fw-normal">تومان</span></span>
                        <span class="badge ${badgeClass} rounded-pill px-3 py-2 shadow-sm">${order.statusText}</span>
                        <button class="btn btn-outline-dark btn-sm rounded-pill px-3 glass-btn">مشاهده فاکتور</button>
                    </div>
                </div>
            `;
            container.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error("خطا در دریافت لیست سفارشات:", error);
        container.innerHTML = '<div class="glass-card text-center p-4 text-danger fw-bold">خطا در برقراری ارتباط با سرور.</div>';
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