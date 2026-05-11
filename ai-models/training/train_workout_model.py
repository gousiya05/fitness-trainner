import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

def generate_synthetic_data(num_samples=5000):
    np.random.seed(42)
    
    # Inputs
    ages = np.random.randint(16, 70, num_samples)
    weights = np.random.uniform(45.0, 120.0, num_samples)
    heights = np.random.uniform(150.0, 200.0, num_samples)
    genders = np.random.choice(['male', 'female'], num_samples)
    goals = np.random.choice(['muscle_gain', 'weight_loss', 'endurance', 'flexibility', 'general'], num_samples)
    activity_levels = np.random.choice(['sedentary', 'light', 'moderate', 'active', 'very_active'], num_samples)
    experiences = np.random.choice(['beginner', 'intermediate', 'advanced'], num_samples)
    
    # Target (Workout Plan ID)
    # 0 to 8 based on goal and experience
    plans = []
    for i in range(num_samples):
        goal = goals[i]
        exp = experiences[i]
        
        if goal == 'muscle_gain':
            if exp == 'beginner': plans.append(0)
            elif exp == 'intermediate': plans.append(1)
            else: plans.append(2)
        elif goal == 'weight_loss':
            if exp == 'beginner': plans.append(3)
            elif exp == 'intermediate': plans.append(4)
            else: plans.append(5)
        else:
            if exp == 'beginner': plans.append(6)
            elif exp == 'intermediate': plans.append(7)
            else: plans.append(8)
            
    df = pd.DataFrame({
        'age': ages,
        'weight': weights,
        'height': heights,
        'gender': genders,
        'goal': goals,
        'activity_level': activity_levels,
        'experience': experiences,
        'plan_id': plans
    })
    
    return df

def train_model():
    print("Generating synthetic data...")
    df = generate_synthetic_data(10000)
    
    # Categorical encoding
    encoders = {}
    cat_cols = ['gender', 'goal', 'activity_level', 'experience']
    
    for col in cat_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        encoders[col] = le
        
    X = df.drop('plan_id', axis=1)
    y = df['plan_id']
    
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X, y)
    
    # Save the model and encoders
    models_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    joblib.dump(model, os.path.join(models_dir, 'workout_rf.pkl'))
    # Saving label_encoders.pkl as expected by api/main.py
    joblib.dump(encoders, os.path.join(models_dir, 'label_encoders.pkl'))
    
    print("Model and encoders saved successfully in ai-models/models/")

if __name__ == "__main__":
    train_model()
