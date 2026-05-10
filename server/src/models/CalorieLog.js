const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  time: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], default: 'snack' },
});

const calorieLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: { type: Date, default: Date.now },
  consumed: { type: Number, default: 0 },
  burned: { type: Number, default: 0 },
  goal: { type: Number, default: 2000 },
  meals: [mealSchema],
  water: { type: Number, default: 0 },  // ml
}, { timestamps: true });

module.exports = mongoose.model('CalorieLog', calorieLogSchema);
