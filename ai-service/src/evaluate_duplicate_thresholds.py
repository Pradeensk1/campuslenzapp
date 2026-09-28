import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = PROJECT_ROOT / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from embedding_service import get_embeddings, cosine_similarity

DATASET_FILE = PROJECT_ROOT / "tests" / "duplicate_evaluation_dataset.json"

THRESHOLDS = [0.70, 0.72, 0.74, 0.76, 0.78, 0.80, 0.82, 0.84, 0.85]


def evaluate_thresholds():
    if not DATASET_FILE.exists():
        print(f"ERROR: Dataset file not found at {DATASET_FILE}", flush=True)
        return

    with open(DATASET_FILE, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    total_pairs = len(dataset)
    print("\n" + "=" * 80, flush=True)
    print("CAMPUS LENZ AI - DUPLICATE DETECTION THRESHOLD EVALUATION", flush=True)
    print(f"Total pairs to evaluate: {total_pairs}", flush=True)
    print("=" * 80, flush=True)

    # 1. Collect all texts and fetch embeddings in one batched pass
    all_texts = []
    for item in dataset:
        all_texts.append(item["text_a"])
        all_texts.append(item["text_b"])

    print(f"Generating embeddings for {len(all_texts)} texts using 'nomic-embed-text'...", flush=True)
    try:
        vectors = get_embeddings(all_texts, model="nomic-embed-text")
    except Exception as e:
        print(f"ERROR generating embeddings: {e}", flush=True)
        return

    print(f"Embeddings successfully generated ({len(vectors[0])} dimensions per vector).\n", flush=True)

    # 2. Compute cosine similarity for each pair once
    pair_results = []
    duplicate_sims = []
    non_duplicate_sims = []

    print("-" * 80, flush=True)
    print(f"{'ID':<12} {'Topic':<18} {'Expected':<12} {'Similarity':<12} {'Relationship'}", flush=True)
    print("-" * 80, flush=True)

    for idx, item in enumerate(dataset):
        vec_a = vectors[2 * idx]
        vec_b = vectors[2 * idx + 1]
        sim = cosine_similarity(vec_a, vec_b)
        rounded_sim = round(sim, 4)

        is_dup = item["expected"]["likely_duplicate"]
        relationship = item["expected"].get("relationship", "N/A")
        topic = item.get("topic", "general")

        if is_dup:
            duplicate_sims.append(rounded_sim)
        else:
            non_duplicate_sims.append(rounded_sim)

        pair_results.append({
            "id": item["id"],
            "topic": topic,
            "expected_dup": is_dup,
            "similarity": rounded_sim,
            "relationship": relationship
        })

        print(
            f"{item['id']:<12} {topic:<18} {'DUPLICATE' if is_dup else 'NON-DUP':<12} "
            f"{rounded_sim:<12.4f} {relationship}",
            flush=True
        )

    avg_dup = sum(duplicate_sims) / len(duplicate_sims) if duplicate_sims else 0.0
    avg_non_dup = sum(non_duplicate_sims) / len(non_duplicate_sims) if non_duplicate_sims else 0.0

    print("-" * 80, flush=True)
    print(f"Duplicate pairs count:     {len(duplicate_sims)} | Mean Similarity: {avg_dup:.4f}", flush=True)
    print(f"Non-duplicate pairs count: {len(non_duplicate_sims)} | Mean Similarity: {avg_non_dup:.4f}", flush=True)
    print(f"Mean Separation Delta:     {avg_dup - avg_non_dup:.4f}", flush=True)
    print("=" * 80, flush=True)

    # 3. Evaluate each threshold
    print("\n" + "=" * 80, flush=True)
    print(f"{'Threshold':<11} {'Accuracy':<10} {'TP':<5} {'TN':<5} {'FP':<5} {'FN':<5} {'Precision':<11} {'Recall':<9} {'F1-Score':<9}", flush=True)
    print("=" * 80, flush=True)

    threshold_metrics = []

    for t in THRESHOLDS:
        tp = 0
        tn = 0
        fp = 0
        fn = 0

        for r in pair_results:
            pred = (r["similarity"] >= t)
            actual = r["expected_dup"]

            if actual and pred:
                tp += 1
            elif not actual and not pred:
                tn += 1
            elif not actual and pred:
                fp += 1
            elif actual and not pred:
                fn += 1

        accuracy = ((tp + tn) / total_pairs) * 100
        precision = (tp / (tp + fp)) if (tp + fp) > 0 else 0.0
        recall = (tp / (tp + fn)) if (tp + fn) > 0 else 0.0
        f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0

        metrics_row = {
            "threshold": t,
            "accuracy": accuracy,
            "tp": tp,
            "tn": tn,
            "fp": fp,
            "fn": fn,
            "precision": precision,
            "recall": recall,
            "f1": f1
        }
        threshold_metrics.append(metrics_row)

        print(
            f"{t:<11.2f} {accuracy:>6.1f}%   {tp:<5} {tn:<5} {fp:<5} {fn:<5} "
            f"{precision:<11.4f} {recall:<9.4f} {f1:<9.4f}",
            flush=True
        )

    print("=" * 80 + "\n", flush=True)

    return {
        "pair_results": pair_results,
        "avg_dup_similarity": avg_dup,
        "avg_non_dup_similarity": avg_non_dup,
        "threshold_metrics": threshold_metrics
    }


if __name__ == "__main__":
    evaluate_thresholds()
