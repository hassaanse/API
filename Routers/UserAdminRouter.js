const express = require('express');
const {
  signUp,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
} = require('../Controllers/UserAdminController');

const router = express.Router();

router.post('/signup', signUp);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
