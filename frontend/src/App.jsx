import React, { useState, useRef } from 'react';
import FileUpload from './components/FileUpload';
import QuestionInput from './components/QuestionInput';
import SubmitButton from './components/SubmitButton';
import axios from 'axios';

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [previousAnswers, setPreviousAnswers] = useState([]);
  const [formattedText, setFormattedText] = useState('');

  // Add a ref to reset the file input
  const fileInputRef = useRef(null);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    let valid = true;

    // Reset errors before validation
    setErrors({});

    // PDF Validation
    if (!pdfFile && !extractedText) {
      setErrors((prevErrors) => ({ ...prevErrors, pdfFile: 'Please upload a PDF file' }));
      valid = false;
    }

    // Question Validation
    if (question.trim() === '') {
      setErrors((prevErrors) => ({ ...prevErrors, question: 'Question cannot be empty' }));
      valid = false;
    }

    if (valid) {
      setLoading(true);  // Show loading state while sending the request
      try {
        const formData = new FormData();

        // If PDF is already uploaded and text extracted, no need to send the file again
        if (pdfFile) {
          formData.append('pdf', pdfFile);
        }

        formData.append('question', question);

        // Send the request to the backend (Flask)
        const response = await axios.post('http://localhost:5000/api/ask-question', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Store the formatted text and display it
        setFormattedText(response.data.formattedText);

        // Store the answer
        const newAnswer = response.data.answer;
        setAnswer(newAnswer);
        setPreviousAnswers((prevAnswers) => [...prevAnswers, { question, answer: newAnswer }]);

        setQuestion('');  // Reset the question input field

      } catch (error) {
        console.error('Error during submission:', error);
        setErrors((prevErrors) => ({ ...prevErrors, general: 'An error occurred during submission.' }));
      } finally {
        setLoading(false);  // Hide loading state after request completes
      }
    }
  };

  // Handle the "Clear" button to reset the app and backend
  const handleClear = async () => {
    setPdfFile(null);
    setQuestion('');
    setExtractedText('');
    setAnswer('');
    setFormattedText('');
    setPreviousAnswers([]);
    setErrors({});

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = null;  // Clear the file input
    }

    // Clear the backend state as well
    try {
      await axios.post('http://localhost:5000/api/clear');
      console.log('Backend state cleared');
    } catch (error) {
      console.error('Error clearing backend state:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        <h1 className="text-2xl font-semibold mb-6 text-center">PDF Q&A</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Show the FileUpload component only if no extracted text exists */}
          {!extractedText && (
            <FileUpload
              pdfFile={pdfFile}
              setPdfFile={setPdfFile}
              error={errors.pdfFile}
              setErrors={setErrors}
              fileInputRef={fileInputRef}  // Pass ref to FileUpload component
            />
          )}

          <QuestionInput
            question={question}
            setQuestion={setQuestion}
            error={errors.question}
            setErrors={setErrors}
          />

          <SubmitButton loading={loading} />

          {errors.general && <p className="text-red-500 text-sm mt-2">{errors.general}</p>}

          {/* Display the answer */}
          {answer && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold">Answer:</h2>
              <p className="text-lg">{answer}</p>
            </div>
          )}
        </form>

        {/* Display formatted text */}
        {formattedText && (
          <div
            className="mt-6 p-4 bg-gray-100 rounded-lg"
            dangerouslySetInnerHTML={{ __html: formattedText }}  // Safely render the HTML content
          />
        )}

        {/* Clear Button to reset the app */}
        <button
          onClick={handleClear}
          className="w-full mt-4 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Clear and Start Over
        </button>
      </div>
    </div>
  );
}

export default App;
