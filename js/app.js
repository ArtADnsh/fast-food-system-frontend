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
            // در آینده: fetchAndRenderMenu(pageParam);
            console.log(`منوی رستوران شماره ${pageParam} لود شد.`);
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