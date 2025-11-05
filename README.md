# 💸 GenPay

GenPay is a modern full-stack digital payment and finance management platform powered by AI.  
It allows users to send and receive money, view transaction insights, and interact with an AI assistant for smart financial analysis — all in one place.

---

## 🚀 Features

- 🔐 **User Authentication** — Secure login and signup with Passport.js.
- 💰 **Money Transfers** — Instantly send or receive money between users.
- 📊 **Transaction Insights** — Get AI-powered analysis of your spending habits.
- 💬 **AI Chat Assistant** — Ask questions and receive insights using Gemini AI.
- 🧠 **Context-Aware Dashboard** — Dynamic financial dashboard built with React and Tailwind CSS.
- 🪄 **Seamless UX** — Fast, minimal, and responsive frontend powered by Vite.

---

## 🧩 Project Structure

GenPay/
├── backend/ # Node.js + Express server
│ ├── routes/ # API routes (auth, user, transactions, insights, etc.)
│ ├── services/ # AI and Insight services
│ ├── config/ # Passport and environment setup
│ ├── database/ # Database connection scripts
│ ├── index.js # Entry point for backend server
│ └── package.json # Backend dependencies
│
└── frontend/ # React + Vite + Tailwind frontend
├── src/
│ ├── components/ # Reusable UI components
│ ├── pages/ # Main app pages (Signin, Dashboard, etc.)
│ ├── services/ # API and AI interaction layer
│ ├── context/ # Global state providers
│ └── main.jsx # App entry point
└── package.json # Frontend dependencies

yaml
Copy code

---

## ⚙️ Tech Stack

### **Frontend**
- React (Vite)
- Tailwind CSS
- Context API
- Axios for API calls

### **Backend**
- Node.js + Express.js
- Passport.js (Authentication)
- MongoDB (via `database/db.js`)
- Gemini AI integration (`services/GeminiService.js`)
- Insight analysis (`services/InsightService.js`)

---

## 🛠️ Setup Instructions

### **1️⃣ Clone the Repository**
git clone https://github.com/yourusername/GenPay.git
cd GenPay

2️⃣ Backend Setup
----------------------------------------------------------------------------------------------------------------------------------
Open your terminal and navigate to the backend folder using:
cd backend

Install all the required dependencies by running:
npm install

Create a new file named .env inside the backend directory.

Add the following environment variables inside the .env file:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key


Start the backend server by running:
npm start

Once started, the server will run by default on:
http://localhost:5000

3️⃣ Frontend Setup
--------------------------------------------------------------------------------------------------------------------------------
Open your terminal and navigate to the frontend folder using:
cd frontend

Install all the required dependencies by running:
npm install

Once the installation is complete, start the frontend development server using:
npm run dev

After starting, the frontend will run by default on:
http://localhost:5173

---

## 📦 Deploying to Render (single service)

You can deploy the whole project as a single service on Render. The root `package.json` contains scripts to build the frontend and start the backend.

Recommended Render settings:
- Build Command: npm run build
- Start Command: npm start
- Root directory: repository root (where this README and root package.json live)

Required environment variables (set these in the Render dashboard):
- MONGO_URI — MongoDB Atlas connection string
- GOOGLE_CLIENT_ID — Google OAuth client id
- GOOGLE_CLIENT_SECRET — Google OAuth client secret
- JWT_SECRET — secret used to sign JWT tokens
- PORT — optional, Render provides a port automatically

Notes:
- The build step runs `cd frontend && npm install && npm run build` which produces the production files in `frontend/dist`.
- The backend (`backend/server.js`) serves the static files and mounts API routes under `/api/v1`.
- Ensure `FRONTEND_ORIGIN` is set if you want to restrict CORS to a specific origin. During Render deployment the server and client will be served from the same origin so relative API URLs will work.

