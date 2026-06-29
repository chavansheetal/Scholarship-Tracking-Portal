# 🏛 National Scholarship Portal (NSP) — React App

## ⚡ Quick Start (Run in 3 steps)

```bash
# Step 1: Go into the project folder
cd react_first

# Step 2: Install dependencies (REQUIRED — do this only once)
npm install

# Step 3: Start the app
npm run dev
```

The app opens at **http://localhost:3000**

---

## 🔑 Login Credentials

### Student Login (at /login)
1. **Register first** at `/register` — note your Application ID
2. Login with: **Application ID** + **Password you set during registration**

### Admin Login (at /admin)
| Role | User ID | Password |
|------|---------|----------|
| Institute Officer | `INST001` | `Inst@123` |
| Institute Officer 2 | `INST002` | `Inst@456` |
| State Officer | `STATE001` | `State@123` |
| Ministry Admin | `ADMIN001` | `Admin@123` |

---

## 📁 Project Structure
```
src/
├── App.jsx          — Router + auth state
├── store.js         — localStorage database
├── pages/           — All page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── ApplicationForm.jsx
│   ├── ApplicationTracker.jsx  (includes Print Certificate)
│   ├── AdminLogin.jsx
│   ├── AdminDashboard.jsx      (approve/reject applications)
│   ├── ForgotPassword.jsx
│   ├── DigiLockerLogin.jsx
│   └── ...more pages
└── styles/          — CSS for each page
```

## ⚠️ If you see a blank page
1. Make sure you ran `npm install`
2. Check browser console (F12 → Console tab) for errors
3. If data issue: click "Clear Data & Restart" on the error screen
