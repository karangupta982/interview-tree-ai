from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

from ..ai_generator import generate_topic_nodes, generate_node_detail
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
    # Updated: accept a topic instead of difficulty for topic-node generation
    topic: str
    max_subtopics: int = 8

    class Config:
        json_schema_extra = {"example": {"topic": "ReactJS", "max_subtopics": 6}}


@router.post("/generate-challenge")
async def generate_challenge(request: ChallengeRequest, request_obj: Request, db: Session = Depends(get_db)):
    
    try:
        user_details = authenticate_and_get_user_details(request_obj)
        user_id = str(user_details.get("user_id"))

        quota = get_challenge_quota(db, user_id)
        if not quota:
            quota = create_challenge_quota(db, user_id)

        quota = reset_quota_if_needed(db, quota)

        if quota.quota_remaining <= 0:
            raise HTTPException(status_code=429, detail="Quota exhausted")

        # Generate topic nodes using AI generator
        try:
            topic_data = generate_topic_nodes(request.topic, request.max_subtopics)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Failed to generate topic nodes: {e}")

        # Deduct quota and commit
        quota.quota_remaining -= 1
        db.commit()

        return {
            "topic": topic_data.get("root", request.topic),
            "nodes": topic_data.get("nodes", []),
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
    print("###########Quota endpoint hit user authenticated############")
    if not user_details:
        raise HTTPException(status_code=401, detail="Invalid or missing auth token")
    
    user_id = str(user_details.get("user_id"))
    print("###########Quota endpoint hit user ID############", user_id)
    # 2. Fetch quota
    quota = get_challenge_quota(db, user_id)
    print("###########Quota endpoint hit quota fetched############", quota)
    # 3. If quota doesn't exist yet
    if not quota:
        return {
            "user_id": user_id,
            "quota_remaining": 0,
            "last_reset_date": datetime.now()
        }

    # 4. Reset quota if needed
    quota = reset_quota_if_needed(db, quota)
    print("###########Quota endpoint hit quota after reset check############", quota)
    # 5. Return dictionary instead of SQLAlchemy model
    return {
        "id": quota.id,
        "user_id": quota.user_id,
        "quota_remaining": quota.quota_remaining,
        "last_reset_date": quota.last_reset_date.isoformat()
    }



class NodeDetailRequest(BaseModel):
    topic: str
    node_title: str


@router.post("/generate-node-detail")
async def generate_node_detail_endpoint(request: NodeDetailRequest, request_obj: Request, db: Session = Depends(get_db)):
    """
    Generate a detailed explanation for a single node inside a topic tree.
    """
    user_details = authenticate_and_get_user_details(request_obj)
    if not user_details:
        raise HTTPException(status_code=401, detail="Invalid or missing auth token")

    try:
        detail = generate_node_detail(request.topic, request.node_title)
        return detail
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate node detail: {e}")