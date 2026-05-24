import requests


def ask_ai(task, text):

    prompt = f"""
You are an AI Study Assistant.

Task:
{task}

Text:
{text[:4000]}

Give a clear and student-friendly answer.
"""

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3.2",
            "prompt": prompt,
            "stream": False
        }
    )

    data = response.json()

    return data["response"]