const path = require("path");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const mainRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const { passport } = require("./config/passport");

const app = express();

// --------------------
// Allowed origins
// --------------------
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean);

// --------------------
// Middlewares
// --------------------
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn("[CORS] Blocked:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

app.use(passport.initialize());

// --------------------
// Health check
// --------------------
app.get("/health", (req, res) => {
  res.status(200).send("Backend is running 🎉");
});

// --------------------
// API routes
// --------------------
app.use("/api/v1", mainRouter);
app.use("/api/auth", authRouter);

// --------------------
// Serve React frontend
// --------------------
const frontendDistPath = path.join(__dirname, "../frontend/dist");

app.use(express.static(frontendDistPath));


app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

// --------------------
// Start server
// --------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
