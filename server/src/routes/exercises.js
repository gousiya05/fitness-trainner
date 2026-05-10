const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Exercise library — static data (extend with DB if needed)
const EXERCISES = [
  { id: 'e1', name: 'Push-Ups', muscle: 'Chest', equipment: 'None', difficulty: 'beginner', calories: 5, videoUrl: null },
  { id: 'e2', name: 'Pull-Ups', muscle: 'Back', equipment: 'Pull-up Bar', difficulty: 'intermediate', calories: 6 },
  { id: 'e3', name: 'Squats', muscle: 'Legs', equipment: 'None', difficulty: 'beginner', calories: 8 },
  { id: 'e4', name: 'Deadlifts', muscle: 'Full Body', equipment: 'Barbell', difficulty: 'advanced', calories: 10 },
  { id: 'e5', name: 'Burpees', muscle: 'Full Body', equipment: 'None', difficulty: 'intermediate', calories: 12 },
  { id: 'e6', name: 'Plank', muscle: 'Core', equipment: 'None', difficulty: 'beginner', calories: 3 },
  { id: 'e7', name: 'Mountain Climbers', muscle: 'Core', equipment: 'None', difficulty: 'beginner', calories: 8 },
  { id: 'e8', name: 'Jump Squats', muscle: 'Legs', equipment: 'None', difficulty: 'intermediate', calories: 10 },
  { id: 'e9', name: 'Dips', muscle: 'Triceps', equipment: 'Parallel Bars', difficulty: 'intermediate', calories: 5 },
  { id: 'e10', name: 'Lunges', muscle: 'Legs', equipment: 'None', difficulty: 'beginner', calories: 6 },
  { id: 'e11', name: 'High Knees', muscle: 'Cardio', equipment: 'None', difficulty: 'beginner', calories: 9 },
  { id: 'e12', name: 'Jumping Jacks', muscle: 'Full Body', equipment: 'None', difficulty: 'beginner', calories: 7 },
  { id: 'e13', name: 'Glute Bridges', muscle: 'Glutes', equipment: 'None', difficulty: 'beginner', calories: 4 },
  { id: 'e14', name: 'Russian Twists', muscle: 'Core', equipment: 'None', difficulty: 'beginner', calories: 4 },
  { id: 'e15', name: 'Box Jumps', muscle: 'Legs', equipment: 'Box', difficulty: 'advanced', calories: 12 },
];

// GET /api/exercises
router.get('/', protect, (req, res) => {
  const { muscle, difficulty, search } = req.query;
  let results = [...EXERCISES];

  if (muscle) results = results.filter(e => e.muscle.toLowerCase().includes(muscle.toLowerCase()));
  if (difficulty) results = results.filter(e => e.difficulty === difficulty);
  if (search) results = results.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  res.json({ exercises: results, total: results.length });
});

// GET /api/exercises/:id
router.get('/:id', protect, (req, res) => {
  const exercise = EXERCISES.find(e => e.id === req.params.id);
  if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
  res.json({ exercise });
});

module.exports = router;
