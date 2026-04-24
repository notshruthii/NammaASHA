import os
import json
import traceback
from datetime import datetime, timezone
from typing import List

import fitz  # pymupdf
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# --- 1. Load Environment Variables First ---
load_dotenv()

# --- 2. Configuration & API Keys ---
MONGO_URI = os.getenv("MONGO_URI")
API_KEY = os.getenv("GEMINI_API_KEY")

# --- 3. Database Setup ---
# We initialize the client after loading the .env
client_db = AsyncIOMotorClient(MONGO_URI)
db = client_db.asha_healthcare  # Database Name
forms_collection = db.get_collection("patient_forms")
workers_collection = db.get_collection("workers")

# --- 4. AI Setup ---
ai_client = genai.Client(api_key=API_KEY)

# --- 5. PDF Guidelines Extraction ---
def extract_pdf_text(pdf_path):
    try:
        if not os.path.exists(pdf_path):
            print(f"Warning: {pdf_path} not found. Guidelines will be empty.")
            return ""
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        return text
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return ""

guidelines = extract_pdf_text("Handbook_for_ASHA_Facilitators.pdf")

# --- 6. Pydantic Models ---
class FormSubmission(BaseModel):
    asha_id: str
    asha_name: str
    form_type: str
    patient_name: str
    formData: dict 

class Question(BaseModel):
    text: str
    language: str = "kn" # Default to Kannada

# --- 7. FastAPI App Initialization ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 8. AI Assistant Endpoint ---
@app.post("/ask")
async def ask(question: Question):
    try:
        print(f"Incoming ({question.language}): {question.text}")

        prompt = f"""
You are a healthcare assistant for ASHA workers in Karnataka, India.
Base your answers on the National Health Mission guidelines.

If the question is unrelated to health, respond with an 'Out of scope' topic.

Respond ONLY with a valid JSON object. No markdown fences.

Schema:
{{
  "topic": "English label",
  "answer_en": "2-4 sentence answer",
  "answer_kn": "Same answer in simple Kannada",
  "key_actions_en": ["action 1", "action 2"],
  "key_actions_kn": ["ಕ್ರಿಯೆ 1", "ಕ್ರಿಯೆ 2"],
  "followup_checklist": [
     {{"en": "check item", "kn": "ಪರಿಶೀಲನಾ ಅಂಶ"}}
  ]
}}

Guidelines Context: {guidelines[:5000]} 
Question: {question.text}
"""

        # Using async generate_content if supported, else wrap in run_in_threadpool
        response = ai_client.models.generate_content(
            model="gemini-2.0-flash", # Updated to latest model
            contents=prompt
        )

        raw = response.text
        if not raw:
            raise HTTPException(status_code=500, detail="Empty response from AI")

        # Clean JSON string
        clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        return json.loads(clean)

    except Exception as e:
        traceback.print_exc()
        return {"error": "AI processing error", "detail": str(e)}

# --- 9. Form Submission Endpoint ---
@app.post("/submit-form")
async def submit_form(submission: FormSubmission):
    try:
        doc = submission.model_dump() 
        doc["created_at"] = datetime.now(timezone.utc)
        
        result = await forms_collection.insert_one(doc)
        
        return {
            "status": "success", 
            "message": "Form stored in Atlas", 
            "id": str(result.inserted_id)
        }
    except Exception as e:
        print(f"DB Error: {e}")
        return {"status": "error", "message": str(e)}

# --- 10. Get Records Endpoint ---
@app.get("/get-records/{asha_id}")
async def get_records(asha_id: str):
    try:
        cursor = forms_collection.find({"asha_id": asha_id}).sort("created_at", -1)
        records = await cursor.to_list(length=100)
        for r in records:
            r["_id"] = str(r["_id"]) 
        return records
    except Exception as e:
        return {"status": "error", "message": str(e)}


# Add this model
class LoginRequest(BaseModel):
    asha_id: str

# Add this endpoint
@app.post("/login")
async def login(req: LoginRequest):
    # Search for the worker in the 'workers' collection
    worker = await workers_collection.find_one({"asha_id": req.asha_id})
    
    if worker:
        return {
            "status": "success", 
            "worker_name": worker["name"], 
            "village": worker["village"]
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid ASHA ID")