const appContainer = document.getElementById('app');

// ==========================================
// توابع مربوط به صفحه اصلی (Home)
// ==========================================

// این تابع در آینده به بک‌اند DRF متصل می‌شود
async function fetchAndRenderRestaurants() {
    const container = document.getElementById('restaurants-container');
    
    try {
        // در آینده این خط را از کامنت خارج می‌کنی و دیتای واقعی می‌گیری:
        // const response = await fetch('http://localhost:8000/api/restaurants/');
        // const restaurants = await response.json();

        // فعلا برای تست فرانت‌اند، دیتای فرضی (Mock) برمی‌گردانیم
        const restaurants = [
            {
                id: 1,
                name: "پیتزا آفتاب",
                rating: 4.8,
                description: "انواع پیتزاهای ایتالیایی و آمریکایی، سالاد",
                delivery_fee: 0, // 0 یعنی ارسال رایگان
                image: ""
            },
            {
                id: 2,
                name: "برگر زغالی بمب",
                rating: 4.5,
                description: "برگرهای دست‌ساز، هات‌داگ، سیب‌زمینی ویژه",
                delivery_fee: 20000,
                image: ""
            },
            {
                id: 3,
                name: "سوخاری کرانچ",
                rating: 4.2,
                description: "مرغ سوخاری، قارچ سوخاری، سیب‌زمینی",
                delivery_fee: 15000,
                image: ""
            }
        ];

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
        // در آینده این خطوط را برای ارتباط با DRF فعال می‌کنی:
        // const response = await fetch(`http://localhost:8000/api/restaurants/${restaurantId}/menu/`);
        // const mockData = await response.json();

        // دیتای فرضی (Mock JSON) برای تست فرانت‌اند
        const mockData = {
            restaurant: {
                id: restaurantId,
                name: "پیتزا آفتاب",
                rating: 4.8,
                delivery_fee: 15000
            },
            categories: ["پیتزاها", "برگرها", "نوشیدنی‌ها"],
            items: [
                { id: 101, name: "پیتزا پپرونی", description: "پپرونی، پنیر موزارلا، سس مخصوص", price: 250000, category: "پیتزاها", image: "" },
                { id: 102, name: "چیز برگر کلاسیک", description: "گوشت ۱۰۰٪ خالص، پنیر گودا، کاهو، گوجه", price: 180000, category: "برگرها", image: "" },
                { id: 103, name: "نوشابه قوطی کوکا", description: "۳۳۰ میلی‌لیتر", price: 30000, category: "نوشیدنی‌ها", image: "" }
            ]
        };

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

// تابع ساده برای تست دکمه افزودن به سبد خرید
function addToCart(itemId, itemName, itemPrice) {
    // فعلاً یک الرت ساده نمایش می‌دهیم تا مطمئن شویم رویداد کار می‌کند
    alert(`غذا انتخاب شد:\n${itemName}\nقیمت: ${itemPrice.toLocaleString()} تومان`);
    
    // چاپ در کنسول برای دیباگ بهتر
    console.log("آیتم آماده اضافه شدن به سبد:", { id: itemId, name: itemName, price: itemPrice });
}


// ==========================================
// منطق اصلی مسیریابی (Router)
// ==========================================

async function loadPage() {
    let hash = window.location.hash.substring(1);
    if (!hash) hash = 'home';

    // مدیریت پارامترها در URL (مثل #menu/1)
    let pageName = hash.split('/')[0]; 
    let pageParam = hash.split('/')[1];

    try {
        const response = await fetch(`views/${pageName}.html`);
        if (!response.ok) throw new Error('صفحه پیدا نشد');
        
        const htmlContent = await response.text();
        appContainer.innerHTML = htmlContent;

        // اجرا کردن کدهای مخصوص هر صفحه بعد از لود شدن HTML آن
        if (pageName === 'home') {
            fetchAndRenderRestaurants();
        } 
        else if (pageName === 'menu') {
            fetchAndRenderMenu(pageParam);
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