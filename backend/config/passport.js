const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const { User, Account } = require('../database/db');

// Load environment variables
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  JWT_SECRET,
  NODE_ENV,
  CLIENT_REDIRECT_URL,
} = process.env;

// Determine environment
const isProduction = NODE_ENV === 'production';

// Define backend and frontend URLs
const backendBaseUrl = isProduction
  ? 'https://genpay-2.onrender.com'
  : 'http://localhost:3000';

const googleCallbackUrl = `${backendBaseUrl.replace(/\/$/, '')}/api/auth/google/callback`;

// Safety checks
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('[Passport] ⚠️ Missing Google OAuth credentials');
}

if (!JWT_SECRET) {
  console.warn('[Passport] ⚠️ Missing JWT_SECRET');
}

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: googleCallbackUrl,
      passReqToCallback: false,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile?.emails && profile.emails[0]?.value?.toLowerCase();
        if (!email) return done(new Error('Google account has no email associated.'));

        let user = await User.findOne({ username: email });

        if (!user) {
          user = await User.create({
            username: email,
            password: null,
            firstName: profile?.name?.givenName || profile?.displayName || 'Google',
            lastName: profile?.name?.familyName || '',
            authProvider: 'google',
            googleId: profile?.id || null,
          });

          await Account.create({
            userId: user._id,
            balance: 50000,
          });

          console.log(`[Passport] 🆕 Created new user: ${email}`);
        } else {
          let updated = false;
          if (!user.googleId && profile?.id) {
            user.googleId = profile.id;
            updated = true;
          }
          if (user.authProvider !== 'google') {
            user.authProvider = 'google';
            updated = true;
          }
          if (updated) await user.save();
          console.log(`[Passport] ✅ Existing user logged in: ${email}`);
        }

        return done(null, user);
      } catch (err) {
        console.error('[Passport] ❌ Google Auth Error:', err);
        return done(err, null);
      }
    }
  )
);

// Issue JWT for logged-in user
function issueJwtForUser(user) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET not defined');
  const payload = { userId: user._id };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Export
module.exports = {
  passport,
  issueJwtForUser,
  clientRedirectUrl:
    CLIENT_REDIRECT_URL ||
    (isProduction
      ? 'https://gen-pay-eight.vercel.app'
      : 'http://localhost:5173'),
};
