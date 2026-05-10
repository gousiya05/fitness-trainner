/**
 * User Routes — /api/users
 */

const express = require('express');
const { protect }    = require('../middleware/auth');
const { authorize }  = require('../middleware/authorize');
const {
  getProfile, updateProfile, listUsers, deleteUser,
} = require('../controllers/userController');

const router = express.Router();

// User's own profile
router.get ('/profile', protect, getProfile);
router.put ('/profile', protect, updateProfile);

// Admin-only
router.get ('/', protect, authorize('admin'), listUsers);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
