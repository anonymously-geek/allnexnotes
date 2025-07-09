import React, { useState } from 'react';

const FileUpload = ({ onTextExtracted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://huggingface.co/spaces/arush1234sharma/Querio-backend.hf.space/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errMsg = 'Upload failed.';
        try {
          const errJson = await response.json();
          errMsg = errJson.detail || JSON.stringify(errJson);
        } catch (jsonErr) {
          const errText = await response.text();
          errMsg = errText;
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      onTextExtracted(data.text); // Pass extracted text up
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <label className="block mb-4">
        <span className="text-gray-700">Upload PDF or Text File</span>
        <input
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </label>
      {loading && <div className="text-blue-600">Processing file...</div>}
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
};

export default FileUpload;
