# DevMaster Courses – Full Stack Course Selling Website

A modern, responsive website for selling web development courses (HTML, CSS, JavaScript, React, Node.js, SQL) with Razorpay payment integration.

## Features

- Beautiful dark-themed UI
- Course catalog with detail pages
- Curriculum, features, pricing
- Shopping cart (persisted in localStorage)
- **Payment via your Razorpay.me link**: https://razorpay.me/@amitshaw9110
- Fully responsive (mobile + desktop)
- React + Vite frontend
- Express.js backend API

## Courses Included

| Course                    | Price  |
|---------------------------|--------|
| HTML Fundamentals         | ₹499   |
| CSS Mastery               | ₹599   |
| JavaScript Essentials     | ₹799   |
| React.js Complete Guide   | ₹1499  |
| Node.js Backend           | ₹1299  |
| SQL & Database Mastery    | ₹699   |

## Project Structure

```
dev-courses-store/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── data/courses.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── ...
├── backend/           # Express API
│   ├── server.js
│   └── package.json
└── README.md
```

## How to Run

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Backend (optional)

```bash
cd backend
npm install
npm start
```

API runs on http://localhost:5000

Endpoints:
- `GET /api/courses`
- `GET /api/courses/:id`
- `POST /api/orders`
- `GET /api/health`

## Payment Flow

1. User clicks **Buy Now** or **Pay with Razorpay** in cart
2. Browser opens your Razorpay.me payment page: https://razorpay.me/@amitshaw9110
3. Customer completes payment on Razorpay
4. (For production) Use Razorpay webhooks / dashboard to confirm payment and grant course access

> **Note**: The current integration uses your simple Razorpay.me link.  
> For full automated access control you would need Razorpay API keys + webhooks (can be added later).

## Customization

- Edit courses, prices, descriptions → `frontend/src/data/courses.js`
- Change Razorpay link → same file (`RAZORPAY_LINK`)
- Colors & theme → `frontend/src/index.css`

## Deploy

**Frontend** → Vercel / Netlify / Cloudflare Pages  
**Backend** → Railway / Render / any Node host

---

#Live: https://dev-course-y4p0.onrender.com/

Built for selling development courses with a clean modern experience.
