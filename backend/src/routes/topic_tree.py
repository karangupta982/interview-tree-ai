from fastapi import APIRouter, Depends, Request
from groq import Groq
from ..database.models import get_db
from ..utils import authenticate_and_get_user_details
import os

router = APIRouter()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@router.post("/generate-subtopics")
async def generate_subtopics(payload: dict, request: Request):
    user = authenticate_and_get_user_details(request)
    topic = payload.get("topic")

    prompt = f"""
    Generate 6–10 subtopics for: {topic}
    Only return a list of subtopics, no explanation.
    """

    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": prompt}]
    )

    cleaned = response.choices[0].message["content"]
    subtopics = [t.strip("- ").strip() for t in cleaned.split("\n") if t.strip()]

    return {"topic": topic, "subtopics": subtopics}
