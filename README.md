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
