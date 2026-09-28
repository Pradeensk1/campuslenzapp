import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock

# Ensure src/ is on sys.path
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


class CampusLenzApiTestSuite(unittest.TestCase):
    """
    Automated regression and verification test suite for CampusLenzAI API.
    Guarantees no real email sending, mocks notification delivery,
    and resets rate limits per test.
    """

    @classmethod
    def setUpClass(cls):
        # Global safety guard: prevent any real Resend calls throughout the test suite
        cls._resend_send_orig = resend.Emails.send
        resend.Emails.send = MagicMock(return_value={"id": "mock_global_resend_id"})

        # Global safety guard: prevent any real college contacts from receiving messages
        cls._orig_get_contact = college_contacts.get_verified_contact
        cls.mock_contact = {
            "name": "Mock Test Administrator",
            "email": "mock-safety@college-test.edu",
            "verified": True
        }
        college_contacts.get_verified_contact = MagicMock(return_value=cls.mock_contact)

        cls.client = TestClient(app)
        cls.headers = {"x-api-key": API_KEY}

    @classmethod
    def tearDownClass(cls):
        resend.Emails.send = cls._resend_send_orig
        college_contacts.get_verified_contact = cls._orig_get_contact

    def setUp(self):
        # Reset limiter before every test to prevent cross-test rate limit interference
        limiter.reset()

    # -------------------------------------------------------------
    # 1. GET /
    # -------------------------------------------------------------
    def test_01_root_endpoint(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        expected = {
            "service": "Campus Lenz AI",
            "status": "running",
            "version": "1.0.0"
        }
        self.assertEqual(response.json(), expected)

    # -------------------------------------------------------------
    # 2. GET /health
    # -------------------------------------------------------------
    def test_02_health_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "healthy"})

    # -------------------------------------------------------------
    # 3. Authentication
    # -------------------------------------------------------------
    def test_03_auth_missing_api_key(self):
        response = self.client.post(
            "/analyze/review",
            json={"review": "Great college with helpful faculty."}
        )
        self.assertEqual(response.status_code, 401)
        self.assertIn("API key required", response.json().get("detail", ""))

    def test_04_auth_incorrect_api_key(self):
        response = self.client.post(
            "/analyze/review",
            headers={"x-api-key": "invalid_test_key_123"},
            json={"review": "Great college with helpful faculty."}
        )
        self.assertEqual(response.status_code, 403)
        self.assertIn("Invalid API key", response.json().get("detail", ""))

    # -------------------------------------------------------------
    # 4. Review API
    # -------------------------------------------------------------
    def test_05_review_valid_request(self):
        response = self.client.post(
            "/analyze/review",
            headers=self.headers,
            json={"review": "The computer science professors explain concepts clearly and the library is great."}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("overall_sentiment", data)
        self.assertIn("aspects", data)
        self.assertIsInstance(data["aspects"], list)

    def test_06_review_empty_or_whitespace(self):
        # Whitespace-only string -> 400
        res_whitespace = self.client.post(
            "/analyze/review",
            headers=self.headers,
            json={"review": "    "}
        )
        self.assertEqual(res_whitespace.status_code, 400)
        self.assertIn("cannot be empty", res_whitespace.json().get("detail", ""))

        # Empty string -> 422 from Pydantic min_length
        res_empty = self.client.post(
            "/analyze/review",
            headers=self.headers,
            json={"review": ""}
        )
        self.assertEqual(res_empty.status_code, 422)

    def test_07_review_oversized(self):
        oversized = "A" * 5001
        response = self.client.post(
            "/analyze/review",
            headers=self.headers,
            json={"review": oversized}
        )
        self.assertEqual(response.status_code, 422)

    # -------------------------------------------------------------
    # 5. Post API
    # -------------------------------------------------------------
    def test_08_post_valid_request(self):
        response = self.client.post(
            "/analyze/post",
            headers=self.headers,
            json={"post": "The campus robotics club is hosting an orientation tomorrow in the main hall."}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        for field in ["sentiment", "category", "moderation", "college_related"]:
            self.assertIn(field, data)

    def test_09_post_empty_or_whitespace(self):
        res_whitespace = self.client.post(
            "/analyze/post",
            headers=self.headers,
            json={"post": "   "}
        )
        self.assertEqual(res_whitespace.status_code, 400)

        res_empty = self.client.post(
            "/analyze/post",
            headers=self.headers,
            json={"post": ""}
        )
        self.assertEqual(res_empty.status_code, 422)

    def test_10_post_oversized(self):
        oversized = "B" * 5001
        response = self.client.post(
            "/analyze/post",
            headers=self.headers,
            json={"post": oversized}
        )
        self.assertEqual(response.status_code, 422)

    # -------------------------------------------------------------
    # 6. Summary API
    # -------------------------------------------------------------
    def test_11_summary_valid_request(self):
        reviews = [
            "The professors are knowledgeable and supportive.",
            "Hostel food quality needs improvement.",
            "Campus placement opportunities are decent."
        ]
        response = self.client.post(
            "/analyze/summary",
            headers=self.headers,
            json={"college_id": "college_001", "reviews": reviews}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("summary", data)
        self.assertIn("positive_points", data)
        self.assertIn("negative_points", data)
        self.assertIn("aspect_summary", data)

    def test_12_summary_empty_reviews(self):
        # Empty list -> 400
        res_empty_list = self.client.post(
            "/analyze/summary",
            headers=self.headers,
            json={"college_id": "college_001", "reviews": []}
        )
        self.assertEqual(res_empty_list.status_code, 400)
        self.assertIn("At least one review is required", res_empty_list.json().get("detail", ""))

        # List with only whitespace -> 400
        res_whitespace = self.client.post(
            "/analyze/summary",
            headers=self.headers,
            json={"college_id": "college_001", "reviews": ["   ", ""]}
        )
        self.assertEqual(res_whitespace.status_code, 400)
        self.assertIn("No valid reviews provided", res_whitespace.json().get("detail", ""))

    def test_13_summary_more_than_100_reviews(self):
        too_many = ["Good college"] * 101
        response = self.client.post(
            "/analyze/summary",
            headers=self.headers,
            json={"college_id": "college_001", "reviews": too_many}
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Maximum 100 reviews allowed", response.json().get("detail", ""))

    def test_14_summary_review_too_long(self):
        response = self.client.post(
            "/analyze/summary",
            headers=self.headers,
            json={"college_id": "college_001", "reviews": ["Good", "C" * 5001]}
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("One of the reviews is too long", response.json().get("detail", ""))

    # -------------------------------------------------------------
    # 7. Image API
    # -------------------------------------------------------------
    def test_15_image_valid_request(self):
        test_img = PROJECT_ROOT / "tests" / "download.jpg"
        self.assertTrue(test_img.exists(), "Sample test image download.jpg missing")

        with open(test_img, "rb") as f:
            response = self.client.post(
                "/analyze/image",
                headers=self.headers,
                files={"file": (test_img.name, f, "image/jpeg")}
            )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        for field in ["category", "description", "ocr_text", "college_related", "relevance"]:
            self.assertIn(field, data)

    def test_16_image_unsupported_extension_or_mime(self):
        # Unsupported extension
        res_ext = self.client.post(
            "/analyze/image",
            headers=self.headers,
            files={"file": ("test.pdf", b"%PDF-1.4...", "image/jpeg")}
        )
        self.assertEqual(res_ext.status_code, 400)
        self.assertIn("Unsupported image format", res_ext.json().get("detail", ""))

        # Unsupported MIME
        res_mime = self.client.post(
            "/analyze/image",
            headers=self.headers,
            files={"file": ("test.jpg", b"\xFF\xD8\xFF", "application/octet-stream")}
        )
        self.assertEqual(res_mime.status_code, 400)
        self.assertIn("Invalid image content type", res_mime.json().get("detail", ""))

    def test_17_image_empty_and_oversized(self):
        # Empty file -> 400
        res_empty = self.client.post(
            "/analyze/image",
            headers=self.headers,
            files={"file": ("empty.png", b"", "image/png")}
        )
        self.assertEqual(res_empty.status_code, 400)
        self.assertIn("empty", res_empty.json().get("detail", "").lower())

        # Oversized file (> 10MB) -> 413
        oversized_bytes = b"0" * (10 * 1024 * 1024 + 10)
        res_oversized = self.client.post(
            "/analyze/image",
            headers=self.headers,
            files={"file": ("huge.jpg", oversized_bytes, "image/jpeg")}
        )
        self.assertEqual(res_oversized.status_code, 413)

    def test_18_image_tempfile_cleanup(self):
        temp_dir = Path(tempfile.gettempdir())
        before_temps = set(temp_dir.glob("tmp*.jpg"))

        test_img = PROJECT_ROOT / "tests" / "download.jpg"
        with open(test_img, "rb") as f:
            res = self.client.post(
                "/analyze/image",
                headers=self.headers,
                files={"file": ("download.jpg", f, "image/jpeg")}
            )
        self.assertEqual(res.status_code, 200)

        after_temps = set(temp_dir.glob("tmp*.jpg"))
        leaked_temps = after_temps - before_temps
        self.assertEqual(len(leaked_temps), 0, f"Temporary file leak detected: {leaked_temps}")

    # -------------------------------------------------------------
    # 8. Rate Limiting
    # -------------------------------------------------------------
    def test_19_rate_limiting_review_endpoint(self):
        # Reset storage to guarantee a fresh limit window
        limiter.reset()

        # Mock analyze_review to avoid 30 slow Ollama inferences
        mock_analysis = {
            "overall_sentiment": "positive",
            "aspects": [{"name": "Faculty", "sentiment": "positive"}]
        }

        with patch("api.analyze_review", return_value=mock_analysis):
            # Send 30 requests -> all must return 200 OK
            for i in range(30):
                res = self.client.post(
                    "/analyze/review",
                    headers=self.headers,
                    json={"review": f"Campus is great iteration {i}"}
                )
                self.assertEqual(
                    res.status_code, 200,
                    f"Request {i+1}/30 failed unexpectedly with status {res.status_code}"
                )

            # 31st request must trigger 429 Too Many Requests
            res_31 = self.client.post(
                "/analyze/review",
                headers=self.headers,
                json={"review": "Campus is great iteration 31"}
            )
            self.assertEqual(res_31.status_code, 429)
            self.assertIn("Rate limit exceeded", res_31.json().get("error", ""))

    # -------------------------------------------------------------
    # 9. POST /moderate/post (Mocked Notification / Email Layer)
    # -------------------------------------------------------------
    def test_20_moderate_normal_post(self):
        with patch("moderation_engine.send_college_notification") as mock_send:
            response = self.client.post(
                "/moderate/post",
                headers=self.headers,
                json={
                    "post": "The central library has quiet study cubicles and helpful research resources.",
                    "author_id": "test_user_01",
                    "college_id": "college_001"
                }
            )
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data.get("action"), "publish")
            self.assertTrue(data.get("policy", {}).get("publish"))
            self.assertNotIn("sensitive_notification_incident", data)
            self.assertNotIn("safety_incident", data)
            self.assertNotIn("college_notification", data)
            mock_send.assert_not_called()

    def test_21_moderate_spam_post(self):
        with patch("moderation_engine.send_college_notification") as mock_send:
            response = self.client.post(
                "/moderate/post",
                headers=self.headers,
                json={
                    "post": "Buy our premium course today! 90% discount! Contact us now!",
                    "author_id": "spammer_user",
                    "college_id": "college_001"
                }
            )
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data.get("action"), "reject")
            self.assertFalse(data.get("policy", {}).get("publish"))
            self.assertNotIn("sensitive_notification_incident", data)
            self.assertNotIn("safety_incident", data)
            self.assertNotIn("college_notification", data)
            mock_send.assert_not_called()

    def test_22_moderate_sensitive_post(self):
        mock_email_result = {
            "notification_id": "notification_test_123",
            "email_id": "mock_resend_email_id_sensitive",
            "status": "sent",
            "sent_at": "2026-09-28T10:30:00Z"
        }

        with patch("moderation_engine.send_college_notification", return_value=mock_email_result) as mock_send:
            response = self.client.post(
                "/moderate/post",
                headers=self.headers,
                json={
                    "post": "I am dealing with a very private and sensitive personal crisis with a professor that requires confidential assistance.",
                    "author_id": "student_confidential",
                    "college_id": "college_001"
                }
            )
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data.get("action"), "publish")
            self.assertTrue(data.get("policy", {}).get("publish"))

            # Incident verified
            self.assertIn("sensitive_notification_incident", data)
            incident = data["sensitive_notification_incident"]
            self.assertEqual(incident.get("status"), "notification_sent")

            # Notification verified
            self.assertIn("college_notification", data)
            self.assertIsNotNone(data["college_notification"])

            # Mock email call verified
            mock_send.assert_called_once()
            self.assertIn("email_result", data)
            self.assertEqual(data["email_result"]["email_id"], "mock_resend_email_id_sensitive")

    def test_23_moderate_potentially_harmful_post(self):
        mock_email_result = {
            "notification_id": "notification_test_456",
            "email_id": "mock_resend_email_id_harmful",
            "status": "sent",
            "sent_at": "2026-09-28T10:30:00Z"
        }

        with patch("moderation_engine.send_college_notification", return_value=mock_email_result) as mock_send:
            response = self.client.post(
                "/moderate/post",
                headers=self.headers,
                json={
                    "post": "I am going to hurt another student on campus tomorrow.",
                    "author_id": "dangerous_user",
                    "college_id": "college_001"
                }
            )
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data.get("action"), "safety_review")
            self.assertFalse(data.get("policy", {}).get("publish"))

            # Safety Incident verified
            self.assertIn("safety_incident", data)
            incident = data["safety_incident"]
            self.assertEqual(incident.get("status"), "pending_review")

            # Notification verified
            self.assertIn("college_notification", data)
            self.assertIsNotNone(data["college_notification"])

            # Mock email call verified
            mock_send.assert_called_once()
            self.assertIn("email_result", data)
            self.assertEqual(data["email_result"]["email_id"], "mock_resend_email_id_harmful")

    # -------------------------------------------------------------
    # 10. Regression Check: POST /analyze/post schema
    # -------------------------------------------------------------
    def test_24_analyze_post_regression(self):
        response = self.client.post(
            "/analyze/post",
            headers=self.headers,
            json={"post": "The university canteen food is decent and clean."}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Must have exactly these 4 top-level keys
        expected_keys = {"sentiment", "category", "moderation", "college_related"}
        self.assertEqual(set(data.keys()), expected_keys)

        # Ensure no moderation pipeline fields leaked into raw analyzer
        for forbidden in ["action", "policy", "safety_incident", "college_notification"]:
            self.assertNotIn(forbidden, data)


if __name__ == "__main__":
    unittest.main()
