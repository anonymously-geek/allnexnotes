import React from 'react';

const HandwrittenNotes = ({ text, style }) => {
  // Different handwriting styles
  const styles = {
    neat: {
      fontFamily: "'Caveat', cursive",
      background: "linear-gradient(to bottom, #f5f5f5 0%, #f5f5f5 1px, transparent 1px)",
      backgroundSize: "100% 28px",
      lineHeight: "28px",
      padding: "20px",
      border: "1px solid #d1d5db",
      backgroundColor: "#f9fafb",
      color: "#111827"
    },
    casual: {
      fontFamily: "'Dancing Script', cursive",
      background: "url('data:image/svg+xml;utf8,<svg width=\"100%\" height=\"100%\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"100%\" height=\"100%\" fill=\"none\" stroke=\"%23d1d5db\" stroke-width=\"1\" stroke-dasharray=\"3,3\" /></svg>')",
      padding: "20px",
      backgroundColor: "#f9fafb",
      color: "#111827"
    },
    messy: {
      fontFamily: "'Indie Flower', cursive",
      background: "url('data:image/svg+xml;utf8,<svg width=\"100%\" height=\"100%\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"100%\" height=\"100%\" fill=\"none\" stroke=\"%23d1d5db\" stroke-width=\"1\" stroke-dasharray=\"2,4\" /></svg>')",
      padding: "20px",
      backgroundColor: "#f9fafb",
      color: "#111827",
      transform: "rotate(-0.5deg)"
    }
  };

  const formatText = (text) => {
    return text.split('\n').map((line, i) => {
      // Add handwriting variations
      const randomRotation = Math.random() * 2 - 1; // -1 to 1 degrees
      const randomOffset = Math.random() * 10 - 5; // -5 to 5 px
      
      return (
        <div 
          key={i} 
          className="relative"
          style={{
            transform: `rotate(${randomRotation}deg) translateX(${randomOffset}px)`,
            marginBottom: '12px'
          }}
        >
          {line.split('').map((char, j) => (
            <span 
              key={j} 
              style={{
                display: 'inline-block',
                transform: `rotate(${Math.random() * 4 - 2}deg) translateY(${Math.random() * 2 - 1}px)`,
                opacity: 0.9 + Math.random() * 0.1
              }}
            >
              {char}
            </span>
          ))}
        </div>
      );
    });
  };

  return (
    <div 
      className="rounded-xl shadow-lg my-4 overflow-hidden"
      style={styles[style] || styles.neat}
    >
      <div className="p-6">
        {formatText(text)}
      </div>
      <div className="absolute bottom-2 right-2 text-xs text-gray-400">
        {style === 'neat' ? 'Neat Notes' : style === 'casual' ? 'Casual Notes' : 'Quick Notes'}
      </div>
    </div>
  );
};

export default HandwrittenNotes;