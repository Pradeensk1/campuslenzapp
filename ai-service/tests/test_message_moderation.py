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


class MessageModerationTestSuite(unittest.TestCase):
    """
    Dedicated test suite for POST /moderate/message.
    Verifies allow/reject/safety_review actions, privacy safeguards,
    profanity rejection, spam rejection, threat handling, validations,
    auth, regressions, and rate limits.
    """

    @classmethod
    def setUpClass(cls):
        # Global safety guard: prevent any real Resend calls
        cls._orig_resend_send = resend.Emails.send
        resend.Emails.send = MagicMock(return_value={"id": "mock_msg_resend_id"})

        # Global safety guard: mock verified contact
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

    # 1. Clean message -> allow
    def test_01_clean_message(self):
        mock_msg_analysis = {
            "sentiment": "neutral",
            "category": "general",
            "moderation": "normal"
        }

        with patch("moderation_engine.analyze_message", return_value=mock_msg_analysis):
            res = self.client.post(
                "/moderate/message",
                headers=self.headers,
                json={
                    "message": "Hey, are we still meeting in the library at 5 PM?",
                    "sender_id": "usr_sender_01",
                    "recipient_id": "usr_recipient_02"
                }
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["action"], "allow")
            self.assertTrue(data["policy"]["publish"])
            self.assertFalse(data["policy"]["profanity_detected"])
            self.assertEqual(data["policy"]["reason"], "Allowed content")
            self.assertEqual(data["sender_id"], "usr_sender_01")
            self.assertEqual(data["recipient_id"], "usr_recipient_02")
            self.assertNotIn("safety_incident", data)
            self.assertNotIn("college_notification", data)

    # 2. Normal disagreement -> allow (must NOT be treated as harmful)
    def test_02_normal_disagreement(self):
        mock_msg_analysis = {
            "sentiment": "negative",
            "category": "academic",
            "moderation": "normal"
        }

        with patch("moderation_engine.analyze_message", return_value=mock_msg_analysis):
            res = self.client.post(
                "/moderate/message",
                headers=self.headers,
                json={
                    "message": "I don't agree with your solution to question 3.",
                    "sender_id": "usr_sender_01",
                    "recipient_id": "usr_recipient_02"
                }
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["action"], "allow")
            self.assertTrue(data["policy"]["publish"])
            self.assertNotIn("safety_incident", data)

    # 3. Negative but ordinary message -> allow
    def test_03_negative_but_ordinary_message(self):
        mock_msg_analysis = {
            "sentiment": "negative",
            "category": "personal",
            "moderation": "normal"
        }

        with patch("moderation_engine.analyze_message", return_value=mock_msg_analysis):
            res = self.client.post(
                "/moderate/message",
                headers=self.headers,
                json={
                    "message": "Stop messaging me, I am stressed and preparing for exams.",
                    "sender_id": "usr_sender_01",
                    "recipient_id": "usr_recipient_02"
                }
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["action"], "allow")
            self.assertNotIn("safety_incident", data)

    # 4. Message containing profanity -> reject
    def test_04_message_with_profanity(self):
        mock_msg_analysis = {
            "sentiment": "negative",
            "category": "personal",
            "moderation": "normal"
        }

        with patch("moderation_engine.analyze_message", return_value=mock_msg_analysis):
            res = self.client.post(
                "/moderate/message",
                headers=self.headers,
                json={
                    "message": "You are a complete asshole.",
                    "sender_id": "usr_sender_01",
                    "recipient_id": "usr_recipient_02"
                }
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["action"], "reject")
            self.assertFalse(data["policy"]["publish"])
            self.assertTrue(data["policy"]["profanity_detected"])
            self.assertEqual(data["policy"]["policy_result"], "reject")
            self.assertEqual(data["policy"]["reason"], "Prohibited profanity")
            self.assertNotIn("safety_incident", data)

    # 5. Promotional / spam message -> reject
    def test_05_promotional_spam_message(self):
        mock_msg_analysis = {
            "sentiment": "neutral",
            "category": "spam",
            "moderation": "spam"
        }

        with patch("moderation_engine.analyze_message", return_value=mock_msg_analysis):
            res = self.client.post(
                "/moderate/message",
                headers=self.headers,
                json={
                    "message": "Win free gift vouchers instantly! Visit http://free-gifts.xyz now!",
                    "sender_id": "spammer_99",
                    "recipient_id": "usr_recipient_02"
                }
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["action"], "reject")
            self.assertFalse(data["policy"]["publish"])
            self.assertEqual(data["policy"]["policy_result"], "reject")
            self.assertEqual(data["policy"]["reason"], "Spam")
            self.assertNotIn("safety_incident", data)

    # 6. Explicit violent threat -> safety_review + safety incident record created
    # Privacy safeguard: NO college administrator notification sent for private messages
    def test_06_explicit_violent_threat(self):
        mock_msg_analysis = {
            "sentiment": "negative",
            "category": "threat",
            "moderation": "potentially_harmful"
        }

        with patch("moderation_engine.analyze_message", return_value=mock_msg_analysis):
            res = self.client.post(
                "/moderate/message",
                headers=self.headers,
                json={
                    "message": "I am going to hurt you tomorrow after class.",
                    "sender_id": "usr_threat_sender",
                    "recipient_id": "usr_target_student"
                }
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["action"], "safety_review")
            self.assertFalse(data["policy"]["publish"])
            self.assertEqual(data["policy"]["policy_result"], "safety_review")
            self.assertEqual(data["policy"]["reason"], "Potentially harmful content")

            # Preserves sender and recipient IDs
            self.assertEqual(data["sender_id"], "usr_threat_sender")
            self.assertEqual(data["recipient_id"], "usr_target_student")

            # Safety incident created for internal review
            self.assertIn("safety_incident", data)
            incident = data["safety_incident"]
            self.assertIn("incident_id", incident)
            self.assertEqual(incident["author_id"], "usr_threat_sender")
            self.assertEqual(incident["sender_id"], "usr_threat_sender")
            self.assertEqual(incident["recipient_id"], "usr_target_student")
            self.assertEqual(incident["status"], "pending_review")

            # Privacy rule: NO college notification triggered for private messages
            self.assertNotIn("college_notification", data)
            self.assertNotIn("email_result", data)

    # 7. Whitespace-only and empty message validation
    def test_07_empty_and_whitespace_message(self):
        # Empty string -> 422 via Pydantic min_length
        res_empty = self.client.post(
            "/moderate/message",
            headers=self.headers,
            json={"message": ""}
        )
        self.assertEqual(res_empty.status_code, 422)

        # Whitespace-only string -> 400 via validate_text
        res_whitespace = self.client.post(
            "/moderate/message",
            headers=self.headers,
            json={"message": "    \n\t  "}
        )
        self.assertEqual(res_whitespace.status_code, 400)
        self.assertIn("Message cannot be empty.", res_whitespace.json().get("detail", ""))

    # 8. Message over 5000 characters -> 422
    def test_08_oversized_message(self):
        oversized = "M" * 5001
        res = self.client.post(
            "/moderate/message",
            headers=self.headers,
            json={"message": oversized}
        )
        self.assertEqual(res.status_code, 422)

    # 9. Missing API key -> 401
    def test_09_missing_api_key(self):
        res = self.client.post(
            "/moderate/message",
            json={"message": "Hello there"}
        )
        self.assertEqual(res.status_code, 401)
        self.assertIn("API key required", res.json().get("detail", ""))

    # 10. Wrong API key -> 403
    def test_10_wrong_api_key(self):
        res = self.client.post(
            "/moderate/message",
            headers={"x-api-key": "invalid-wrong-key"},
            json={"message": "Hello there"}
        )
        self.assertEqual(res.status_code, 403)
        self.assertIn("Invalid API key", res.json().get("detail", ""))

    # 11. Existing /moderate/post regression check
    def test_11_moderate_post_regression(self):
        mock_post_analysis = {
            "sentiment": "positive",
            "category": "General",
            "moderation": "normal",
            "college_related": True
        }
        with patch("moderation_engine.analyze_post", return_value=mock_post_analysis):
            res = self.client.post(
                "/moderate/post",
                headers=self.headers,
                json={"post": "Great day on campus today!"}
            )
            self.assertEqual(res.status_code, 200)
            self.assertEqual(res.json()["action"], "publish")

    # 12. Existing /moderate/review regression check
    def test_12_moderate_review_regression(self):
        mock_rev_analysis = {
            "overall_sentiment": "positive",
            "aspects": [{"name": "Faculty", "sentiment": "positive"}]
        }
        mock_post_eval = {
            "sentiment": "positive",
            "category": "Faculty",
            "moderation": "normal",
            "college_related": True
        }
        with patch("moderation_engine.analyze_review", return_value=mock_rev_analysis), \
             patch("moderation_engine.analyze_post", return_value=mock_post_eval):
            res = self.client.post(
                "/moderate/review",
                headers=self.headers,
                json={"review": "The teachers are extremely supportive."}
            )
            self.assertEqual(res.status_code, 200)
            self.assertEqual(res.json()["action"], "publish")

    # 13. Existing /analyze/post regression check
    def test_13_analyze_post_regression(self):
        mock_post_analysis = {
            "sentiment": "positive",
            "category": "General",
            "moderation": "normal",
            "college_related": True
        }
        with patch("api.analyze_post", return_value=mock_post_analysis):
            res = self.client.post(
                "/analyze/post",
                headers=self.headers,
                json={"post": "Campus sports day was well organized."}
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["sentiment"], "positive")
            self.assertEqual(data["moderation"], "normal")

    # 14. Existing /analyze/review regression check
    def test_14_analyze_review_regression(self):
        mock_rev_analysis = {
            "overall_sentiment": "positive",
            "aspects": [{"name": "Academics", "sentiment": "positive"}]
        }
        with patch("api.analyze_review", return_value=mock_rev_analysis):
            res = self.client.post(
                "/analyze/review",
                headers=self.headers,
                json={"review": "The computer science syllabus is modern and practical."}
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["overall_sentiment"], "positive")

    # 15. Rate limiting at 30/minute
    def test_15_rate_limit_behavior(self):
        mock_msg_analysis = {
            "sentiment": "neutral",
            "category": "general",
            "moderation": "normal"
        }
        with patch("moderation_engine.analyze_message", return_value=mock_msg_analysis):
            for i in range(30):
                res = self.client.post(
                    "/moderate/message",
                    headers=self.headers,
                    json={"message": f"Test ping message number {i}"}
                )
                self.assertEqual(res.status_code, 200, f"Request {i+1} failed unexpectedly.")

            res_31 = self.client.post(
                "/moderate/message",
                headers=self.headers,
                json={"message": "Exceeding rate limit message"}
            )
            self.assertEqual(res_31.status_code, 429)


if __name__ == "__main__":
    unittest.main()
