const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: String,
  sets: Number,
  reps: Number,
  duration: Number,  // seconds
  rest: Number,      // seconds
  muscle: String,
  calories: Number,
  completed: { type: Boolean, default: false },
  notes: String,
});

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: { type: String, default: 'AI Workout' },
  exercises: [exerciseSchema],
  date: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false },
  aiGenerated: { type: Boolean, default: true },
  goal: String,
  totalCalories: { type: Number, default: 0 },
  durationMinutes: { type: Number, default: 0 },
  rating: { type: Number, min: 1, max: 5, default: null },
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);
