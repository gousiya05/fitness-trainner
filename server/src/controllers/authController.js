/**
 * Auth Controller
 * Handles user registration, login, profile retrieval, and password reset.
 * Keeps route files thin — all business logic lives here.
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// ─── Helper: sign a JWT ───────────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

// ─── Helper: strip sensitive fields ──────────────────────────────────────────
const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  profile: user.profile,
  streak: user.streak,
  totalWorkouts: user.totalWorkouts,
  joinedAt: user.joinedAt,
});

// ─── @route  POST /api/auth/register ─────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;

    // Prevent duplicate accounts
    if (await User.findOne({ email }))
      return res.status(400).json({ error: 'Email already registered' });

    const user = await User.create({ name, email, password });

    res.status(201).json({
      token: generateToken(user._id),
      user: safeUser(user),
    });
  } catch (err) { next(err); }
};

// ─── @route  POST /api/auth/login ────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    // select('+password') because password has `select: false` in schema
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ error: 'Invalid email or password' });

    res.json({
      token: generateToken(user._id),
      user: safeUser(user),
    });
  } catch (err) { next(err); }
};

// ─── @route  GET /api/auth/me ─────────────────────────────────────────────────
exports.getMe = (req, res) => {
  res.json({ user: safeUser(req.user) });
};

// ─── @route  POST /api/auth/forgot-password ──────────────────────────────────
/**
 * Generates a reset token, stores its hash on the user doc, and (in production)
 * would email it. For now it returns the raw token in the response so the frontend
 * can demonstrate the flow without an SMTP server configured.
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(404).json({ error: 'No account with that email' });

    // Create a random reset token (plain-text)
    const resetToken = crypto.randomBytes(32).toString('hex');
    // Store SHA-256 hash so even if DB is breached the token is useless
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save({ validateBeforeSave: false });

    // In production: send email with resetToken via nodemailer / sendgrid
    // For dev, return it directly
    res.json({
      message: 'Reset token generated (check email in production)',
      resetToken, // REMOVE in production — send via email only
    });
  } catch (err) { next(err); }
};

// ─── @route  PUT /api/auth/reset-password/:token ────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const hashed = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ error: 'Token is invalid or has expired' });

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ token: generateToken(user._id), user: safeUser(user) });
  } catch (err) { next(err); }
};
