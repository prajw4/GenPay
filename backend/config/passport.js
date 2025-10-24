const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const { User, Account } = require('../database/db');

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  CLIENT_URL,
  JWT_SECRET
} = process.env;

if (!JWT_SECRET) {
  console.warn('[Passport] JWT_SECRET not set. Google OAuth will not issue tokens.');
}

const hasGoogleCredentials = Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);

if (!hasGoogleCredentials) {
  console.warn('[Passport] Google OAuth credentials are missing. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
}

const defaultCallbackUrl = GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';

if (hasGoogleCredentials) {
  passport.use(new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: defaultCallbackUrl,
      passReqToCallback: false
    },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile?.emails && profile.emails[0]?.value?.toLowerCase();
      if (!email) {
        return done(new Error('Google account has no email associated.'));
      }

      let existingUser = await User.findOne({ username: email });

      if (!existingUser) {
        existingUser = await User.create({
          username: email,
          password: null,
          firstName: profile?.name?.givenName || profile?.displayName || 'Google',
          lastName: profile?.name?.familyName || '',
          authProvider: 'google',
          googleId: profile?.id || null
        });
        await Account.create({
          userId: existingUser._id,
          balance: 0
        });
      } else {
        let shouldUpdate = false;
        if (!existingUser.googleId && profile?.id) {
          existingUser.googleId = profile.id;
          shouldUpdate = true;
        }
        if (!existingUser.authProvider) {
          existingUser.authProvider = 'local';
        }
        if (existingUser.authProvider !== 'google') {
          existingUser.authProvider = 'google';
          shouldUpdate = true;
        }
        if (shouldUpdate) {
          await existingUser.save();
        }
      }

      return done(null, existingUser);
    } catch (err) {
      return done(err, null);
    }
  }
  ));
}

function issueJwtForUser(user) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  const payload = { userId: user._id };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

module.exports = {
  passport,
  issueJwtForUser,
  clientRedirectUrl: CLIENT_URL || 'http://localhost:5173'
};
