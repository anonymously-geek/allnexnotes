import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="glass-effect rounded-3xl p-6 sm:p-8">
      <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-gradient">Privacy Policy</h2>

      <section className="mb-8">
        <h3 className="text-xl sm:text-2xl font-semibold mb-3">1. Information We Collect</h3>
        <p className="text-gray-300 mb-2">We do not collect any personal identifying information from our users.</p>
        <p className="text-gray-300">NexNotes AI is designed to be a privacy-first tool. All text you input, URLs you provide, and files you upload are processed in real-time by our backend and the AI model. We do not store your content on our servers after processing the request.</p>
      </section>

      <section className="mb-8">
        <h3 className="text-xl sm:text-2xl font-semibold mb-3">2. How We Use Your Information</h3>
        <p className="text-gray-300">Since we do not collect personal information, we do not use it for any purpose. The content you provide is used solely for the immediate purpose of generating questions or summaries, and it is not retained.</p>
      </section>

      <section className="mb-8">
        <h3 className="text-xl sm:text-2xl font-semibold mb-3">3. Data Security</h3>
        <p className="text-gray-300">While we do not store your data, we take reasonable measures to protect the confidentiality of your interactions. Communications with our backend are secured using standard encryption protocols.</p>
      </section>

      <section className="mb-8">
        <h3 className="text-xl sm:text-2xl font-semibold mb-3">4. Third-Party Services</h3>
        <p className="text-gray-300">Our backend uses the Together AI API for question generation and summarization. Your input text is sent to Together AI for processing. Please refer to <a href="https://www.together.ai/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Together AI's Privacy Policy</a> for information on their data handling practices.</p>
      </section>

      <section className="mb-8">
        <h3 className="text-xl sm:text-2xl font-semibold mb-3">5. Changes to This Privacy Policy</h3>
        <p className="text-gray-300">We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
      </section>

      <section>
        <h3 className="text-xl sm:text-2xl font-semibold mb-3">6. Contact Us</h3>
        <p className="text-gray-400">If you have any questions about this Privacy Policy, please contact us at arush2022pro@gmail.com or nexnotes.ai@gmail.com
         NexNotes AI has been created by Arush Sharma, India(2025).</p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
