"""
Rep Counter — counts repetitions based on pose landmark movements.
Uses angle-based joint tracking for different exercises.
"""

import numpy as np
from collections import deque


class RepCounter:
    """Counts exercise repetitions using pose landmark angles."""

    EXERCISE_JOINTS = {
        "squat": {
            "joints": [("23", "25", "27"), ("24", "26", "28")],  # left/right knee
            "up_threshold": 160,
            "down_threshold": 100,
        },
        "push_up": {
            "joints": [("11", "13", "15"), ("12", "14", "16")],  # left/right elbow
            "up_threshold": 160,
            "down_threshold": 90,
        },
        "bicep_curl": {
            "joints": [("11", "13", "15"), ("12", "14", "16")],
            "up_threshold": 60,
            "down_threshold": 160,
        },
        "lunge": {
            "joints": [("23", "25", "27")],
            "up_threshold": 160,
            "down_threshold": 90,
        },
        "jumping_jack": {
            "joints": [("11", "13", "15")],
            "up_threshold": 160,
            "down_threshold": 40,
        },
        "general": {
            "joints": [("23", "25", "27")],
            "up_threshold": 160,
            "down_threshold": 100,
        },
    }

    def __init__(self, buffer_size: int = 10):
        self._count = 0
        self._stage = "up"  # "up" or "down"
        self._angle_buffer = deque(maxlen=buffer_size)
        self._exercise = "general"

    def update(self, landmarks: dict, exercise: str = "general") -> int:
        """Update rep count based on new landmarks."""
        self._exercise = exercise.lower().replace(" ", "_")
        config = self.EXERCISE_JOINTS.get(self._exercise, self.EXERCISE_JOINTS["general"])

        angles = []
        for joint_trio in config["joints"]:
            a_key, b_key, c_key = joint_trio
            a = landmarks.get(a_key)
            b = landmarks.get(b_key)
            c = landmarks.get(c_key)
            if a and b and c:
                angle = self._calculate_angle(a, b, c)
                angles.append(angle)

        if not angles:
            return self._count

        avg_angle = np.mean(angles)
        self._angle_buffer.append(avg_angle)
        smooth_angle = np.mean(self._angle_buffer)

        up_thresh = config["up_threshold"]
        down_thresh = config["down_threshold"]

        if smooth_angle > up_thresh and self._stage == "down":
            self._stage = "up"
            self._count += 1
        elif smooth_angle < down_thresh and self._stage == "up":
            self._stage = "down"

        return self._count

    def get_count(self) -> int:
        return self._count

    def reset(self):
        self._count = 0
        self._stage = "up"
        self._angle_buffer.clear()

    @staticmethod
    def _calculate_angle(a: dict, b: dict, c: dict) -> float:
        a_arr = np.array([a["x"], a["y"]])
        b_arr = np.array([b["x"], b["y"]])
        c_arr = np.array([c["x"], c["y"]])
        ba = a_arr - b_arr
        bc = c_arr - b_arr
        cos_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-8)
        return float(np.degrees(np.arccos(np.clip(cos_angle, -1, 1))))
