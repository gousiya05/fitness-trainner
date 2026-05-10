"""
ai-models/utils/helpers.py
Shared helpers used across the AI microservice.
"""

def bmi_category(bmi: float) -> dict:
    """Return BMI category, health risk, and display colour."""
    if bmi < 18.5:
        return {"category": "Underweight", "risk": "Low",       "color": "#60a5fa"}
    if bmi < 25:
        return {"category": "Normal",      "risk": "Minimal",   "color": "#34d399"}
    if bmi < 30:
        return {"category": "Overweight",  "risk": "Moderate",  "color": "#fbbf24"}
    if bmi < 35:
        return {"category": "Obese I",     "risk": "High",      "color": "#f87171"}
    return     {"category": "Obese II+",   "risk": "Very High", "color": "#dc2626"}


def calculate_bmr(weight: float, height: float, age: int, gender: str) -> float:
    """Mifflin–St Jeor BMR (kcal/day)."""
    if gender.lower() == "male":
        return 88.36 + 13.4 * weight + 4.8 * height - 5.7 * age
    return 447.6 + 9.2 * weight + 3.1 * height - 4.3 * age


def decode_frame(frame_base64: str):
    """Decode a base64 JPEG/PNG string to an OpenCV BGR image."""
    import base64
    import numpy as np
    import cv2

    img_data = base64.b64decode(frame_base64)
    nparr    = np.frombuffer(img_data, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
