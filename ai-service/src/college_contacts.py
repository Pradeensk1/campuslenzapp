import os
from pathlib import Path

from dotenv import load_dotenv


PROJECT_ROOT = Path(__file__).resolve().parent.parent

load_dotenv(PROJECT_ROOT / ".env")


TEST_EMAIL = os.getenv("TEST_EMAIL")


COLLEGE_CONTACTS = {
    "college_001": {
        "name": "College Safety Administrator",
        "email": TEST_EMAIL,
        "verified": True
    }
}


def get_verified_contact(college_id: str):

    contact = COLLEGE_CONTACTS.get(college_id)

    if contact is None:
        return None

    if not contact["verified"]:
        return None

    if not contact["email"]:
        return None

    return contact


if __name__ == "__main__":

    contact = get_verified_contact("college_001")

    print("\nVerified College Contact:")
    print(contact)