
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv
import os
import fitz  # pymupdf

def extract_pdf_text(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

guidelines = extract_pdf_text("Handbook_for_ASHA_Facilitators.pdf")
# Load .env
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

# Debug (optional)
print("API KEY LOADED:", API_KEY is not None)

# Init client
client = genai.Client(api_key=API_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    text: str

import json

@app.post("/ask")
def ask(question: Question):
    try:
        print("Incoming:", question.text)

        prompt = f"""
You are an assistant for ASHA health workers in Karnataka, India.

You answer questions related to:
- Maternal health
- Newborn and child health
- Immunization
- Nutrition
- Communicable diseases (e.g., fever, diarrhea, TB, malaria, dengue)
- Basic first aid and community health education
- National Health Mission (NHM) and HBNC guidelines

If the question is outside healthcare, respond with:
{{
  "topic": "Out of scope",
  "answer_en": "This question is not related to ASHA health work or community healthcare.",
  "answer_kn": "ಈ ಪ್ರಶ್ನೆ ಆರೋಗ್ಯ ಕಾರ್ಯಕ್ಕೆ ಸಂಬಂಧಪಟ್ಟಿಲ್ಲ.",
  "key_actions_en": [],
  "key_actions_kn": [],
  "followup_checklist": null
}}

Respond ONLY with a valid JSON object. No markdown, no extra text.

Schema:
{{
  "topic": "<short topic label in English>",
  "answer_en": "<clear answer in English, 2-4 sentences>",
  "answer_kn": "<same answer in simple Kannada>",
  "key_actions_en": ["<action 1>", "<action 2>", "<action 3>"],
  "key_actions_kn": ["<action 1 in Kannada>", "<action 2>", "<action 3>"],
  "followup_checklist": null
}}

The "followup_checklist" field should be null UNLESS the question involves
assessing a patient, doing a home visit, checking immunization status,
or any verification task. If needed:
[
  {{"en": "<check item>", "kn": "<check item in Kannada>"}}
]
Limit to 4–5 items.

Guidelines: {guidelines}
Question: {question.text}
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        raw = getattr(response, "text", None)
        if not raw:
            return {"error": "No response from AI"}

        # Strip any accidental markdown fences
        clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()

        try:
            data = json.loads(clean)
        except json.JSONDecodeError:
            return {"error": "AI returned malformed JSON", "raw": raw}

        return data

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": "Backend error", "detail": str(e)}


