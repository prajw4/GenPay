require("dotenv").config();
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.status(403).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Auth middleware userId:', decoded.userId);

    if (decoded.userId) {
      req.userId = decoded.userId;
      return next();
    }
    return res.status(403).json({ error: 'Invalid token payload' });
  } catch (err) {
    return res.status(403).json({ error: 'Token verification failed' });
  }
};

module.exports = { authMiddleware };
