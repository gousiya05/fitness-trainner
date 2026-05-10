/**
 * Progress Model
 * Aggregated daily snapshot for charts (cached computed values).
 */

const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date:            { type: Date, default: Date.now, index: true },
  weight:          { type: Number },          // kg snapshot
  bmi:             { type: Number },
  caloriesBurned:  { type: Number, default: 0 },
  caloriesConsumed:{ type: Number, default: 0 },
  workoutsLogged:  { type: Number, default: 0 },
  streak:          { type: Number, default: 0 },
  notes:           { type: String },
}, { timestamps: true });

// One entry per user per day
progressSchema.index({ userId: 1, date: 1 }, { unique: false });

module.exports = mongoose.model('Progress', progressSchema);
