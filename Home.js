import React from 'react';
import PDFProcessor from '../components/PDFProcessor';

const Home = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Transform Your Documents into Knowledge
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Upload your PDF documents or text files to generate summaries and practice questions instantly.
        </p>
      </div>

      <PDFProcessor />
    </div>
  );
};

export default Home; 