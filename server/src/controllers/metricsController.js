/**
 * BMI / Body-Metrics Controller
 */

const axios = require('axios');
const BodyMetrics = require('../models/BodyMetrics');

const AI_URL = () => process.env.AI_SERVICE_URL || 'http://localhost:8000';

// ─── GET /api/metrics ─────────────────────────────────────────────────────────
exports.listMetrics = async (req, res, next) => {
  try {
    const { limit = 30 } = req.query;
    const metrics = await BodyMetrics.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(parseInt(limit));
    res.json({ metrics });
  } catch (err) { next(err); }
};

// ─── POST /api/metrics ────────────────────────────────────────────────────────
// Saves a body-metrics entry. BMI is auto-calculated by the Mongoose pre-save hook.
exports.saveMetric = async (req, res, next) => {
  try {
    const metric = await BodyMetrics.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ metric });
  } catch (err) { next(err); }
};

// ─── POST /api/metrics/predict-bmi ───────────────────────────────────────────
exports.predictBMI = async (req, res, next) => {
  try {
    const { data } = await axios.post(`${AI_URL()}/predict/bmi`, req.body, {
      timeout: 10000,
    });
    res.json(data);
  } catch (err) {
    if (err.code === 'ECONNREFUSED')
      return res.status(503).json({ error: 'AI service unavailable' });
    next(err);
  }
};
