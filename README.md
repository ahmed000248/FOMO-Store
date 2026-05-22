🛍️ FOMO — Fear of Missing Out (Ecommerce Platform)

A modern luxury streetwear ecommerce web application built with React + Vite, powered by Firebase, and designed with a premium UI/UX inspired by high-end fashion brands.

“Never Miss the Drop.”

🚀 Live Demo

👉 https://fomo-store.vercel.app

✨ Features
🛒 Ecommerce Core
Product listing & product detail pages
Shopping cart system
Wishlist functionality
Checkout flow
WhatsApp order integration
🔐 Authentication
Google Login (Firebase Auth)
Email authentication support
Role-based admin access system
🧑‍💼 Admin Dashboard
Add / edit / delete products
Manage orders
Manage customers
Website settings CMS (dynamic content control)
🎨 UI/UX
Luxury streetwear design system
Dark cinematic theme
Glassmorphism effects
Framer Motion animations
Fully responsive (mobile-first)
⚙️ Advanced Features
Firebase Firestore database
Firebase Storage for images
Real-time data updates
Dynamic homepage content
Settings-based CMS (no-code editing)
SEO-ready structure
🧠 Tech Stack
⚛️ React (Vite)
🎨 Tailwind CSS
🎞 Framer Motion
🔥 Firebase (Auth + Firestore + Storage)
🌐 Vercel (Deployment)
📁 Project Structure
src/
 ├── admin/            # Admin dashboard
 ├── components/       # Reusable UI components
 ├── context/          # Global state (Auth, Cart, Settings)
 ├── firebase/         # Firebase configuration
 ├── hooks/            # Custom hooks
 ├── pages/            # Main pages (Home, Products, etc.)
 ├── services/         # Business logic layer
 ├── utils/            # Helper functions
🔐 Environment Variables

Create a .env file in root:

VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

⚠️ Never expose .env in public repositories.

🚀 Getting Started
1. Clone repo
git clone https://github.com/your-username/fomo.git
2. Install dependencies
npm install
3. Run development server
npm run dev
4. Build for production
npm run build
🌐 Deployment (Vercel)
Push code to GitHub
Import project in Vercel
Add environment variables
Deploy
🧑‍💼 Admin Access

Admin panel is protected via Firebase Auth.

To make a user admin:

Add user email in Firestore users collection
Set role: admin
💡 Brand Concept

FOMO (Fear of Missing Out) is a modern streetwear brand built around:

Limited drops
Hype culture
Exclusivity
Minimal luxury aesthetics
📸 Screenshots

(Add your screenshots here)

⚡ Future Improvements
Multi-vendor system
AI product recommendations
Payment gateway integration
Mobile app version
Advanced analytics dashboard
👨‍💻 Developer

Built with 💻 by Ahmed Raza
