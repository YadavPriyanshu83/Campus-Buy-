import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {

  return (
    <section
      id="section"
      className="bg-gradient-to-b from-[#fcfdfd] via-[#fffbee] to-[#f7f9ff] h-full"

    >
      <main className="flex-grow flex flex-col items-center px-6 sm:px-10 max-w-7xl mx-auto w-full">


        <h1 className="animate-bounce mt-12 text-center text-gray-900 font-semibold text-3xl sm:text-4xl md:text-5xl max-w-1xl leading-tight">
          🛍️ MMMUT Gkp Buy & Sell<br></br>
          </h1>      

        <p className="mt-4 text-center text-gray-600 max-w-md text-sm sm:text-base leading-relaxed">
          The smart way to buy, sell & grow. <br />
          Built by hustlers. Trusted by doers. <br />
          💞Loved by customers.
        </p>
        <Link to="/signup">
          <button className="text-shadow-black mt-2 bg-indigo-100 px-6 py-3 rounded-full  text-sm font-medium hover:bg-indigo-500 hover:text-white transition ">
            <span>Swipe, Sell, Success. Explore. ➔ </span>
          </button>
        </Link>


        {/* Images */}
        <div
          aria-label="Product Images"
          className="mt-12 mb-8 flex flex-wrap justify-center gap-6 max-w-8xl w-full mx-auto px-6"
        >
          {[
            
            {
              src: "https://res.cloudinary.com/dzkprawxw/image/upload/v1754232332/Shoes_fxiaqm.png",
              price: "₹299/-"
            },
            {
              src: "https://res.cloudinary.com/dzkprawxw/image/upload/v1754232329/cooler_qqlfi2.png",
              price: "₹999/-"
            },
            {
              src: "https://res.cloudinary.com/dzkprawxw/image/upload/v1754232338/Books_t3pxjf.png",
              price: "₹99/-"
            },
            {
              src: "https://res.cloudinary.com/dzkprawxw/image/upload/v1754232327/Iphone_xrfzpd.png",
              price: "₹10,999/-"
            }
          ].map((item, index) => (
            <Link to="/login" key={index} className="relative w-61 h-60 rounded-lg overflow-hidden hover:-translate-y-3 transition duration-300 flex-shrink-0 ">
              <img
                src={item.src}
                alt={`Product ${index + 1}`}
                className="object-cover w-full h-full"
              />
              <div className="absolute bottom-2 left-2 bg-white/80 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded">
                Starting from {item.price}
              </div>
            </Link>
          ))}
        </div>

      </main>
    </section>
  );
};

export default HeroSection;