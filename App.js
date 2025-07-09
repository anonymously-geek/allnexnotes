// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PDFProcessor from './components/PDFProcessor';
import About from './components/About';
import PrivacyPolicy from './components/PrivacyPolicy';
import LandingPage from './components/LandingPage';
import Pricing from './components/Pricing';
import AuthPage from './components/AuthPage';
import { UserProvider } from './components/UserContext';

function App() {
  const glassEffectPrimary = 'glass-effect';

  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen relative overflow-x-hidden bg-black text-white font-poppins">
          <div className="absolute inset-0 z-0 bg-black"></div>

          <div className="max-w-7xl mx-auto relative z-10 py-6 sm:py-8 px-4 sm:px-6">
            <header className="flex flex-col sm:flex-row justify-between items-center mb-10 sm:mb-16">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gradient mb-4 sm:mb-0">NexNotes AI</h1>
              <nav className={`${glassEffectPrimary} rounded-full p-1 flex`}>
                <Link to="/" className="px-4 sm:px-6 py-2 rounded-full text-white hover:bg-gray-700 hover:text-white transition-colors duration-300 transform hover:scale-105 text-sm sm:text-base font-semibold">
                  Home
                </Link>
                <Link to="/about" className="px-4 sm:px-6 py-2 rounded-full text-white hover:bg-gray-700 hover:text-white transition-colors duration-300 transform hover:scale-105 text-sm sm:text-base font-semibold">
                  About Us
                </Link>
                <Link to="/privacy-policy" className="px-4 sm:px-6 py-2 rounded-full text-white hover:bg-gray-700 hover:text-white transition-colors duration-300 transform hover:scale-105 text-sm sm:text-base font-semibold">
                  Privacy Policy
                </Link>
                <Link to="/pricing" className="px-4 sm:px-6 py-2 rounded-full text-white hover:bg-gray-700 hover:text-white transition-colors duration-300 transform hover:scale-105 text-sm sm:text-base font-semibold">
                  Pricing
                </Link>
                <Link to="/signin" className="px-4 sm:px-6 py-2 rounded-full text-white hover:bg-purple-700 hover:text-white transition-colors duration-300 transform hover:scale-105 text-sm sm:text-base font-semibold">
                  Sign In
                </Link>
              </nav>
            </header>

            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/app" element={<PDFProcessor />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/signin" element={<AuthPage />} />
              <Route path="*" element={<h2 className="text-center text-4xl text-white mt-20">404 - Page Not Found</h2>} />
            </Routes>
          </div>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;