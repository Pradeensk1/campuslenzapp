import json
import requests


OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "campus-lenz-ai"


def summarize_reviews(
    college_id: str,
    reviews: list[str]
) -> dict:

    if not reviews:
        raise ValueError("No reviews provided.")

    reviews_text = "\n".join(
        f"Review {index + 1}: {review}"
        for index, review in enumerate(reviews)
    )

    prompt = f"""
You are summarizing real student reviews for Campus Lenz.

College ID: {college_id}

Here are the reviews:

{reviews_text}

Read ALL reviews carefully.

The reviews contain real opinions about:
- Academics
- Faculty
- Placements
- Hostel
- Fees
- Campus Life

Create a factual summary using ONLY these reviews.

IMPORTANT:
- Do NOT return empty fields when the reviews contain relevant information.
- Do NOT invent facts.
- Do NOT add information that is not present.
- Positive statements must go into positive_points.
- Negative statements must go into negative_points.
- If multiple reviews mention the same topic, identify that topic.
- Keep each point short.
- Treat opinions as student opinions, not verified institutional facts.

Return ONLY this JSON:

{{
  "summary": "One short paragraph summarizing the overall feedback.",
  "positive_points": [
    "Positive point from the reviews",
    "Another positive point from the reviews"
  ],
  "negative_points": [
    "Negative point from the reviews"
  ],
  "aspect_summary": {{
    "Academics": "Summary based only on reviews, or null if not mentioned.",
    "Faculty": "Summary based only on reviews, or null if not mentioned.",
    "Placements": "Summary based only on reviews, or null if not mentioned.",
    "Infrastructure": "Summary based only on reviews, or null if not mentioned.",
    "Hostel": "Summary based only on reviews, or null if not mentioned.",
    "Campus Life": "Summary based only on reviews, or null if not mentioned.",
    "Value for Money": "Summary based only on reviews, or null if not mentioned.",
    "Student Experience": "Summary based only on reviews, or null if not mentioned."
  }}
}}

Before returning JSON, make sure:
- summary is not empty.
- positive_points contains the positive feedback.
- negative_points contains the negative feedback.
- mentioned aspects are summarized.

Return JSON only.
No markdown.
No explanation.
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
        timeout=180
    )

    response.raise_for_status()

    data = response.json()

    content = data["message"]["content"]

    result = json.loads(content)

    if not isinstance(result, dict):
        raise ValueError(
            "AI response is not a JSON object."
        )

    required_fields = [
        "summary",
        "positive_points",
        "negative_points",
        "aspect_summary"
    ]

    for field in required_fields:
        if field not in result:
            raise ValueError(
                f"Missing field: {field}"
            )

    if not result["summary"]:
        raise ValueError(
            "AI returned an empty summary."
        )

    if not isinstance(
        result["positive_points"],
        list
    ):
        raise ValueError(
            "positive_points must be a list."
        )

    if not isinstance(
        result["negative_points"],
        list
    ):
        raise ValueError(
            "negative_points must be a list."
        )

    if not isinstance(
        result["aspect_summary"],
        dict
    ):
        raise ValueError(
            "aspect_summary must be an object."
        )

    return result


if __name__ == "__main__":

    reviews = [
        "The courses are well designed and the professors are helpful.",
        "Placement opportunities are excellent.",
        "The hostel rooms are poor.",
        "The fees are too expensive.",
        "The professors explain concepts clearly.",
        "Campus events are enjoyable and students participate actively."
    ]

    result = summarize_reviews(
        college_id="college_001",
        reviews=reviews
    )

    print("\nCampus Lenz Review Summary:")

    print(
        json.dumps(
            result,
            indent=2,
            ensure_ascii=False
        )
    )