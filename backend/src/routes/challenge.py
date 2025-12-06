from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

from ..ai_generator import generate_challenge_with_ai
from ..database.db import (
    get_challenge_quota,
    create_challenge,
    create_challenge_quota,
    reset_quota_if_needed,
    get_user_challenges
)
from ..utils import authenticate_and_get_user_details
from ..database.models import get_db
import json


router = APIRouter()


class ChallengeRequest(BaseModel):
    difficulty: str

    class Config:
        json_schema_extra = {"example": {"difficulty": "easy"}}


@router.post("/generate-challenge")
async def generate_challenge(request: ChallengeRequest, request_obj: Request, db: Session = Depends(get_db)):
    """
    Generate a new challenge using AI, based on the requested difficulty.
    This endpoint requires authentication and respects the user's challenge quota.

    Args:
        request: The request body containing the difficulty level.
        request_obj: The FastAPI request object, used for authentication.
        db: The database session.

    Returns:
        A dictionary containing the details of the newly created challenge.
    """
    try:
        user_details = authenticate_and_get_user_details(request_obj)
        user_id = str(user_details.get("user_id"))

        quota = get_challenge_quota(db, user_id)
        if not quota:
            quota = create_challenge_quota(db, user_id)

        quota = reset_quota_if_needed(db, quota)

        if quota.quota_remaining <= 0:
            raise HTTPException(status_code=429, detail="Quota exhausted")

        try:
            challenge_data = generate_challenge_with_ai(request.difficulty)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Failed to generate challenge: {e}")

        new_challenge = create_challenge(
            db=db,
            difficulty=request.difficulty,
            created_by=user_id,
            title=challenge_data["title"],
            options=json.dumps(challenge_data["options"]),
            correct_answer_id=challenge_data["correct_answer_id"],
            explanation=challenge_data["explanation"]
        )

        quota.quota_remaining -= 1
        db.commit()

        return {
            "id": new_challenge.id,
            "difficulty": request.difficulty,
            "title": new_challenge.title,
            "options": json.loads(new_challenge.options),
            "correct_answer_id": new_challenge.correct_answer_id,
            "explanation": new_challenge.explanation,
            "timestamp": new_challenge.date_created.isoformat()
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")


@router.get("/my-history")
async def my_history(request: Request, db: Session = Depends(get_db)):
    """
    Get the challenge history for the authenticated user.

    Args:
        request: The FastAPI request object, used for authentication.
        db: The database session.

    Returns:
        A dictionary containing a list of challenges created by the user.
    """
    user_details = authenticate_and_get_user_details(request)
    user_id = str(user_details.get("user_id"))

    challenges = get_user_challenges(db, user_id)
    return {"challenges": challenges}


# @router.get("/quota")
# async def get_quota(request: Request, db: Session = Depends(get_db)):
#     """
#     Get the challenge quota for the authenticated user.

#     Args:
#         request: The FastAPI request object, used for authentication.
#         db: The database session.

#     Returns:
#         The user's challenge quota object.
#     """
#     user_details = authenticate_and_get_user_details(request)
#     user_id = str(user_details.get("user_id"))

#     quota = get_challenge_quota(db, user_id)
#     if not quota:
#         return {
#             "user_id": user_id,
#             "quota_remaining": 0,
#             "last_reset_date": datetime.now()
#         }

#     quota = reset_quota_if_needed(db, quota)
#     return quota







@router.get("/quota")
async def get_quota(request: Request, db: Session = Depends(get_db)):
    # 1. Authenticate user
    user_details = authenticate_and_get_user_details(request)
    if not user_details:
        raise HTTPException(status_code=401, detail="Invalid or missing auth token")
    
    user_id = str(user_details.get("user_id"))

    # 2. Fetch quota
    quota = get_challenge_quota(db, user_id)

    # 3. If quota doesn't exist yet
    if not quota:
        return {
            "user_id": user_id,
            "quota_remaining": 0,
            "last_reset_date": datetime.now()
        }

    # 4. Reset quota if needed
    quota = reset_quota_if_needed(db, quota)

    # 5. Return dictionary instead of SQLAlchemy model
    return {
        "id": quota.id,
        "user_id": quota.user_id,
        "quota_remaining": quota.quota_remaining,
        "last_reset_date": quota.last_reset_date
    }
