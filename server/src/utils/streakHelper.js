/**
 * Streak Helper
 * Updates a user's consecutive-day workout streak.
 * Called after a workout is successfully saved.
 */

const User = require('../models/User');

/**
 * @param {string|ObjectId} userId
 */
const updateStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const now = new Date();
  const lastWorkout = user.lastWorkout ? new Date(user.lastWorkout) : null;

  if (!lastWorkout) {
    // First workout ever
    user.streak = 1;
  } else {
    // Check if last workout was yesterday (within the same calendar day window)
    const diffMs   = now - lastWorkout;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day — streak unchanged
    } else if (diffDays === 1) {
      // Consecutive day — increment
      user.streak += 1;
    } else {
      // Streak broken
      user.streak = 1;
    }
  }

  user.lastWorkout = now;
  await user.save({ validateBeforeSave: false });

  return user.streak;
};

module.exports = { updateStreak };
