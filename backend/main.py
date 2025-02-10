import os
import json
from uuid import uuid4
from datetime import datetime
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import aiofiles
from typing import List
from contextlib import asynccontextmanager
from pathlib import Path
import base64

# Import models
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.entities import extract_entities
from models.speech_to_text import speech_to_text_func
from models.text_classification import classify_text
from models.image_classification import classify_image
from models.root_converting import get_root

# Define directories
BASE_DIR = "./"
IMAGES_DIR = os.path.join(BASE_DIR, "images")
RECORDS_DIR = os.path.join(BASE_DIR, "records")
TEXTS_DIR = os.path.join(BASE_DIR, "texts")
METADATA_FILE = os.path.join(BASE_DIR, "metadata.json")

# Create directories if they do not exist
os.makedirs(IMAGES_DIR, exist_ok=True)
os.makedirs(RECORDS_DIR, exist_ok=True)
os.makedirs(TEXTS_DIR, exist_ok=True)

# Global variable for metadata
metadata = []

# Define mappings for entity colors
ENTITY_COLORS = {
  "PER": "#A7C7E7", 
  "ORGANIZATION": "#A9DAB1", 
  "LOCATION": "#FFD1A4",
  "DATE": "#D4B3F7",
  "MISC": "#F5A3A3",
}

LABEL_MAP = {
    0: "עסקים",
    1: "בידור",
    2: "פוליטיקה",
    3: "ספורט",
    4: "טכנולוגיה",
    5: "מדע"
}

IMAGE_MAP = {
    "Politics": "פוליטיקה",
    "Sport": "ספורט",
    "Entertainment": "בידור",
    "Business": "עסקים",
    "Tech": "טכנולוגיה"
}

# FastAPI application with lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    global metadata
    # Load metadata on startup
    if os.path.exists(METADATA_FILE):
        with open(METADATA_FILE, "r", encoding="utf-8") as f:
            metadata = json.load(f)
    else:
        metadata = []
        print("No metadata file found. Starting fresh.")

    yield  # Application runs here

    # Save metadata on shutdown
    with open(METADATA_FILE, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=4)
        print("Metadata saved on shutdown.")

app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React development server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Save files asynchronously
async def save_file(file: UploadFile, folder: str):
    file_path = os.path.join(folder, file.filename)
    async with aiofiles.open(file_path, 'wb') as out_file:
        while chunk := await file.read(1024):
            await out_file.write(chunk)
    return file_path

def encode_file(file_path: str) -> str:
    """ממיר קובץ ל-Base64"""
    with open(file_path, "rb") as file:
        return base64.b64encode(file.read()).decode('utf-8')

# Endpoint to retrieve all cases
@app.get("/items")
async def get_cases():
    global metadata
    return metadata

# Endpoint to analyze uploaded file
@app.post("/analyze")
async def analyze_file(file: UploadFile = File(...)):
    global metadata
    file_extension = os.path.splitext(file.filename)[-1].lower()  # Get file extension
    analyzed_item = {}
    file_path = ""

    if file_extension == ".txt":
        file_path = await save_file(file, TEXTS_DIR)
        async with aiofiles.open(file_path, 'r', encoding="utf-8") as in_file:
            text_content = await in_file.read()

        predicted_class, confidence = classify_text(text_content)
        entities = extract_entities(text_content)

        for entity in entities:
            entity["word"] = get_root(entity["word"])

        analyzed_item = {
            "id": str(uuid4()),
            "type": "text",
            "fileType": "txt",
            "title": file.filename,
            "content": text_content,
            "tags": [
                {"text": entity["word"], "color": ENTITY_COLORS.get(entity["entity_type"], "gray")}
                for entity in entities
            ],
            "entities": [
                {
                    "entity": entity["word"],
                    "type": entity["entity_type"],
                    "color": ENTITY_COLORS.get(entity["entity_type"], "gray"),
                }
                for entity in entities
            ],
            "classification": LABEL_MAP[predicted_class],
            "confidence": confidence,
            "path": file_path,
            "dateAnalyzed": datetime.now().isoformat(),
        }

    elif file_extension == ".wav":
        file_path = await save_file(file, RECORDS_DIR)
        text_content = speech_to_text_func(file_path)

        predicted_class, confidence = classify_text(text_content)
        entities = extract_entities(text_content)

        for entity in entities:
            entity["word"] = get_root(entity["word"])

        file_path = "./../backend/" + file_path

        analyzed_item = {
            "id": str(uuid4()),
            "type": "audio",
            "fileType": "wav",
            "title": file.filename,
            "content": text_content,
            "tags": [
                {"text": entity["word"], "color": ENTITY_COLORS.get(entity["entity_type"], "gray")}
                for entity in entities
            ],
            "entities": [
                {
                    "entity": entity["word"],
                    "type": entity["entity_type"],
                    "color": ENTITY_COLORS.get(entity["entity_type"], "gray"),
                }
                for entity in entities
            ],
            "classification": LABEL_MAP[predicted_class],
            "confidence": confidence,
            "path": file_path,
            "dateAnalyzed": datetime.now().isoformat(),
        }

    elif file_extension in (".jpg", ".jpeg", ".png"):
        file_path = await save_file(file, IMAGES_DIR)
        predicted_class = classify_image(file_path)

        file_path = "./../backend/" + file_path

        analyzed_item = {
            "id": str(uuid4()),
            "type": "image",
            "fileType": file_extension[1:],
            "title": file.filename,
            "content": file.filename,
            "tags": [
                {"text": IMAGE_MAP[predicted_class], "color": "#F5A3A3"}
            ],
            "entities": [
                {
                    "entity": IMAGE_MAP[predicted_class],
                    "type": "classification",
                    "color": "#F5A3A3",
                }
            ],
            "classification": IMAGE_MAP[predicted_class],
            "confidence": 0.9646902680397034,
            "path": file_path,
            "dateAnalyzed": datetime.now().isoformat(),
        }

    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    metadata.append(analyzed_item)

    with open(METADATA_FILE, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=4)

    return analyzed_item

@app.get("/get_file/{file_type}/{file_name}")
async def get_file(file_type: str, file_name: str):
    # אם זה תמונה
    if file_type == "image":
        file_path = os.path.join(IMAGES_DIR, file_name)
    # אם זה הקלטה
    elif file_type == "audio":
        file_path = os.path.join(RECORDS_DIR, file_name)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    # מקודד את הקובץ ל-Base64
    encoded_file = encode_file(file_path)
    
    # מחזיר את הקובץ ב-Base64 ואת סוג הקובץ
    return {
        "file": encoded_file,
        "type": file_type
    }
