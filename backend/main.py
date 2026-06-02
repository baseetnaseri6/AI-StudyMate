from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os

from pdf_service import extract_text_from_pdf
from ai_service import ask_ai

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

last_pdf_text = ""
last_pdf_name = ""


@app.get("/")
def home():
    return {"message": "AI StudyMate backend is running"}


@app.post("/study")
async def study_pdf(
    file: UploadFile = File(...),
    task: str = Form(...)
):
    global last_pdf_text, last_pdf_name

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    pdf_text = extract_text_from_pdf(file_path)

    last_pdf_text = pdf_text
    last_pdf_name = file.filename

    result = ask_ai(task, pdf_text)

    return {
        "filename": file.filename,
        "task": task,
        "text_length": len(pdf_text),
        "result": result
    }


@app.post("/chat")
async def chat_with_pdf(question: str = Form(...)):
    global last_pdf_text, last_pdf_name

    if not last_pdf_text:
        return {
            "answer": "Please upload and analyze a PDF first."
        }

    prompt = f"""
Answer the user's question based only on this PDF.

PDF Name:
{last_pdf_name}

Question:
{question}

PDF Text:
{last_pdf_text[:6000]}
"""

    answer = ask_ai(prompt, last_pdf_text)

    return {
        "pdf": last_pdf_name,
        "question": question,
        "answer": answer
    }
