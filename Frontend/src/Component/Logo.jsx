import React from 'react';
import logoIMG from '../assets/logoIMG.png';

const Logo = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-yellow-100 to-purple-200 p-4">
      <div className="text-5xl md:text-7xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 animate-pulse drop-shadow-lg">
        🔥 MMMUT
      </div>
      <div className="mt-4 text-4xl md:text-6xl font-bold text-blue-700 animate-bounce drop-shadow-xl">
        🛒 Buy & Sell
      </div>
      <div className="mt-6 w-32 h-32 animate-spin-slow">
        <img
          src={logoIMG} // ✅ Use your own logo path here
          alt="Logo"
          className="w-full h-full object-contain rounded-full shadow-xl border-4 border-white"
        />
      </div>
    </div>
  );
};
export default Logo;
