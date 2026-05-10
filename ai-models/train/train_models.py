"""
Train all ML models and save as .pkl files.
Run this script once before starting the AI service.
"""

import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, r2_score
import joblib

MODEL_DIR = os.environ.get("MODEL_DIR", os.path.join(os.path.dirname(__file__), "..", "models"))
os.makedirs(MODEL_DIR, exist_ok=True)

print("🏋️  AI Fitness Trainer — Model Training")
print("=" * 50)

# ─── 1. Workout Recommendation (Random Forest) ───────────────────────────────
print("\n[1/3] Training Workout Recommendation Model (Random Forest)...")

np.random.seed(42)
N = 5000

goals = ["weight_loss", "muscle_gain", "endurance", "flexibility", "general"]
activity_levels = ["sedentary", "light", "moderate", "active", "very_active"]
fitness_levels = ["beginner", "intermediate", "advanced"]
genders = ["male", "female"]

workout_data = pd.DataFrame({
    "age": np.random.randint(15, 70, N),
    "weight": np.random.uniform(40, 150, N),
    "height": np.random.uniform(145, 200, N),
    "gender": np.random.choice(genders, N),
    "goal": np.random.choice(goals, N),
    "activity_level": np.random.choice(activity_levels, N),
    "fitness_level": np.random.choice(fitness_levels, N),
})
workout_data["label"] = workout_data["goal"]  # simplified: predict goal category

le_gender = LabelEncoder().fit(genders)
le_goal = LabelEncoder().fit(goals)
le_activity = LabelEncoder().fit(activity_levels)
le_fitness = LabelEncoder().fit(fitness_levels)

label_encoders = {
    "gender": le_gender,
    "goal": le_goal,
    "activity_level": le_activity,
    "fitness_level": le_fitness,
}

workout_data["gender_enc"] = le_gender.transform(workout_data["gender"])
workout_data["goal_enc"] = le_goal.transform(workout_data["goal"])
workout_data["activity_enc"] = le_activity.transform(workout_data["activity_level"])
workout_data["fitness_enc"] = le_fitness.transform(workout_data["fitness_level"])
workout_data["label_enc"] = le_goal.transform(workout_data["label"])

features = ["age", "weight", "height", "gender_enc", "activity_enc", "fitness_enc"]
X_w = workout_data[features]
y_w = workout_data["label_enc"]

X_train, X_test, y_train, y_test = train_test_split(X_w, y_w, test_size=0.2, random_state=42)
rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
rf.fit(X_train, y_train)
acc = accuracy_score(y_test, rf.predict(X_test))
print(f"   Accuracy: {acc:.3f} ✅")

joblib.dump(rf, os.path.join(MODEL_DIR, "workout_rf.pkl"))
joblib.dump(label_encoders, os.path.join(MODEL_DIR, "label_encoders.pkl"))
print(f"   Saved: {MODEL_DIR}/workout_rf.pkl")

# ─── 2. BMI Category (Logistic Regression) ───────────────────────────────────
print("\n[2/3] Training BMI Category Model (Logistic Regression)...")

weights = np.random.uniform(40, 160, N)
heights = np.random.uniform(145, 200, N)
ages = np.random.randint(15, 70, N)
gender_arr = np.random.choice([0, 1], N)  # 0=female, 1=male

bmis = weights / ((heights / 100) ** 2)

def bmi_to_category(bmi):
    if bmi < 18.5:
        return 0  # underweight
    elif bmi < 25:
        return 1  # normal
    elif bmi < 30:
        return 2  # overweight
    else:
        return 3  # obese

bmi_labels = np.array([bmi_to_category(b) for b in bmis])

bmi_features = np.column_stack([bmis, ages, gender_arr])
X_train_b, X_test_b, y_train_b, y_test_b = train_test_split(bmi_features, bmi_labels, test_size=0.2, random_state=42)

bmi_pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("lr", LogisticRegression(max_iter=1000, random_state=42)),
])
bmi_pipeline.fit(X_train_b, y_train_b)
bmi_acc = accuracy_score(y_test_b, bmi_pipeline.predict(X_test_b))
print(f"   Accuracy: {bmi_acc:.3f} ✅")

joblib.dump(bmi_pipeline, os.path.join(MODEL_DIR, "bmi_lr.pkl"))
print(f"   Saved: {MODEL_DIR}/bmi_lr.pkl")

# ─── 3. Calorie Burn (Linear Regression) ─────────────────────────────────────
print("\n[3/3] Training Calorie Burn Model (Linear Regression)...")

exercise_types = ["cardio", "strength", "yoga", "hiit", "cycling", "running", "swimming"]
intensities = ["low", "moderate", "high"]

cal_weights = np.random.uniform(40, 150, N)
cal_heights = np.random.uniform(145, 200, N)
cal_ages = np.random.randint(15, 70, N)
cal_genders = np.random.choice([0, 1], N)
cal_ex = np.random.randint(0, len(exercise_types), N)
cal_dur = np.random.randint(10, 90, N)
cal_intensity = np.random.randint(0, 3, N)

MET_BASE = [7, 5, 3, 9, 6, 9, 7]  # base METs
MET_MULT = [0.7, 1.0, 1.3]       # intensity multipliers

met_values = np.array([MET_BASE[e] * MET_MULT[i] for e, i in zip(cal_ex, cal_intensity)])
cal_burned = met_values * cal_weights * (cal_dur / 60) + np.random.normal(0, 15, N)
cal_burned = np.clip(cal_burned, 0, None)

cal_features = np.column_stack([cal_weights, cal_heights, cal_ages, cal_genders, cal_ex, cal_dur, cal_intensity])
X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(cal_features, cal_burned, test_size=0.2, random_state=42)

cal_pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("lr", LinearRegression()),
])
cal_pipeline.fit(X_train_c, y_train_c)
cal_r2 = r2_score(y_test_c, cal_pipeline.predict(X_test_c))
print(f"   R² Score: {cal_r2:.3f} ✅")

joblib.dump(cal_pipeline, os.path.join(MODEL_DIR, "calories_lr.pkl"))
print(f"   Saved: {MODEL_DIR}/calories_lr.pkl")

print("\n" + "=" * 50)
print("✅ All models trained and saved successfully!")
print(f"   Model directory: {os.path.abspath(MODEL_DIR)}")
