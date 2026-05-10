/**
 * Dashboard Controller
 * Aggregates cross-collection stats for the user's dashboard.
 */

const Workout     = require('../models/Workout');
const BodyMetrics = require('../models/BodyMetrics');
const CalorieLog  = require('../models/CalorieLog');

// ─── GET /api/dashboard/stats ─────────────────────────────────────────────────
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Run all DB queries in parallel for speed
    const [totalWorkouts, recentWorkouts, latestMetric, recentCalories] =
      await Promise.all([
        Workout.countDocuments({ userId }),
        Workout.find({ userId, date: { $gte: thirtyDaysAgo } })
          .sort({ date: -1 })
          .limit(10),
        BodyMetrics.findOne({ userId }).sort({ date: -1 }),
        CalorieLog.find({ userId, date: { $gte: thirtyDaysAgo } })
          .sort({ date: -1 })
          .limit(7),
      ]);

    // Build last-7-days workout bar chart data
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);

      const [count, calLog] = await Promise.all([
        Workout.countDocuments({ userId, date: { $gte: day, $lt: next } }),
        CalorieLog.findOne({ userId, date: { $gte: day, $lt: next } }),
      ]);

      weeklyData.push({
        day: day.toLocaleDateString('en-US', { weekday: 'short' }),
        workouts: count,
        calories: calLog?.burned || 0,
      });
    }

    res.json({
      totalWorkouts,
      streak:          req.user.streak,
      weeklyGoal:      5,
      weeklyCompleted: weeklyData.filter(d => d.workouts > 0).length,
      latestBMI:       latestMetric?.bmi       || null,
      bmiCategory:     latestMetric?.bmiCategory || null,
      recentWorkouts:  recentWorkouts.slice(0, 5),
      weeklyData,
      calorieData: recentCalories.map(log => ({
        date:     log.date,
        consumed: log.consumed,
        burned:   log.burned,
        goal:     log.goal,
      })),
    });
  } catch (err) { next(err); }
};
