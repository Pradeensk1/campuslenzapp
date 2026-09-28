import os
from pathlib import Path
from tempfile import NamedTemporaryFile

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File, Header, Request
from pydantic import BaseModel, Field

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from review_analyzer import analyze_review
from post_analyzer import analyze_post
from review_summarizer import summarize_reviews
from image_analyzer import analyze_image
from moderation_engine import (
    decide_action,
    decide_review_action,
    decide_message_action
)
from semantic_search import search_colleges


# ---------------------------------------------------------
# Environment
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent

load_dotenv(
    PROJECT_ROOT / ".env"
)

API_KEY = os.getenv(
    "CAMPUS_LENZ_API_KEY"
)


# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------

MAX_REVIEW_LENGTH = 5000
MAX_POST_LENGTH = 5000
MAX_MESSAGE_LENGTH = 5000
MAX_SEARCH_QUERY_LENGTH = 500
MAX_SUMMARY_REVIEWS = 100
MAX_SUMMARY_REVIEW_LENGTH = 5000

MAX_IMAGE_SIZE = 10 * 1024 * 1024

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp"
}

ALLOWED_IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}


# ---------------------------------------------------------
# Application
# ---------------------------------------------------------

limiter = Limiter(
    key_func=get_remote_address
)

app = FastAPI(
    title="Campus Lenz AI",
    version="1.0.0"
)

app.state.limiter = limiter

app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler
)


# ---------------------------------------------------------
# Authentication
# ---------------------------------------------------------

def verify_api_key(
    x_api_key: str | None
):

    if not API_KEY:

        raise HTTPException(
            status_code=500,
            detail="AI API key is not configured."
        )

    if not x_api_key:

        raise HTTPException(
            status_code=401,
            detail="API key required."
        )

    if x_api_key != API_KEY:

        raise HTTPException(
            status_code=403,
            detail="Invalid API key."
        )


# ---------------------------------------------------------
# Request Models
# ---------------------------------------------------------

class ReviewRequest(BaseModel):

    review: str = Field(
        ...,
        min_length=1,
        max_length=MAX_REVIEW_LENGTH
    )


class ModerateReviewRequest(BaseModel):

    review: str = Field(
        ...,
        min_length=1,
        max_length=MAX_REVIEW_LENGTH
    )

    author_id: str | None = Field(
        default="unknown_author",
        max_length=100
    )

    college_id: str | None = Field(
        default="unknown_college",
        max_length=100
    )


class PostRequest(BaseModel):

    post: str = Field(
        ...,
        min_length=1,
        max_length=MAX_POST_LENGTH
    )


class ModeratePostRequest(BaseModel):

    post: str = Field(
        ...,
        min_length=1,
        max_length=MAX_POST_LENGTH
    )

    author_id: str | None = Field(
        default="unknown_author",
        max_length=100
    )

    college_id: str | None = Field(
        default="unknown_college",
        max_length=100
    )


class ModerateMessageRequest(BaseModel):

    message: str = Field(
        ...,
        min_length=1,
        max_length=MAX_MESSAGE_LENGTH
    )

    sender_id: str | None = Field(
        default="unknown_sender",
        max_length=100
    )

    recipient_id: str | None = Field(
        default="unknown_recipient",
        max_length=100
    )



class SummaryRequest(BaseModel):

    college_id: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    reviews: list[str]


class CollegeSearchRequest(BaseModel):

    query: str = Field(
        ...,
        min_length=1,
        max_length=MAX_SEARCH_QUERY_LENGTH
    )

    limit: int | None = Field(
        default=5,
        ge=1,
        le=20
    )



# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------

def validate_text(
    text: str,
    field_name: str
):

    text = text.strip()

    if not text:

        raise HTTPException(
            status_code=400,
            detail=f"{field_name} cannot be empty."
        )

    return text


# ---------------------------------------------------------
# Public Health Endpoint
# ---------------------------------------------------------

@app.get("/")
def root():

    return {
        "service": "Campus Lenz AI",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# ---------------------------------------------------------
# Review Analysis
# ---------------------------------------------------------

@app.post("/analyze/review")
@limiter.limit("30/minute")
def review_endpoint(
    request: Request,
    review_request: ReviewRequest,
    x_api_key: str | None = Header(
        default=None
    )
):

    verify_api_key(
        x_api_key
    )

    review = validate_text(
        review_request.review,
        "Review"
    )

    try:

        return analyze_review(
            review
        )

    except Exception:

        raise HTTPException(
            status_code=500,
            detail="Review analysis failed."
        )


# ---------------------------------------------------------
# Review Moderation
# ---------------------------------------------------------

@app.post("/moderate/review")
@limiter.limit("30/minute")
def moderate_review_endpoint(
    request: Request,
    moderate_request: ModerateReviewRequest,
    x_api_key: str | None = Header(
        default=None
    )
):

    verify_api_key(
        x_api_key
    )

    review = validate_text(
        moderate_request.review,
        "Review"
    )

    author_id = (
        moderate_request.author_id.strip()
        if moderate_request.author_id
        else "unknown_author"
    )

    college_id = (
        moderate_request.college_id.strip()
        if moderate_request.college_id
        else "unknown_college"
    )

    try:

        return decide_review_action(
            review=review,
            author_id=author_id,
            college_id=college_id
        )

    except Exception:

        raise HTTPException(
            status_code=500,
            detail="Review moderation failed."
        )


# ---------------------------------------------------------
# Post Analysis
# ---------------------------------------------------------

@app.post("/analyze/post")
@limiter.limit("30/minute")
def post_endpoint(
    request: Request,
    post_request: PostRequest,
    x_api_key: str | None = Header(
        default=None
    )
):

    verify_api_key(
        x_api_key
    )

    post = validate_text(
        post_request.post,
        "Post"
    )

    try:

        return analyze_post(
            post
        )

    except Exception:

        raise HTTPException(
            status_code=500,
            detail="Post analysis failed."
        )


# ---------------------------------------------------------
# Post Moderation
# ---------------------------------------------------------

@app.post("/moderate/post")
@limiter.limit("30/minute")
def moderate_post_endpoint(
    request: Request,
    moderate_request: ModeratePostRequest,
    x_api_key: str | None = Header(
        default=None
    )
):

    verify_api_key(
        x_api_key
    )

    post = validate_text(
        moderate_request.post,
        "Post"
    )

    author_id = (
        moderate_request.author_id.strip()
        if moderate_request.author_id
        else "unknown_author"
    )

    college_id = (
        moderate_request.college_id.strip()
        if moderate_request.college_id
        else "unknown_college"
    )

    try:

        return decide_action(
            post=post,
            author_id=author_id,
            college_id=college_id
        )

    except Exception:

        raise HTTPException(
            status_code=500,
            detail="Post moderation failed."
        )


# ---------------------------------------------------------
# Message Moderation
# ---------------------------------------------------------

@app.post("/moderate/message")
@limiter.limit("30/minute")
def moderate_message_endpoint(
    request: Request,
    moderate_request: ModerateMessageRequest,
    x_api_key: str | None = Header(
        default=None
    )
):

    verify_api_key(
        x_api_key
    )

    message = validate_text(
        moderate_request.message,
        "Message"
    )

    sender_id = (
        moderate_request.sender_id.strip()
        if moderate_request.sender_id
        else "unknown_sender"
    )

    recipient_id = (
        moderate_request.recipient_id.strip()
        if moderate_request.recipient_id
        else "unknown_recipient"
    )

    try:

        return decide_message_action(
            message=message,
            sender_id=sender_id,
            recipient_id=recipient_id
        )

    except Exception:

        raise HTTPException(
            status_code=500,
            detail="Message moderation failed."
        )


# ---------------------------------------------------------
# Review Summary
# ---------------------------------------------------------

@app.post("/analyze/summary")
@limiter.limit("10/minute")
def summary_endpoint(
    request: Request,
    summary_request: SummaryRequest,
    x_api_key: str | None = Header(
        default=None
    )
):

    verify_api_key(
        x_api_key
    )

    if not summary_request.reviews:

        raise HTTPException(
            status_code=400,
            detail="At least one review is required."
        )

    if len(summary_request.reviews) > MAX_SUMMARY_REVIEWS:

        raise HTTPException(
            status_code=400,
            detail=(
                f"Maximum {MAX_SUMMARY_REVIEWS} "
                "reviews allowed per request."
            )
        )

    cleaned_reviews = []

    for review in summary_request.reviews:

        review = review.strip()

        if not review:
            continue

        if len(review) > MAX_SUMMARY_REVIEW_LENGTH:

            raise HTTPException(
                status_code=400,
                detail="One of the reviews is too long."
            )

        cleaned_reviews.append(
            review
        )

    if not cleaned_reviews:

        raise HTTPException(
            status_code=400,
            detail="No valid reviews provided."
        )

    try:

        return summarize_reviews(
            college_id=summary_request.college_id.strip(),
            reviews=cleaned_reviews
        )

    except Exception:

        raise HTTPException(
            status_code=500,
            detail="Review summarization failed."
        )


# ---------------------------------------------------------
# Image Analysis
# ---------------------------------------------------------

@app.post("/analyze/image")
@limiter.limit("10/minute")
def image_endpoint(
    request: Request,
    file: UploadFile = File(...),
    x_api_key: str | None = Header(
        default=None
    )
):

    verify_api_key(
        x_api_key
    )

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="Image filename is missing."
        )

    extension = Path(
        file.filename
    ).suffix.lower()

    if extension not in ALLOWED_IMAGE_EXTENSIONS:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported image format. "
                "Allowed: JPG, JPEG, PNG, WEBP."
            )
        )

    if file.content_type not in ALLOWED_IMAGE_TYPES:

        raise HTTPException(
            status_code=400,
            detail="Invalid image content type."
        )

    temporary_path = None

    try:

        image_bytes = file.file.read()

        if not image_bytes:

            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty."
            )

        if len(image_bytes) > MAX_IMAGE_SIZE:

            raise HTTPException(
                status_code=413,
                detail="Image is larger than 10 MB."
            )

        with NamedTemporaryFile(
            suffix=extension,
            delete=False
        ) as temporary_file:

            temporary_file.write(
                image_bytes
            )

            temporary_path = Path(
                temporary_file.name
            )

        result = analyze_image(
            str(temporary_path)
        )

        return result

    except HTTPException:

        raise

    except Exception:

        raise HTTPException(
            status_code=500,
            detail="Image analysis failed."
        )

    finally:

        if temporary_path is not None:

            try:

                temporary_path.unlink(
                    missing_ok=True
                )

            except Exception:

                pass


# ---------------------------------------------------------
# Semantic College Search
# ---------------------------------------------------------

@app.post("/search/colleges")
@limiter.limit("30/minute")
def search_colleges_endpoint(
    request: Request,
    search_request: CollegeSearchRequest,
    x_api_key: str | None = Header(
        default=None
    )
):

    verify_api_key(
        x_api_key
    )

    query = validate_text(
        search_request.query,
        "Search query"
    )

    limit = search_request.limit or 5

    try:

        return search_colleges(
            query=query,
            limit=limit
        )

    except Exception:

        raise HTTPException(
            status_code=500,
            detail="Semantic college search failed."
        )


# ---------------------------------------------------------
# Development Server
# ---------------------------------------------------------

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "api:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )