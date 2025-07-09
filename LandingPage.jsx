import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const functionalities = [
  {
    icon: '📝',
    title: 'Flashcards',
    desc: 'Turn your notes or PDFs into instant flashcards with AI-powered question creation.'
  },
  {
    icon: '📄',
    title: 'File Uploads',
    desc: 'Upload study materials and get summaries, quizzes, and more.'
  },
  {
    icon: '📊',
    title: 'Improve your vocabulary',
    desc: 'Get important words from your content and improve your vocabulary.'
  },
  {
    icon: '👩‍🏫',
    title: 'Humanized Text',
    desc: 'Get humanized text from your content and make AI generated content more human.'
  },
  {
    icon: '👩‍🏫',
    title: 'Summaries',
    desc: 'Get summaries from your content and get concepts crystal clear.'
  },
  {
    icon: '👩‍🏫',
    title: 'Article Summaries',
    desc: 'Get summaries from your articles and get core points.'
  },
];

const pricing = [
  {
    name: 'Free',
    price: '₹0',
    desc: 'Limited daily uploads, ads shown.'
  },
  {
    name: 'Basic',
    price: '₹279',
    desc: 'see pricing tab for details.'
  },
  {
    name: 'Premium',
    price: '₹399',
    desc: '900 requests per month.(go to pricing tab for more info.)'
  },
  {
    name: 'Pro',
    price: '₹699',
    desc: 'Unlock everything.'
  }
];

const faqs = [
  {
    q: 'Is NexNotes AI free to use?',
    a: 'Yes! The Free plan offers limited quiz generation and basic uploads. Pro and Premium plans unlock more features.'
  },
  {
    q: 'How does quiz generation work?',
    a: 'Upload your notes or PDFs and our AI instantly creates quizzes tailored to your content.'
  },
  {
    q: 'Can teachers generate question papers?',
    a: 'Yes, teachers can generate question papers and customize question difficulty.'
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. we DO NOT STORE YOUR DATA ANYWHERE, visit privacy policy tab for more info.'
  },
];

const LandingPage = () => {
  const textGradient = 'text-gradient'; // Ensure this class exists in index.css for the text effect
  const buttonGradient = 'button-gradient'; // Ensure this class exists in index.css for button styles
  const [openFaq, setOpenFaq] = useState(null);

  return (
    // Outer container for the Landing Page content.
    // The 'lumin-landing-bg' class applies the global black background with the top radial glow.
    // 'relative z-10' ensures this container establishes a stacking context and is above the fixed background.
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-14rem)] text-white relative z-10 px-4 sm:px-6 py-8">
      {/* Background layer for the radial glow from index.css */}
      {/* This div is where the magic of the lumin-landing-bg class and its ::before pseudo-element happens */}
      <div className="lumin-landing-bg"></div>

      {/* Main Hero Content Area - Ensure this content is above the background via z-index */}
      <div className="flex flex-col items-center justify-center flex-grow text-center max-w-4xl mx-auto relative z-20">
        <h2 className={`text-4xl sm:text-6xl font-extrabold mb-4 leading-tight text-white`}>
          The Ultimate AI-Powered Study Assistant
        </h2>
        <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-3xl mx-auto opacity-90">
          Transform your notes into instant quizzes,mind maps,diagrams get quick summaries, and ace your exams.
          Designed for students and researchers, free and effortless.
        </p>

        {/* Call to action buttons */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <Link
            to="/app" // Link to your main application (PDFProcessor)
            className={`inline-block px-8 py-3 rounded-full text-lg font-bold text-white shadow-lg transition-all duration-300 ${buttonGradient}`}
          >
            Get Started →
          </Link>
          <Link
            to="/about" // Link to About page
            className="inline-block px-8 py-3 rounded-full text-lg font-bold text-white transition-all duration-300 border border-white/20 hover:bg-white/10"
          >
            Read the docs
          </Link>
        </div>
      </div>

      {/* Functionalities Section */}
      <section className="w-full max-w-6xl mx-auto mt-20 mb-12">
        <h3 className="text-3xl font-bold text-center mb-8 text-gradient">What Can NexNotes AI Do?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {functionalities.map((f) => (
            <div key={f.title} className="glass-effect rounded-2xl p-6 flex flex-col items-center text-center">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h4 className="text-xl font-semibold mb-2">{f.title}</h4>
              <p className="text-gray-300 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Info Section */}
      <section className="w-full max-w-5xl mx-auto mb-12">
        <h3 className="text-3xl font-bold text-center mb-8 text-gradient">Pricing Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricing.map((p) => (
            <div key={p.name} className="glass-effect rounded-2xl p-6 flex flex-col items-center text-center border border-white/10">
              <h4 className="text-2xl font-bold mb-2 text-gradient">{p.name}</h4>
              <div className="text-3xl font-extrabold mb-2">{p.price}</div>
              <p className="text-gray-300 text-sm mb-2">{p.desc}</p>
              {p.name === 'Pro' && <span className="inline-block mt-2 px-3 py-1 rounded-full bg-purple-600/80 text-white text-xs font-semibold">Most Popular</span>}
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link to="/pricing" className={`inline-block px-8 py-3 rounded-full text-lg font-bold text-white mt-4 shadow-lg transition-all duration-300 ${buttonGradient}`}>See Full Pricing →</Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full max-w-3xl mx-auto mb-16">
        <h3 className="text-3xl font-bold text-center mb-8 text-gradient">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={faq.q} className="glass-effect rounded-xl p-4">
              <button
                className="w-full text-left flex justify-between items-center text-lg font-semibold focus:outline-none"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <span>{faq.q}</span>
                <span className="ml-2">{openFaq === idx ? '−' : '+'}</span>
              </button>
              {openFaq === idx && (
                <div className="mt-2 text-gray-300 text-base animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
