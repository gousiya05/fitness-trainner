"""
AI Fitness Trainer — FastAPI AI Service (api/main.py)
Restructured under ai-models/api/ with cleaner separation.
All ML model endpoints + WebSocket pose detection.
"""

import os
import sys

# Allow imports from parent directory (ai-models/)
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

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

# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="FitAI — AI Microservice",
    description="ML predictions and real-time pose detection.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = os.environ.get("MODEL_DIR", os.path.join(os.path.dirname(__file__), "..", "models"))

# ─── Model Loading ────────────────────────────────────────────────────────────
workout_model   = None
bmi_model       = None
calorie_model   = None
label_encoders  = {}


def load_model(filename: str):
    """Load a .pkl model from MODEL_DIR. Raises a clear error if missing."""
    path = os.path.join(MODEL_DIR, filename)
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Model not found: {path}. "
            f"Run:  python ai-models/training/train_models.py"
        )
    return joblib.load(path)


@app.on_event("startup")
async def load_models():
    global workout_model, bmi_model, calorie_model, label_encoders
    try:
        workout_model  = load_model("workout_rf.pkl")
        bmi_model      = load_model("bmi_lr.pkl")
        calorie_model  = load_model("calories_lr.pkl")
        label_encoders = load_model("label_encoders.pkl")
        print("✅ All ML models loaded successfully")
    except FileNotFoundError as e:
        print(f"⚠️  {e}")


# ─── Schemas ──────────────────────────────────────────────────────────────────
class WorkoutRequest(BaseModel):
    age:            int
    weight:         float
    height:         float
    gender:         str
    goal:           str
    activity_level: str
    fitness_level:  str

class BMIRequest(BaseModel):
    weight: float
    height: float
    age:    int
    gender: str

class CalorieRequest(BaseModel):
    weight:           float
    height:           float
    age:              int
    gender:           str
    exercise_type:    str
    duration_minutes: int
    intensity:        str

class FrameRequest(BaseModel):
    frame_base64: str
    exercise:     Optional[str] = "general"


# ─── Exercise Database ────────────────────────────────────────────────────────
EXERCISE_DB = {
    "weight_loss": [
        {"name": "Burpees",          "sets": 3, "reps": 15, "rest": 60,  "muscle": "Full Body", "calories": 12},
        {"name": "Jump Squats",      "sets": 4, "reps": 20, "rest": 45,  "muscle": "Legs",      "calories": 10},
        {"name": "Mountain Climbers","sets": 3, "reps": 30, "rest": 30,  "muscle": "Core",      "calories": 8},
        {"name": "High Knees",       "sets": 4, "reps": 40, "rest": 30,  "muscle": "Cardio",    "calories": 9},
        {"name": "Jumping Jacks",    "sets": 3, "reps": 50, "rest": 30,  "muscle": "Full Body", "calories": 7},
    ],
    "muscle_gain": [
        {"name": "Push-Ups",  "sets": 4, "reps": 12, "rest": 90,  "muscle": "Chest",    "calories": 5},
        {"name": "Pull-Ups",  "sets": 4, "reps": 8,  "rest": 90,  "muscle": "Back",     "calories": 6},
        {"name": "Squats",    "sets": 5, "reps": 10, "rest": 120, "muscle": "Legs",     "calories": 8},
        {"name": "Deadlifts", "sets": 4, "reps": 8,  "rest": 120, "muscle": "Full Body","calories": 10},
        {"name": "Dips",      "sets": 4, "reps": 12, "rest": 90,  "muscle": "Triceps",  "calories": 5},
    ],
    "endurance": [
        {"name": "Running",    "sets": 1, "reps": 1, "rest": 0, "muscle": "Cardio",    "calories": 400, "duration": 30},
        {"name": "Cycling",    "sets": 1, "reps": 1, "rest": 0, "muscle": "Legs",      "calories": 300, "duration": 30},
        {"name": "Jump Rope",  "sets": 5, "reps": 60,"rest": 60,"muscle": "Full Body", "calories": 150},
        {"name": "Box Jumps",  "sets": 4, "reps": 15,"rest": 60,"muscle": "Legs",      "calories": 12},
    ],
    "flexibility": [
        {"name": "Yoga Sun Salutation","sets": 3, "reps": 5,  "rest": 30,"muscle": "Full Body",  "calories": 4},
        {"name": "Hip Flexor Stretch", "sets": 3, "reps": 30, "rest": 15,"muscle": "Hips",       "calories": 2},
        {"name": "Hamstring Stretch",  "sets": 3, "reps": 30, "rest": 15,"muscle": "Legs",       "calories": 2},
        {"name": "Pigeon Pose",        "sets": 2, "reps": 60, "rest": 30,"muscle": "Hips",       "calories": 3},
    ],
    "general": [
        {"name": "Push-Ups",      "sets": 3, "reps": 10, "rest": 60, "muscle": "Chest",  "calories": 5},
        {"name": "Squats",        "sets": 3, "reps": 15, "rest": 60, "muscle": "Legs",   "calories": 8},
        {"name": "Plank",         "sets": 3, "reps": 30, "rest": 45, "muscle": "Core",   "calories": 3},
        {"name": "Lunges",        "sets": 3, "reps": 12, "rest": 60, "muscle": "Legs",   "calories": 6},
        {"name": "Glute Bridges", "sets": 3, "reps": 15, "rest": 45, "muscle": "Glutes", "calories": 4},
    ],
}

DIET_TIPS = {
    "weight_loss":  ["Maintain a 300–500 kcal deficit", "1.6–2g protein/kg body weight", "Avoid processed foods"],
    "muscle_gain":  ["Eat 200–400 kcal surplus", "2–2.4g protein/kg body weight", "Time carbs around workouts"],
    "endurance":    ["Prioritise complex carbs", "Hydrate before, during and after", "Iron-rich foods for oxygen transport"],
    "flexibility":  ["Anti-inflammatory foods (turmeric, ginger)", "Magnesium for muscle relaxation", "Omega-3 for soreness"],
    "general":      ["Balanced macros daily", "5 servings veg & fruit", "7–9 hours sleep for recovery"],
}


def calculate_bmi(weight, height_cm):
    h = height_cm / 100
    return round(weight / h ** 2, 1)


def bmi_category(bmi):
    if bmi < 18.5: return {"category": "Underweight", "risk": "Low",       "color": "#60a5fa"}
    if bmi < 25:   return {"category": "Normal",      "risk": "Minimal",   "color": "#34d399"}
    if bmi < 30:   return {"category": "Overweight",  "risk": "Moderate",  "color": "#fbbf24"}
    if bmi < 35:   return {"category": "Obese I",     "risk": "High",      "color": "#f87171"}
    return             {"category": "Obese II+",   "risk": "Very High", "color": "#dc2626"}


# ─── Endpoints ────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status":        "healthy",
        "models_loaded": workout_model is not None,
        "service":       "FitAI — AI Microservice",
    }


@app.post("/predict/workout")
async def predict_workout(req: WorkoutRequest):
    goal_key  = req.goal.lower().replace(" ", "_")
    exercises = EXERCISE_DB.get(goal_key, EXERCISE_DB["general"])
    diets     = DIET_TIPS.get(goal_key, DIET_TIPS["general"])

    mult = {"beginner": 0.7, "intermediate": 1.0, "advanced": 1.3}.get(
        req.fitness_level.lower(), 1.0
    )

    adjusted = [
        {**ex, "sets": max(1, round(ex["sets"] * mult)),
                "reps": max(1, round(ex["reps"] * mult))}
        for ex in exercises
    ]

    total_cal = sum(
        ex.get("calories", 0) * ex.get("sets", 1) * ex.get("reps", 1) / 10
        for ex in adjusted
    )

    return {
        "goal":                           req.goal,
        "fitness_level":                  req.fitness_level,
        "exercises":                      adjusted,
        "weekly_sessions":                4 if req.activity_level in ["active", "very_active"] else 3,
        "estimated_calories_per_session": round(total_cal),
        "diet_suggestions":               diets,
        "ai_tip": (
            f"Based on your profile (age {req.age}, {req.weight} kg), "
            f"focus on progressive overload and consistency for {req.goal.replace('_', ' ')}."
        ),
    }


@app.post("/predict/bmi")
async def predict_bmi(req: BMIRequest):
    bmi  = calculate_bmi(req.weight, req.height)
    info = bmi_category(bmi)
    h    = req.height / 100

    if bmi < 18.5:  advice = ["Increase caloric intake gradually", "Focus on strength training"]
    elif bmi < 25:  advice = ["Maintain current lifestyle", "Stay active 3–5 days/week"]
    elif bmi < 30:  advice = ["Create a moderate caloric deficit", "Add 30 min cardio daily"]
    else:           advice = ["Consult a healthcare provider", "Start with low-impact exercise"]

    return {
        "bmi":      bmi,
        **info,
        "ideal_weight_range": {
            "min": round(18.5 * h ** 2, 1),
            "max": round(24.9 * h ** 2, 1),
            "unit": "kg",
        },
        "advice": advice,
    }


@app.post("/predict/calories")
async def predict_calories(req: CalorieRequest):
    MET = {
        "cardio":   {"low": 4.5, "moderate": 7.0, "high": 10.0},
        "strength": {"low": 3.5, "moderate": 5.0, "high": 6.5},
        "yoga":     {"low": 2.5, "moderate": 3.5, "high": 4.5},
        "hiit":     {"low": 7.0, "moderate": 9.0, "high": 12.0},
        "cycling":  {"low": 4.0, "moderate": 6.8, "high": 10.0},
        "running":  {"low": 6.0, "moderate": 9.8, "high": 13.0},
        "swimming": {"low": 5.0, "moderate": 7.0, "high": 9.0},
    }
    met  = MET.get(req.exercise_type.lower(), MET["cardio"]).get(req.intensity.lower(), 7.0)
    kcal = round(met * req.weight * (req.duration_minutes / 60), 1)

    bmr = (
        88.36 + 13.4 * req.weight + 4.8 * req.height - 5.7 * req.age
        if req.gender.lower() == "male"
        else 447.6 + 9.2 * req.weight + 3.1 * req.height - 4.3 * req.age
    )

    return {
        "calories_burned":      kcal,
        "exercise_type":        req.exercise_type,
        "duration_minutes":     req.duration_minutes,
        "intensity":            req.intensity,
        "bmr":                  round(bmr),
        "daily_calories_needed":round(bmr * 1.55),
        "met_value":            met,
    }


@app.post("/pose/analyze-frame")
async def analyze_frame(req: FrameRequest):
    """Decode a base64 JPEG frame and return posture score + feedback."""
    try:
        img_data  = base64.b64decode(req.frame_base64)
        nparr     = np.frombuffer(img_data, np.uint8)
        frame     = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        detector  = PoseDetector()
        scorer    = PostureScorer()
        landmarks = detector.detect(frame)

        if landmarks is None:
            return {"detected": False, "score": 0, "feedback": ["No pose detected"]}

        score, feedback = scorer.score(landmarks)
        return {"detected": True, "score": score, "feedback": feedback, "landmarks": landmarks}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.websocket("/pose/stream")
async def pose_stream(websocket: WebSocket):
    """Real-time WebSocket endpoint: send frames, receive rep counts + posture feedback."""
    await websocket.accept()
    rep_counter = RepCounter()
    scorer      = PostureScorer()
    detector    = PoseDetector()

    try:
        while True:
            data      = await websocket.receive_json()
            frame_b64 = data.get("frame")
            exercise  = data.get("exercise", "squat")

            img_data  = base64.b64decode(frame_b64)
            nparr     = np.frombuffer(img_data, np.uint8)
            frame     = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            landmarks = detector.detect(frame)

            result = {"detected": False, "reps": rep_counter.get_count(), "score": 0, "feedback": []}

            if landmarks:
                rep_counter.update(landmarks, exercise)
                score, feedback = scorer.score(landmarks)
                result.update({
                    "detected":  True,
                    "reps":      rep_counter.get_count(),
                    "score":     score,
                    "feedback":  feedback,
                    "landmarks": landmarks,
                })

            await websocket.send_json(result)

    except WebSocketDisconnect:
        pass
