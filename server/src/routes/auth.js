/**
 * Auth Routes — /api/auth
 * Uses controllers to keep this file clean.
 */

const express = require('express');
const { body }  = require('express-validator');
const { validate }          = require('../middleware/validate');
const { protect }           = require('../middleware/auth');
const {
  register, login, getMe, forgotPassword, resetPassword,
} = require('../controllers/authController');

const router = express.Router();

// Validators
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password ≥ 6 chars'),
];
const loginRules = [
  body('email').isEmail(),
  body('password').notEmpty(),
];

router.post('/register', registerRules, validate, register);
router.post('/login',    loginRules,    validate, login);
router.get ('/me',       protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put ('/reset-password/:token', [
  body('password').isLength({ min: 6 }),
], validate, resetPassword);

module.exports = router;
