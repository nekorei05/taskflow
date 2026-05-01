const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refresh,
  logout,
  getMe,
} = require('../../controllers/authController');
const { protect } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { registerValidation, loginValidation } = require('../../validators/authValidators');

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
