from flask import Flask, request, jsonify
from flask_cors import CORS
import fitz  # PyMuPDF for PDF extraction
import re
from gradio_client import Client
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import nltk
nltk.download('punkt')
nltk.download('punkt_tab')
nltk.download('stopwords')


app = Flask(__name__)

app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Enable CORS for all routes
CORS(app)

# Initialize Gradio client
client = Client("mr-ez0/test-gradio")

def extract_pdf_sections(pdf_file):
    """
    Extracts text from the PDF and organizes it by section based on simple headings.
    """
    pdf_document = fitz.open(stream=pdf_file, filetype="pdf")
    all_text = ""
    for page_num in range(len(pdf_document)):
        page = pdf_document.load_page(page_num)
        all_text += page.get_text("text")
    
    # Split text based on headings that may indicate a section title
    sections = re.split(r'\n\s*(\b[A-Z][A-Za-z\s\-]+\b)\s*\n', all_text)
    
    section_dict = {}
    for i in range(1, len(sections), 2):
        section_title = sections[i].strip()
        section_content = sections[i + 1].strip()
        section_dict[section_title] = section_content
    
    return section_dict

def extract_text_by_page(pdf_file):
    """
    Extracts text from each page of the PDF separately.
    """
    pdf_document = fitz.open(stream=pdf_file, filetype="pdf")
    pages = []
    for page_num in range(len(pdf_document)):
        page = pdf_document.load_page(page_num)
        page_text = page.get_text("text")
        pages.append({"page_number": page_num + 1, "text": page_text})
    return pages

def extract_keywords(question):
    """
    Extracts keywords from the question using basic NLP.
    """
    stop_words = set(stopwords.words('english'))
    words = word_tokenize(question)
    # Extract words that are not stopwords and are longer than 2 characters
    keywords = [word.lower() for word in words if word.lower() not in stop_words and len(word) > 2]
    return keywords

def find_relevant_section(section_dict, keywords):
    """
    Searches through the extracted sections to find the most relevant one based on keywords.
    """
    for section_title, section_content in section_dict.items():
        # Check if any of the keywords appear in the section title or content
        if any(keyword in section_title.lower() or keyword in section_content.lower() for keyword in keywords):
            return section_title, section_content
    return None, None

def is_general_question(question):
    """
    Determines if the question is asking for general information or a summary.
    """
    general_keywords = ["summarize", "overview", "general", "conclusion", "purpose", "about", "content"]
    for keyword in general_keywords:
        if keyword in question.lower():
            return True
    return False

def is_page_by_page_question(question):
    """
    Determines if the question is asking for page-by-page analysis.
    """
    page_keywords = ["page by page", "each page", "analyze page", "go through pages"]
    for keyword in page_keywords:
        if keyword in question.lower():
            return True
    return False

@app.route('/api/ask-question', methods=['POST'])
def ask_question():
    try:
        pdf_file = request.files.get('pdf', None)
        question = request.form.get('question', '')

        if not pdf_file or not question:
            return jsonify({"error": "Please upload a PDF and ask a question."}), 400

        # Check if the question is asking for general information
        if is_general_question(question):
            # Extract entire text of the PDF for general questions
            pdf_document = fitz.open(stream=pdf_file.read(), filetype="pdf")
            all_text = ""
            for page_num in range(len(pdf_document)):
                page = pdf_document.load_page(page_num)
                all_text += page.get_text("text")

            # Process the question with the entire text as context
            result = client.predict(
                message=question,
                system_message=f"Based on the following text from the PDF document:\n{all_text}\nPlease answer the question with a general overview or conclusion.",
                max_tokens=512,
                temperature=0.7,
                top_p=0.95,
                api_name="/chat"
            )

            return jsonify({"answer": result, "content": "Full PDF Content Used"})

        # Check if the question is asking for page-by-page analysis
        if is_page_by_page_question(question):
            # Extract text page by page
            pages = extract_text_by_page(pdf_file.read())

            all_responses = []
            for page in pages:
                page_number = page["page_number"]
                page_text = page["text"]

                # Send page-specific text to the AI model
                result = client.predict(
                    message=question,
                    system_message=f"Analyze the following text from page {page_number} of a PDF document:\n{page_text}\nPlease answer the question.",
                    max_tokens=512,
                    temperature=0.7,
                    top_p=0.95,
                    api_name="/chat"
                )

                all_responses.append({
                    "page_number": page_number,
                    "answer": result
                })

            return jsonify({"responses": all_responses})

        # Extract sections from the PDF for specific questions
        section_dict = extract_pdf_sections(pdf_file.read())

        # Extract keywords from the question
        keywords = extract_keywords(question)

        # Search for the most relevant section based on extracted keywords
        section_title, relevant_section = find_relevant_section(section_dict, keywords)

        if not relevant_section:
            return jsonify({"error": "Could not find relevant section in the PDF."}), 404

        # Process the question and get the answer using the extracted relevant section
        result = client.predict(
            message=question,
            system_message=f"Based on the following text from the '{section_title}' section of the PDF:\n{relevant_section}\nPlease answer the question and provide relevant references from the PDF.",
            max_tokens=512,
            temperature=0.7,
            top_p=0.95,
            api_name="/chat"
        )

        return jsonify({"answer": result, "section": section_title, "content": relevant_section})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Clear the in-memory state (if any)
@app.route('/api/clear', methods=['POST'])
def clear_state():
    global saved_state
    saved_state.clear()  # Clear all in-memory data
    return jsonify({"message": "Backend state cleared"}), 200

if __name__ == '__main__':
    app.run(debug=True)
