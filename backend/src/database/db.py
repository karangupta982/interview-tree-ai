from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, List

from .models import ChallengeQuota, Challenge


def get_challenge_quota(db: Session, user_id: str) -> Optional[ChallengeQuota]:
    """
    Returns the user's quota row if found, otherwise None.
    """
    # return (
    #     db.query(ChallengeQuota)
    #     .filter(ChallengeQuota.user_id == user_id)
    #     .first()
    # )
    res = db.query(ChallengeQuota).filter(ChallengeQuota.user_id == user_id).first()
    print("###########Fetched quota#############:", res)
    return res



def create_challenge_quota(db: Session, user_id: str) -> ChallengeQuota:
    """
    Creates a new quota entry for a user who does not have one.
    """
    quota = ChallengeQuota(user_id=user_id, quota_remaining=20)
    db.add(quota)
    db.commit()
    db.refresh(quota)
    return quota


def reset_quota_if_needed(db: Session, quota: ChallengeQuota) -> ChallengeQuota:
    """
    Resets the user's quota if 24 hours have passed since the last reset.
    """
    now = datetime.now()
    last_reset = quota.last_reset_date 

    if now - last_reset > timedelta(hours=24):
        quota.quota_remaining = 10
        quota.last_reset_date = now
        db.commit()
        db.refresh(quota)

    return quota


def create_challenge(
    db: Session,
    difficulty: str,
    created_by: str,
    title: str,
    options: str,
    correct_answer_id: int,
    explanation: str
) -> Challenge:
    """
    Creates a new challenge and saves it to the database.
    """
    challenge = Challenge(
        difficulty=difficulty,
        created_by=created_by,
        title=title,
        options=options,
        correct_answer_id=correct_answer_id,
        explanation=explanation
    )

    db.add(challenge)
    db.commit()
    db.refresh(challenge)
    return challenge


def get_user_challenges(db: Session, user_id: str) -> List[Challenge]:
    """
    Returns all challenges created by a specific user.
    """
    return (
        db.query(Challenge)
        .filter(Challenge.created_by == user_id)
        .all()
    )
