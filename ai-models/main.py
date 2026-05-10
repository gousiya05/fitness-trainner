"""
AI Fitness Trainer — FastAPI AI Service
Endpoints for ML predictions and pose detection.
"""

import os
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import joblib
import base64
import cv2

from pose.detector import PoseDetector
from pose.rep_counter import RepCounter
from pose.posture_scorer import PostureScorer

# ─── App Setup ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Fitness Trainer — AI Service",
    description="ML predictions and pose detection for the AI Fitness Trainer app.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = os.environ.get("MODEL_DIR", "./models")

# ─── Load Models ─────────────────────────────────────────────────────────────
def load_model(filename: str):
    path = os.path.join(MODEL_DIR, filename)
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Model not found: {path}. Run 'python train/train_models.py' first."
        )
    return joblib.load(path)

workout_model = None
bmi_model = None
calorie_model = None
label_encoders = {}

@app.on_event("startup")
async def load_models():
    global workout_model, bmi_model, calorie_model, label_encoders
    try:
        workout_model = load_model("workout_rf.pkl")
        bmi_model = load_model("bmi_lr.pkl")
        calorie_model = load_model("calories_lr.pkl")
        label_encoders = load_model("label_encoders.pkl")
        print("✅ All ML models loaded successfully")
    except FileNotFoundError as e:
        print(f"⚠️  {e}")

# ─── Pydantic Schemas ─────────────────────────────────────────────────────────
class WorkoutRequest(BaseModel):
    age: int
    weight: float          # kg
    height: float          # cm
    gender: str            # male / female
    goal: str              # weight_loss / muscle_gain / endurance / flexibility / general
    activity_level: str    # sedentary / light / moderate / active / very_active
    fitness_level: str     # beginner / intermediate / advanced

class BMIRequest(BaseModel):
    weight: float
    height: float          # cm
    age: int
    gender: str

class CalorieRequest(BaseModel):
    weight: float
    height: float
    age: int
    gender: str
    exercise_type: str     # cardio / strength / yoga / hiit / cycling / running / swimming
    duration_minutes: int
    intensity: str         # low / moderate / high

class FrameRequest(BaseModel):
    frame_base64: str      # base64 encoded JPEG frame
    exercise: Optional[str] = "general"

# ─── Helpers ─────────────────────────────────────────────────────────────────
EXERCISE_DATABASE = {
    "weight_loss": [
        {"name": "Burpees", "sets": 3, "reps": 15, "rest": 60, "muscle": "Full Body", "calories": 12},
        {"name": "Jump Squats", "sets": 4, "reps": 20, "rest": 45, "muscle": "Legs", "calories": 10},
        {"name": "Mountain Climbers", "sets": 3, "reps": 30, "rest": 30, "muscle": "Core", "calories": 8},
        {"name": "High Knees", "sets": 4, "reps": 40, "rest": 30, "muscle": "Cardio", "calories": 9},
        {"name": "Jumping Jacks", "sets": 3, "reps": 50, "rest": 30, "muscle": "Full Body", "calories": 7},
    ],
    "muscle_gain": [
        {"name": "Push-Ups", "sets": 4, "reps": 12, "rest": 90, "muscle": "Chest", "calories": 5},
        {"name": "Pull-Ups", "sets": 4, "reps": 8, "rest": 90, "muscle": "Back", "calories": 6},
        {"name": "Squats", "sets": 5, "reps": 10, "rest": 120, "muscle": "Legs", "calories": 8},
        {"name": "Deadlifts", "sets": 4, "reps": 8, "rest": 120, "muscle": "Full Body", "calories": 10},
        {"name": "Dips", "sets": 4, "reps": 12, "rest": 90, "muscle": "Triceps", "calories": 5},
    ],
    "endurance": [
        {"name": "Running", "sets": 1, "reps": 1, "rest": 0, "muscle": "Cardio", "calories": 400, "duration": 30},
        {"name": "Cycling", "sets": 1, "reps": 1, "rest": 0, "muscle": "Legs", "calories": 300, "duration": 30},
        {"name": "Jump Rope", "sets": 5, "reps": 60, "rest": 60, "muscle": "Full Body", "calories": 150},
        {"name": "Box Jumps", "sets": 4, "reps": 15, "rest": 60, "muscle": "Legs", "calories": 12},
    ],
    "flexibility": [
        {"name": "Yoga Sun Salutation", "sets": 3, "reps": 5, "rest": 30, "muscle": "Full Body", "calories": 4},
        {"name": "Hip Flexor Stretch", "sets": 3, "reps": 30, "rest": 15, "muscle": "Hips", "calories": 2},
        {"name": "Hamstring Stretch", "sets": 3, "reps": 30, "rest": 15, "muscle": "Legs", "calories": 2},
        {"name": "Shoulder Stretch", "sets": 3, "reps": 30, "rest": 15, "muscle": "Shoulders", "calories": 1},
        {"name": "Pigeon Pose", "sets": 2, "reps": 60, "rest": 30, "muscle": "Hips", "calories": 3},
    ],
    "general": [
        {"name": "Push-Ups", "sets": 3, "reps": 10, "rest": 60, "muscle": "Chest", "calories": 5},
        {"name": "Squats", "sets": 3, "reps": 15, "rest": 60, "muscle": "Legs", "calories": 8},
        {"name": "Plank", "sets": 3, "reps": 30, "rest": 45, "muscle": "Core", "calories": 3},
        {"name": "Lunges", "sets": 3, "reps": 12, "rest": 60, "muscle": "Legs", "calories": 6},
        {"name": "Glute Bridges", "sets": 3, "reps": 15, "rest": 45, "muscle": "Glutes", "calories": 4},
    ],
}

DIET_SUGGESTIONS = {
    "weight_loss": [
        "Increase protein intake to 1.6–2g per kg of body weight",
        "Maintain a 300–500 calorie daily deficit",
        "Prioritize vegetables, lean proteins, and complex carbs",
        "Drink at least 3L of water daily",
        "Avoid processed foods and sugary drinks",
    ],
    "muscle_gain": [
        "Eat in a 200–400 calorie daily surplus",
        "Consume 2–2.4g protein per kg of body weight",
        "Time carbohydrates around your workouts",
        "Don't skip post-workout protein within 30 minutes",
        "Include healthy fats like avocado, nuts, and olive oil",
    ],
    "endurance": [
        "Prioritize complex carbohydrates for sustained energy",
        "Hydrate well before, during, and after workouts",
        "Include iron-rich foods to support oxygen transport",
        "Consider electrolyte replenishment for long sessions",
        "Eat a light meal 2–3 hours before endurance training",
    ],
    "flexibility": [
        "Anti-inflammatory foods: turmeric, ginger, berries",
        "Magnesium-rich foods support muscle relaxation",
        "Stay hydrated to maintain joint lubrication",
        "Include collagen-boosting foods like bone broth",
        "Omega-3 fatty acids reduce muscle soreness",
    ],
    "general": [
        "Eat a balanced diet with all macronutrients",
        "Aim for 5 servings of vegetables and fruits daily",
        "Choose whole grains over refined carbohydrates",
        "Limit alcohol and processed food consumption",
        "Get 7–9 hours of quality sleep for recovery",
    ],
}


def calculate_bmi(weight: float, height_cm: float) -> float:
    height_m = height_cm / 100
    return round(weight / (height_m ** 2), 1)


def bmi_category(bmi: float) -> dict:
    if bmi < 18.5:
        return {"category": "Underweight", "risk": "Low", "color": "#60a5fa"}
    elif bmi < 25:
        return {"category": "Normal", "risk": "Minimal", "color": "#34d399"}
    elif bmi < 30:
        return {"category": "Overweight", "risk": "Moderate", "color": "#fbbf24"}
    elif bmi < 35:
        return {"category": "Obese Class I", "risk": "High", "color": "#f87171"}
    else:
        return {"category": "Obese Class II+", "risk": "Very High", "color": "#dc2626"}


# ─── Routes ──────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "models_loaded": workout_model is not None,
        "service": "AI Fitness Trainer — AI Service",
    }


@app.post("/predict/workout")
async def predict_workout(req: WorkoutRequest):
    goal_key = req.goal.lower().replace(" ", "_")
    exercises = EXERCISE_DATABASE.get(goal_key, EXERCISE_DATABASE["general"])
    diets = DIET_SUGGESTIONS.get(goal_key, DIET_SUGGESTIONS["general"])

    # Adjust for fitness level
    multipliers = {"beginner": 0.7, "intermediate": 1.0, "advanced": 1.3}
    mult = multipliers.get(req.fitness_level.lower(), 1.0)

    adjusted = []
    for ex in exercises:
        adjusted.append({
            **ex,
            "sets": max(1, round(ex["sets"] * mult)),
            "reps": max(1, round(ex["reps"] * mult)) if "reps" in ex else ex.get("reps"),
        })

    # Estimate total weekly calories
    total_cal = sum(
        ex.get("calories", 0) * ex.get("sets", 1) * ex.get("reps", 1) / 10
        for ex in adjusted
    )

    return {
        "goal": req.goal,
        "fitness_level": req.fitness_level,
        "exercises": adjusted,
        "weekly_sessions": 4 if req.activity_level in ["active", "very_active"] else 3,
        "estimated_calories_per_session": round(total_cal),
        "diet_suggestions": diets,
        "ai_tip": f"Based on your profile (age {req.age}, {req.weight}kg), focus on progressive overload and consistency.",
    }


@app.post("/predict/bmi")
async def predict_bmi(req: BMIRequest):
    bmi = calculate_bmi(req.weight, req.height)
    info = bmi_category(bmi)

    # Ideal weight range (using normal BMI range 18.5–24.9)
    h_m = req.height / 100
    ideal_min = round(18.5 * h_m ** 2, 1)
    ideal_max = round(24.9 * h_m ** 2, 1)

    advice = []
    if bmi < 18.5:
        advice = ["Increase caloric intake gradually", "Focus on strength training", "Consult a nutritionist"]
    elif bmi < 25:
        advice = ["Maintain current lifestyle", "Stay active 3–5 days/week", "Focus on muscle building"]
    elif bmi < 30:
        advice = ["Create a moderate caloric deficit", "Add 30 min cardio daily", "Track your nutrition"]
    else:
        advice = ["Consult a healthcare provider", "Start with low-impact exercise", "Make gradual dietary changes"]

    return {
        "bmi": bmi,
        "category": info["category"],
        "risk": info["risk"],
        "color": info["color"],
        "ideal_weight_range": {"min": ideal_min, "max": ideal_max, "unit": "kg"},
        "advice": advice,
    }


@app.post("/predict/calories")
async def predict_calories(req: CalorieRequest):
    # MET-based calorie calculation
    MET_VALUES = {
        "cardio": {"low": 4.5, "moderate": 7.0, "high": 10.0},
        "strength": {"low": 3.5, "moderate": 5.0, "high": 6.5},
        "yoga": {"low": 2.5, "moderate": 3.5, "high": 4.5},
        "hiit": {"low": 7.0, "moderate": 9.0, "high": 12.0},
        "cycling": {"low": 4.0, "moderate": 6.8, "high": 10.0},
        "running": {"low": 6.0, "moderate": 9.8, "high": 13.0},
        "swimming": {"low": 5.0, "moderate": 7.0, "high": 9.0},
    }

    exercise_type = req.exercise_type.lower()
    intensity = req.intensity.lower()
    met_map = MET_VALUES.get(exercise_type, MET_VALUES["cardio"])
    met = met_map.get(intensity, met_map["moderate"])

    # Calories = MET × weight(kg) × duration(hours)
    duration_h = req.duration_minutes / 60
    calories_burned = round(met * req.weight * duration_h, 1)

    # BMR-adjusted daily needs
    if req.gender.lower() == "male":
        bmr = 88.36 + (13.4 * req.weight) + (4.8 * req.height) - (5.7 * req.age)
    else:
        bmr = 447.6 + (9.2 * req.weight) + (3.1 * req.height) - (4.3 * req.age)

    return {
        "calories_burned": calories_burned,
        "exercise_type": req.exercise_type,
        "duration_minutes": req.duration_minutes,
        "intensity": req.intensity,
        "bmr": round(bmr),
        "daily_calories_needed": round(bmr * 1.55),
        "met_value": met,
    }


@app.post("/pose/analyze-frame")
async def analyze_frame(req: FrameRequest):
    """Analyze a single base64 frame for posture scoring."""
    try:
        img_data = base64.b64decode(req.frame_base64)
        nparr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        detector = PoseDetector()
        scorer = PostureScorer()

        landmarks = detector.detect(frame)
        if landmarks is None:
            return {"detected": False, "score": 0, "feedback": ["No pose detected"]}

        score, feedback = scorer.score(landmarks)
        return {"detected": True, "score": score, "feedback": feedback, "landmarks": landmarks}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.websocket("/pose/stream")
async def pose_stream(websocket: WebSocket):
    """WebSocket endpoint for real-time pose streaming."""
    await websocket.accept()
    rep_counter = RepCounter()
    scorer = PostureScorer()
    detector = PoseDetector()

    try:
        while True:
            data = await websocket.receive_json()
            frame_b64 = data.get("frame")
            exercise = data.get("exercise", "squat")

            img_data = base64.b64decode(frame_b64)
            nparr = np.frombuffer(img_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            landmarks = detector.detect(frame)
            result = {"detected": False, "reps": rep_counter.get_count(), "score": 0, "feedback": []}

            if landmarks:
                result["detected"] = True
                rep_counter.update(landmarks, exercise)
                score, feedback = scorer.score(landmarks)
                result.update({"reps": rep_counter.get_count(), "score": score, "feedback": feedback, "landmarks": landmarks})

            await websocket.send_json(result)

    except WebSocketDisconnect:
        pass
