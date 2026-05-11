// ─── App constants ────────────────────────────────────────────────────
export const APP_NAME = 'FitAI'
export const APP_VERSION = '2.0.0'
export const TOKEN_KEY = 'fitai_token'
export const USER_KEY  = 'fitai_user'

// ─── API URLs ─────────────────────────────────────────────────────────
export const API_BASE  = import.meta.env.VITE_API_URL  || 'http://localhost:5000/api'
export const AI_BASE   = import.meta.env.VITE_AI_URL   || 'http://localhost:8000'

// ─── Fitness options ──────────────────────────────────────────────────
export const GOALS = [
  { value: 'weight_loss',  label: 'Weight Loss',   emoji: '🔥', color: '#ff6b35' },
  { value: 'muscle_gain',  label: 'Muscle Gain',   emoji: '💪', color: '#00ff87' },
  { value: 'endurance',    label: 'Endurance',     emoji: '🏃', color: '#06b6d4' },
  { value: 'flexibility',  label: 'Flexibility',   emoji: '🧘', color: '#a78bfa' },
  { value: 'general',      label: 'General Fitness',emoji: '⚡', color: '#fbbf24' },
] as const

export const ACTIVITY_LEVELS = [
  { value: 'sedentary',   label: 'Sedentary',      desc: 'Little to no exercise' },
  { value: 'light',       label: 'Light',           desc: '1–3 days/week' },
  { value: 'moderate',    label: 'Moderate',        desc: '3–5 days/week' },
  { value: 'active',      label: 'Active',          desc: '6–7 days/week' },
  { value: 'very_active', label: 'Very Active',     desc: 'Twice daily or athlete' },
] as const

export const FITNESS_LEVELS = [
  { value: 'beginner',     label: 'Beginner',     desc: 'Just starting out' },
  { value: 'intermediate', label: 'Intermediate', desc: '6+ months experience' },
  { value: 'advanced',     label: 'Advanced',     desc: '2+ years training' },
] as const

export const GENDERS = [
  { value: 'male',   label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other',  label: 'Other' },
] as const

export const EXERCISE_TYPES = [
  { value: 'cardio',    label: 'Cardio',    icon: '🏃' },
  { value: 'strength',  label: 'Strength',  icon: '🏋️' },
  { value: 'yoga',      label: 'Yoga',      icon: '🧘' },
  { value: 'hiit',      label: 'HIIT',      icon: '⚡' },
  { value: 'cycling',   label: 'Cycling',   icon: '🚴' },
  { value: 'running',   label: 'Running',   icon: '🏃' },
  { value: 'swimming',  label: 'Swimming',  icon: '🏊' },
] as const

export const INTENSITIES = [
  { value: 'low',      label: 'Low',      color: '#06b6d4' },
  { value: 'moderate', label: 'Moderate', color: '#fbbf24' },
  { value: 'high',     label: 'High',     color: '#f87171' },
] as const

export const MEAL_TIMES = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅', color: '#fbbf24' },
  { value: 'lunch',     label: 'Lunch',     icon: '☀️', color: '#00ff87' },
  { value: 'dinner',    label: 'Dinner',    icon: '🌙', color: '#7c3aed' },
  { value: 'snack',     label: 'Snack',     icon: '🍎', color: '#06b6d4' },
] as const

export const EXERCISES_FOR_DETECTION = [
  { value: 'squat',       label: 'Squats' },
  { value: 'push_up',     label: 'Push-Ups' },
  { value: 'lunge',       label: 'Lunges' },
  { value: 'bicep_curl',  label: 'Bicep Curl' },
  { value: 'jumping_jack',label: 'Jumping Jacks' },
  { value: 'plank',       label: 'Plank Hold' },
] as const

// ─── BMI Ranges ────────────────────────────────────────────────────────
export const BMI_RANGES = [
  { label: 'Underweight', min: 0,    max: 18.5, color: '#60a5fa' },
  { label: 'Normal',      min: 18.5, max: 25,   color: '#34d399' },
  { label: 'Overweight',  min: 25,   max: 30,   color: '#fbbf24' },
  { label: 'Obese I',     min: 30,   max: 35,   color: '#f87171' },
  { label: 'Obese II+',   min: 35,   max: 50,   color: '#dc2626' },
]

// ─── Muscle → color ────────────────────────────────────────────────────
export const MUSCLE_COLORS: Record<string, string> = {
  'Full Body': '#00ff87', Chest: '#7c3aed', Back: '#ff6b35',
  Legs: '#06b6d4', Core: '#f59e0b', Cardio: '#ec4899',
  Triceps: '#a78bfa', Glutes: '#34d399', Shoulders: '#f87171',
  Hips: '#fb923c', Arms: '#818cf8',
}

// ─── Daily calorie goal default ────────────────────────────────────────
export const DEFAULT_CALORIE_GOAL = 2000
export const DEFAULT_WATER_GOAL   = 3000  // ml

// ─── Nav routes ───────────────────────────────────────────────────────
export const NAV_ROUTES = [
  { path: '/dashboard', label: 'Dashboard',      icon: 'MdDashboard' },
  { path: '/workout',   label: 'AI Workout',     icon: 'MdFitnessCenter' },
  { path: '/bmi',       label: 'BMI Tracker',    icon: 'MdMonitorWeight' },
  { path: '/calories',  label: 'Calories',       icon: 'MdLocalFireDepartment' },
  { path: '/diet',      label: 'Diet Plan',      icon: 'MdRestaurant' },
  { path: '/posture',   label: 'Posture AI',     icon: 'MdSelfImprovement' },
  { path: '/profile',   label: 'Profile',        icon: 'MdPerson' },
]
