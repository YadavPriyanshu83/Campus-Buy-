import React from 'react';
import { Link } from 'react-router-dom';

const Error404 = () => {
  return (
    <div className="bg-gradient-to-br from-[#E0F7FA] to-[#FFECB3] h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md bg-white p-6 rounded-3xl shadow-2xl border border-gray-200">
        {/* Cartoon Image */}
        <img
          src="https://octodex.github.com/images/octobiwan.jpg"
          alt="404 Mascot"
          className="mx-auto w-52 rounded-xl shadow-lg mb-4"
        />

        {/* 404 Heading */}
        <h1 className="text-6xl font-extrabold text-[#2E3A59] mb-2 drop-shadow-md">
          404
        </h1>

        {/* Message */}
        <p className="text-lg text-gray-700 font-medium mb-6">
          Oops! This is not the web page you’re looking for.
        </p>

        {/* Button */}
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-full font-semibold shadow-md hover:scale-105 transition-all duration-200"
        >
          🚀 Go to Home
        </Link>
      </div>
    </div>
  );
};

export default Error404;
