const express = require('express');
const axios = require('axios');
const { protect } = require('../middleware/auth');
const Workout = require('../models/Workout');
const User = require('../models/User');

const router = express.Router();

// GET /api/workouts — list user workouts
router.get('/', protect, async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const workouts = await Workout.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Workout.countDocuments({ userId: req.user._id });
    res.json({ workouts, total, page: parseInt(page) });
  } catch (err) { next(err); }
});

// POST /api/workouts — save a workout
router.post('/', protect, async (req, res, next) => {
  try {
    const workout = await Workout.create({ ...req.body, userId: req.user._id });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalWorkouts: 1 },
      lastWorkout: new Date(),
    });

    res.status(201).json({ workout });
  } catch (err) { next(err); }
});

// GET /api/workouts/recommend — proxy to AI service
router.get('/recommend', protect, async (req, res, next) => {
  try {
    const { profile } = req.user;
    if (!profile || !profile.goal) {
      return res.status(400).json({ error: 'Please complete your profile first (goal, weight, height, etc.)' });
    }

    const payload = {
      age: profile.age || 25,
      weight: profile.weight || 70,
      height: profile.height || 170,
      gender: profile.gender || 'male',
      goal: profile.goal,
      activity_level: profile.activityLevel || 'moderate',
      fitness_level: profile.fitnessLevel || 'beginner',
    };

    const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const { data } = await axios.post(`${aiUrl}/predict/workout`, payload, { timeout: 10000 });
    res.json(data);
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'AI service unavailable. Please try again later.' });
    }
    next(err);
  }
});

// GET /api/workouts/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, userId: req.user._id });
    if (!workout) return res.status(404).json({ error: 'Workout not found' });
    res.json({ workout });
  } catch (err) { next(err); }
});

// DELETE /api/workouts/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const workout = await Workout.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!workout) return res.status(404).json({ error: 'Workout not found' });
    res.json({ message: 'Workout deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
