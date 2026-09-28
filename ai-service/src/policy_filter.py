import re


# 48-term platform profanity dictionary, partitioned into strict terms
# and contextual terms to prevent false positives on harmless colloquialisms.

CONTEXTUAL_WORDS = {
    "bloody",
    "cocky",
    "damn",
    "hell",
}

STRICT_PROFANITY_WORDS = {
    "arse",
    "arsehole",
    "asshole",
    "balls",
    "bastard",
    "bitch",
    "bollocks",
    "bugger",
    "bullshit",
    "cock",
    "crap",
    "cum",
    "cunt",
    "dick",
    "dickhead",
    "douche",
    "douchebag",
    "fuck",
    "fucked",
    "fucker",
    "fuckface",
    "fucking",
    "goddamn",
    "jack-off",
    "jackass",
    "jerk-off",
    "jizz",
    "motherfucker",
    "piss",
    "prick",
    "pussy",
    "retard",
    "scumbag",
    "shit",
    "shithead",
    "shitty",
    "skank",
    "slut",
    "sod",
    "son of a bitch",
    "tits",
    "twat",
    "wanker",
    "whore",
}

# The complete 48-term profanity dictionary is preserved
PROFANITY_WORDS = STRICT_PROFANITY_WORDS | CONTEXTUAL_WORDS

# Explicit natural plural extensions for countable noun profanities
# Prevents plural bypass (e.g., asshole -> assholes) without blind substring matching.
PLURAL_EXTENSIONS = {
    "arse": ["arses"],
    "arsehole": ["arseholes"],
    "asshole": ["assholes"],
    "bastard": ["bastards"],
    "bitch": ["bitches"],
    "bugger": ["buggers"],
    "bullshit": ["bullshits"],
    "cock": ["cocks"],
    "cunt": ["cunts"],
    "dick": ["dicks"],
    "dickhead": ["dickheads"],
    "douche": ["douches"],
    "douchebag": ["douchebags"],
    "fuck": ["fucks"],
    "fucker": ["fuckers"],
    "fuckface": ["fuckfaces"],
    "jack-off": ["jack-offs"],
    "jackass": ["jackasses"],
    "jerk-off": ["jerk-offs"],
    "motherfucker": ["motherfuckers"],
    "prick": ["pricks"],
    "pussy": ["pussies"],
    "retard": ["retards"],
    "scumbag": ["scumbags"],
    "shit": ["shits"],
    "shithead": ["shitheads"],
    "skank": ["skanks"],
    "slut": ["sluts"],
    "sod": ["sods"],
    "son of a bitch": ["sons of bitches", "sons of a bitch"],
    "twat": ["twats"],
    "wanker": ["wankers"],
    "whore": ["whores"],
}

ALL_STRICT_PROFANITY = set(STRICT_PROFANITY_WORDS)
for word, plurals in PLURAL_EXTENSIONS.items():
    ALL_STRICT_PROFANITY.update(plurals)


TARGETED_CONTEXTUAL_ABUSE_PATTERNS = [
    r"\b(go\s+to\s+hell|burn\s+in\s+hell|rot\s+in\s+hell|to\s+hell\s+with\s+(you|them|him|her))\b",
    r"\b(damn\s+(you|him|her|them))\b",
    r"\b(bloody\s+(idiot|moron|fool|bastard|bitch|asshole|liar|scumbag))\b",
]


def contains_strict_profanity(text: str) -> bool:
    """
    Detect explicit, deterministic profanity (including natural plurals).
    Always returns True for unambiguous profanity regardless of context.
    """
    text_lower = text.lower()

    for word in ALL_STRICT_PROFANITY:
        escaped = r"\s+".join(re.escape(part) for part in word.split())
        pattern = rf"\b{escaped}\b"
        if re.search(pattern, text_lower):
            return True

    return False


def contains_contextual_profanity(text: str, analysis: dict | None = None) -> bool:
    """
    Evaluate contextual words ('hell', 'damn', 'cocky', 'bloody').
    Only returns True if there is clear evidence of abusive/hostile context.
    Harmless colloquialisms, intensifiers, medical terms, and legitimate
    negative feedback ('hostel food is damn bad') evaluate to False.
    """
    text_lower = text.lower()

    has_contextual = False
    for word in CONTEXTUAL_WORDS:
        if re.search(rf"\b{re.escape(word)}\b", text_lower):
            has_contextual = True
            break

    if not has_contextual:
        return False

    # 1. Check for targeted abusive phrases (e.g. 'go to hell', 'damn you', 'bloody idiot')
    for pat in TARGETED_CONTEXTUAL_ABUSE_PATTERNS:
        if re.search(pat, text_lower):
            return True

    # 2. Check if external AI analysis provided evidence of harassment/threat
    if analysis:
        moderation = analysis.get("moderation")
        category = str(analysis.get("category", "")).lower()
        if moderation in ("potentially_harmful", "sensitive") and category in ("harassment", "threat"):
            return True

    return False


def contains_profanity(text: str, analysis: dict | None = None) -> bool:
    """
    Detect prohibited profanity.
    Strict profanity is always detected deterministically.
    Contextual words require abusive context.
    """
    if contains_strict_profanity(text):
        return True

    if contains_contextual_profanity(text, analysis):
        return True

    return False


def apply_policy(text: str, analysis: dict) -> dict:
    """
    Apply deterministic platform policy after AI analysis.
    """

    profanity = contains_profanity(text, analysis=analysis)

    moderation = analysis.get("moderation", "normal")

    # Potentially harmful content:
    # Do not publish. Send to safety review.
    if moderation == "potentially_harmful":
        return {
            "policy_result": "safety_review",
            "publish": False,
            "profanity_detected": profanity,
            "reason": "Potentially harmful content"
        }

    # Spam is rejected.
    if moderation == "spam":
        return {
            "policy_result": "reject",
            "publish": False,
            "profanity_detected": profanity,
            "reason": "Spam"
        }

    # Profanity is rejected.
    if profanity:
        return {
            "policy_result": "reject",
            "publish": False,
            "profanity_detected": True,
            "reason": "Prohibited profanity"
        }

    # Sensitive content can be published.
    # The college will receive a notification (for public posts).
    if moderation == "sensitive":
        return {
            "policy_result": "publish",
            "publish": True,
            "profanity_detected": False,
            "reason": "Sensitive content - college notification required"
        }

    # Normal content can be published.
    return {
        "policy_result": "publish",
        "publish": True,
        "profanity_detected": False,
        "reason": "Allowed content"
    }


if __name__ == "__main__":

    text = input("Enter Campus Lenz post: ")

    analysis = {
        "moderation": "normal"
    }

    result = apply_policy(text, analysis)

    print("\nPolicy Result:")
    print(result)