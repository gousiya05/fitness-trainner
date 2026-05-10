/**
 * Calorie Controller
 * Handles daily calorie logs and AI burn predictions.
 */

const axios = require('axios');
const CalorieLog = require('../models/CalorieLog');

const AI_URL = () => process.env.AI_SERVICE_URL || 'http://localhost:8000';

// ─── GET /api/calories ────────────────────────────────────────────────────────
exports.getLogs = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));
    const logs = await CalorieLog.find({
      userId: req.user._id,
      date: { $gte: since },
    }).sort({ date: -1 });
    res.json({ logs });
  } catch (err) { next(err); }
};

// ─── POST /api/calories/log ───────────────────────────────────────────────────
// Upserts today's log. If a meal is passed it is pushed onto the meals array and
// the total consumed calories are recalculated automatically.
exports.logCalories = async (req, res, next) => {
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
      if (req.body.burned  !== undefined) log.burned += req.body.burned;
      if (req.body.water   !== undefined) log.water  += req.body.water;
      await log.save();
    } else {
      log = await CalorieLog.create({ ...req.body, userId: req.user._id });
    }

    res.status(201).json({ log });
  } catch (err) { next(err); }
};

// ─── POST /api/calories/predict ──────────────────────────────────────────────
// Proxies to the FastAPI AI microservice for MET-based calorie-burn prediction.
exports.predictCalories = async (req, res, next) => {
  try {
    const { data } = await axios.post(
      `${AI_URL()}/predict/calories`,
      req.body,
      { timeout: 10000 }
    );
    res.json(data);
  } catch (err) {
    if (err.code === 'ECONNREFUSED')
      return res.status(503).json({ error: 'AI service unavailable' });
    next(err);
  }
};
