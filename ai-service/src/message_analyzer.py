import json
import requests


OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "campus-lenz-ai"


ALLOWED_SENTIMENTS = {
    "positive",
    "negative",
    "neutral",
    "mixed",
}

ALLOWED_CATEGORIES = {
    "general",
    "harassment",
    "threat",
    "spam",
    "personal",
    "academic",
    "event",
    "other",
}

ALLOWED_MODERATION = {
    "normal",
    "sensitive",
    "spam",
    "potentially_harmful",
}


def analyze_message(message: str) -> dict:
    """
    Analyze private direct messages between Campus Lenz users.
    Determines sentiment, category, and moderation classification.
    """

    prompt = f"""
Analyze this private direct message between students/users for Campus Lenz:

"{message}"

Return ONLY valid JSON.

Determine:
1. sentiment
2. category
3. moderation classification

Sentiment must be exactly one of:
positive
negative
neutral
mixed

Category must be exactly one of:
general
harassment
threat
spam
personal
academic
event
other

Moderation must be exactly one of:
normal
sensitive
spam
potentially_harmful

Rules:
- Private messages are direct communication between individuals.
- Ordinary disagreement, debate, refusal, criticism, or negative emotions (e.g., "The assignment was difficult", "I don't agree with you", "Stop messaging me") are normal communication. Do NOT classify them as potentially harmful.
- Rude language or personal insults (e.g., "You are stupid") should be categorized as personal or harassment, with moderation as sensitive or normal. They are NOT safety incidents and must NOT be marked potentially_harmful.
- Commercial advertisements, unsolicited promotional links, scams, or phishing solicitations are spam.
- Potentially harmful is STRICTLY reserved for explicit threats of physical violence, assault, weapons, self-harm, or serious imminent danger (e.g., "I am going to hurt you", "I will attack you tomorrow").
- If the message is ordinary interpersonal conversation, disagreement, or inquiry, mark moderation as normal.
- Do not invent facts.

Return exactly:
{{
  "sentiment": "",
  "category": "",
  "moderation": ""
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
    content = data["message"]["content"].strip()

    # Clean markdown code fences if model enclosed JSON
    if content.startswith("```"):
        lines = content.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        content = "\n".join(lines).strip()

    result = json.loads(content)

    if not isinstance(result, dict):
        raise ValueError("AI response is not a JSON object.")

    required_fields = [
        "sentiment",
        "category",
        "moderation",
    ]

    for field in required_fields:
        if field not in result:
            raise ValueError(f"Missing field: {field}")

    if result["sentiment"] not in ALLOWED_SENTIMENTS:
        raise ValueError(f"Invalid sentiment: {result['sentiment']}")

    if result["category"] not in ALLOWED_CATEGORIES:
        raise ValueError(f"Invalid category: {result['category']}")

    if result["moderation"] not in ALLOWED_MODERATION:
        raise ValueError(f"Invalid moderation: {result['moderation']}")

    return result


if __name__ == "__main__":
    message = input("Enter Campus Lenz private message: ")
    result = analyze_message(message)
    print("\nAI Message Analysis:")
    print(json.dumps(result, indent=2))
