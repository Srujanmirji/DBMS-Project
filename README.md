# 💳 SubTracker: Premium Subscription Management

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
![MySQL](https://img.shields.io/badge/database-MySQL-00758f?style=flat-square&logo=mysql&logoColor=white)
![React](https://img.shields.io/badge/frontend-React-61dafb?style=flat-square&logo=react&logoColor=black)
![Node](https://img.shields.io/badge/backend-Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)

**SubTracker** is a high-performance, DBMS-driven subscription management platform designed to help you reclaim your financial freedom. It goes beyond simple tracking by calculating the **True Value** of your services and identifying hidden "subscription bleed."

---

## ✨ Features

### 💎 Premium Experience
- **Glassmorphic UI**: A futuristic, dark-mode first interface with smooth transitions and subtle glow effects.
- **Guided Storytelling**: Scroll-driven landing page using Framer Motion and Three.js backgrounds.
- **Mobile Responsive**: Manage your expenses from any device with a fluid, adaptive layout.

### 📊 Advanced Analytics
- **"True Value" Logic**: Automatically calculates the cost-per-use of your subscriptions. Stop paying for what you don't use.
- **Insight Cards**: High-visibility metrics for Monthly Spend, Potential Savings, and Budget Health.
- **Visual Trends**: Interactive line and donut charts to visualize spending categories and cost history.
- **Admin Analytics Dashboard**: High-fidelity dashboard secured by an email whitelist showing platform KPIs (MRR, churn metrics, and category charts).

### 🔐 Robust DBMS Core (MySQL)
- **Automated Budget Alerts**: MySQL Events monitor your spending and trigger health alerts when you exceed 80% of your budget.
- **Shared Debt Tracking**: Sophisticated mapping to track "Who Owes You" for shared subscriptions (Netflix, Spotify Family, etc.).
- **ACID Transaction Settlement**: Uses isolated SQL transactions (`START TRANSACTION`, `COMMIT`, `ROLLBACK`) to ledger payments and atomically clear debts.
- **Audit Logs**: Database triggers track every status change for high-integrity financial auditing, rendered in a global admin activity feed.
- **Stored Procedures**: High-performance backend logic for cancelling and reporting subscriptions.

### ✉️ Real-World Integrations
- **Serverless Branded Emails**: Uses Google Apps Script to send beautiful, custom-themed HTML emails (dark theme with orange accents) directly through Gmail for free.
- **Automated Budget Warnings**: Node background cron workers parse new budget alerts every 60 seconds and email users.
- **Passwordless OTP Login**: Custom authentication flow with secure 6-digit codes, a strict 60-second database-enforced expiration, and a React UI countdown timer with a "Resend OTP" option.

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Framer Motion, Chart.js, Lucide React.
- **Backend**: Node.js, Express.js.
- **Database**: MySQL 8.0 (Railway used for production).
- **Authentication**: Google OAuth 2.0, Native JWT-based auth, & Passwordless OTP.
- **Mailing**: Google Apps Script (Web App bridge).
- **Deployment**: Vercel (Full-Stack Monorepo).

---

## 🛠️ Local Setup

### 1. Prerequisite
- Node.js (v18+)
- MySQL Server (Running on Port 3306)

### 2. Installation
Clone the repository and install dependencies:

```bash
# Install root dependencies
npm install

# Setup Backend
cd local-backend
npm install
# Create a .env file based on the template below

# Setup Frontend
cd ../frontend
npm install
```

### 3. Environment Variables
Create a `.env` file in the `local-backend/` folder:

```properties
MYSQLHOST=localhost
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=your_password
MYSQLDATABASE=railway
PORT=5000
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
APPS_SCRIPT_URL=your_google_apps_script_url
```

### 4. Running the App
```bash
# Terminal 1 (Backend)
cd local-backend
npm start

# Terminal 2 (Frontend)
cd frontend
npm run dev
```

---

## 🌍 Deployment

This project is prepared for **Vercel** deployment. 

- Routes starting with `/api` are automatically handled by the Express backend inside the `/api` directory as Serverless Functions.
- Every other route is handled by the Vite frontend.
- Database is hosted on **Railway** for high-availability production access.

---

## 📄 License
This project is for educational and demo purposes.

---

Developed with ❤️ by [Srujan Mirji](https://github.com/Srujanmirji)
