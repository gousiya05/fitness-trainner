/**
 * DietPlan Model
 * Stores AI-generated diet recommendations per user.
 */

const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  time:     { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
  name:     { type: String, required: true },
  calories: { type: Number },
  protein:  { type: Number }, // g
  carbs:    { type: Number }, // g
  fat:      { type: Number }, // g
  notes:    { type: String },
});

const dietPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  goal:        { type: String },             // weight_loss, muscle_gain, …
  suggestions: [{ type: String }],           // AI text tips
  aiTip:       { type: String },             // personalised tip from AI
  meals:       [mealSchema],                 // optional saved meals
  macros: {
    targetCalories: { type: Number },
    protein:        { type: Number },
    carbs:          { type: Number },
    fat:            { type: Number },
  },
  active: { type: Boolean, default: true },  // current plan
}, { timestamps: true });

module.exports = mongoose.model('DietPlan', dietPlanSchema);
