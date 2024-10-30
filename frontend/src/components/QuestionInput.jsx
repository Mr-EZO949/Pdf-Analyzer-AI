import React from 'react';
import ErrorMessage from './ErrorMessage';

const QuestionInput = ({ question, setQuestion, error, setErrors }) => {
  const handleQuestionChange = (e) => {
    const input = e.target.value;
    setQuestion(input);
    if (input.trim() !== '') {
      setErrors((prevErrors) => ({ ...prevErrors, question: null }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, question: 'Question cannot be empty' }));
    }
  };

  return (
    <div>
      <label className="block font-medium mb-2">Ask a Question:</label>
      <input
        type="text"
        value={question}
        onChange={handleQuestionChange}
        className="block w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
        placeholder="Type your question here"
      />
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

export default QuestionInput;
