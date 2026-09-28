import unittest
import sys
from pathlib import Path
from unittest.mock import patch

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = PROJECT_ROOT / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from embedding_service import (
    cosine_similarity,
    get_embedding,
    get_embeddings
)
from duplicate_detector import (
    compare_embeddings,
    compare_texts,
    DEFAULT_DUPLICATE_THRESHOLD
)


class DuplicateDetectorTestSuite(unittest.TestCase):
    """
    Deterministic unit test suite for embedding service and duplicate detector.
    All tests use synthetic vectors or mocks to guarantee independence from live Ollama.
    """

    # 1. Identical vectors -> similarity = 1.0, likely_duplicate = True
    def test_01_identical_vectors(self):
        v = [0.2, 0.4, 0.6, 0.8]
        sim = cosine_similarity(v, v)
        self.assertAlmostEqual(sim, 1.0, places=4)

        result = compare_embeddings(v, v, threshold=0.85)
        self.assertEqual(result["similarity"], 1.0)
        self.assertTrue(result["likely_duplicate"])

    # 2. Clearly different / orthogonal vectors -> similarity = 0.0, likely_duplicate = False
    def test_02_orthogonal_and_opposite_vectors(self):
        # Orthogonal (perpendicular)
        v_a = [1.0, 0.0, 0.0]
        v_b = [0.0, 1.0, 0.0]
        sim_ortho = cosine_similarity(v_a, v_b)
        self.assertAlmostEqual(sim_ortho, 0.0, places=4)

        result_ortho = compare_embeddings(v_a, v_b, threshold=0.85)
        self.assertFalse(result_ortho["likely_duplicate"])

        # Opposite vectors -> similarity = -1.0
        v_c = [1.0, 2.0, 3.0]
        v_d = [-1.0, -2.0, -3.0]
        sim_opp = cosine_similarity(v_c, v_d)
        self.assertAlmostEqual(sim_opp, -1.0, places=4)

        result_opp = compare_embeddings(v_c, v_d, threshold=0.85)
        self.assertFalse(result_opp["likely_duplicate"])

    # 3. Zero vector validation -> raises ValueError
    def test_03_zero_vector_handling(self):
        v_zero = [0.0, 0.0, 0.0]
        v_valid = [1.0, 2.0, 3.0]

        with self.assertRaises(ValueError) as ctx:
            cosine_similarity(v_zero, v_valid)
        self.assertIn("zero vector", str(ctx.exception).lower())

        with self.assertRaises(ValueError) as ctx2:
            cosine_similarity(v_valid, v_zero)
        self.assertIn("zero vector", str(ctx2.exception).lower())

    # 4. Mismatched vector lengths -> raises ValueError
    def test_04_mismatched_vector_lengths(self):
        v_3 = [1.0, 2.0, 3.0]
        v_4 = [1.0, 2.0, 3.0, 4.0]

        with self.assertRaises(ValueError) as ctx:
            cosine_similarity(v_3, v_4)
        self.assertIn("dimensions must match", str(ctx.exception).lower())

    # 5. Empty vector validation -> raises ValueError
    def test_05_empty_vector_handling(self):
        with self.assertRaises(ValueError):
            cosine_similarity([], [1.0, 2.0])

        with self.assertRaises(ValueError):
            cosine_similarity([1.0, 2.0], [])

    # 6. Empty text validation in compare_texts
    def test_06_empty_text_validation(self):
        with self.assertRaises(ValueError) as ctx:
            compare_texts("", "Some valid text")
        self.assertIn("cannot be empty", str(ctx.exception).lower())

        with self.assertRaises(ValueError) as ctx2:
            compare_texts("Some valid text", "   \t\n  ")
        self.assertIn("cannot be empty", str(ctx2.exception).lower())

    # 7. Threshold behavior
    def test_07_threshold_behavior(self):
        # High similarity pair: 0.88
        v_a = [1.0, 1.0, 0.0]
        v_b = [1.0, 0.8, 0.2]
        # Calculate actual similarity
        sim = cosine_similarity(v_a, v_b)
        self.assertTrue(0.85 < sim < 0.99)

        # With threshold 0.85 -> likely_duplicate = True
        res_low_thresh = compare_embeddings(v_a, v_b, threshold=0.85)
        self.assertTrue(res_low_thresh["likely_duplicate"])

        # With strict threshold 0.99 -> likely_duplicate = False
        res_high_thresh = compare_embeddings(v_a, v_b, threshold=0.99)
        self.assertFalse(res_high_thresh["likely_duplicate"])

    # 8. compare_texts with mocked embeddings: duplicate pair
    @patch("duplicate_detector.get_embeddings")
    def test_08_compare_texts_duplicate_pair(self, mock_get_embeddings):
        # Mock high-similarity embeddings (cosine similarity ~ 0.96)
        mock_get_embeddings.return_value = [
            [0.5, 0.5, 0.5, 0.5],
            [0.51, 0.49, 0.5, 0.5]
        ]

        text_a = "The hostel rooms are very small and poorly maintained."
        text_b = "Hostel accommodation is cramped and the rooms aren't maintained properly."

        result = compare_texts(text_a, text_b, threshold=0.85)

        self.assertIn("similarity", result)
        self.assertIn("likely_duplicate", result)
        self.assertIn("threshold", result)
        self.assertTrue(result["likely_duplicate"])
        self.assertGreaterEqual(result["similarity"], 0.85)
        mock_get_embeddings.assert_called_once_with([text_a, text_b], model="nomic-embed-text")

    # 9. compare_texts with mocked embeddings: non-duplicate pair
    @patch("duplicate_detector.get_embeddings")
    def test_09_compare_texts_non_duplicate_pair(self, mock_get_embeddings):
        # Mock low-similarity embeddings (cosine similarity ~ 0.1)
        mock_get_embeddings.return_value = [
            [0.9, 0.1, 0.0, 0.0],
            [0.0, 0.1, 0.9, 0.0]
        ]

        text_a = "The hostel food is excellent and very tasty."
        text_b = "The football team won the regional championship trophy yesterday."

        result = compare_texts(text_a, text_b, threshold=0.85)

        self.assertFalse(result["likely_duplicate"])
        self.assertLess(result["similarity"], 0.85)


if __name__ == "__main__":
    unittest.main()
