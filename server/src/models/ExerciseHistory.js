const mongoose = require('mongoose');

const exerciseHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout',
  },
  exerciseName: { type: String, required: true },
  muscleGroup: String,
  sets: Number,
  reps: Number,
  durationSeconds: Number,
  caloriesBurned: Number,
  date: { type: Date, default: Date.now },
  postureScore: { type: Number, min: 0, max: 100 },
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('ExerciseHistory', exerciseHistorySchema);
