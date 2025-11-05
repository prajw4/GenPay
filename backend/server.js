// backend/server.js
// Single-entry server intended for production / Render deployment.
// Serves API routes under /api/v1 and serves the frontend production build from ../frontend/dist

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { passport } = require('./config/passport');
const mainRouter = require('./routes/index');
const authRouter = require('./routes/auth');

const app = express();

// Configure allowed origins. In Render you'll set FRONTEND_ORIGIN to your site; during local
// dev we also allow Vite (http://localhost:5173).
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const defaultAllowed = [FRONTEND_ORIGIN, 'http://localhost:5173'];
const envOrigins = (process.env.FRONTEND_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
const allowedOrigins = Array.from(new Set([].concat(envOrigins, defaultAllowed)));

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: function(origin, cb) {
    if (!origin) return cb(null, true); // allow server-to-server or curl
    if (allowedOrigins.indexOf(origin) !== -1) return cb(null, true);
    console.warn('[CORS] Blocking origin:', origin);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(passport.initialize());

// Mount API routes under /api/v1 — keep existing routes working as before.
app.use('/api/v1', mainRouter);
app.use('/api/auth', authRouter);

// Serve static frontend build (Vite -> `dist`) when present. This makes the backend
// also serve the single-page app in production.
const staticPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(staticPath));

// Wildcard route: send index.html for any non-API route so client-side routing works.
app.get('*', (req, res) => {
  // If the request is for the API, let the API routers handle it.
  if (req.path.startsWith('/api/')) return res.status(404).json({ message: 'API route not found' });
  res.sendFile(path.join(staticPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server (server.js) running on port ${PORT}`);
});

// Export app for tests or serverless adapters if needed
module.exports = app;
