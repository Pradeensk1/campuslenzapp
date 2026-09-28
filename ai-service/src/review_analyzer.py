import json
import requests


OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "campus-lenz-ai"


ALLOWED_ASPECTS = [
    "Academics",
    "Faculty",
    "Placements",
    "Infrastructure",
    "Hostel",
    "Campus Life",
    "Value for Money",
    "Student Experience",
]


ALLOWED_ASPECT_SENTIMENTS = {
    "positive",
    "negative",
    "neutral",
}


ALLOWED_OVERALL_SENTIMENTS = {
    "positive",
    "negative",
    "neutral",
    "mixed",
}


# Explicit phrase-to-aspect rules.
ASPECT_RULES = {
    "Faculty": [
        "teachers",
        "teacher",
        "professors",
        "professor",
        "faculty",
        "teaching staff",
    ],

    "Academics": [
        "subjects",
        "courses",
        "course",
        "curriculum",
        "syllabus",
        "exams",
        "learning",
    ],

    "Placements": [
        "job opportunities",
        "placement opportunities",
        "placement support",
        "placements",
        "placement",
        "campus recruitment",
        "companies visiting",
    ],

    "Infrastructure": [
        "buildings",
        "building",
        "labs",
        "lab",
        "classrooms",
        "classroom",
        "library building",
        "campus facilities",
    ],

    "Hostel": [
        "hostel food",
        "hostel rooms",
        "hostel room",
        "hostel",
        "mess",
        "dormitory",
    ],

    "Campus Life": [
        "events",
        "clubs",
        "festivals",
        "student activities",
    ],

    "Value for Money": [
        "fees",
        "fee",
        "cost",
        "costly",
        "expensive",
        "worth the money",
        "tuition value",
    ],

    "Student Experience": [
        "overall student experience",
        "student satisfaction",
        "college experience",
    ],
}


def find_detected_aspects(review: str) -> set:
    """
    Detect all explicit Campus Lenz aspects mentioned
    in the review.
    """

    text = review.lower()

    detected = set()

    for aspect, phrases in ASPECT_RULES.items():

        for phrase in phrases:

            if phrase in text:
                detected.add(aspect)
                break

    return detected


def remove_duplicate_aspects(aspects: list) -> list:
    """
    Keep only one entry for each aspect.
    """

    unique = {}

    for aspect in aspects:

        name = aspect["name"]
        sentiment = aspect["sentiment"]

        if name not in unique:
            unique[name] = sentiment

    return [
        {
            "name": name,
            "sentiment": sentiment
        }
        for name, sentiment in unique.items()
    ]


def correct_aspects(
    review: str,
    ai_aspects: list
) -> list:
    """
    Correct missing or duplicated aspect classifications.
    """

    detected_aspects = find_detected_aspects(review)

    ai_aspects = remove_duplicate_aspects(
        ai_aspects
    )

    final_aspects = {}

    # Keep valid AI results first.
    for aspect in ai_aspects:

        name = aspect["name"]
        sentiment = aspect["sentiment"]

        if name in ALLOWED_ASPECTS:

            final_aspects[name] = sentiment

    # Add deterministic aspects that the AI missed.
    for detected_aspect in detected_aspects:

        if detected_aspect not in final_aspects:

            final_aspects[detected_aspect] = "neutral"

    return [
        {
            "name": name,
            "sentiment": sentiment
        }
        for name, sentiment in final_aspects.items()
    ]


def analyze_review(review: str) -> dict:

    prompt = f"""
Analyze this student review for Campus Lenz:

"{review}"

Return ONLY valid JSON.

Overall sentiment must be exactly one of:
positive
negative
neutral
mixed

Every aspect name MUST be exactly one of:

Academics
Faculty
Placements
Infrastructure
Hostel
Campus Life
Value for Money
Student Experience

Aspect mapping:

- teachers, professors, faculty, teaching staff -> Faculty
- subjects, courses, curriculum, syllabus, exams, learning -> Academics
- job opportunities, placement opportunities, placement support,
  placements, campus recruitment -> Placements
- buildings, labs, classrooms, library building,
  campus facilities -> Infrastructure
- hostel, hostel food, hostel rooms, mess, dormitory -> Hostel
- events, clubs, festivals, student activities -> Campus Life
- fees, cost, costly, expensive, worth the money -> Value for Money
- overall student experience, student satisfaction,
  college experience -> Student Experience

Important:

- "courses" MUST be Academics.
- "course" MUST be Academics.
- "curriculum" MUST be Academics.
- "professors" MUST be Faculty.
- "professor" MUST be Faculty.
- "teachers" MUST be Faculty.
- "classrooms" MUST be Infrastructure.
- "hostel rooms" MUST be Hostel.
- "hostel food" MUST be Hostel.
- "placement opportunities" MUST be Placements.
- Do not duplicate an aspect.
- Only include aspects actually mentioned.
- Do not invent information.

Aspect sentiment must be exactly:
positive
negative
neutral

Overall sentiment must be exactly:
positive
negative
neutral
mixed

Return exactly:

{{
  "overall_sentiment": "",
  "aspects": [
    {{
      "name": "",
      "sentiment": ""
    }}
  ]
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

    # Validate main structure.
    if not isinstance(result, dict):
        raise ValueError(
            "AI response is not a JSON object."
        )

    if "overall_sentiment" not in result:
        raise ValueError(
            "Missing overall_sentiment."
        )

    if "aspects" not in result:
        raise ValueError(
            "Missing aspects."
        )

    if not isinstance(result["aspects"], list):
        raise ValueError(
            "Aspects must be a list."
        )

    # Validate overall sentiment.
    if result["overall_sentiment"] not in ALLOWED_OVERALL_SENTIMENTS:
        raise ValueError(
            f"Invalid overall sentiment: "
            f"{result['overall_sentiment']}"
        )

    # Validate AI aspects.
    for aspect in result["aspects"]:

        if "name" not in aspect:
            raise ValueError(
                "Aspect is missing name."
            )

        if "sentiment" not in aspect:
            raise ValueError(
                "Aspect is missing sentiment."
            )

        if aspect["name"] not in ALLOWED_ASPECTS:
            raise ValueError(
                f"Invalid aspect returned by AI: "
                f"{aspect['name']}"
            )

        if aspect["sentiment"] not in ALLOWED_ASPECT_SENTIMENTS:
            raise ValueError(
                f"Invalid aspect sentiment: "
                f"{aspect['sentiment']}"
            )

    # Apply deterministic corrections.
    result["aspects"] = correct_aspects(
        review,
        result["aspects"]
    )

    return result


if __name__ == "__main__":

    review = input("Enter student review: ")

    result = analyze_review(review)

    print("\nAI Analysis:")
    print(json.dumps(result, indent=2))