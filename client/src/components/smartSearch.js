'use client';
import React, { useState, useEffect } from 'react';
import { Search, Train } from 'lucide-react';

const AITrainSearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [waveHeights, setWaveHeights] = useState(Array(25).fill(6));

  // Smooth wave animation
  useEffect(() => {
    let animationFrame;
    const animate = () => {
      setWaveHeights(prev =>
        prev.map((_, i) => {
          const time = Date.now() * 0.002;
          return 6 + Math.sin(time + i * 0.6) * 8 + Math.sin(time * 1.5 + i * 0.3) * 4;
        })
      );
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      console.log('AI Train Search:', query);
      if (onSearch) onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto my-10">
      
      {/* Glowing AI aura */}
      <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-500 opacity-40 blur-3xl animate-glowSlow"></div>

      {/* Main input container */}
      <div className="relative bg-gray-900/80 backdrop-blur-md rounded-full border border-sky-500/30 shadow-2xl shadow-sky-500/50 overflow-hidden">
        
        {/* Animated AI waves */}
        <div className="absolute inset-0 flex items-end justify-center opacity-30 px-4">
          {waveHeights.map((h, i) => (
            <div
              key={i}
              className="w-1 mx-px rounded-full bg-gradient-to-t from-blue-400 via-cyan-300 to-sky-500"
              style={{
                height: `${h + 12}px`,
                animation: `wavePulse ${(1.2 + i * 0.05).toFixed(2)}s infinite ease-in-out`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>

        {/* Input field */}
        <div className="relative flex items-center px-6 py-4 z-10">
          <Train className="w-5 h-5 text-sky-400 animate-pulse mr-2" />
          <Search className="w-4 h-4 text-cyan-400 animate-pulse mr-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="AskDISHA AI: 'Fastest train from Delhi to Mumbai tomorrow'"
            className="flex-1 bg-transparent text-white placeholder-gray-300 outline-none text-base font-medium"
          />
          <button
            type="submit"
            className="ml-4 bg-sky-500 hover:bg-cyan-400 text-white px-4 py-2 rounded-full shadow-lg transition duration-300"
          >
            Search
          </button>
        </div>

        {/* Floating gradient overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/5 via-cyan-400/10 to-sky-500/5 animate-glowSlow"></div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes wavePulse {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.6); }
        }
        @keyframes glowSlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        .animate-glowSlow {
          animation: glowSlow 3s infinite ease-in-out;
        }
      `}</style>
    </form>
  );
};

export default AITrainSearchBar;
