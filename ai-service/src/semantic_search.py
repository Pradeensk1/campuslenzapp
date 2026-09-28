"""
Campus Lenz AI - Semantic College Search Service.

Provides semantic retrieval over actual Campus Lenz institutional records using
nomic-embed-text (768-dim) embeddings and cosine similarity.

Retrieval signals represent semantic relevance to the query, NOT a quality ranking
or institutional endorsement.
"""

import math
from embedding_service import (
    get_embedding,
    get_embeddings,
    cosine_similarity,
    DEFAULT_EMBED_MODEL
)
from college_data_fixtures import SAMPLE_COLLEGES

ATTRIBUTE_KEYWORDS = {
    "placements": {
        "placement", "placements", "job", "jobs", "hiring", "recruit",
        "recruiter", "recruiters", "recruitment", "salary", "package",
        "companies", "career", "employment"
    },
    "fees": {
        "fee", "fees", "affordable", "cost", "costly", "expensive",
        "cheap", "subsidized", "tuition", "roi", "value", "economical", "budget"
    },
    "hostel": {
        "hostel", "hostels", "dorm", "dormitory", "mess", "food",
        "room", "rooms", "accommodation", "residence", "residential"
    },
    "campus_life": {
        "campus life", "culture", "fest", "fests", "festival",
        "clubs", "activities", "sports", "cultural", "student life", "social"
    },
    "infrastructure": {
        "infrastructure", "library", "labs", "laboratories", "equipment",
        "facilities", "building", "buildings", "workstation", "campus"
    },
    "academics": {
        "academics", "academic", "curriculum", "syllabus", "course",
        "courses", "study", "engineering", "computer science", "cs",
        "research", "learning"
    },
    "faculty": {
        "faculty", "professors", "professor", "teachers", "teacher",
        "mentorship", "guidance", "teaching", "staff"
    },
    "programs": {
        "mca", "b.tech", "m.tech", "mba", "diploma", "degree",
        "postgraduate", "undergraduate", "program", "programs"
    },
    "location": {
        "coimbatore", "tamil nadu", "peelamedu", "thadagam",
        "saravanampatti", "ettimadai", "location", "near", "city"
    }
}


def build_searchable_text(college: dict) -> str:
    """
    Construct a dense, factual text representation of a college record
    using ONLY fields that are present and non-empty.
    Missing fields are strictly omitted to prevent data fabrication.
    """
    parts = []

    if college.get("college_name"):
        parts.append(f"College Name: {college['college_name']}")

    if college.get("location"):
        parts.append(f"Location: {college['location']}")

    if college.get("programs"):
        programs = college["programs"]
        programs_str = ", ".join(programs) if isinstance(programs, list) else str(programs)
        parts.append(f"Programs Offered: {programs_str}")

    if college.get("academics"):
        parts.append(f"Academics: {college['academics']}")

    if college.get("faculty"):
        parts.append(f"Faculty: {college['faculty']}")

    if college.get("placements"):
        parts.append(f"Placements: {college['placements']}")

    if college.get("infrastructure"):
        parts.append(f"Infrastructure: {college['infrastructure']}")

    if college.get("hostel"):
        parts.append(f"Hostel: {college['hostel']}")

    if college.get("campus_life"):
        parts.append(f"Campus Life: {college['campus_life']}")

    if college.get("fees"):
        parts.append(f"Fees and Value: {college['fees']}")

    if college.get("student_experience"):
        parts.append(f"Student Experience: {college['student_experience']}")

    return "\n".join(parts)


def identify_matched_information(query: str, college: dict) -> list[str]:
    """
    Identify which available attributes in the college record contributed
    to relevance based on query keywords and populated fields.
    """
    query_lower = query.lower()
    matched = []

    for attr, keywords in ATTRIBUTE_KEYWORDS.items():
        # Check if attribute exists and is populated in this college
        val = college.get(attr)
        if not val:
            continue

        # Check for keyword overlap in query
        if any(kw in query_lower for kw in keywords):
            matched.append(attr)

    return matched


class SemanticCollegeSearchIndex:
    """
    In-memory vector search index over college records.
    Caches college embeddings to prevent re-embedding on every search query.
    """

    def __init__(self, colleges: list[dict] | None = None, model: str = DEFAULT_EMBED_MODEL):
        self.model = model
        self.colleges = colleges if colleges is not None else list(SAMPLE_COLLEGES)
        self.doc_texts: list[str] = []
        self.embeddings: list[list[float]] = []
        self._indexed = False

    def build_index(self, force_refresh: bool = False):
        """
        Generate and cache embeddings for all populated college records.
        """
        if self._indexed and not force_refresh:
            return

        self.doc_texts = [build_searchable_text(col) for col in self.colleges]

        if not self.doc_texts:
            self.embeddings = []
            self._indexed = True
            return

        # Single batched call to Ollama /api/embed
        self.embeddings = get_embeddings(self.doc_texts, model=self.model)
        self._indexed = True

    def search(
        self,
        query: str,
        limit: int = 5,
        min_similarity: float = 0.30
    ) -> dict:
        """
        Search colleges using natural language semantic query.
        Returns ranked matching colleges with similarity scores and matched attributes.
        """
        if not query or not query.strip():
            raise ValueError("Search query cannot be empty or whitespace.")

        query_cleaned = query.strip()

        if not self._indexed:
            self.build_index()

        if not self.colleges or not self.embeddings:
            return {
                "query": query_cleaned,
                "results": [],
                "total_results": 0
            }

        # 1. Generate query embedding
        query_vec = get_embedding(query_cleaned, model=self.model)

        # 2. Compute cosine similarity against all indexed colleges
        scored_colleges = []
        for idx, college in enumerate(self.colleges):
            doc_vec = self.embeddings[idx]
            sim = cosine_similarity(query_vec, doc_vec)
            rounded_sim = round(sim, 4)

            matched_info = identify_matched_information(query_cleaned, college)

            scored_colleges.append({
                "college_id": college.get("college_id"),
                "college_name": college.get("college_name"),
                "location": college.get("location"),
                "similarity": rounded_sim,
                "matched_information": matched_info,
                # Include non-empty summary attributes
                "programs": college.get("programs"),
                "placements_highlight": college.get("placements"),
                "fees_highlight": college.get("fees"),
                "hostel_highlight": college.get("hostel"),
                "academics_highlight": college.get("academics")
            })

        # 3. Filter and rank descending by similarity
        filtered = [c for c in scored_colleges if c["similarity"] >= min_similarity]
        ranked = sorted(filtered, key=lambda x: x["similarity"], reverse=True)

        selected = ranked[:limit]

        return {
            "query": query_cleaned,
            "results": selected,
            "total_results": len(selected)
        }


# Singleton service instance
_global_search_index = None

def get_search_index(colleges: list[dict] | None = None, model: str = DEFAULT_EMBED_MODEL) -> SemanticCollegeSearchIndex:
    global _global_search_index
    if _global_search_index is None or colleges is not None:
        _global_search_index = SemanticCollegeSearchIndex(colleges=colleges, model=model)
    return _global_search_index


def search_colleges(query: str, limit: int = 5) -> dict:
    """
    Convenience function for semantic college search.
    """
    index = get_search_index()
    return index.search(query=query, limit=limit)
