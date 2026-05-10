"""
Posture Scorer — evaluates body posture from pose landmarks.
Returns a score 0-100 and actionable feedback list.
"""

import numpy as np


class PostureScorer:
    """Scores posture quality using joint angle analysis."""

    def score(self, landmarks: dict) -> tuple[int, list[str]]:
        """
        Returns (score: int 0-100, feedback: list[str])
        """
        issues = []
        score = 100

        # ── Spine alignment ──
        spine_score, spine_issues = self._check_spine(landmarks)
        score -= spine_score
        issues.extend(spine_issues)

        # ── Shoulder symmetry ──
        shoulder_score, shoulder_issues = self._check_shoulders(landmarks)
        score -= shoulder_score
        issues.extend(shoulder_issues)

        # ── Head position ──
        head_score, head_issues = self._check_head(landmarks)
        score -= head_score
        issues.extend(head_issues)

        # ── Hip symmetry ──
        hip_score, hip_issues = self._check_hips(landmarks)
        score -= hip_score
        issues.extend(hip_issues)

        final_score = max(0, min(100, score))

        if not issues:
            issues = ["✅ Excellent posture! Keep it up."]

        return final_score, issues

    def _check_spine(self, lm: dict) -> tuple[int, list]:
        issues = []
        deduction = 0

        left_shoulder = lm.get("11")
        right_shoulder = lm.get("12")
        left_hip = lm.get("23")
        right_hip = lm.get("24")

        if left_shoulder and right_shoulder and left_hip and right_hip:
            # Spine tilt (shoulder mid to hip mid vertical alignment)
            shoulder_mid_x = (left_shoulder["x"] + right_shoulder["x"]) / 2
            hip_mid_x = (left_hip["x"] + right_hip["x"]) / 2
            tilt = abs(shoulder_mid_x - hip_mid_x)

            if tilt > 0.08:
                deduction += 20
                issues.append("⚠️ Lean detected — keep your spine straight and upright")
            elif tilt > 0.04:
                deduction += 10
                issues.append("ℹ️ Slight lateral lean — try to center your weight")

        return deduction, issues

    def _check_shoulders(self, lm: dict) -> tuple[int, list]:
        issues = []
        deduction = 0

        left_shoulder = lm.get("11")
        right_shoulder = lm.get("12")

        if left_shoulder and right_shoulder:
            height_diff = abs(left_shoulder["y"] - right_shoulder["y"])
            if height_diff > 0.06:
                deduction += 15
                issues.append("⚠️ Shoulders are uneven — roll them back and down evenly")
            elif height_diff > 0.03:
                deduction += 7
                issues.append("ℹ️ Slight shoulder imbalance detected")

        return deduction, issues

    def _check_head(self, lm: dict) -> tuple[int, list]:
        issues = []
        deduction = 0

        nose = lm.get("0")
        left_shoulder = lm.get("11")
        right_shoulder = lm.get("12")

        if nose and left_shoulder and right_shoulder:
            shoulder_mid_x = (left_shoulder["x"] + right_shoulder["x"]) / 2
            head_offset = abs(nose["x"] - shoulder_mid_x)

            if head_offset > 0.08:
                deduction += 20
                issues.append("⚠️ Head is tilted — keep your head centered over your spine")
            elif head_offset > 0.04:
                deduction += 10
                issues.append("ℹ️ Slight head tilt — look straight ahead")

            # Forward head posture (nose y relative to shoulders)
            shoulder_avg_y = (left_shoulder["y"] + right_shoulder["y"]) / 2
            if nose["y"] > shoulder_avg_y + 0.05:
                deduction += 15
                issues.append("⚠️ Forward head posture — tuck your chin slightly")

        return deduction, issues

    def _check_hips(self, lm: dict) -> tuple[int, list]:
        issues = []
        deduction = 0

        left_hip = lm.get("23")
        right_hip = lm.get("24")

        if left_hip and right_hip:
            height_diff = abs(left_hip["y"] - right_hip["y"])
            if height_diff > 0.06:
                deduction += 15
                issues.append("⚠️ Hips are uneven — distribute your weight equally")
            elif height_diff > 0.03:
                deduction += 7
                issues.append("ℹ️ Slight hip tilt detected — engage your core")

        return deduction, issues
