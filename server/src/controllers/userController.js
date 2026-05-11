/**
 * User Controller
 * Profile management and admin-only user listing.
 */

const User = require('../models/User');

// ─── GET /api/users/profile ───────────────────────────────────────────────────
exports.getProfile = (req, res) => {
  res.json({ user: req.user });
};

// ─── PUT /api/users/profile ───────────────────────────────────────────────────
// Only allows whitelisted fields to be updated (prevents role escalation).
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'avatar', 'profile'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    res.json({ user });
  } catch (err) { next(err); }
};

// ─── GET /api/users  (admin only) ────────────────────────────────────────────
exports.listUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = search
      ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] }
      : {};

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.json({ users, total, page: parseInt(page) });
  } catch (err) { next(err); }
};

// ─── DELETE /api/users/:id  (admin only) ─────────────────────────────────────
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
};
