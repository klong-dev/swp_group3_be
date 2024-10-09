const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken')

/**
 * @swagger
 * tags:
 *   name: GoogleAuth
 *   description: Google authentication
 */

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Google authentication
 *     tags: [GoogleAuth]
 *     responses:
 *       302:
 *         description: Redirect to Google for authentication
 */
router.get('/',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @swagger
 * /auth/google/failed:
 *   get:
 *     summary: Google authentication failed
 *     tags: [GoogleAuth]
 *     responses:
 *       200:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "failure"
 */
router.get("/failed", (req, res) => {
  res.json({
    success: false,
    message: "failure"
  })
})

/**
 * @swagger
 * /auth/google/logout:
 *   get:
 *     summary: Logout from Google
 *     tags: [GoogleAuth]
 *     responses:
 *       302:
 *         description: Redirect to client URL after logout
 */
router.get('/logout', (req, res) => {
  req.logout()
  res.redirect(process.env.CLIENT_URL)
})

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google authentication callback
 *     tags: [GoogleAuth]
 *     responses:
 *       302:
 *         description: Redirect to client URL with JWT token
 *         headers:
 *           Location:
 *             description: URL to redirect to
 *             schema:
 *               type: string
 *               example: "http://localhost:3000/login?token=your_jwt_token"
 */
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
