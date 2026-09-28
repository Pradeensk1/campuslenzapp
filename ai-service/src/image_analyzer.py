import base64
import json
import requests
from pathlib import Path


OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "campus-lenz-ai"


ALLOWED_CATEGORIES = {
    "college",
    "campus",
    "event",
    "document",
    "person",
    "food",
    "infrastructure",
    "other"
}


ALLOWED_RELEVANCE = {
    "relevant",
    "possibly_relevant",
    "not_relevant"
}


def encode_image(image_path: str) -> str:
    """
    Convert an image file into base64.
    """

    path = Path(image_path)

    if not path.exists():
        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    with open(path, "rb") as image_file:
        return base64.b64encode(
            image_file.read()
        ).decode("utf-8")


def analyze_image(image_path: str) -> dict:

    image_base64 = encode_image(image_path)

    prompt = """
Analyze this image for Campus Lenz.

Return ONLY valid JSON.

Determine:

1. category
2. description
3. OCR text
4. whether the image is related to college/student experience
5. relevance

Category must be exactly one of:

college
campus
event
document
person
food
infrastructure
other

Relevance must be exactly one of:

relevant
possibly_relevant
not_relevant

Rules:

- Describe only what is actually visible.
- Do not invent college names, people, locations, dates, or facts.
- If readable text exists in the image, extract it into ocr_text.
- If there is no readable text, use an empty string for ocr_text.
- College buildings, classrooms, labs, libraries, hostels, campus areas,
  college events, student activities, and college documents are relevant.
- Clearly unrelated images are not relevant.
- If relevance is uncertain, use possibly_relevant.
- Keep the description concise.

Return exactly:

{
  "category": "",
  "description": "",
  "ocr_text": "",
  "college_related": true,
  "relevance": ""
}

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
                    "content": prompt,
                    "images": [
                        image_base64
                    ]
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
        "category",
        "description",
        "ocr_text",
        "college_related",
        "relevance"
    ]

    for field in required_fields:

        if field not in result:
            raise ValueError(
                f"Missing field: {field}"
            )

    if result["category"] not in ALLOWED_CATEGORIES:
        raise ValueError(
            f"Invalid category: "
            f"{result['category']}"
        )

    if not isinstance(result["description"], str):
        raise ValueError(
            "description must be a string."
        )

    if not isinstance(result["ocr_text"], str):
        raise ValueError(
            "ocr_text must be a string."
        )

    if not isinstance(result["college_related"], bool):
        raise ValueError(
            "college_related must be true or false."
        )

    if result["relevance"] not in ALLOWED_RELEVANCE:
        raise ValueError(
            f"Invalid relevance: "
            f"{result['relevance']}"
        )

    return result


if __name__ == "__main__":

    image_path = input(
        "Enter image path: "
    ).strip()

    result = analyze_image(
        image_path
    )

    print("\nCampus Lenz Image Analysis:")

    print(
        json.dumps(
            result,
            indent=2,
            ensure_ascii=False
        )
    )