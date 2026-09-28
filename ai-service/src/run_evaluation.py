import json
import sys
import time
from pathlib import Path
import requests

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = PROJECT_ROOT / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

# Ensure test/eval execution never sends live emails
import resend
resend.Emails.send = lambda *args, **kwargs: {"id": "eval_mock_resend_id"}

import college_contacts
college_contacts.get_verified_contact = lambda *args, **kwargs: {
    "name": "Evaluation Administrator",
    "email": "safety-eval@campus-lenz.test",
    "verified": True
}

from moderation_engine import (
    decide_action,
    decide_review_action,
    decide_message_action
)


OLLAMA_TAGS_URL = "http://localhost:11434/api/tags"
DATASET_FILE = PROJECT_ROOT / "tests" / "evaluation_dataset.json"


def check_ollama_status() -> bool:
    """Verify Ollama service is reachable and responsive."""
    try:
        resp = requests.get(OLLAMA_TAGS_URL, timeout=5)
        if resp.status_code == 200:
            return True
        print(f"Ollama returned unexpected status code: {resp.status_code}", flush=True)
        return False
    except requests.exceptions.RequestException as e:
        print("\n" + "=" * 75, flush=True)
        print("ERROR: Ollama service is unreachable at http://localhost:11434.", flush=True)
        print("Please ensure Ollama is running (e.g. 'ollama serve').", flush=True)
        print(f"Connection error details: {e}", flush=True)
        print("=" * 75 + "\n", flush=True)
        return False


def run_evaluation():
    if not check_ollama_status():
        sys.exit(1)

    if not DATASET_FILE.exists():
        print(f"ERROR: Evaluation dataset not found at {DATASET_FILE}", flush=True)
        sys.exit(1)

    with open(DATASET_FILE, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    # Optional limit for smoke testing
    limit = None
    if len(sys.argv) > 1:
        args = sys.argv[1:]
        for i, arg in enumerate(args):
            if arg in ("--limit", "-l") and i + 1 < len(args):
                try:
                    limit = int(args[i + 1])
                except ValueError:
                    pass
            elif arg == "--smoke":
                limit = 3
            elif arg.isdigit():
                limit = int(arg)

    if limit is not None:
        dataset = dataset[:limit]

    total_cases = len(dataset)
    print("\n" + "=" * 75, flush=True)
    print(f"CAMPUS LENZ AI EVALUATION RUNNER - {total_cases} CASES", flush=True)
    print("=" * 75, flush=True)

    passed_count = 0
    failed_count = 0

    # Moderation action metrics
    action_correct = 0
    false_positives = []
    false_negatives = []

    # Sentiment metrics
    sentiment_correct = 0
    sentiment_total = 0

    # Review aspect metrics
    total_expected_aspects = 0
    correct_aspects_detected = 0

    # Message safety metrics
    message_safety_total = 0
    message_safety_correct = 0

    # Failure details list
    failure_details = []

    total_start_time = time.time()

    for idx, item in enumerate(dataset, 1):
        case_id = item["id"]
        content_type = item["type"]
        text = item["text"]
        expected = item["expected"]

        pred_sentiment = None
        pred_moderation = None
        pred_action = None
        pred_aspects = []
        raw_error = None
        decision = {}

        case_start_time = time.time()

        try:
            # FIX 1: Call ONLY the decision engine for each content type.
            # Do NOT call standalone analyzers redundantly.
            if content_type == "review":
                decision = decide_review_action(text)
                analysis = decision.get("analysis", {})
                pred_sentiment = analysis.get("overall_sentiment")
                pred_aspects = analysis.get("aspects", [])
                pred_moderation = decision.get("policy", {}).get("policy_result")
                pred_action = decision.get("action")

            elif content_type == "post":
                decision = decide_action(text)
                analysis = decision.get("analysis", {})
                pred_sentiment = analysis.get("sentiment")
                pred_moderation = analysis.get("moderation")
                pred_action = decision.get("action")

            elif content_type == "message":
                decision = decide_message_action(text)
                analysis = decision.get("analysis", {})
                pred_sentiment = analysis.get("sentiment")
                pred_moderation = analysis.get("moderation")
                pred_action = decision.get("action")

        except Exception as e:
            raw_error = str(e)

        case_elapsed = time.time() - case_start_time

        # Check moderation action
        exp_action = expected.get("action")
        is_action_match = (pred_action == exp_action)
        if is_action_match:
            action_correct += 1

        # Check for False Positives:
        # Expected action is allow/publish, but predicted is reject or safety_review
        if exp_action in ("allow", "publish") and pred_action in ("reject", "safety_review"):
            false_positives.append({
                "id": case_id,
                "type": content_type,
                "text": text,
                "expected_action": exp_action,
                "predicted_action": pred_action,
                "reason": decision.get("policy", {}).get("reason")
            })

        # Check for False Negatives:
        # Expected action is safety_review (threat/violence), but predicted is allow/publish or reject
        if exp_action == "safety_review" and pred_action != "safety_review":
            false_negatives.append({
                "id": case_id,
                "type": content_type,
                "text": text,
                "expected_action": exp_action,
                "predicted_action": pred_action,
                "reason": decision.get("policy", {}).get("reason")
            })

        # Check Sentiment
        exp_sentiment = expected.get("sentiment") or expected.get("overall_sentiment")
        if exp_sentiment:
            sentiment_total += 1
            if pred_sentiment == exp_sentiment:
                sentiment_correct += 1

        # Check Review Aspects
        if content_type == "review" and "aspects" in expected:
            exp_aspects_list = expected["aspects"]
            total_expected_aspects += len(exp_aspects_list)
            pred_aspect_map = {a["name"]: a["sentiment"] for a in pred_aspects}
            for exp_a in exp_aspects_list:
                a_name = exp_a["name"]
                a_sent = exp_a["sentiment"]
                if a_name in pred_aspect_map and pred_aspect_map[a_name] == a_sent:
                    correct_aspects_detected += 1

        # Check Message Safety
        if content_type == "message":
            message_safety_total += 1
            if is_action_match:
                message_safety_correct += 1

        # Case overall pass/fail criteria:
        # Passes if action matches expected AND no uncaught exception occurred
        case_passed = (is_action_match and raw_error is None)

        if case_passed:
            passed_count += 1
            status_tag = "[PASS]"
        else:
            failed_count += 1
            status_tag = "[FAIL]"
            failure_details.append({
                "id": case_id,
                "type": content_type,
                "text": text,
                "expected_action": exp_action,
                "predicted_action": pred_action,
                "expected_sentiment": exp_sentiment,
                "predicted_sentiment": pred_sentiment,
                "error": raw_error,
                "reason": decision.get("policy", {}).get("reason"),
                "details": f"Pred Action: {pred_action}, Exp Action: {exp_action} | Pred Sent: {pred_sentiment}, Exp Sent: {exp_sentiment}"
            })

        # FIX 2: Immediate unbuffered real-time output
        print(f"[{idx:02d}/{total_cases:02d}] {case_id} {status_tag} {case_elapsed:.1f}s", flush=True)

    total_elapsed = time.time() - total_start_time
    avg_time_per_case = (total_elapsed / total_cases) if total_cases > 0 else 0
    accuracy = (passed_count / total_cases) * 100 if total_cases > 0 else 0
    action_acc = (action_correct / total_cases) * 100 if total_cases > 0 else 0
    aspect_acc = (correct_aspects_detected / total_expected_aspects) * 100 if total_expected_aspects > 0 else 0
    sent_acc = (sentiment_correct / sentiment_total) * 100 if sentiment_total > 0 else 0
    msg_safety_acc = (message_safety_correct / message_safety_total) * 100 if message_safety_total > 0 else 0

    print("\n" + "=" * 75, flush=True)
    print("AGGREGATE EVALUATION REPORT", flush=True)
    print("=" * 75, flush=True)
    print(f"Total Cases Evaluated:       {total_cases}", flush=True)
    print(f"Passed:                      {passed_count}", flush=True)
    print(f"Failed:                      {failed_count}", flush=True)
    print(f"Overall Accuracy:            {accuracy:.2f}%", flush=True)
    print(f"Moderation Action Accuracy:  {action_acc:.2f}% ({action_correct}/{total_cases})", flush=True)
    print(f"Sentiment Accuracy:          {sent_acc:.2f}% ({sentiment_correct}/{sentiment_total})", flush=True)
    print(f"Review Aspect Accuracy:      {aspect_acc:.2f}% ({correct_aspects_detected}/{total_expected_aspects})", flush=True)
    print(f"Message Safety Accuracy:     {msg_safety_acc:.2f}% ({message_safety_correct}/{message_safety_total})", flush=True)
    print(f"False Positives:             {len(false_positives)}", flush=True)
    print(f"False Negatives:             {len(false_negatives)}", flush=True)
    print(f"Total Runtime:               {total_elapsed:.2f}s", flush=True)
    print(f"Average Time Per Case:       {avg_time_per_case:.2f}s", flush=True)

    if false_positives:
        print("\n--- FALSE POSITIVES (Safe content rejected or escalated) ---", flush=True)
        for fp in false_positives:
            print(f"  * [{fp['id']}] \"{fp['text']}\" -> Predicted: {fp['predicted_action']} | Reason: {fp['reason']}", flush=True)

    if false_negatives:
        print("\n--- FALSE NEGATIVES (Safety threat missed) ---", flush=True)
        for fn in false_negatives:
            print(f"  * [{fn['id']}] \"{fn['text']}\" -> Predicted: {fn['predicted_action']} (Expected: {fn['expected_action']})", flush=True)

    if failure_details:
        print(f"\n--- FAILED TEST CASES BREAKDOWN ({len(failure_details)} cases) ---", flush=True)
        for fail in failure_details:
            print(f"  * [{fail['id']}] {fail['details']} | Text: \"{fail['text']}\"", flush=True)

    print("=" * 75 + "\n", flush=True)

    return {
        "total": total_cases,
        "passed": passed_count,
        "failed": failed_count,
        "accuracy": accuracy,
        "action_accuracy": action_acc,
        "aspect_accuracy": aspect_acc,
        "sentiment_accuracy": sent_acc,
        "message_safety_accuracy": msg_safety_acc,
        "false_positives": false_positives,
        "false_negatives": false_negatives,
        "total_runtime": total_elapsed,
        "avg_time_per_case": avg_time_per_case,
        "failures": failure_details
    }


if __name__ == "__main__":
    run_evaluation()
