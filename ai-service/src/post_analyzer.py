import json
import requests


OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "campus-lenz-ai"


ALLOWED_CATEGORIES = {
    "Academics",
    "Faculty",
    "Placements",
    "Infrastructure",
    "Hostel",
    "Campus Life",
    "Events",
    "Fees",
    "Student Experience",
    "General",
}


ALLOWED_SENTIMENTS = {
    "positive",
    "negative",
    "neutral",
    "mixed",
}


ALLOWED_MODERATION = {
    "normal",
    "sensitive",
    "spam",
    "potentially_harmful",
}


def analyze_post(post: str) -> dict:

    prompt = f"""
Analyze this user post for Campus Lenz:

"{post}"

Return ONLY valid JSON.

Determine:

1. sentiment
2. category
3. moderation classification
4. whether the content is related to college/student experience

Sentiment must be exactly one of:
positive
negative
neutral
mixed

Category must be exactly one of:
Academics
Faculty
Placements
Infrastructure
Hostel
Campus Life
Events
Fees
Student Experience
General

Moderation must be exactly one of:
normal
sensitive
spam
potentially_harmful

Rules:

- Legitimate negative college feedback is NOT harmful.
- Complaints about hostel, faculty, placements, fees, infrastructure, etc. can still be normal content.
- Do not classify criticism as harmful just because it is negative.
- Spam includes advertisements, repeated promotional content, scams, or irrelevant commercial messages.
- Sensitive content may include serious personal accusations, highly personal matters, or content requiring additional review.
- Potentially harmful includes threats, serious harassment, instructions for wrongdoing, or clearly dangerous content.
- Do not invent information.
- If the post is ordinary college-related content, mark moderation as normal.

Return exactly:

{{
  "sentiment": "",
  "category": "",
  "moderation": "",
  "college_related": true
}}

Do not explain.
Do not use markdown.
Return JSON only.
"""

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "stream": False
        },
        timeout=120
    )

    response.raise_for_status()

    data = response.json()
    content = data["message"]["content"]

    result = json.loads(content)

    # Basic validation
    if not isinstance(result, dict):
        raise ValueError("AI response is not a JSON object.")

    required_fields = [
        "sentiment",
        "category",
        "moderation",
        "college_related",
    ]

    for field in required_fields:
        if field not in result:
            raise ValueError(f"Missing field: {field}")

    if result["sentiment"] not in ALLOWED_SENTIMENTS:
        raise ValueError(
            f"Invalid sentiment: {result['sentiment']}"
        )

    if result["category"] not in ALLOWED_CATEGORIES:
        raise ValueError(
            f"Invalid category: {result['category']}"
        )

    if result["moderation"] not in ALLOWED_MODERATION:
        raise ValueError(
            f"Invalid moderation: {result['moderation']}"
        )

    if not isinstance(result["college_related"], bool):
        raise ValueError(
            "college_related must be true or false."
        )

    # Deterministic correction:
    # Spam is treated as non-college-related by default.
    if result["moderation"] == "spam":
        result["college_related"] = False

    return result


if __name__ == "__main__":

    post = input("Enter Campus Lenz post: ")

    result = analyze_post(post)

    print("\nAI Post Analysis:")
    print(json.dumps(result, indent=2))