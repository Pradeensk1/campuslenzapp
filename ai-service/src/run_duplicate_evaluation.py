import json
import sys
import time
from pathlib import Path
import requests

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = PROJECT_ROOT / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from embedding_service import (
    get_embeddings,
    DEFAULT_EMBED_MODEL,
    OLLAMA_EMBED_URL
)
from duplicate_detector import (
    compare_embeddings,
    DEFAULT_DUPLICATE_THRESHOLD
)

DATASET_FILE = PROJECT_ROOT / "tests" / "duplicate_evaluation_dataset.json"


def check_embedding_model_available(model_name: str) -> bool:
    """
    Check if the specified embedding model is installed in Ollama.
    """
    try:
        resp = requests.get("http://localhost:11434/api/tags", timeout=5)
        if resp.status_code != 200:
            print(f"ERROR: Ollama server responded with status {resp.status_code}", flush=True)
            return False

        models = [m.get("name", "") for m in resp.json().get("models", [])]
        # Match model name or model:latest
        available = any(
            m == model_name or m.startswith(f"{model_name}:")
            for m in models
        )
        return available
    except requests.exceptions.RequestException as e:
        print(f"ERROR: Cannot connect to Ollama at http://localhost:11434: {e}", flush=True)
        return False


def run_evaluation(threshold: float = DEFAULT_DUPLICATE_THRESHOLD, model: str = DEFAULT_EMBED_MODEL):
    print("\n" + "=" * 75, flush=True)
    print(f"CAMPUS LENZ AI - DUPLICATE DETECTION EVALUATION", flush=True)
    print(f"Target Embedding Model: '{model}' | Threshold: {threshold}", flush=True)
    print("=" * 75, flush=True)

    if not check_embedding_model_available(model):
        print("\n" + "!" * 75, flush=True)
        print(f"CRITICAL STATUS: Embedding model '{model}' is NOT installed in Ollama.", flush=True)
        print("Installed models currently available:")
        try:
            r = requests.get("http://localhost:11434/api/tags", timeout=5)
            for m in r.json().get("models", []):
                print(f"  - {m.get('name')}", flush=True)
        except Exception:
            pass
        print(f"\nTo download and enable this model, run in your terminal:")
        print(f"    ollama pull {model}")
        print("!" * 75 + "\n", flush=True)
        return {
            "status": "model_missing",
            "model": model,
            "message": f"Embedding model '{model}' is not installed."
        }

    if not DATASET_FILE.exists():
        print(f"ERROR: Dataset not found at {DATASET_FILE}", flush=True)
        return {"status": "dataset_missing"}

    with open(DATASET_FILE, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    total_cases = len(dataset)
    correct_count = 0
    incorrect_count = 0

    duplicate_sims = []
    non_duplicate_sims = []

    false_positives = []
    false_negatives = []

    start_time = time.time()

    # Pre-collect all unique texts for efficient single/batched embedding generation
    all_texts = []
    for item in dataset:
        all_texts.append(item["text_a"])
        all_texts.append(item["text_b"])

    print(f"Generating embeddings for {len(all_texts)} texts...", flush=True)
    t0 = time.time()
    try:
        all_vectors = get_embeddings(all_texts, model=model)
        dim = len(all_vectors[0]) if all_vectors else 0
        emb_time = time.time() - t0
        avg_emb_time = emb_time / len(all_texts)
        print(f"Generated {len(all_vectors)} vectors ({dim} dims) in {emb_time:.2f}s ({avg_emb_time*1000:.1f}ms/text).\n", flush=True)
    except Exception as e:
        print(f"ERROR generating embeddings: {e}", flush=True)
        return {"status": "embedding_failed", "error": str(e)}

    # Evaluate each pair
    for idx, item in enumerate(dataset):
        pair_id = item["id"]
        exp_duplicate = item["expected"]["likely_duplicate"]
        topic = item.get("topic", "general")

        vec_a = all_vectors[2 * idx]
        vec_b = all_vectors[2 * idx + 1]

        result = compare_embeddings(vec_a, vec_b, threshold=threshold)
        sim = result["similarity"]
        pred_duplicate = result["likely_duplicate"]

        is_correct = (pred_duplicate == exp_duplicate)
        if is_correct:
            correct_count += 1
            status_tag = "[PASS]"
        else:
            incorrect_count += 1
            status_tag = "[FAIL]"

        if exp_duplicate:
            duplicate_sims.append(sim)
            if not pred_duplicate:
                false_negatives.append({
                    "id": pair_id,
                    "sim": sim,
                    "text_a": item["text_a"],
                    "text_b": item["text_b"]
                })
        else:
            non_duplicate_sims.append(sim)
            if pred_duplicate:
                false_positives.append({
                    "id": pair_id,
                    "sim": sim,
                    "text_a": item["text_a"],
                    "text_b": item["text_b"]
                })

        print(
            f"[{idx+1:02d}/{total_cases:02d}] {pair_id} {status_tag} | sim={sim:.4f} | "
            f"pred={'DUP' if pred_duplicate else 'NON' :3s} (exp={'DUP' if exp_duplicate else 'NON':3s}) | "
            f"topic={topic}",
            flush=True
        )

    total_time = time.time() - start_time
    accuracy = (correct_count / total_cases) * 100 if total_cases > 0 else 0
    avg_dup_sim = (sum(duplicate_sims) / len(duplicate_sims)) if duplicate_sims else 0.0
    avg_non_dup_sim = (sum(non_duplicate_sims) / len(non_duplicate_sims)) if non_duplicate_sims else 0.0

    print("\n" + "=" * 75, flush=True)
    print("DUPLICATE EVALUATION METRICS", flush=True)
    print("=" * 75, flush=True)
    print(f"Total Evaluated Pairs:         {total_cases}", flush=True)
    print(f"Correct Classifications:       {correct_count}", flush=True)
    print(f"Incorrect Classifications:     {incorrect_count}", flush=True)
    print(f"Accuracy:                      {accuracy:.2f}%", flush=True)
    print(f"Configured Threshold:          {threshold}", flush=True)
    print(f"Average Similarity (Duplicates):     {avg_dup_sim:.4f}", flush=True)
    print(f"Average Similarity (Non-Duplicates): {avg_non_dup_sim:.4f}", flush=True)
    print(f"False Positives (Non-dup marked DUP): {len(false_positives)}", flush=True)
    print(f"False Negatives (Dup marked NON):     {len(false_negatives)}", flush=True)
    print(f"Total Runtime:                 {total_time:.2f}s", flush=True)
    print("=" * 75 + "\n", flush=True)

    return {
        "status": "success",
        "total": total_cases,
        "correct": correct_count,
        "incorrect": incorrect_count,
        "accuracy": accuracy,
        "avg_dup_sim": avg_dup_sim,
        "avg_non_dup_sim": avg_non_dup_sim,
        "false_positives": false_positives,
        "false_negatives": false_negatives
    }


if __name__ == "__main__":
    threshold = DEFAULT_DUPLICATE_THRESHOLD
    if len(sys.argv) > 1:
        try:
            threshold = float(sys.argv[1])
        except ValueError:
            pass
    run_evaluation(threshold=threshold)
