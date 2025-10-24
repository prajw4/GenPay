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
      const redirectUrl = new URL(`${clientRedirectUrl.replace(/\/$/, '')}/login/success`);
      redirectUrl.searchParams.set('token', token);
      res.redirect(redirectUrl.toString());
    } catch (err) {
      console.error('Failed to issue JWT for Google user', err);
      res.redirect(failureRedirect);
    }
  }
);

module.exports = router;
