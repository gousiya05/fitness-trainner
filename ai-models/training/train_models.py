"""
Model Training Script — ai-models/training/train_models.py
Generates synthetic training data and trains all 3 ML models, saving them as .pkl files.
Run once before starting the AI service:
    python ai-models/training/train_models.py
"""

import os
import sys
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, r2_score
import joblib

# Output directory — save to ai-models/models/
MODEL_DIR = os.environ.get(
    "MODEL_DIR",
    os.path.join(os.path.dirname(__file__), "..", "models"),
)
os.makedirs(MODEL_DIR, exist_ok=True)

print("[FitAI] Model Training Pipeline")
print("=" * 50)

np.random.seed(42)
N = 5000  # synthetic samples per model

# ─── Labels / categories ──────────────────────────────────────────────────────
GOALS           = ["weight_loss", "muscle_gain", "endurance", "flexibility", "general"]
ACTIVITY_LEVELS = ["sedentary", "light", "moderate", "active", "very_active"]
FITNESS_LEVELS  = ["beginner", "intermediate", "advanced"]
GENDERS         = ["male", "female"]

# ─── 1. Workout Recommendation (Random Forest) ────────────────────────────────
print("\n[1/3] Training Workout Recommendation Model …")

df = pd.DataFrame({
    "age":            np.random.randint(15, 70, N),
    "weight":         np.random.uniform(40, 150, N),
    "height":         np.random.uniform(145, 200, N),
    "gender":         np.random.choice(GENDERS, N),
    "goal":           np.random.choice(GOALS, N),
    "activity_level": np.random.choice(ACTIVITY_LEVELS, N),
    "fitness_level":  np.random.choice(FITNESS_LEVELS, N),
})
df["label"] = df["goal"]

le_gender   = LabelEncoder().fit(GENDERS)
le_goal     = LabelEncoder().fit(GOALS)
le_activity = LabelEncoder().fit(ACTIVITY_LEVELS)
le_fitness  = LabelEncoder().fit(FITNESS_LEVELS)

label_encoders = {
    "gender": le_gender, "goal": le_goal,
    "activity_level": le_activity, "fitness_level": le_fitness,
}

df["gender_enc"]   = le_gender.transform(df["gender"])
df["activity_enc"] = le_activity.transform(df["activity_level"])
df["fitness_enc"]  = le_fitness.transform(df["fitness_level"])
df["label_enc"]    = le_goal.transform(df["label"])

X = df[["age", "weight", "height", "gender_enc", "activity_enc", "fitness_enc"]]
y = df["label_enc"]

X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)
rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
rf.fit(X_tr, y_tr)
print(f"   Accuracy: {accuracy_score(y_te, rf.predict(X_te)):.3f} OK")

joblib.dump(rf,             os.path.join(MODEL_DIR, "workout_rf.pkl"))
joblib.dump(label_encoders, os.path.join(MODEL_DIR, "label_encoders.pkl"))

# ─── 2. BMI Classification (Logistic Regression) ─────────────────────────────
print("\n[2/3] Training BMI Classification Model …")

weights    = np.random.uniform(40, 160, N)
heights    = np.random.uniform(145, 200, N)
ages       = np.random.randint(15, 70, N)
genders_01 = np.random.choice([0, 1], N)
bmis       = weights / ((heights / 100) ** 2)

def bmi_label(b):
    if b < 18.5: return 0
    if b < 25:   return 1
    if b < 30:   return 2
    return 3

y_bmi = np.array([bmi_label(b) for b in bmis])
X_bmi = np.column_stack([bmis, ages, genders_01])

X_tr_b, X_te_b, y_tr_b, y_te_b = train_test_split(X_bmi, y_bmi, test_size=0.2, random_state=42)
bmi_pipe = Pipeline([("sc", StandardScaler()), ("lr", LogisticRegression(max_iter=1000))])
bmi_pipe.fit(X_tr_b, y_tr_b)
print(f"   Accuracy: {accuracy_score(y_te_b, bmi_pipe.predict(X_te_b)):.3f} OK")

joblib.dump(bmi_pipe, os.path.join(MODEL_DIR, "bmi_lr.pkl"))

# ─── 3. Calorie Burn (Linear Regression) ─────────────────────────────────────
print("\n[3/3] Training Calorie Burn Model …")

MET_BASE = [7, 5, 3, 9, 6, 9, 7]   # cardio strength yoga hiit cycling running swimming
MET_MULT = [0.7, 1.0, 1.3]          # low moderate high

ex_idx     = np.random.randint(0, 7, N)
dur        = np.random.randint(10, 90, N)
intensity  = np.random.randint(0, 3, N)
cal_w      = np.random.uniform(40, 150, N)
cal_h      = np.random.uniform(145, 200, N)
cal_a      = np.random.randint(15, 70, N)
cal_g      = np.random.choice([0, 1], N)

met_vals = np.array([MET_BASE[e] * MET_MULT[i] for e, i in zip(ex_idx, intensity)])
cal_y    = np.clip(met_vals * cal_w * (dur / 60) + np.random.normal(0, 15, N), 0, None)
X_cal    = np.column_stack([cal_w, cal_h, cal_a, cal_g, ex_idx, dur, intensity])

X_tr_c, X_te_c, y_tr_c, y_te_c = train_test_split(X_cal, cal_y, test_size=0.2, random_state=42)
cal_pipe = Pipeline([("sc", StandardScaler()), ("lr", LinearRegression())])
cal_pipe.fit(X_tr_c, y_tr_c)
print(f"   R2 Score: {r2_score(y_te_c, cal_pipe.predict(X_te_c)):.3f} OK")

joblib.dump(cal_pipe, os.path.join(MODEL_DIR, "calories_lr.pkl"))

print("\n" + "=" * 50)
print("[DONE] All models trained and saved!")
print(f"   -> {os.path.abspath(MODEL_DIR)}")
