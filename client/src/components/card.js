import React, { useState, useRef, useEffect } from 'react';

const CreditCardDemo = () => {
  const [cardType, setCardType] = useState('visa');
  const [cardNumber, setCardNumber] = useState('4123 4567 8901 2345');
  const [cardHolder, setCardHolder] = useState('JOHN M. DOE');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });
  const cardRef = useRef(null);

  // Handle mouse movement for 3D effect
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateY = ((x - centerX) / centerX) * 15;
    const rotateX = ((y - centerY) / centerY) * -15;
    
    setRotation({ x: rotateX, y: rotateY });
    
    // Update glow position
    const glowX = (x / rect.width) * 100;
    const glowY = (y / rect.height) * 100;
    setGlowPosition({ x: glowX, y: glowY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setGlowPosition({ x: 50, y: 50 });
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    return parts.length ? parts.join(' ') : value;
  };

  // Handle card number change
  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    
    // Detect card type based on first digit
    const firstDigit = e.target.value.charAt(0);
    if (firstDigit === '4') setCardType('visa');
    else if (firstDigit === '5') setCardType('mastercard');
    else if (firstDigit === '3') setCardType('amex');
    else if (firstDigit === '6') setCardType('discover');
  };

  // Card designs
  const cardDesigns = {
    visa: {
      front: 'bg-gradient-to-br from-blue-900 to-purple-800',
      back: 'bg-gradient-to-bl from-blue-900 to-purple-800',
      logo: <div className="text-white font-bold text-2xl tracking-widest">VISA</div>,
      hologram: 'from-blue-400 to-purple-400'
    },
    mastercard: {
      front: 'bg-gradient-to-br from-red-900 to-yellow-600',
      back: 'bg-gradient-to-bl from-red-900 to-yellow-600',
      logo: (
        <div className="flex items-center">
          <div className="w-6 h-6 bg-red-500 rounded-full mr-1"></div>
          <div className="w-6 h-6 bg-yellow-500 rounded-full ml-1"></div>
        </div>
      ),
      hologram: 'from-red-400 to-yellow-400'
    },
    amex: {
      front: 'bg-gradient-to-br from-green-800 to-blue-700',
      back: 'bg-gradient-to-bl from-green-800 to-blue-700',
      logo: <div className="text-white font-bold text-xl tracking-widest">AMEX</div>,
      hologram: 'from-green-400 to-blue-400'
    },
    discover: {
      front: 'bg-gradient-to-br from-orange-700 to-red-700',
      back: 'bg-gradient-to-bl from-orange-700 to-red-700',
      logo: (
        <div className="flex flex-col items-center">
          <div className="text-white font-bold text-sm">DISCOVER</div>
          <div className="w-6 h-6 border-2 border-white rounded-sm"></div>
        </div>
      ),
      hologram: 'from-orange-400 to-red-400'
    }
  };

  const currentDesign = cardDesigns[cardType];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-4">
      <h1 className="text-4xl font-bold text-white mb-2">3D Credit Card</h1>
      <p className="text-gray-300 mb-8">Move your cursor to explore the 3D effect</p>
      
      {/* Card type selector */}
      <div className="flex space-x-4 mb-6">
        {Object.keys(cardDesigns).map(type => (
          <button
            key={type}
            onClick={() => setCardType(type)}
            className={`px-4 py-2 rounded-lg capitalize ${cardType === type ? 'bg-white text-blue-900 font-bold' : 'bg-gray-800 text-white'}`}
          >
            {type}
          </button>
        ))}
      </div>
      
      <div className="relative w-96 h-56 mb-8" 
           onMouseMove={handleMouseMove}
           onMouseLeave={handleMouseLeave}>
        {/* 3D Card Container */}
        <div className="absolute w-full h-full transition-all duration-500 preserve-3d"
             style={{ 
               transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
               transformStyle: 'preserve-3d'
             }}
             ref={cardRef}>
          
          {/* Front of the card */}
          <div className={`absolute w-full h-full backface-hidden transition-all duration-500 rounded-xl ${isFlipped ? 'opacity-0' : 'opacity-100'}`}>
            <div className={`relative w-full h-full ${currentDesign.front} rounded-xl shadow-2xl overflow-hidden border-2 border-gray-200 border-opacity-20`}>
              
              {/* Dynamic glow effect */}
              <div 
                className="absolute inset-0 opacity-20 transition-all duration-300"
                style={{
                  background: `radial-gradient(circle at ${glowPosition.x}% ${glowPosition.y}%, white, transparent)`
                }}
              ></div>
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white opacity-10 animate-shimmer"></div>
              
              {/* Card Logo */}
              <div className="absolute top-5 right-5">
                {currentDesign.logo}
              </div>
              
              {/* Chip */}
              <div className="absolute top-12 left-5 w-12 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-md flex items-center justify-center">
                <div className="w-10 h-6 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-sm"></div>
              </div>
              
              {/* Contactless symbol */}
              <div className="absolute top-14 left-20">
                <div className="w-6 h-6 rounded-full border-2 border-white border-opacity-70"></div>
                <div className="absolute top-1.5 left-1.5 w-3 h-3 rounded-full border-2 border-white border-opacity-70"></div>
              </div>
              
              {/* Card Number */}
              <div className="absolute top-24 left-5 text-white font-mono text-xl tracking-widest">
                {cardNumber}
              </div>
              
              {/* Card Holder */}
              <div className="absolute bottom-12 left-5 text-white text-sm tracking-widest">
                <div className="text-xs text-gray-300 opacity-80">CARD HOLDER</div>
                <div>{cardHolder}</div>
              </div>
              
              {/* Expiry Date */}
              <div className="absolute bottom-12 right-5 text-white text-sm tracking-widest">
                <div className="text-xs text-gray-300 opacity-80">EXPIRES</div>
                <div>{expiry}</div>
              </div>
              
              {/* Hologram effect */}
              <div className={`absolute top-5 left-5 w-16 h-16 rounded-full bg-gradient-to-r ${currentDesign.hologram} opacity-30`}></div>
              
              {/* Decorative elements */}
              <div className="absolute bottom-5 left-5 w-20 h-6 rounded-full bg-white opacity-5"></div>
              <div className="absolute top-5 left-20 w-10 h-10 rounded-full bg-white opacity-5"></div>
            </div>
          </div>
          
          {/* Back of the card */}
          <div className={`absolute w-full h-full backface-hidden transition-all duration-500 rounded-xl ${isFlipped ? 'opacity-100' : 'opacity-0'}`}
               style={{ transform: 'rotateY(180deg)' }}>
            <div className={`relative w-full h-full ${currentDesign.back} rounded-xl shadow-2xl overflow-hidden border-2 border-gray-200 border-opacity-20`}>
              
              {/* Dynamic glow effect */}
              <div 
                className="absolute inset-0 opacity-20 transition-all duration-300"
                style={{
                  background: `radial-gradient(circle at ${glowPosition.x}% ${glowPosition.y}%, white, transparent)`
                }}
              ></div>
              
              {/* Black magnetic strip */}
              <div className="absolute top-5 w-full h-10 bg-black"></div>
              
              {/* CVV Strip */}
              <div className="absolute top-24 w-full h-10 bg-gray-800 flex items-center justify-end px-5">
                <div className="text-white text-sm">{cvv}</div>
              </div>
              
              {/* Signature strip */}
              <div className="absolute top-40 left-5 right-5 h-8 bg-gray-200 bg-opacity-20 flex items-center">
                <div className="h-6 w-full bg-gray-300 bg-opacity-10 flex items-center justify-end pr-2 text-xs text-gray-300">
                  Authorized Signature
                </div>
              </div>
              
              {/* Hologram */}
              <div className={`absolute top-44 left-10 w-16 h-16 rounded-full bg-gradient-to-r ${currentDesign.hologram} opacity-20`}></div>
              
              {/* Card details */}
              <div className="absolute bottom-5 left-5 text-white text-xs opacity-70 w-80">
                This card is property of the issuing bank. Use of this card is subject to the terms and conditions of the cardholder agreement.
              </div>
              
              {/* Card logo watermark */}
              <div className="absolute bottom-10 right-5 text-white text-2xl font-bold opacity-20">
                {cardType.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Flip button */}
      <button 
        onClick={() => setIsFlipped(!isFlipped)}
        className="mb-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        {isFlipped ? 'View Front' : 'View Back'}
      </button>
      
      {/* Card details form */}
      <div className="bg-gray-800 bg-opacity-50 p-6 rounded-xl shadow-lg w-full max-w-md backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-white mb-4">Card Details</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Card Number</label>
            <input 
              type="text" 
              value={cardNumber} 
              onChange={handleCardNumberChange}
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={19}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Card Holder</label>
            <input 
              type="text" 
              value={cardHolder} 
              onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Expiry Date</label>
              <input 
                type="text" 
                value={expiry} 
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="MM/YY"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">CVV</label>
              <input 
                type="text" 
                value={cvv} 
                onChange={(e) => setCvv(e.target.value)}
                onFocus={() => setIsFlipped(true)}
                onBlur={() => setIsFlipped(false)}
                className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={4}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Add custom styles for the 3D effect */}
      <style jsx>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(200%) skewX(-20deg); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default CreditCardDemo;