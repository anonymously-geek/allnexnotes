import React from 'react';

const tiers = [
  {
    name: 'Free',
    price: '₹0',
    description: 'For students and teachers getting started.',
    features: [
      '3 summary/flashcards requests per day',
      '1 PDF upload per day',
      '10 Humanized text request per month',
      'ads will be shown',
      'No early access to new features',
    ],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Basic',
    price: '₹279/mo',
    description: 'For students and teachers who want more features.',
    features: [
      '300 summary/flashcards requests per month',
      '100 quizzes per month',
      '15 PDF/file uploads per day(max 60 pages per file) ',
      '20 Humanized text requests per month',
      'No ads',
      'Early access to new features',
    ],
    cta: 'Upgrade to Basic',
    highlight: true,
  },
  {
    name: 'Premium',
    price: '₹399/mo',
    description: 'For students and teachers who want more features.',
    features: [
      '900 summary/flashcards requests per month',
      '650 quizzes per month',
      '50 PDF/file uploads per day(max 60 pages per file) ',
      '200 Humanized text requests per month',
      'No ads',
      'Early access to new features',
    ],
    cta: 'Upgrade to Premium⚡',
    highlight: true,
  },
  {
    name: 'Pro',
    price: '₹699/mo',
    description: 'Unlock the full potential.',
    features: [
      'Unlimited summary/flashcards requests',
      'Unlimited quizzes',
      'Unlimited PDF/file uploads',
      'Unlimited Humanized text requests',
      'No ads',
      'Priority access to new features',
    ],
    cta: 'Upgrade to Pro⚡⚡',
    highlight: true,
  },
]



function Pricing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black relative px-4 py-16">
      {/* Animated background shapes (reuse glassmorphism) */}
      <div className="lumin-landing-bg absolute inset-0 z-0" />
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-8 text-gradient">
          Affordable, Transparent Pricing
        </h1>
        <p className="text-lg text-gray-300 text-center mb-16 max-w-2xl mx-auto">
          Save several hours a day, boost your productivity
          at the price of a movie ticket!.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`glass-effect rounded-3xl p-8 flex flex-col items-center border-2 transition-all duration-300 ${
                tier.highlight
                  ? 'border-purple-400 shadow-xl scale-105' : 'border-white/10'
              }`}
            >
              <h2 className="text-3xl font-bold mb-2 text-gradient">
                {tier.name}
              </h2>
              <div className="text-4xl font-extrabold mb-4">
                {tier.price}
              </div>
              <p className="text-gray-300 mb-6 text-center min-h-[48px]">{tier.description}</p>
              <ul className="text-gray-200 mb-8 space-y-3 text-left w-full max-w-xs mx-auto">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-green-400">✓</span> {feature}
                  </li>
                ))}
              </ul>
              {tier.name === 'Free' ? (
                <button
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-lg text-white mt-auto ${
                    tier.highlight
                      ? 'button-gradient shadow-lg hover:scale-105' : 'bg-white/10 hover:bg-white/20'
                  } transition-all duration-300`}
                >
                  {tier.cta}
                </button>
              ) : (
                <a
                  href={
                    tier.name === 'Basic'
                      ? 'https://rzp.io/rzp/Ua7bNLMh' // Replace with your actual Razorpay Basic plan link
                      : tier.name === 'Premium'
                      ? 'https://rzp.io/rzp/eBiwi2k' // Replace with your actual Razorpay Premium plan link
                      : tier.name === 'Pro'
                      ? 'https://rzp.io/rzp/psQyYzd' // Replace with your actual Razorpay Pro plan link
                      : '#'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-lg text-white mt-auto text-center inline-block ${
                    tier.highlight
                      ? 'button-gradient shadow-lg hover:scale-105' : 'bg-white/10 hover:bg-white/20'
                  } transition-all duration-300`}
                >
                  {tier.cta}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Pricing; 