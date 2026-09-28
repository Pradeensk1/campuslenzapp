from post_analyzer import analyze_post
from review_analyzer import analyze_review
from message_analyzer import analyze_message
from policy_filter import apply_policy
from safety_incident import create_safety_incident
from notification_service import (
    create_college_notification,
    send_college_notification
)


def decide_action(
    post: str,
    author_id: str = "unknown_author",
    college_id: str = "unknown_college"
) -> dict:

    # 1. Analyze the student post
    analysis = analyze_post(post)

    # 2. Apply deterministic platform policy
    policy = apply_policy(post, analysis)

    # 3. Determine final action
    if policy["policy_result"] == "publish":
        action = "publish"

    elif policy["policy_result"] == "reject":
        action = "reject"

    elif policy["policy_result"] == "safety_review":
        action = "safety_review"

    else:
        action = "reject"

    result = {
        "action": action,
        "analysis": analysis,
        "policy": policy
    }

    # 4. Sensitive content
    # Publish the post AND notify the verified college contact.
    if (
        action == "publish"
        and analysis["moderation"] == "sensitive"
    ):

        incident = create_safety_incident(
            post=post,
            analysis=analysis,
            author_id=author_id,
            college_id=college_id
        )

        result["sensitive_notification_incident"] = incident

        notification = create_college_notification(
            incident
        )

        result["college_notification"] = notification

        if notification is not None:

            email_result = send_college_notification(
                incident,
                notification
            )

            result["email_result"] = email_result

    # 5. Potentially harmful content
    # Do NOT publish. Create safety incident and notify college.
    elif action == "safety_review":

        incident = create_safety_incident(
            post=post,
            analysis=analysis,
            author_id=author_id,
            college_id=college_id
        )

        result["safety_incident"] = incident

        notification = create_college_notification(
            incident
        )

        result["college_notification"] = notification

        if notification is not None:

            email_result = send_college_notification(
                incident,
                notification
            )

            result["email_result"] = email_result

    return result


def decide_review_action(
    review: str,
    author_id: str = "unknown_author",
    college_id: str = "unknown_college"
) -> dict:

    # 1. Analyze the student review (aspects & sentiment)
    review_analysis = analyze_review(review)

    # 2. Check for potentially harmful content or spam
    eval_result = analyze_post(review)
    moderation_flag = eval_result.get("moderation", "normal")

    # 3. Apply deterministic platform policy
    policy = apply_policy(
        review,
        {"moderation": moderation_flag}
    )

    # 4. Determine final action
    if policy["policy_result"] == "publish":
        action = "publish"

    elif policy["policy_result"] == "reject":
        action = "reject"

    elif policy["policy_result"] == "safety_review":
        action = "safety_review"

    else:
        action = "reject"

    result = {
        "action": action,
        "analysis": review_analysis,
        "policy": policy
    }

    # 5. Potentially harmful review: create incident and notify college
    if action == "safety_review":

        incident_meta = {
            "moderation": moderation_flag,
            "sentiment": review_analysis.get("overall_sentiment", "negative"),
            "category": "Review"
        }

        incident = create_safety_incident(
            post=review,
            analysis=incident_meta,
            author_id=author_id,
            college_id=college_id
        )

        result["safety_incident"] = incident

        notification = create_college_notification(
            incident
        )

        result["college_notification"] = notification

        if notification is not None:

            email_result = send_college_notification(
                incident,
                notification
            )

            result["email_result"] = email_result

    return result


def decide_message_action(
    message: str,
    sender_id: str = "unknown_sender",
    recipient_id: str = "unknown_recipient"
) -> dict:

    # 1. Analyze the private direct message
    analysis = analyze_message(message)

    # 2. Apply deterministic platform policy
    policy = apply_policy(message, analysis)

    # 3. Determine final action (allow, reject, safety_review)
    if policy["policy_result"] == "publish":
        action = "allow"
    elif policy["policy_result"] == "reject":
        action = "reject"
    elif policy["policy_result"] == "safety_review":
        action = "safety_review"
    else:
        action = "reject"

    result = {
        "action": action,
        "sender_id": sender_id,
        "recipient_id": recipient_id,
        "analysis": analysis,
        "policy": policy
    }

    # 4. Potentially harmful message (threat/violence):
    # Create safety incident record for internal platform safety review,
    # preserving sender_id and recipient_id.
    # Privacy safeguard: Do NOT automatically notify college administrators
    # for private messages between users.
    if action == "safety_review":

        incident_meta = {
            "moderation": analysis.get("moderation", "potentially_harmful"),
            "sentiment": analysis.get("sentiment", "negative"),
            "category": analysis.get("category", "threat")
        }

        incident = create_safety_incident(
            post=message,
            analysis=incident_meta,
            author_id=sender_id,
            college_id="private_message"
        )
        incident["sender_id"] = sender_id
        incident["recipient_id"] = recipient_id

        result["safety_incident"] = incident

    return result



if __name__ == "__main__":

    post = input("Enter Campus Lenz post: ")

    decision = decide_action(
        post=post,
        author_id="student_123",
        college_id="college_001"
    )

    print("\nCampus Lenz Moderation Decision:")
    print(decision)