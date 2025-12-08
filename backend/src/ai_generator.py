# import os
# import json

# from openai import OpenAI
# from typing import Dict, Any
# from dotenv import load_dotenv

# load_dotenv()

# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# def generate_challenge_with_ai(difficulty: str) -> Dict[str, Any]:
#     system_prompt = """You are an expert coding challenge creator. 
#     Your task is to generate a coding question with multiple choice answers.
#     The question should be appropriate for the specified difficulty level.

#     For easy questions: Focus on basic syntax, simple operations, or common programming concepts.
#     For medium questions: Cover intermediate concepts like data structures, algorithms, or language features.
#     For hard questions: Include advanced topics, design patterns, optimization techniques, or complex algorithms.

#     Return the challenge in the following JSON structure:
#     {
#         "title": "The question title",
#         "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
#         "correct_answer_id": 0, // Index of the correct answer (0-3)
#         "explanation": "Detailed explanation of why the correct answer is right"
#     }

#     Make sure the options are plausible but with only one clearly correct answer.
#     """
#     try:
#         response = client.chat.completions.create(
#             model="gpt-3.5-turbo-0125",
#             messages=[
#                 {"role": "system", "content": system_prompt},
#                 {"role": "user", "content": f"Generate a {difficulty} difficulty coding challenge."}
#             ],
#             response_format={"type": "json_object"},
#             temperature=0.7
#         )

#         content = response.choices[0].message.content
#         challenge_data = json.loads(content)

#         required_fields = ["title", "options", "correct_answer_id", "explanation"]
#         for field in required_fields:
#             if field not in challenge_data:
#                 raise ValueError(f"Missing required field: {field}")

#         return challenge_data

#     except Exception as e:
#         print(e)
#         return {
#             "title": "Basic Python List Operation",
#             "options": [
#                 "my_list.append(5)",
#                 "my_list.add(5)",
#                 "my_list.push(5)",
#                 "my_list.insert(5)",
#             ],
#             "correct_answer_id": 0,
#             "explanation": "In Python, append() is the correct method to add an element to the end of a list."
#         }










import os
import json
from groq import Groq
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_challenge_with_ai(difficulty: str) -> Dict[str, Any]:
    system_prompt = """
    You are an expert coding challenge creator.
    Generate a coding question with 4 multiple choice options.

    Difficulty levels:
    - EASY: basic syntax, list operations, loops, conditions
    - MEDIUM: data structures, algorithms, strings, recursion
    - HARD: optimization, advanced algorithms, performance, tricky edge cases

    STRICT JSON FORMAT:
    {
        "title": "question title",
        "options": ["A", "B", "C", "D"],
        "correct_answer_id": 0,
        "explanation": "why the answer is correct"
    }

    Only one correct option.
    Do NOT add extra text outside JSON.
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",   # FREE & FAST
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Generate a {difficulty} difficulty coding challenge in JSON."}
            ],
            temperature=0.7,
        )

        # raw_content = response.choices[0].message.content.strip()

        # Remove backticks if model wraps JSON in ```json ```
        # if raw_content.startswith("```"):
        #     raw_content = raw_content.strip("`")
        #     raw_content = raw_content.replace("json", "").strip()

        raw_content = response.choices[0].message.content

        # Safety check for Pylance + rare model output issues
        if raw_content is None:
            raise ValueError("Groq returned no content.")

        raw_content = raw_content.strip()

        # Remove backticks if wrapped in ```json ... ```
        if raw_content.startswith("```"):
            raw_content = raw_content.strip("`")
            raw_content = raw_content.replace("json", "").strip()


        challenge_data = json.loads(raw_content)

        # Validate required fields
        required_fields = ["title", "options", "correct_answer_id", "explanation"]
        for field in required_fields:
            if field not in challenge_data:
                raise ValueError(f"Missing required field: {field}")

        return challenge_data

    except Exception as e:
        print("Groq AI Error:", e)

        # Safe fallback challenge
        return {
            "title": "Basic Python List Operation",
            "options": [
                "my_list.append(5)",
                "my_list.add(5)",
                "my_list.push(5)",
                "my_list.insert(5)",
            ],
            "correct_answer_id": 0,
            "explanation": "append() adds an element to the end of a Python list."
        }


def generate_node_followup(topic: str, node_title: str, followup: str) -> str:
    """
    Return a natural-language follow-up answer (no JSON). Keep it concise; include code blocks when relevant.
    """
    system_prompt = f"""
    You are an expert teacher. Answer follow-up questions about "{node_title}" within topic "{topic}" in short paragraphs.

    Rules:
    - Respond as plain text (no JSON, no lists unless needed).
    - If code is included, wrap it in fenced code blocks with a correct language tag, e.g.:
      ```javascript
      // code
      ```
      ```python
      # code
      ```
    - Prefer under 200 words.
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": followup},
            ],
            temperature=0.6,
        )

        raw_content = response.choices[0].message.content
        if raw_content is None:
            raise ValueError("Groq returned no content for node follow-up.")
        return raw_content.strip()
    except Exception as e:
        print("Groq node follow-up error:", e)
        return "Sorry, I couldn’t generate that answer. Please try again."

def generate_topic_nodes(topic: str, max_subtopics: int = 8) -> Dict[str, Any]:
    """
    Generate a topic tree (root + subtopics) for the given topic.

    Returns a JSON-friendly dict with keys:
    - root: topic string
    - nodes: list of nodes where each node is {"id": str, "title": str}
    Note: Only returns immediate subtopics, no nested children.
    """
    system_prompt = f"""
    You are an expert knowledge-graph generator. Given a topic, produce a JSON object describing a root node and up to {max_subtopics} immediate subtopics.

    STRICT JSON FORMAT:
    {{
      "root": "Topic Name",
      "nodes": [
        {{"id": "1", "title": "Subtopic A"}},
        {{"id": "2", "title": "Subtopic B"}},
        ...
      ]
    }}

    IMPORTANT:
    - Make ids simple numeric strings starting from "1"
    - Each node should only have "id" and "title" fields
    - Do NOT include "children" field in any node
    - Return only the immediate subtopics of the root topic
    - Return no more than {max_subtopics} subtopics; prefer exactly {max_subtopics} if relevant subtopics exist
    - Only return the JSON object and no additional explanation.
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Create a short topic tree for: {topic}."}
            ],
            temperature=0.6,
        )

        raw_content = response.choices[0].message.content
        if raw_content is None:
            raise ValueError("Groq returned no content for topic nodes.")

        raw_content = raw_content.strip()
        if raw_content.startswith("```"):
            raw_content = raw_content.strip("`")
            raw_content = raw_content.replace("json", "").strip()

        data = json.loads(raw_content)

        # Basic validation
        if "root" not in data or "nodes" not in data:
            raise ValueError("Invalid node structure returned from AI.")

        # Clean up nodes - remove children field if present, keep only id and title
        cleaned_nodes = []
        for node in data.get("nodes", []):
            cleaned_node = {
                "id": str(node.get("id", "")),
                "title": str(node.get("title", ""))
            }
            cleaned_nodes.append(cleaned_node)

        return {
            "root": data.get("root", topic),
            "nodes": cleaned_nodes
        }

    except Exception as e:
        print("Groq topic nodes error:", e)
        # Fallback simple node list
        nodes = []
        for i, name in enumerate(["Overview", "Fundamentals", "Advanced Topics", "Examples", "Best Practices"][:max_subtopics], start=1):
            nodes.append({"id": str(i), "title": name})

        return {"root": topic, "nodes": nodes}


def generate_node_detail(topic: str, node_title: str, followup: str = None) -> Dict[str, Any]:
    """
    Generate a detailed explanation for a specific node within a topic tree.

    Returns: {"title": <node_title>, "definition": "...", "why_important": "...", "examples": "..."}
    """
    system_prompt = f"""
    You are an expert teacher. Given a topic "{topic}" and a node title "{node_title}", return a JSON object with a concise definition, why it's important, a short example, and 2-3 interview-style questions with answers.

    If your answer includes any code, wrap it in fenced code blocks with the correct language label, for example:
    ```javascript
    // code here
    ```
    ```python
    # code here
    ```
    Keep the JSON valid by escaping newlines as needed.

    STRICT JSON FORMAT:
    {{
      "title": "...",
      "definition": "...",
      "why_important": "...",
      "examples": ["ex1", "ex2"],
      "interview_questions": [
        {{"q": "...", "a": "..."}},
      ]
    }}

    Only return the JSON object.
    """

    try:
        # If there's a followup question from the user, include it in the user message
        user_message = f"Provide detailed info for node: {node_title} under topic: {topic}."
        if followup:
            user_message += f"\n\nFollow-up question: {followup} \nAnswer and expand the previous information accordingly."

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.6,
        )

        raw_content = response.choices[0].message.content
        if raw_content is None:
            raise ValueError("Groq returned no content for node detail.")

        raw_content = raw_content.strip()
        if raw_content.startswith("```"):
            raw_content = raw_content.strip("`")
            raw_content = raw_content.replace("json", "").strip()

        data = json.loads(raw_content)
        return data

    except Exception as e:
        print("Groq node detail error:", e)
        return {
            "title": node_title,
            "definition": f"{node_title} is an important concept within {topic}.",
            "why_important": "It helps understand core ideas and practical use-cases.",
            "examples": ["Example 1", "Example 2"],
            "interview_questions": [{"q": "What is this?", "a": "Short answer."}]
        }
