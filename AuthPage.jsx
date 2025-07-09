import React, { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const { login, signup, loading: authLoading } = useUser();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // 🔍 Debug on mount
  useEffect(() => {
    console.log("🔥 AuthPage Mounted");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 handleSubmit called", { email, password });

    if (authLoading || isSubmitting) {
      console.log("⛔ Blocked due to loading");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setMessage('Email and password are required.');
      console.log("❗ Validation failed");
      return;
    }

    setMessage('');
    setIsSubmitting(true);

    const timeoutId = setTimeout(() => {
      setIsSubmitting(false);
      setMessage('Request timed out. Please try again.');
    }, 10000);

    try {
      if (isSignup) {
        console.log("📥 Signing up");
        await signup(email, password);
        setMessage('Signup successful! Please check your email to confirm your account.');
      } else {
        console.log("🔐 Logging in...");
        const response = await login(email, password);
        console.log("✅ Login Response:", response);
        if (response?.data?.user) {
          setMessage('Login successful! Redirecting...');
          setTimeout(() => navigate('/app'), 1000);
        } else {
          setMessage('Login failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('❌ Error in auth:', err);
      setMessage(err.message || 'An error occurred. Please try again.');
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg w-96 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">
          {isSignup ? 'Sign Up' : 'Sign In'}
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 mb-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => {
            console.log("✏️ Email changed:", e.target.value);
            setEmail(e.target.value);
          }}
          required
          disabled={authLoading}
          autoComplete="email"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 mb-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => {
            console.log("🔑 Password changed");
            setPassword(e.target.value);
          }}
          required
          disabled={authLoading}
          minLength={8}
          autoComplete="current-password"
        />

        <button
          type="submit"
          onClick={() => console.log("🖱️ Button Clicked")}
          className={`w-full ${
            isSubmitting || authLoading
              ? 'bg-blue-700 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-semibold py-2 px-4 rounded transition-colors`}
          disabled={isSubmitting || authLoading}
        >
          {isSubmitting || authLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : isSignup ? (
            'Create Account'
          ) : (
            'Log In'
          )}
        </button>

        {message && (
          <p
            className={`mt-3 text-sm ${
              message.includes('successful')
                ? 'text-green-400'
                : 'text-red-400'
            }`}
          >
            {message}
          </p>
        )}

        <p
          onClick={() => {
            if (!isSubmitting && !authLoading) {
              console.log("🔁 Toggling auth mode");
              setIsSignup(!isSignup);
            }
          }}
          className="mt-4 text-sm text-blue-400 hover:underline cursor-pointer select-none"
          style={{
            pointerEvents: isSubmitting || authLoading ? 'none' : 'auto',
          }}
        >
          {isSignup
            ? 'Already have an account? Sign in'
            : "Don't have an account? Sign up"}
        </p>
      </form>
    </div>
  );
};

export default AuthPage;
