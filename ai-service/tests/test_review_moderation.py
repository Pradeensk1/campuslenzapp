import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = PROJECT_ROOT / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from fastapi.testclient import TestClient
import resend
import notification_service
import moderation_engine
import college_contacts
from api import app, API_KEY, limiter


class ReviewModerationTestSuite(unittest.TestCase):
    """
    Dedicated test suite for POST /moderate/review.
    Verifies legitimate negative reviews pass, profanity is rejected,
    threats trigger safety_review, validations, auth, and rate limits.
    Guarantees no real email sending during tests.
    """

    @classmethod
    def setUpClass(cls):
        # Prevent any real Resend calls globally
        cls._orig_resend_send = resend.Emails.send
        resend.Emails.send = MagicMock(return_value={"id": "mock_review_resend_id"})

        # Prevent real college contacts lookup from reaching real emails
        cls._orig_get_contact = college_contacts.get_verified_contact
        cls.mock_contact = {
            "name": "College Safety Administrator",
            "email": "mock-safety@college-test.edu",
            "verified": True
        }
        college_contacts.get_verified_contact = MagicMock(return_value=cls.mock_contact)

        cls.client = TestClient(app)
        cls.headers = {"x-api-key": API_KEY}

    @classmethod
    def tearDownClass(cls):
        resend.Emails.send = cls._orig_resend_send
        college_contacts.get_verified_contact = cls._orig_get_contact

    def setUp(self):
        limiter.reset()

    # 1. Clean positive review -> publish
    def test_01_clean_positive_review(self):
        mock_rev_analysis = {
            "overall_sentiment": "positive",
            "aspects": [
                {"name": "Faculty", "sentiment": "positive"},
                {"name": "Infrastructure", "sentiment": "positive"}
            ]
        }
        mock_post_analysis = {
            "sentiment": "positive",
            "category": "Faculty",
            "moderation": "normal",
            "college_related": True
        }

        with patch("moderation_engine.analyze_review", return_value=mock_rev_analysis), \
             patch("moderation_engine.analyze_post", return_value=mock_post_analysis):

            res = self.client.post(
                "/moderate/review",
                headers=self.headers,
                json={
                    "review": "The professors are knowledgeable and lab facilities are state of the art.",
                    "author_id": "student_01",
                    "college_id": "college_001"
                }
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["action"], "publish")
            self.assertTrue(data["policy"]["publish"])
            self.assertFalse(data["policy"]["profanity_detected"])
            self.assertEqual(data["policy"]["reason"], "Allowed content")
            self.assertEqual(data["analysis"]["overall_sentiment"], "positive")
            self.assertEqual(len(data["analysis"]["aspects"]), 2)

    # 2. Legitimate negative review -> publish (MUST NOT be rejected)
    def test_02_legitimate_negative_review(self):
        mock_rev_analysis = {
            "overall_sentiment": "negative",
            "aspects": [
                {"name": "Hostel", "sentiment": "negative"}
            ]
        }
        mock_post_analysis = {
            "sentiment": "negative",
            "category": "Hostel",
            "moderation": "normal",
            "college_related": True
        }

        with patch("moderation_engine.analyze_review", return_value=mock_rev_analysis), \
             patch("moderation_engine.analyze_post", return_value=mock_post_analysis):

            res = self.client.post(
                "/moderate/review",
                headers=self.headers,
                json={
                    "review": "The hostel rooms are small and maintenance is poor.",
                    "author_id": "student_02",
                    "college_id": "college_001"
                }
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            # Must remain publish because legitimate negative feedback is allowed
            self.assertEqual(data["action"], "publish")
            self.assertTrue(data["policy"]["publish"])
            self.assertFalse(data["policy"]["profanity_detected"])
            self.assertEqual(data["analysis"]["overall_sentiment"], "negative")

    # 3. Review containing profanity -> reject
    def test_03_review_with_profanity(self):
        mock_rev_analysis = {
            "overall_sentiment": "negative",
            "aspects": [
                {"name": "Faculty", "sentiment": "negative"}
            ]
        }
        mock_post_analysis = {
            "sentiment": "negative",
            "category": "Faculty",
            "moderation": "normal",
            "college_related": True
        }

        with patch("moderation_engine.analyze_review", return_value=mock_rev_analysis), \
             patch("moderation_engine.analyze_post", return_value=mock_post_analysis):

            res = self.client.post(
                "/moderate/review",
                headers=self.headers,
                json={
                    "review": "The professor is an asshole and this college is complete bullshit.",
                    "author_id": "student_03",
                    "college_id": "college_001"
                }
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["action"], "reject")
            self.assertFalse(data["policy"]["publish"])
            self.assertTrue(data["policy"]["profanity_detected"])
            self.assertEqual(data["policy"]["reason"], "Prohibited profanity")

    # 4. Review containing a serious threat -> safety_review
    def test_04_review_with_serious_threat(self):
        mock_rev_analysis = {
            "overall_sentiment": "negative",
            "aspects": []
        }
        mock_post_analysis = {
            "sentiment": "negative",
            "category": "General",
            "moderation": "potentially_harmful",
            "college_related": True
        }
        mock_email_result = {
            "notification_id": "notification_rev_threat",
            "email_id": "mock_email_rev_threat",
            "status": "sent",
            "sent_at": "2026-09-28T12:00:00Z"
        }

        with patch("moderation_engine.analyze_review", return_value=mock_rev_analysis), \
             patch("moderation_engine.analyze_post", return_value=mock_post_analysis), \
             patch("moderation_engine.send_college_notification", return_value=mock_email_result) as mock_send:

            res = self.client.post(
                "/moderate/review",
                headers=self.headers,
                json={
                    "review": "I will bring a weapon to campus and kill the professors tomorrow.",
                    "author_id": "dangerous_reviewer",
                    "college_id": "college_001"
                }
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["action"], "safety_review")
            self.assertFalse(data["policy"]["publish"])
            self.assertEqual(data["policy"]["reason"], "Potentially harmful content")
            self.assertIn("safety_incident", data)
            self.assertEqual(data["safety_incident"]["status"], "pending_review")
            self.assertIn("college_notification", data)
            mock_send.assert_called_once()
            self.assertIn("email_result", data)

    # 5. Empty review -> validation error
    def test_05_empty_review(self):
        res = self.client.post(
            "/moderate/review",
            headers=self.headers,
            json={"review": ""}
        )
        self.assertEqual(res.status_code, 422)

    # 6. Whitespace-only review -> validation error
    def test_06_whitespace_review(self):
        res = self.client.post(
            "/moderate/review",
            headers=self.headers,
            json={"review": "    "}
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("cannot be empty", res.json().get("detail", ""))

    # 7. Oversized review -> validation error
    def test_07_oversized_review(self):
        oversized = "R" * 5001
        res = self.client.post(
            "/moderate/review",
            headers=self.headers,
            json={"review": oversized}
        )
        self.assertEqual(res.status_code, 422)

    # 8. Missing API key -> 401
    def test_08_missing_api_key(self):
        res = self.client.post(
            "/moderate/review",
            json={"review": "Great college with helpful teachers."}
        )
        self.assertEqual(res.status_code, 401)
        self.assertIn("API key required", res.json().get("detail", ""))

    # 9. Wrong API key -> 403
    def test_09_wrong_api_key(self):
        res = self.client.post(
            "/moderate/review",
            headers={"x-api-key": "invalid_wrong_key"},
            json={"review": "Great college with helpful teachers."}
        )
        self.assertEqual(res.status_code, 403)
        self.assertIn("Invalid API key", res.json().get("detail", ""))

    # 10. Existing /analyze/review regression -> existing behavior unchanged
    def test_10_analyze_review_regression(self):
        mock_analysis = {
            "overall_sentiment": "positive",
            "aspects": [{"name": "Academics", "sentiment": "positive"}]
        }
        with patch("api.analyze_review", return_value=mock_analysis):
            res = self.client.post(
                "/analyze/review",
                headers=self.headers,
                json={"review": "The curriculum is well structured."}
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            # Must contain original keys
            self.assertIn("overall_sentiment", data)
            self.assertIn("aspects", data)
            # Must NOT contain moderation keys
            self.assertNotIn("action", data)
            self.assertNotIn("policy", data)
            self.assertNotIn("safety_incident", data)

    # 11. Existing /moderate/post regression -> existing behavior unchanged
    def test_11_moderate_post_regression(self):
        mock_post = {
            "sentiment": "positive",
            "category": "Infrastructure",
            "moderation": "normal",
            "college_related": True
        }
        with patch("moderation_engine.analyze_post", return_value=mock_post):
            res = self.client.post(
                "/moderate/post",
                headers=self.headers,
                json={
                    "post": "The campus grounds are clean and well maintained.",
                    "author_id": "user_123",
                    "college_id": "college_001"
                }
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["action"], "publish")
            self.assertIn("analysis", data)
            self.assertIn("policy", data)

    # 12. Rate-limit behavior -> 30 allowed, 31st returns 429
    def test_12_rate_limit_behavior(self):
        limiter.reset()

        mock_rev_analysis = {
            "overall_sentiment": "positive",
            "aspects": [{"name": "Faculty", "sentiment": "positive"}]
        }
        mock_post_analysis = {
            "sentiment": "positive",
            "category": "Faculty",
            "moderation": "normal",
            "college_related": True
        }

        with patch("moderation_engine.analyze_review", return_value=mock_rev_analysis), \
             patch("moderation_engine.analyze_post", return_value=mock_post_analysis):

            for i in range(30):
                res = self.client.post(
                    "/moderate/review",
                    headers=self.headers,
                    json={"review": f"Review number {i+1}"}
                )
                self.assertEqual(
                    res.status_code, 200,
                    f"Request {i+1} failed with {res.status_code}"
                )

            # 31st request must trigger 429
            res_31 = self.client.post(
                "/moderate/review",
                headers=self.headers,
                json={"review": "Review number 31"}
            )
            self.assertEqual(res_31.status_code, 429)
            self.assertIn("Rate limit exceeded", res_31.json().get("error", ""))


if __name__ == "__main__":
    unittest.main()
