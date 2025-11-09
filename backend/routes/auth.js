const express = require('express');
const router = express.Router();
const { passport, issueJwtForUser, clientRedirectUrl } = require('../config/passport');

const failureRedirect = `${clientRedirectUrl}/signin?error=google_auth_failed`;

router.get('/google', (req, res, next) => {
  if (!passport._strategies.google) {
    return res.status(503).json({ message: 'Google OAuth is not configured on the server.' });
  }
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    prompt: 'select_account'
  })(req, res, next);
});

router.get(
  '/google/callback',
  (req, res, next) => {
    if (!passport._strategies.google) {
      return res.redirect(failureRedirect);
    }
    next();
  },
  passport.authenticate('google', { session: false, failureRedirect }),
  (req, res) => {
    try {
      const token = issueJwtForUser(req.user);
      // Use Lax for OAuth flow so the cookie can be set during the cross-site
      // Google -> backend -> frontend navigation. After landing on the
      // frontend we let the client call /user/me to hydrate the session.
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 3600000
      }

      res.cookie('token', token, cookieOptions)

      // Redirect to a lightweight client route that completes login and
      // hydrates the UI. This avoids direct navigation to protected pages
      // which can 404 on some static hosts if SPA rewrites are not present.
      const redirectUrl = new URL(`${clientRedirectUrl.replace(/\/$/, '')}/login/success`);
      res.redirect(redirectUrl.toString());
    } catch (err) {
      console.error('Failed to issue JWT for Google user', err);
      res.redirect(failureRedirect);
    }
  }
);

module.exports = router;
