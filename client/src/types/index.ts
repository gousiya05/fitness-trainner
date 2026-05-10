// ─── User & Auth ──────────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  profile: UserProfile
  streak: number
  totalWorkouts: number
  joinedAt: string
}

export interface UserProfile {
  age?: number
  weight?: number      // kg
  height?: number      // cm
  gender?: 'male' | 'female' | 'other'
  goal?: FitnessGoal
  activityLevel?: ActivityLevel
  fitnessLevel?: FitnessLevel
}

export type FitnessGoal     = 'weight_loss' | 'muscle_gain' | 'endurance' | 'flexibility' | 'general'
export type ActivityLevel   = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type FitnessLevel    = 'beginner' | 'intermediate' | 'advanced'
export type Gender          = 'male' | 'female' | 'other'
export type MealTime        = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type Intensity       = 'low' | 'moderate' | 'high'
export type ExerciseType    = 'cardio' | 'strength' | 'yoga' | 'hiit' | 'cycling' | 'running' | 'swimming'

// ─── Workout ──────────────────────────────────────────────────────────
export interface Exercise {
  name: string
  sets: number
  reps: number
  rest: number       // seconds
  muscle: string
  calories: number
  duration?: number  // seconds (for timed exercises)
  completed?: boolean
}

export interface WorkoutPlan {
  goal: FitnessGoal
  fitness_level: FitnessLevel
  exercises: Exercise[]
  weekly_sessions: number
  estimated_calories_per_session: number
  diet_suggestions: string[]
  ai_tip: string
}

export interface WorkoutHistory {
  id: string
  title: string
  date: string
  completed: boolean
  totalCalories: number
  durationMinutes: number
  goal?: FitnessGoal
  exercises: Exercise[]
  rating?: number
  aiGenerated?: boolean
}

// ─── BMI ──────────────────────────────────────────────────────────────
export interface BMIResult {
  bmi: number
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese Class I' | 'Obese Class II+'
  risk: string
  color: string
  ideal_weight_range: { min: number; max: number; unit: string }
  advice: string[]
}

export interface BMIHistory {
  date: string
  bmi: number
  weight: number
  category: string
}

// ─── Calories ─────────────────────────────────────────────────────────
export interface CaloriePrediction {
  calories_burned: number
  exercise_type: ExerciseType
  duration_minutes: number
  intensity: Intensity
  bmr: number
  daily_calories_needed: number
  met_value: number
}

export interface Meal {
  id?: string
  name: string
  calories: number
  protein?: number
  carbs?: number
  fat?: number
  time: MealTime
}

export interface CalorieLog {
  date: string
  consumed: number
  burned: number
  goal: number
  water: number
  meals: Meal[]
}

// ─── Diet ─────────────────────────────────────────────────────────────
export interface DietPlan {
  goal: FitnessGoal
  calorie_target: number
  protein_g: number
  carbs_g: number
  fat_g: number
  meals: DietMeal[]
  tips: string[]
  foods_to_eat: string[]
  foods_to_avoid: string[]
  supplements?: string[]
}

export interface DietMeal {
  time: MealTime
  name: string
  items: string[]
  calories: number
  protein: number
  carbs: number
  fat: number
}

// ─── Dashboard ────────────────────────────────────────────────────────
export interface DashboardStats {
  totalWorkouts: number
  streak: number
  latestBMI: number | null
  bmiCategory: string | null
  weeklyData: { day: string; workouts: number; calories: number }[]
  calorieData: { date: string; consumed: number; burned: number; goal: number }[]
  recentWorkouts: WorkoutHistory[]
  weeklyGoal: number
  weeklyCompleted: number
}

// ─── Pose Detection ───────────────────────────────────────────────────
export interface PoseLandmark {
  x: number
  y: number
  z: number
  visibility: number
}

export interface PostureAnalysis {
  detected: boolean
  score: number
  feedback: string[]
  landmarks?: Record<string, PoseLandmark>
  reps?: number
}

// ─── API helpers ──────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  error: string
  details?: unknown
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
