import os
from datetime import datetime, timezone
from pathlib import Path
from html import escape

import resend
from dotenv import load_dotenv

from college_contacts import get_verified_contact


PROJECT_ROOT = Path(__file__).resolve().parent.parent

load_dotenv(PROJECT_ROOT / ".env")


RESEND_API_KEY = os.getenv("RESEND_API_KEY")

if not RESEND_API_KEY:
    raise ValueError("RESEND_API_KEY is missing.")

resend.api_key = RESEND_API_KEY


def create_college_notification(incident: dict) -> dict | None:

    college_contact = get_verified_contact(
        incident["college_id"]
    )

    if college_contact is None:
        return None

    moderation = incident["moderation"]

    if moderation == "sensitive":
        subject = "Campus Lenz Sensitive Content Requires Review"
        message = (
            "A sensitive post has been detected on Campus Lenz "
            "and requires authorized review."
        )

    elif moderation == "potentially_harmful":
        subject = "Campus Lenz Safety Incident Requires Review"
        message = (
            "A potentially harmful post has been detected on Campus Lenz "
            "and requires authorized review."
        )

    else:
        subject = "Campus Lenz Content Requires Review"
        message = (
            "A post has been flagged on Campus Lenz "
            "and requires authorized review."
        )

    notification = {
        "notification_id": f"notification_{incident['incident_id']}",
        "incident_id": incident["incident_id"],
        "college_id": incident["college_id"],
        "recipient": {
            "name": college_contact["name"],
            "email": college_contact["email"]
        },
        "subject": subject,
        "message": message,
        "status": "pending_send",
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    return notification


def send_college_notification(
    incident: dict,
    notification: dict
) -> dict:

    moderation = incident["moderation"]

    if moderation == "sensitive":
        title = "Campus Lenz Sensitive Content"
        description = (
            "A sensitive post has been detected and requires "
            "authorized review."
        )

    elif moderation == "potentially_harmful":
        title = "Campus Lenz Safety Incident"
        description = (
            "A potentially harmful post has been detected and requires "
            "authorized review."
        )

    else:
        title = "Campus Lenz Content Review"
        description = (
            "A post has been flagged and requires authorized review."
        )

    # Escape user-generated content before inserting it into HTML.
    reported_content = escape(
        incident["post_content"]
    )

    email = resend.Emails.send({
        "from": "Campus Lenz <onboarding@resend.dev>",
        "to": [notification["recipient"]["email"]],
        "subject": notification["subject"],
        "html": f"""
            <h2>{title}</h2>

            <p>
                {description}
            </p>

            <hr>

            <p>
                <strong>Incident ID:</strong>
                {escape(str(incident["incident_id"]))}
            </p>

            <p>
                <strong>College ID:</strong>
                {escape(str(incident["college_id"]))}
            </p>

            <p>
                <strong>Category:</strong>
                {escape(str(incident["category"]))}
            </p>

            <p>
                <strong>Moderation:</strong>
                {escape(str(incident["moderation"]))}
            </p>

            <p>
                <strong>Reported Content:</strong>
            </p>

            <blockquote>
                {reported_content}
            </blockquote>

            <p>
                Please review this incident through the
                authorized Campus Lenz moderation process.
            </p>
        """
    })

    return {
        "notification_id": notification["notification_id"],
        "email_id": email["id"],
        "status": "sent",
        "sent_at": datetime.now(timezone.utc).isoformat()
    }


if __name__ == "__main__":

    incident = {
        "incident_id": "test-sensitive-001",
        "college_id": "college_001",
        "author_id": "student_123",

        "post_content": (
            "I am having a serious personal issue with someone "
            "at my college and I don't want my identity revealed."
        ),

        "moderation": "sensitive",
        "category": "Student Experience"
    }

    notification = create_college_notification(
        incident
    )

    if notification is None:

        print("No verified college contact found.")

    else:

        print("\nNotification created:")
        print(notification)

        result = send_college_notification(
            incident,
            notification
        )

        print("\nEmail result:")
        print(result)