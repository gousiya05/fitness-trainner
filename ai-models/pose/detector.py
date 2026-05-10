"""
MediaPipe Pose Detector — wraps MediaPipe to extract landmarks.
"""

import numpy as np

try:
    import mediapipe as mp
    import cv2
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False


class PoseDetector:
    """Detects body landmarks using MediaPipe Pose."""

    def __init__(self, static_image_mode: bool = False, model_complexity: int = 1):
        if MEDIAPIPE_AVAILABLE:
            self.mp_pose = mp.solutions.pose
            self.pose = self.mp_pose.Pose(
                static_image_mode=static_image_mode,
                model_complexity=model_complexity,
                smooth_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5,
            )
        else:
            self.pose = None

    def detect(self, frame: np.ndarray) -> dict | None:
        """
        Process a BGR frame and return normalized landmarks dict.
        Returns None if no pose detected or MediaPipe unavailable.
        """
        if not MEDIAPIPE_AVAILABLE or self.pose is None:
            return None

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(rgb)

        if not results.pose_landmarks:
            return None

        landmarks = {}
        for idx, lm in enumerate(results.pose_landmarks.landmark):
            landmarks[str(idx)] = {
                "x": round(lm.x, 4),
                "y": round(lm.y, 4),
                "z": round(lm.z, 4),
                "visibility": round(lm.visibility, 4),
            }
        return landmarks

    def get_landmark_names(self) -> list:
        if MEDIAPIPE_AVAILABLE:
            return [lm.name for lm in self.mp_pose.PoseLandmark]
        return []

    def calculate_angle(self, a: dict, b: dict, c: dict) -> float:
        """Calculate angle at point b formed by a-b-c."""
        a_arr = np.array([a["x"], a["y"]])
        b_arr = np.array([b["x"], b["y"]])
        c_arr = np.array([c["x"], c["y"]])

        ba = a_arr - b_arr
        bc = c_arr - b_arr

        cos_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-8)
        cos_angle = np.clip(cos_angle, -1.0, 1.0)
        return float(np.degrees(np.arccos(cos_angle)))
