import React from 'react';

const SubmitButton = ({ loading }) => {
  return (
    <button
      type="submit"
      className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
      disabled={loading}  // Disable button while loading
    >
      {loading ? 'Loading...' : 'Submit'}
    </button>
  );
};

export default SubmitButton;
