AI-SUPPLY-CHAIN-PROJECT
Transforming Supply Chains with Intelligent Automation

Built with the tools and technologies:

</div>

Table of Contents
Overview

Getting Started

Prerequisites

Installation

Usage

Live Demo

Overview
ai-supply-chain-project is a comprehensive developer toolkit that integrates AI-powered inventory counting and intelligent chat assistance into a modern web application. It leverages advanced AI models, React, and a scalable backend architecture to streamline supply chain management workflows.

Why ai-supply-chain-project?
This project enables developers to rapidly build and deploy AI-enhanced supply chain solutions. The core features include:

🧠 AI Inventory Counting: Automate milk carton detection and counting through image analysis, reducing manual effort and improving accuracy with a custom-trained YOLOv8 model.

🤖 Conversational AI Chat: Engage with a streaming, markdown-rendered chat interface powered by the Google Gemini API for real-time support and insights.

✨ Stunning Neumorphic UI: A modern, tactile user interface built with soft shadows and gradients using React and styled-components.

🚀 Fast Development Environment: Utilize Vite with React for rapid iteration, hot module replacement, and efficient UI development.

🧩 Modular Architecture: Seamlessly connect frontend components with a robust FastAPI backend for scalable, maintainable workflows.

🎯 Focused Supply Chain Features: Designed specifically to enhance inventory accuracy and operational efficiency.

Getting Started
Prerequisites
This project requires the following dependencies to be installed on your system:

Programming Languages: Python 3.8+, Node.js (v18+)

Package Managers: Npm, Pip

Installation
Build ai-supply-chain-project from the source and install dependencies:

Clone the repository:

git clone https://github.com/Pavan19047/ai-supply-chain-project

Navigate to the project directory:

cd ai-supply-chain-project

Set Up the AI Model:

Train your own YOLOv8 model (e.g., using Google Colab).

Place the resulting best.pt file inside the backend/models/ directory.

Install the dependencies:

Using npm (for the frontend):

npm install --prefix frontend

Using pip (for the backend):

pip install -r backend/requirements.txt

Usage
Run the project with the following commands.

1. Start the Backend Server:

# From the project root directory
uvicorn backend.app.main:app --reload

The backend will be running at http://localhost:8000.

2. Start the Frontend Development Server:

# From the project root directory, in a new terminal
npm run dev --prefix frontend

The frontend will be running at http://localhost:5173.

Live Demo
You can view and interact with the deployed application here:

https://ai-supply-chain.netlify.app/
