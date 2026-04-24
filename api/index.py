import os
import json
import traceback
from datetime import datetime, timezone
from typing import List
import re 
import fitz  # pymupdf
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import bcrypt

# --- 1. Load Environment Variables ---
load_dotenv()

# --- 2. Configuration & API Keys ---
MONGO_URI = os.getenv("MONGO_URI")
API_KEY = os.getenv("GEMINI_API_KEY")

# --- 3. Database Setup ---
client_db = AsyncIOMotorClient(MONGO_URI)
db = client_db.asha_healthcare 
forms_collection = db.get_collection("patient_forms")
workers_collection = db.get_collection("workers")

# --- 4. AI Setup ---
ai_client = genai.Client(api_key=API_KEY)

# --- 5. Password Verification Utility ---
# We ONLY keep verify_password here. 
# get_password_hash is now in your other script.
def verify_password(plain_password: str, hashed_password: str):
    try:
        password_byte_enc = plain_password.encode('utf-8')
        hashed_password_enc = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_byte_enc, hashed_password_enc)
    except Exception:
        return False

# --- 6. PDF Guidelines Extraction ---
def extract_pdf_text(pdf_path):
    try:
        if not os.path.exists(pdf_path):
            print(f"Warning: {pdf_path} not found.")
            return ""
        doc = fitz.open(pdf_path)
        text = "".join([page.get_text() for page in doc])
        return text
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return ""





# --- Update this part specifically ---
# This finds the folder where index.py lives (the api/ folder)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
pdf_filename = "Handbook_for_ASHA_Facilitators.pdf"
pdf_path = os.path.join(BASE_DIR, pdf_filename)

# Define a fallback so the variable ALWAYS exists, even if extraction fails
guidelines = ""

def extract_pdf_text(path):
    try:
        if not os.path.exists(path):
            print(f"CRITICAL ERROR: PDF not found at {path}")
            return ""
        doc = fitz.open(path)
        text = ""
        for page in doc:
            text += page.get_text()
        return text
    except Exception as e:
        print(f"PDF Extraction failed: {e}")
        return ""

# Initialize the variable
guidelines = extract_pdf_text(pdf_path)

# --- 7. Pydantic Models ---
class FormSubmission(BaseModel):
    asha_id: str
    asha_name: str
    form_type: str
    patient_name: str
    formData: dict 

class Question(BaseModel):
    text: str
    language: str = "kn"

class LoginRequest(BaseModel):
    asha_id: str
    password: str  

# --- 8. FastAPI App Initialization ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 9. Endpoints ---

@app.post("/api/login")
async def login(req: LoginRequest):
    # 1. Look up worker in the 'workers' collection
    worker = await workers_collection.find_one({"asha_id": req.asha_id})
    
    # 2. Verify existence and password hash
    if worker and verify_password(req.password, worker.get("password")):
        return {
            "status": "success", 
            "worker_name": worker["name"], 
            "village": worker.get("village", "Unknown")
        }
    
    raise HTTPException(status_code=401, detail="Invalid ID or Password")



@app.post("/api/ask")
async def ask(question: Question):
    try:
        print(f"Incoming ({question.language}): {question.text}")

        prompt = f"""

ROLE: You are a helpful, expert supervisor for ASHA (Accredited Social Health Activist) workers in Karnataka. 
KNOWLEDGE BASE: Use the provided National Health Mission (NHM) guidelines.
AUDIENCE: ASHA workers who need simple, actionable health advice for village residents.

CONSTRAINTS:
1. Answer in both kannada and english.
2. Use simple, conversational Kannada (ಕನ್ನಡ) that is easy to read. 
3. If the question is not about health or ASHA duties, set the topic to "Out of Scope".
4. If the condition sounds like an emergency (Red Flags), prioritize referral to a PHC/Hospital in the key actions.
5. Output MUST be a valid JSON object. Do not include any text before or after the JSON.

SCHEMA:
{{
  "topic": "Brief category (e.g., Maternal Health, Newborn Care)",
  "answer_en": "Clear, professional 2-4 sentence explanation.",
  "answer_kn": "ಸರಳ ಕನ್ನಡದಲ್ಲಿ ವಿವರಣೆ (Simple Kannada explanation).",
  "key_actions_en": ["Step-by-step instructions for the ASHA worker"],
  "key_actions_kn": ["ASHA ಕಾರ್ಯಕರ್ತೆಯರಿಗಾಗಿ ಹಂತ-ಹಂತದ ಸೂಚನೆಗಳು"],
  "followup_checklist": [
     {{"en": "Item to monitor", "kn": "ಪರಿಶೀಲಿಸಬೇಕಾದ ಅಂಶ"}}
  ]
}}

CONTEXT FROM HANDBOOK: 
{guidelines[:5000]}

QUESTION: 
{question.text}
"""
        response = ai_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        raw = response.text
        if not raw:
            raise HTTPException(status_code=500, detail="Empty response from AI")

        # --- NEW ROBUST JSON EXTRACTION ---
        # This finds the first '{' and the last '}' ignoring any markdown fences
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if match:
            clean_json_str = match.group(0)
            return json.loads(clean_json_str)
        else:
            print(f"Regex failed to find JSON in AI response: {raw}")
            raise ValueError("AI response did not contain a valid JSON object")

    except Exception as e:
        traceback.print_exc()
        # FALLBACK: Return a valid object so the Frontend AICard doesn't show blank labels
        return {
            "topic": "Error",
            "answer_en": "I'm sorry, I encountered an error while processing your request.",
            "answer_kn": "ಕ್ಷಮಿಸಿ, ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುವಾಗ ದೋಷ ಸಂಭವಿಸಿದೆ.",
            "key_actions_en": ["Please try again later"],
            "key_actions_kn": ["ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ"],
            "followup_checklist": []
        }
@app.post("/api/submit-form")
async def submit_form(submission: FormSubmission):
    try:
        doc = submission.model_dump() 
        doc["created_at"] = datetime.now(timezone.utc)
        result = await forms_collection.insert_one(doc)
        return {"status": "success", "id": str(result.inserted_id)}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/get-records/{asha_id}")
async def get_records(asha_id: str):
    try:
        cursor = forms_collection.find({"asha_id": asha_id}).sort("created_at", -1)
        records = await cursor.to_list(length=100)
        for r in records: r["_id"] = str(r["_id"]) 
        return records
    except Exception as e:
        return {"status": "error", "message": str(e)}