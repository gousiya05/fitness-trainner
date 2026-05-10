/**
 * Workout Controller
 * Manages saving/retrieving workouts and proxying AI recommendations.
 */

const axios = require('axios');
const Workout = require('../models/Workout');
const User   = require('../models/User');
const { updateStreak } = require('../utils/streakHelper');

const AI_URL = () => process.env.AI_SERVICE_URL || 'http://localhost:8000';

// ─── GET /api/workouts ────────────────────────────────────────────────────────
exports.listWorkouts = async (req, res, next) => {
  try {
    const { limit = 20, page = 1, goal } = req.query;
    const filter = { userId: req.user._id };
    if (goal) filter.goal = goal;

    const [workouts, total] = await Promise.all([
      Workout.find(filter)
        .sort({ date: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit)),
      Workout.countDocuments(filter),
    ]);

    res.json({ workouts, total, page: parseInt(page) });
  } catch (err) { next(err); }
};

// ─── POST /api/workouts ───────────────────────────────────────────────────────
exports.saveWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.create({ ...req.body, userId: req.user._id });

    // Update total count + streak
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalWorkouts: 1 },
      lastWorkout: new Date(),
    });
    await updateStreak(req.user._id);

    res.status(201).json({ workout });
  } catch (err) { next(err); }
};

// ─── GET /api/workouts/recommend ──────────────────────────────────────────────
exports.recommendWorkout = async (req, res, next) => {
  try {
    const { profile } = req.user;
    if (!profile?.goal)
      return res.status(400).json({
        error: 'Please complete your profile first (goal, weight, height, etc.)',
      });

    const payload = {
      age:            profile.age            || 25,
      weight:         profile.weight         || 70,
      height:         profile.height         || 170,
      gender:         profile.gender         || 'male',
      goal:           profile.goal,
      activity_level: profile.activityLevel  || 'moderate',
      fitness_level:  profile.fitnessLevel   || 'beginner',
    };

    const { data } = await axios.post(`${AI_URL()}/predict/workout`, payload, {
      timeout: 10000,
    });
    res.json(data);
  } catch (err) {
    if (err.code === 'ECONNREFUSED')
      return res.status(503).json({ error: 'AI service is not running. Start it with: uvicorn main:app' });
    next(err);
  }
};

// ─── GET /api/workouts/:id ────────────────────────────────────────────────────
exports.getWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, userId: req.user._id });
    if (!workout) return res.status(404).json({ error: 'Workout not found' });
    res.json({ workout });
  } catch (err) { next(err); }
};

// ─── DELETE /api/workouts/:id ─────────────────────────────────────────────────
exports.deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!workout) return res.status(404).json({ error: 'Workout not found' });
    res.json({ message: 'Workout deleted' });
  } catch (err) { next(err); }
};
