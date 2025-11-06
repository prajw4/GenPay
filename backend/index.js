require('dotenv').config();
const express = require("express")
const cors = require("cors")
const cookieParser = require('cookie-parser')
const mainRouter = require("./routes/index")
const bodyParser = require("body-parser");
const { passport } = require('./config/passport');
const authRouter = require('./routes/auth');
const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000'

// allow frontend dev server (Vite) by default on 5173 and any FRONTEND_ORIGIN env value
const defaultAllowed = [FRONTEND_ORIGIN, 'http://localhost:5173']
const allowedOrigins = (process.env.FRONTEND_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean)
    .concat(defaultAllowed).filter((v, i, a) => a.indexOf(v) === i)

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: function(origin, cb){
        // allow requests with no origin like mobile apps or curl
        if(!origin) return cb(null, true)
        if(allowedOrigins.indexOf(origin) !== -1) return cb(null, true)
        console.warn('[CORS] Blocking origin:', origin)
        return cb(new Error('Not allowed by CORS'), false)
    },
    credentials: true
}));
app.use(passport.initialize());

app.use("/api/v1",mainRouter);
app.use('/api/auth', authRouter);

// For serverless environments (Vercel) we export the app instance instead of
// starting a listener here. The platform will call the exported app.
module.exports = app;
