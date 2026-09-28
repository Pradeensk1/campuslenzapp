import unittest
import sys
from pathlib import Path
from unittest.mock import patch

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = PROJECT_ROOT / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from fastapi.testclient import TestClient
from api import app, API_KEY, limiter
from semantic_search import (
    build_searchable_text,
    identify_matched_information,
    SemanticCollegeSearchIndex,
    search_colleges
)
from duplicate_detector import compare_embeddings
from college_data_fixtures import SAMPLE_COLLEGES


class SemanticCollegeSearchTestSuite(unittest.TestCase):
    """
    Unit test suite for Semantic College Search.
    Verifies retrieval relevance, natural language query handling,
    missing data preservation, input validation, similarity ranking,
    and API authentication.
    """

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.headers = {"x-api-key": API_KEY}

    def setUp(self):
        limiter.reset()

    # 1. Exact relevant query
    def test_01_exact_relevant_query(self):
        res = search_colleges("Coimbatore Institute of Technology MCA programs", limit=3)
        self.assertIn("results", res)
        self.assertGreater(len(res["results"]), 0)

        top_match = res["results"][0]
        self.assertEqual(top_match["college_id"], "col_cit")
        self.assertIn("programs", top_match["matched_information"])
        self.assertGreaterEqual(top_match["similarity"], 0.70)

    # 2. Natural-language paraphrase query
    def test_02_natural_language_paraphrase(self):
        query = "affordable engineering colleges in Coimbatore with subsidized government tuition"
        res = search_colleges(query, limit=3)
        self.assertGreater(len(res["results"]), 0)

        # GCT or CIT should rank at the top due to affordable/government-aided fees
        top_ids = [r["college_id"] for r in res["results"]]
        self.assertTrue("col_gct" in top_ids or "col_cit" in top_ids)

        top_match = res["results"][0]
        self.assertIn("fees", top_match["matched_information"])
        self.assertIn("location", top_match["matched_information"])

    # 3. Query matching multiple college attributes
    def test_03_query_matching_multiple_attributes(self):
        query = "colleges near Coimbatore with good placements and affordable fees"
        res = search_colleges(query, limit=5)
        self.assertGreater(len(res["results"]), 0)

        top_match = res["results"][0]
        self.assertIn("placements", top_match["matched_information"])
        self.assertIn("fees", top_match["matched_information"])
        self.assertIn("location", top_match["matched_information"])

    # 4. Query with missing / unknown information
    def test_04_query_with_unknown_information(self):
        query = "astrophysics space observatory with private rocket launchpad"
        res = search_colleges(query, limit=3)
        # Search executes safely and returns generic results without hallucinating rocket launchpads
        self.assertIn("results", res)
        for r in res["results"]:
            # Ensure no astrophysics data was generated
            self.assertNotIn("astrophysics", str(r.get("programs", [])).lower())

    # 5. Empty / invalid query validation
    def test_05_empty_and_invalid_query_validation(self):
        with self.assertRaises(ValueError):
            search_colleges("")

        with self.assertRaises(ValueError):
            search_colleges("   \n\t  ")

    # 6. No matching college data (empty index)
    def test_06_empty_index_handling(self):
        empty_index = SemanticCollegeSearchIndex(colleges=[])
        res = empty_index.search("computer science engineering")
        self.assertEqual(res["total_results"], 0)
        self.assertEqual(len(res["results"]), 0)

    # 7. Similarity ordering (strictly descending)
    def test_07_similarity_ordering(self):
        query = "strong computer science academics and coding clubs"
        res = search_colleges(query, limit=5)
        results = res["results"]
        self.assertGreater(len(results), 1)

        for i in range(len(results) - 1):
            self.assertGreaterEqual(
                results[i]["similarity"],
                results[i + 1]["similarity"],
                f"Similarity order violated: {results[i]['similarity']} < {results[i+1]['similarity']}"
            )

    # 8. Ensure fabricated fields are never generated
    def test_08_ensure_fabricated_fields_never_generated(self):
        sparse_col = {
            "college_id": "test_sparse",
            "college_name": "Minimalist Engineering Academy",
            "location": "Coimbatore",
            "programs": ["B.Tech CS"],
            "placements": None,
            "hostel": None,
            "fees": None
        }
        index = SemanticCollegeSearchIndex(colleges=[sparse_col])
        res = index.search("hostel and mess fee details")
        self.assertEqual(len(res["results"]), 1)
        r = res["results"][0]

        # Missing attributes remain None and are never fabricated
        self.assertIsNone(r.get("placements_highlight"))
        self.assertIsNone(r.get("hostel_highlight"))
        self.assertIsNone(r.get("fees_highlight"))

    # 9. Ensure missing information remains omitted from searchable text
    def test_09_ensure_missing_information_omitted_from_text(self):
        college_record = {
            "college_id": "c1",
            "college_name": "Polytechnic Institute",
            "location": "Coimbatore",
            "academics": None,
            "placements": None,
            "hostel": None
        }
        text = build_searchable_text(college_record)

        self.assertIn("College Name: Polytechnic Institute", text)
        self.assertIn("Location: Coimbatore", text)
        self.assertNotIn("Academics:", text)
        self.assertNotIn("Placements:", text)
        self.assertNotIn("Hostel:", text)
        self.assertNotIn("None", text)

    # 10. Ensure duplicate detection functionality remains intact
    def test_10_duplicate_detection_remains_intact(self):
        v1 = [0.1, 0.2, 0.3, 0.4]
        res = compare_embeddings(v1, v1, threshold=0.85)
        self.assertEqual(res["similarity"], 1.0)
        self.assertTrue(res["likely_duplicate"])

    # 11. API Endpoint: POST /search/colleges
    def test_11_api_search_colleges_success(self):
        res = self.client.post(
            "/search/colleges",
            headers=self.headers,
            json={"query": "colleges near Coimbatore with good placements and affordable fees", "limit": 3}
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("query", data)
        self.assertIn("results", data)
        self.assertIn("total_results", data)
        self.assertLessEqual(len(data["results"]), 3)

        # Check structure of top result
        first_result = data["results"][0]
        self.assertIn("college_id", first_result)
        self.assertIn("college_name", first_result)
        self.assertIn("similarity", first_result)
        self.assertIn("matched_information", first_result)

    # 12. API Endpoint: Authentication and Validation errors
    def test_12_api_auth_and_validation(self):
        # Missing API Key -> 401
        res_no_key = self.client.post(
            "/search/colleges",
            json={"query": "computer science engineering"}
        )
        self.assertEqual(res_no_key.status_code, 401)

        # Invalid API Key -> 403
        res_bad_key = self.client.post(
            "/search/colleges",
            headers={"x-api-key": "wrong_key_123"},
            json={"query": "computer science engineering"}
        )
        self.assertEqual(res_bad_key.status_code, 403)

        # Empty string query -> 400
        res_empty = self.client.post(
            "/search/colleges",
            headers=self.headers,
            json={"query": "   "}
        )
        self.assertEqual(res_empty.status_code, 400)

        # Oversized query -> 422
        res_oversized = self.client.post(
            "/search/colleges",
            headers=self.headers,
            json={"query": "Q" * 501}
        )
        self.assertEqual(res_oversized.status_code, 422)


if __name__ == "__main__":
    unittest.main()
