require('dotenv').config();
const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const mainRouter = require("./routes/index");
const bodyParser = require("body-parser");
const { passport } = require('./config/passport');
const authRouter = require('./routes/auth');

const app = express();

// Allowed origins
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,  // your deployed vercel frontend
  "http://localhost:5173",       // Vite dev
  "http://localhost:3000"        // React dev
].filter(Boolean);

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn("[CORS] Blocked:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

app.use(passport.initialize());

// Health check route (Render needs this)
app.get("/", (req, res) => {
  res.send("Backend is running 🎉");
});

// Main routes
app.use("/api/v1", mainRouter);
app.use("/api/auth", authRouter);

// Port setup — works locally + on Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
