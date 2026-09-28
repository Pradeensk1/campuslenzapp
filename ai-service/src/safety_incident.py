import uuid
from datetime import datetime, timezone


def create_safety_incident(
    post: str,
    analysis: dict,
    author_id: str,
    college_id: str
) -> dict:

    moderation = analysis["moderation"]

    if moderation == "potentially_harmful":
        status = "pending_review"

    elif moderation == "sensitive":
        status = "notification_sent"

    else:
        status = "notification_sent"

    incident = {
        "incident_id": str(uuid.uuid4()),
        "college_id": college_id,
        "author_id": author_id,
        "post_content": post,
        "moderation": moderation,
        "sentiment": analysis["sentiment"],
        "category": analysis["category"],
        "status": status,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    return incident


if __name__ == "__main__":

    post = "I am going to hurt another student."

    analysis = {
        "moderation": "potentially_harmful",
        "sentiment": "negative",
        "category": "Campus Life"
    }

    incident = create_safety_incident(
        post=post,
        analysis=analysis,
        author_id="student_123",
        college_id="college_001"
    )

    print("\nSafety Incident:")
    print(incident)