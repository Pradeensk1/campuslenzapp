"""
Campus Lenz AI - Duplicate & Semantic Similarity Detector.

Note on threshold:
The default threshold of 0.85 is an initial baseline designed for high-precision
detection of paraphrased or near-duplicate campus content. It is configurable
and subject to ongoing empirical benchmark evaluation. Semantic similarity
indicates content proximity, not confirmed plagiarism or copying.
"""

from embedding_service import (
    get_embeddings,
    cosine_similarity,
    DEFAULT_EMBED_MODEL
)

DEFAULT_DUPLICATE_THRESHOLD = 0.85


def compare_embeddings(
    vector_a: list[float],
    vector_b: list[float],
    threshold: float = DEFAULT_DUPLICATE_THRESHOLD
) -> dict:
    """
    Compare two pre-computed vector embeddings using cosine similarity.
    Returns similarity score and likely_duplicate indicator.
    """
    similarity = cosine_similarity(vector_a, vector_b)
    # Round similarity to 4 decimal places for clean reporting
    rounded_similarity = round(similarity, 4)

    return {
        "similarity": rounded_similarity,
        "likely_duplicate": rounded_similarity >= threshold,
        "threshold": threshold
    }


def compare_texts(
    text_a: str,
    text_b: str,
    threshold: float = DEFAULT_DUPLICATE_THRESHOLD,
    model: str = DEFAULT_EMBED_MODEL
) -> dict:
    """
    Compare two text inputs by computing their vector embeddings and cosine similarity.

    Returns:
    {
        "similarity": 0.9123,
        "likely_duplicate": True,
        "threshold": 0.85
    }
    """
    if not text_a or not text_a.strip():
        raise ValueError("text_a cannot be empty or whitespace.")

    if not text_b or not text_b.strip():
        raise ValueError("text_b cannot be empty or whitespace.")

    # Batch embedding retrieval (single network roundtrip)
    vectors = get_embeddings([text_a, text_b], model=model)

    result = compare_embeddings(vectors[0], vectors[1], threshold=threshold)
    return result
