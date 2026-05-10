const express = require('express');
const axios = require('axios');
const { protect } = require('../middleware/auth');
const CalorieLog = require('../models/CalorieLog');

const router = express.Router();

// GET /api/calories
router.get('/', protect, async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));
    const logs = await CalorieLog.find({ userId: req.user._id, date: { $gte: since } }).sort({ date: -1 });
    res.json({ logs });
  } catch (err) { next(err); }
});

// POST /api/calories/log — add/update today's log
router.post('/log', protect, async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let log = await CalorieLog.findOne({
      userId: req.user._id,
      date: { $gte: today, $lt: tomorrow },
    });

    if (log) {
      if (req.body.meal) {
        log.meals.push(req.body.meal);
        log.consumed = log.meals.reduce((sum, m) => sum + (m.calories || 0), 0);
      }
      if (req.body.burned !== undefined) log.burned += req.body.burned;
      if (req.body.water !== undefined) log.water += req.body.water;
      await log.save();
    } else {
      log = await CalorieLog.create({ ...req.body, userId: req.user._id });
    }

    res.status(201).json({ log });
  } catch (err) { next(err); }
});

// POST /api/calories/predict — AI calorie burn prediction
router.post('/predict', protect, async (req, res, next) => {
  try {
    const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const { data } = await axios.post(`${aiUrl}/predict/calories`, req.body, { timeout: 10000 });
    res.json(data);
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'AI service unavailable' });
    }
    next(err);
  }
});

module.exports = router;
