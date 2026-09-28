import os
import math
from pathlib import Path
import requests
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")

OLLAMA_EMBED_URL = os.getenv("OLLAMA_EMBED_URL", "http://localhost:11434/api/embed")
DEFAULT_EMBED_MODEL = os.getenv("CAMPUS_LENZ_EMBED_MODEL", "nomic-embed-text")
HTTP_TIMEOUT = 30


def cosine_similarity(vector_a: list[float], vector_b: list[float]) -> float:
    """
    Calculate the cosine similarity between two numeric vectors.
    Returns a value between -1.0 and 1.0.
    """
    if not vector_a or not vector_b:
        raise ValueError("Vectors cannot be empty.")

    if len(vector_a) != len(vector_b):
        raise ValueError(
            f"Vector dimensions must match (got {len(vector_a)} and {len(vector_b)})."
        )

    dot_product = sum(a * b for a, b in zip(vector_a, vector_b))
    norm_a = math.sqrt(sum(a * a for a in vector_a))
    norm_b = math.sqrt(sum(b * b for b in vector_b))

    if norm_a == 0.0 or norm_b == 0.0:
        raise ValueError("Cannot calculate cosine similarity for a zero vector.")

    similarity = dot_product / (norm_a * norm_b)
    # Clamp to avoid floating point precision overflow
    return max(-1.0, min(1.0, similarity))


def get_embedding(
    text: str,
    model: str = DEFAULT_EMBED_MODEL
) -> list[float]:
    """
    Generate a vector embedding for a single text using Ollama's /api/embed endpoint.
    """
    if not text or not text.strip():
        raise ValueError("Input text cannot be empty.")

    embeddings = get_embeddings([text], model=model)
    if not embeddings:
        raise RuntimeError("No embedding returned by embedding service.")

    return embeddings[0]


def get_embeddings(
    texts: list[str],
    model: str = DEFAULT_EMBED_MODEL
) -> list[list[float]]:
    """
    Generate vector embeddings for a list of texts using Ollama's /api/embed endpoint.
    """
    if not texts:
        raise ValueError("Input texts list cannot be empty.")

    cleaned_texts = [t.strip() for t in texts]
    for idx, t in enumerate(cleaned_texts):
        if not t:
            raise ValueError(f"Text at index {idx} cannot be empty.")

    payload = {
        "model": model,
        "input": cleaned_texts if len(cleaned_texts) > 1 else cleaned_texts[0]
    }

    try:
        response = requests.post(
            OLLAMA_EMBED_URL,
            json=payload,
            timeout=HTTP_TIMEOUT
        )
    except requests.exceptions.RequestException as e:
        raise ConnectionError(
            f"Failed to connect to Ollama embedding service at {OLLAMA_EMBED_URL}: {e}"
        ) from e

    if response.status_code == 404:
        raise LookupError(
            f"Embedding model '{model}' not found in Ollama. Pull it with: 'ollama pull {model}'."
        )

    if response.status_code != 200:
        error_msg = response.text
        try:
            error_msg = response.json().get("error", response.text)
        except Exception:
            pass
        raise RuntimeError(
            f"Ollama embedding API error (HTTP {response.status_code}): {error_msg}"
        )

    data = response.json()

    # Ollama /api/embed returns {"model": "...", "embeddings": [[...], [...]]}
    if "embeddings" in data and isinstance(data["embeddings"], list):
        return data["embeddings"]

    # Legacy /api/embeddings endpoint fallback if /api/embed returned single embedding
    if "embedding" in data and isinstance(data["embedding"], list):
        return [data["embedding"]]

    raise ValueError(f"Unexpected response format from embedding API: {data}")
