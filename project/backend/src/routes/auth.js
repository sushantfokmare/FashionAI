const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { signup, login, logout, me } = require('../controllers/authController');

router.post(
  '/signup',
  [
    body('name').trim().isLength({ min: 2, max: 80 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  signup
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  login
);

router.post('/logout', logout);
router.get('/me', auth, me);

module.exports = router;
