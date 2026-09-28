import unittest
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = PROJECT_ROOT / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from policy_filter import (
    contains_profanity,
    contains_strict_profanity,
    contains_contextual_profanity,
    apply_policy,
    PROFANITY_WORDS,
    STRICT_PROFANITY_WORDS,
    CONTEXTUAL_WORDS
)


class PolicyFilterProfanityTestSuite(unittest.TestCase):
    """
    Test suite for policy_filter.py profanity detection and policy decisions.
    Verifies strict profanity, natural plurals, contextual distinctions,
    false-positive prevention, and safety escalation preservation.
    """

    def test_01_all_strict_profanity_terms_detected(self):
        """Verify that every single term in the strict profanity list is detected."""
        for term in STRICT_PROFANITY_WORDS:
            # Standalone word test
            self.assertTrue(
                contains_profanity(term),
                f"Failed to detect standalone strict profanity: {term}"
            )
            # Embedded in sentence test
            sentence = f"Why did you do that, you {term}?"
            self.assertTrue(
                contains_profanity(sentence),
                f"Failed to detect strict profanity in sentence: {sentence}"
            )

    def test_02_plural_profanity_forms(self):
        """
        Verify that plural forms of profanity are detected deterministically
        without bypassing the filter (e.g. asshole -> assholes).
        """
        plural_tests = [
            "asshole",
            "assholes",
            "ASSHOLES",
            "AssHoles",
            "bastards",
            "bitches",
            "dickheads",
            "fuckers",
            "motherfuckers",
            "scumbags",
            "shitheads",
            "whores",
            "jackasses"
        ]
        for term in plural_tests:
            self.assertTrue(
                contains_profanity(term),
                f"Failed to detect plural profanity form: {term}"
            )

        # Real evaluation sentence test
        plural_sentence = "This administrative staff is full of assholes who refuse to sign our clearance forms."
        self.assertTrue(contains_profanity(plural_sentence))

        policy = apply_policy(plural_sentence, {"moderation": "normal"})
        self.assertEqual(policy["policy_result"], "reject")
        self.assertFalse(policy["publish"])
        self.assertTrue(policy["profanity_detected"])

    def test_03_harmless_contextual_words_allowed(self):
        """
        Verify that contextual words ('hell', 'damn', 'cocky', 'bloody')
        in harmless sentences and legitimate negative criticism are NOT rejected.
        """
        harmless_cases = [
            "The semester exams were difficult as hell, but the grading was fair.",
            "Traffic outside the campus gate during rush hour is pure hell.",
            "My morning commute to college was absolute hell today because of the rain.",
            "Some senior students acted cocky during the orientation session.",
            "The debate team from the visiting college was cocky during the opening remarks.",
            "The machine learning lab session was damn interesting and insightful.",
            "That guest lecture on quantum computing was damn good and inspiring.",
            "I studied for ten hours and it was damn exhausting.",
            "The hostel food is damn bad.",
            "A bloody nose happened during football practice on the campus field.",
            "I accidentally cut my finger during workshop and got a bloody bandage."
        ]
        for sentence in harmless_cases:
            self.assertFalse(
                contains_profanity(sentence),
                f"Harmless sentence wrongly flagged as profanity: '{sentence}'"
            )
            policy = apply_policy(sentence, {"moderation": "normal"})
            self.assertEqual(
                policy["policy_result"],
                "publish",
                f"Harmless sentence wrongly rejected: '{sentence}'"
            )
            self.assertTrue(policy["publish"])
            self.assertFalse(policy["profanity_detected"])

    def test_04_abusive_contextual_words_detected(self):
        """Verify that directed hostile/abusive uses of contextual terms are detected."""
        abusive_cases = [
            "Go to hell and leave me alone!",
            "Burn in hell for what you did.",
            "Damn you for ruining my lab project.",
            "You bloody idiot, look what you did to the equipment!"
        ]
        for sentence in abusive_cases:
            self.assertTrue(
                contains_profanity(sentence),
                f"Abusive contextual sentence was missed: '{sentence}'"
            )
            policy = apply_policy(sentence, {"moderation": "normal"})
            self.assertEqual(policy["policy_result"], "reject")
            self.assertFalse(policy["publish"])
            self.assertTrue(policy["profanity_detected"])

    def test_05_multi_word_and_hyphenated_terms(self):
        """Test multi-word phrases and hyphenated profanity terms."""
        phrases = [
            "son of a bitch",
            "son  of  a  bitch",
            "sons of bitches",
            "jack-off",
            "jerk-off",
        ]
        for phrase in phrases:
            self.assertTrue(
                contains_profanity(phrase),
                f"Failed to detect multi-word / hyphenated term: {phrase}"
            )

    def test_06_uppercase_and_mixed_case_variants(self):
        """Test case-insensitivity across uppercase and mixed-case inputs."""
        variants = [
            "FUCK",
            "FuCkInG",
            "ShIt",
            "ASSHOLE",
            "ASSHOLES",
            "GODDAMN",
            "GoDdAmN",
            "DAMN YOU",
            "DICKHEAD",
            "SON OF A BITCH",
            "SoN oF a BiTcH",
            "JaCk-OfF",
            "JeRk-OfF",
            "MOTHERFUCKER",
            "bItCh",
            "bAsTaRd"
        ]
        for variant in variants:
            self.assertTrue(
                contains_profanity(variant),
                f"Failed to detect case variant: {variant}"
            )

    def test_07_false_positive_prevention_on_normal_words(self):
        """
        Verify that harmless words containing profanity substrings
        are NOT flagged as profanity.
        """
        safe_sentences = [
            "Hello everyone, welcome to the university campus.",
            "Please check the shell script and shell commands.",
            "Michelle is presenting her computer science project.",
            "We had cucumber salad and rice at the college mess.",
            "Under these difficult circumstances, students performed well.",
            "Please review the attached document carefully.",
            "Can you pass the can of soda?",
            "Sodium chloride is standard table salt used in the chemistry lab.",
            "We saw a beautiful peacock on campus grounds.",
            "The faculty attended a cocktail networking session.",
            "The pilot checked all controls in the cockpit.",
            "Classic literature is part of the English curriculum.",
            "The semester assessment results are published.",
            "The assistant professor answered questions after class.",
            "We played football on the main sports ground.",
            "The hostel dinner included meatballs and soup.",
            "The witch in the theatrical play had a great costume.",
            "There is a small scratch and itch on my arm.",
            "We listened to the high pitch sound in the physics lab.",
            "The sports team practiced on the cricket pitch.",
            "We consulted the English dictionary in the library.",
            "The model can predict placement outcomes accurately.",
            "The Arsenal football club has many student fans.",
            "The coarse fabric was used in textile engineering.",
            "The parser can parse JSON input cleanly.",
            "The book title is clearly written on the cover.",
            "Students signed a petition for extended library hours.",
            "The college is a recognized legal entity.",
            "The red brick buildings on campus look historic.",
            "My cat was sleeping peacefully near the hostel entrance.",
            "We cleaned up scrap metal in the mechanical workshop."
        ]
        for sentence in safe_sentences:
            self.assertFalse(
                contains_profanity(sentence),
                f"False positive triggered for safe sentence: '{sentence}'"
            )

    def test_08_distinction_between_profanity_and_harmful_content(self):
        """
        Verify that severe threats trigger safety_review, while normal criticism
        or clean content publishes, and ordinary profanity rejects.
        """
        # Potentially harmful content with profanity -> safety_review
        harmful_with_profanity = "I am going to beat the fuck out of you with a weapon tomorrow."
        harmful_policy = apply_policy(harmful_with_profanity, {"moderation": "potentially_harmful"})
        self.assertEqual(harmful_policy["policy_result"], "safety_review")
        self.assertFalse(harmful_policy["publish"])
        self.assertTrue(harmful_policy["profanity_detected"])

        # Severe threats without profanity -> safety_review
        threat_cases = [
            "I will bring a weapon to campus and attack the department head tomorrow.",
            "I am going to plant explosives in the science block tomorrow morning.",
            "I will beat up the student council president in the parking lot after exams.",
            "I am going to hurt you tomorrow if you show up to class.",
            "I am bringing a knife to the campus hostel tonight to settle this dispute.",
            "I will wait outside your hostel room and attack you when you step out."
        ]
        for threat in threat_cases:
            policy = apply_policy(threat, {"moderation": "potentially_harmful"})
            self.assertEqual(policy["policy_result"], "safety_review", f"Failed to escalate threat: {threat}")
            self.assertFalse(policy["publish"])

        # Legitimate negative review criticism -> publish
        negative_critique = "The hostel rooms are poorly maintained and the mess food is awful."
        neg_policy = apply_policy(negative_critique, {"moderation": "normal"})
        self.assertEqual(neg_policy["policy_result"], "publish")
        self.assertTrue(neg_policy["publish"])
        self.assertFalse(neg_policy["profanity_detected"])

        # Profanity -> reject
        profane_text = "This professor is an asshole and the course is bullshit."
        profane_policy = apply_policy(profane_text, {"moderation": "normal"})
        self.assertEqual(profane_policy["policy_result"], "reject")
        self.assertFalse(profane_policy["publish"])
        self.assertTrue(profane_policy["profanity_detected"])


if __name__ == "__main__":
    unittest.main()
