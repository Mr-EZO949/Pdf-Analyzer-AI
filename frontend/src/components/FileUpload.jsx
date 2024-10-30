import React from 'react';
import ErrorMessage from './ErrorMessage';

const FileUpload = ({ pdfFile, setPdfFile, error, setErrors }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setErrors((prevErrors) => ({ ...prevErrors, pdfFile: null }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, pdfFile: 'Please upload a valid PDF file' }));
      setPdfFile(null);
    }
  };

  return (
    <div>
      <label className="block font-medium mb-2">Upload PDF:</label>
      <input
        type="file"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
      />
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

export default FileUpload;
