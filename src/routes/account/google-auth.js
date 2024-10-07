const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken')

router.get('/',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get("/failed", (req, res) => {
  res.json({
    success: false,
    message: "failure"
  })
})

router.get('/logout', (req, res) => {
  req.logout()
  res.redirect(process.env.CLIENT_URL)
})

router.get('/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/google/failed'
  }),
  (req, res) => {
    const { accountId, email } = req.user
    const token = jwt.sign({accountId, email }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    return res.redirect(`${process.env.CLIENT_URL}/login?token=${token}`);
  });

module.exports = router;
