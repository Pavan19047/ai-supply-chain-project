AI Supply Chain Suite - Neumorphism Edition
Live Demo: https://ai-supply-chain.netlify.app/

A modern, full-stack web application designed to bring powerful AI tools to supply chain management. This suite features a beautiful Neumorphic user interface and offers two core functionalities: an AI-powered inventory counter and an intelligent chat assistant.

Features
📦 Inventory Vision: Upload an image of milk cartons and get an instant, accurate count.

🧠 Custom AI Model: Powered by a custom-trained YOLOv8 model for high-accuracy object detection.

🤖 AI Chat Assistant: A real-time, streaming chat interface connected to the Google Gemini API for intelligent Q&A and assistance.

✨ Neumorphic UI: A stunning, modern user interface built with soft shadows and a tactile feel, created using React and styled-components.

🚀 Full-Stack Architecture: A robust backend built with Python and FastAPI, serving the AI model and handling API requests.

☁️ Deployed for Free: The backend is hosted on Render and the frontend on Netlify, utilizing their generous free tiers.

Tech Stack
Frontend

Backend & AI

React (with Vite)

Python 3

Styled Components for Neumorphism

FastAPI for the web server

Axios for API requests

Uvicorn as the ASGI server

React Dropzone for file uploads

Ultralytics YOLOv8 for object detection

React Markdown for chat rendering

OpenCV for image processing

Netlify for hosting

Google Gemini API for generative AI



Render for hosting

How to Use the Live Application
Visit the live demo at https://ai-supply-chain.netlify.app/.

Using the Inventory Vision
The application loads on the "Inventory Vision" tab by default.

Drag and drop an image containing milk cartons into the dashed box, or click the box to select a file from your computer.

A preview of your uploaded image will appear.

Click the "Count Items" button.

The application will send the image to the backend, and after a moment, it will display the annotated image with bounding boxes and the final count.

Using the AI Chat Assistant
Click on the "AI Chat Assistant" button in the top navigation.

Get a Gemini API Key: To use the chat, you need a free API key from Google. You can get one here: Google AI for Developers.

Enter Your Key: Paste your Gemini API key into the input box. The key is saved in your browser's local storage for convenience, so you only need to do this once.

Start Chatting: Once the key is entered, you can type questions into the message box at the bottom and press Enter or click "Send". The AI's response will stream in real-time.

Running the Project Locally
To run this application on your own machine, follow these steps.

Prerequisites
Git

Node.js (which includes npm)

Python 3.8+

1. Clone the Repository
First, clone the project repository to your local machine.

git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

2. Set Up the AI Model
You need a trained model file to run the backend.

Train your own model using the provided Colab notebooks.

Place the resulting best.pt file inside the backend/models/ directory.

3. Set Up and Run the Backend
The backend runs on Python and FastAPI.

# Navigate to the backend directory
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install the required Python packages
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload

The backend will now be running at http://localhost:8000. You should see a terminal message confirming that the YOLOv8 model was loaded successfully.

4. Set Up and Run the Frontend
The frontend is a React application built with Vite.

# Open a new, separate terminal window
# Navigate to the frontend directory
cd frontend

# Install the required npm packages
npm install

# Start the frontend development server
npm run dev

The frontend will now be running at http://localhost:5173 (or the next available port). Open this URL in your browser to use the application locally.
