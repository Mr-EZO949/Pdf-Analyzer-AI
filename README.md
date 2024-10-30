PDF Q&A Web Application

This web application allows users to upload a PDF document and ask questions related to its content. The application processes the PDF, extracts relevant information, and provides answers to the user's questions along with corresponding page numbers. It leverages a Flask backend for PDF processing and question-answering via a language model, with a React frontend for user interaction.
Features

    Upload a PDF and extract text from it.
    Ask questions based on the content of the PDF.
    Receive AI-generated answers along with page references.
    Fully styled UI with TailwindCSS for improved user experience.
    Clears both frontend and backend states after each use.

Technologies Used

    Frontend: React.js (with Vite as the build tool) and TailwindCSS for styling.
    Backend: Flask for processing PDF files and sending questions to the AI model.
    AI Model: Integrated with the Hugging Face Gradio chatbot for AI responses.
    PDF Text Extraction: PyMuPDF (via fitz) for extracting text from PDF documents.

    How to Run the Application

    Start the Flask backend:
        Navigate to the root directory of the project and run the backend using python app.py. This will handle PDF processing and AI responses.

    Start the React frontend:
        Open a new terminal, navigate to the frontend directory, and run the React app using npm run dev.

    Access the App:
        Open your browser and go to http://localhost:3000 to use the PDF Q&A application.


How It Works

    Uploading a PDF:
        Users can upload a PDF file using the file upload button in the frontend.
        The PDF is sent to the backend where PyMuPDF (fitz) extracts the text page by page.

    Asking a Question:
        Users can type a question in the input field after uploading the PDF.
        The question and extracted PDF text are processed by the backend, which sends the text to a Gradio-based AI chatbot.
        The AI returns an answer, which is displayed along with the page number references where the answer was found.

    Clearing the State:
        The "Clear" button allows users to reset the application, removing the uploaded PDF, resetting the question, and clearing both frontend and backend states.
    
API Endpoints
1. Upload and Ask Question

Endpoint: /api/ask-question
Method: POST
Description: Uploads a PDF and submits a question. Returns the AI-generated answer and the corresponding page references.

2. Clear State

Endpoint: /api/clear
Method: POST
Description: Clears any in-memory data on the backend.
