# Fast-Food Management System (Frontend) 🍔
⚙️ **Looking for the Backend?** Check out the Django REST Framework & MySQL API repository [here](https://github.com/ArtADnsh/fast-food-system-backend).
---

Welcome to the frontend repository of the **Fast-Food Management System** (`fast-food-system`). This project is a highly responsive, dynamic, and modern Single Page Application (SPA) built entirely with **Vanilla JavaScript, HTML5, and CSS3**, without relying on heavy frontend frameworks like React or Vue. 

It connects seamlessly to our Django REST API backend to provide a frictionless food delivery experience.

---

## ✨ Key Features & UI/UX

- **Single Page Application (SPA) Architecture:** A central `index.html` acts as the root, dynamically fetching and injecting HTML components from the `views/` directory (e.g., `orders.html`, `menu.html`) to ensure zero page-reloads.
- **Glass-morphism Design:** Beautiful, modern UI components featuring frosted glass effects (`backdrop-filter: blur`), floating cards, and smooth transitions.
- **JWT Stateless Authentication:** Secure login and registration flows handling JWT Access and Refresh tokens seamlessly via Vanilla JS fetch interceptors.
- **Interactive Order Management:** Real-time rendering of order histories with dynamic status badges (Pending, Preparing, Delivering, Delivered).
- **Verified Review System:** Smart, context-aware modals that prompt users to rate their food only *after* an order is marked as 'Delivered', preventing duplicate reviews.

---

## 📁 Project Structure

The project follows a clean, decoupled modular structure:

```text
frontend/
├── css/
│   └── style.css            # Global styles, variables, and glass-morphism utility classes
├── js/
│   ├── app.js               # Core logic, SPA router, API fetching, and DOM manipulation
│   ├── auth.js              # Token management, login/register logic
│   └── cart.js              # LocalStorage cart management and checkout calculations
├── views/                   # HTML partials injected dynamically
│   ├── admin.html
│   ├── cart.html
│   ├── home.html
│   ├── login.html
│   ├── menu.html
│   ├── orders.html          # Contains order history and review modals
│   ├── profile.html
│   └── register.html
└── index.html               # The root template (Navbar, Main App Container, Footer)
```

## 🛠️ Tech Stack

- **Markup & Styling:** HTML5, CSS3, Bootstrap 5 (for grid and responsive components)
- **Logic & DOM:** Vanilla JavaScript (ES6+), Fetch API, DOM manipulation
- **State Management:** Browser `LocalStorage` and `Cookies` (for cart items and JWT tokens)
- **Icons & Typography:** FontAwesome & Vazirmatn (Persian Font)

---

## ⚙️ How to Run Locally

Since this is a Vanilla JS SPA, you don't need Node.js or npm to build it. However, to prevent CORS issues and allow local `fetch` requests for the HTML partials, you must run it through a local HTTP server.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ArtADnsh/fast-food-system-frontend.git
   cd fast-food-system-frontend
   ```
 2. **Serve the project:**
    - **Using VS Code:** Install the **"Live Server"** extension, right-click on `index.html`, and select *Open with Live Server*.
    - **Using Python:** Run the following command in your Ubuntu terminal inside the frontend folder:
       ```bash
       python3 -m http.server 5500
       ```
   Then open `http://localhost:5500` in your browser.
3. **Connect to Backend:**
   Ensure the Django Backend API is running on `http://localhost:8000` (or update the API base URL in js/app.js to match your backend port).

## 👨‍💻 Developer
Designed and developed by **Arta Danesh**.

This frontend showcases the power of pure JavaScript in building complex, modern architectures without framework bloat. 
