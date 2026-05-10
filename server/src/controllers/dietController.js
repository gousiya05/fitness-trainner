/**
 * Diet Controller
 * Returns AI-powered diet recommendations and daily nutrition targets.
 */

const axios = require('axios');
const DietPlan = require('../models/DietPlan');

const AI_URL = () => process.env.AI_SERVICE_URL || 'http://localhost:8000';

// ─── GET /api/diet ─────────────────────────────────────────────────────────────
// Returns saved diet plans for this user.
exports.getDietPlans = async (req, res, next) => {
  try {
    const plans = await DietPlan.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(10);
    res.json({ plans });
  } catch (err) { next(err); }
};

// ─── POST /api/diet/recommend ─────────────────────────────────────────────────
// Proxies to the FastAPI AI service for a diet plan, then saves the result.
exports.recommendDiet = async (req, res, next) => {
  try {
    const { profile } = req.user;

    // Build payload from user profile (fallback defaults for demo)
    const payload = {
      goal:           profile?.goal           || req.body.goal || 'general',
      weight:         profile?.weight         || req.body.weight || 70,
      height:         profile?.height         || req.body.height || 170,
      age:            profile?.age            || req.body.age || 25,
      gender:         profile?.gender         || req.body.gender || 'male',
      activity_level: profile?.activityLevel  || req.body.activity_level || 'moderate',
      fitness_level:  profile?.fitnessLevel   || req.body.fitness_level || 'beginner',
    };

    // Get workout plan (which includes diet_suggestions) from AI service
    const { data: aiData } = await axios.post(`${AI_URL()}/predict/workout`, payload, {
      timeout: 10000,
    });

    // Save plan
    const plan = await DietPlan.create({
      userId: req.user._id,
      goal: payload.goal,
      suggestions: aiData.diet_suggestions || [],
      aiTip: aiData.ai_tip,
      macros: computeMacros(payload),
    });

    res.status(201).json({ plan, aiData });
  } catch (err) {
    if (err.code === 'ECONNREFUSED')
      return res.status(503).json({ error: 'AI service unavailable' });
    next(err);
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Rule-based macro computation:
 * Returns daily calorie target + protein / carb / fat in grams.
 */
function computeMacros({ weight, height, age, gender, activity_level, goal }) {
  // Mifflin-St Jeor BMR
  const bmr = gender === 'male'
    ? 88.36 + 13.4 * weight + 4.8 * height - 5.7 * age
    : 447.6  +  9.2 * weight + 3.1 * height - 4.3 * age;

  const activityMultipliers = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
  };
  const tdee = Math.round(bmr * (activityMultipliers[activity_level] || 1.55));

  // Adjust calories by goal
  const goalDelta = { weight_loss: -350, muscle_gain: 300, general: 0, endurance: 200, flexibility: 0 };
  const targetCalories = tdee + (goalDelta[goal] || 0);

  // Macro split (protein-first approach)
  const protein = Math.round(weight * (goal === 'muscle_gain' ? 2.2 : 1.8)); // g
  const fat     = Math.round((targetCalories * 0.25) / 9);                   // g
  const carbs   = Math.round((targetCalories - protein * 4 - fat * 9) / 4); // g

  return { targetCalories, protein, fat, carbs };
}
