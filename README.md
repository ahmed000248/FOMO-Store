# LUXE Fashion — Full-Stack E-Commerce

A production-ready luxury fashion e-commerce app built with **React + Vite**, **Firebase**, deployable to **Vercel** in minutes.

---

## Features

| Area | What's included |
|------|-----------------|
| **Auth** | Email/password + Google OAuth, persistent sessions, protected routes |
| **Products** | Firestore-backed, real-time, filter / search / sort |
| **Cart** | Firestore-synced per user, localStorage fallback |
| **Wishlist** | Firestore-synced per user |
| **Checkout** | 3-step form → order saved to Firestore with unique ID |
| **Orders** | Real-time status tracking (pending → shipped → delivered) |
| **Admin** | Stats dashboard, product CRUD + image upload to Storage, order & customer management |
| **UX** | Skeleton loaders, toast notifications, empty states, page transitions |

---

## Quick Start

### 1. Clone & install
```bash
git clone https://github.com/your-username/luxe-fashion.git
cd luxe-fashion
npm install
```

### 2. Create a Firebase project
1. Go to https://console.firebase.google.com → New project
2. Enable **Authentication** → Email/Password + Google
3. Create **Firestore Database** (test mode is fine to start)
4. Enable **Storage**
5. Go to **Project Settings → Web app** → copy the config values

### 3. Set environment variables
```bash
cp .env.example .env
# Fill in your Firebase config values
```

### 4. Run
```bash
npm run dev   # http://localhost:5173
npm run build # production build
```

---

## Firestore Security Rules

Copy `firestore.rules` content into Firebase Console → Firestore → Rules tab and publish.

### Promoting a user to admin
1. Firebase Console → Firestore → `users` collection
2. Open the user document and change `role` from `"customer"` to `"admin"`
3. They will now see the Admin Panel link and have access to `/admin`

### Seeding demo products
Log in as admin → Admin Panel → Products → click **🌱 Seed Data** to populate Firestore with demo products.

---

## Deploy to Vercel

**Option A — CLI:**
```bash
npm i -g vercel
vercel
# Add VITE_* environment variables when prompted
```

**Option B — Dashboard:**
1. Push repo to GitHub
2. Import at vercel.com/new
3. Add all `VITE_FIREBASE_*` variables under Environment Variables
4. Deploy

The included `vercel.json` handles SPA routing automatically.

---

## Project Structure

```
src/
├── admin/          AdminLayout, Overview, Products, Orders, Customers
├── components/     auth/ (guards), cart/, home/, layout/, ui/ (skeletons)
├── context/        AuthContext, CartContext, WishlistContext
├── data/           products.js (local seed / fallback data)
├── firebase/       config.js, auth.js, firestore.js, storage.js
├── hooks/          useProducts.js, useOrders.js
└── pages/          Home, Products, ProductDetail, CartCheckout, OtherPages
```

---

## Coupon Codes

| Code | Discount |
|------|----------|
| `LUXE20` | 20% off |

---

## Stack

React 18 · Vite · Tailwind CSS 3 · Firebase 10 · React Router 6 · Framer Motion · React Hot Toast
