const express = require('express');
const axios = require('axios');
const { protect } = require('../middleware/auth');
const BodyMetrics = require('../models/BodyMetrics');

const router = express.Router();

// GET /api/metrics
router.get('/', protect, async (req, res, next) => {
  try {
    const { limit = 30 } = req.query;
    const metrics = await BodyMetrics.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(parseInt(limit));
    res.json({ metrics });
  } catch (err) { next(err); }
});

// POST /api/metrics
router.post('/', protect, async (req, res, next) => {
  try {
    const metric = await BodyMetrics.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ metric });
  } catch (err) { next(err); }
});

// POST /api/metrics/predict-bmi — AI prediction
router.post('/predict-bmi', protect, async (req, res, next) => {
  try {
    const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const { data } = await axios.post(`${aiUrl}/predict/bmi`, req.body, { timeout: 10000 });
    res.json(data);
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'AI service unavailable' });
    }
    next(err);
  }
});

module.exports = router;
