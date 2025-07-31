import os
import io
import cv2
import numpy as np
import google.generativeai as genai
from fastapi import FastAPI, File, UploadFile, HTTPException, Header, Body
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from starlette.responses import StreamingResponse
from pydantic import BaseModel

# --- App Initialization ---
app = FastAPI(title="Supply Chain AI Suite API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins for simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Model Loading ---
# This path assumes 'models' is a sibling directory to 'app'
model_path = os.path.join(os.path.dirname(__file__), '../models/best.pt')
try:
    detection_model = YOLO(model_path)
    print("✅ Custom YOLOv8 model loaded successfully.")
except Exception as e:
    print(f"❌ Error loading YOLOv8 model: {e}")
    detection_model = None

# Pydantic model for the chat request body
class ChatRequest(BaseModel):
    prompt: str

# --- API Endpoints ---
@app.get("/")
def root():
    return {"message": "Welcome to the Supply Chain AI Suite API"}

@app.post("/chat")
async def stream_chat(request: ChatRequest, authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Gemini API key")
    
    api_key = authorization.split("Bearer ")[1]
    prompt = request.prompt
    
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        async def event_stream():
            stream = await model.generate_content_async(prompt, stream=True)
            async for chunk in stream:
                if chunk.text:
                    # SSE format: data: {your_data}\n\n
                    yield f"data: {chunk.text}\n\n"
        
        return StreamingResponse(event_stream(), media_type="text/event-stream")

    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred with the Gemini API: {e}")

@app.post("/detect")
async def detect_and_count(file: UploadFile = File(...)):
    if not detection_model:
        raise HTTPException(status_code=503, detail="Object detection model is not available.")
    
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Perform inference with your custom model
    results = detection_model(img)
    result = results[0]
    count = len(result.boxes)
    
    # Draw results on the image
    annotated_img = result.plot()
    text = f"Milk Carton Count: {count}"
    
    # Add a white outline to the text for better visibility
    cv2.putText(annotated_img, text, (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 255), 4, cv2.LINE_AA)
    # Add the green text on top
    cv2.putText(annotated_img, text, (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 200, 0), 2, cv2.LINE_AA)

    _, encoded_img = cv2.imencode('.jpg', annotated_img)
    return StreamingResponse(io.BytesIO(encoded_img.tobytes()), media_type="image/jpeg", headers={'X-Object-Count': str(count)})
