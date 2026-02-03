import React from "react";
import { Link } from "react-router-dom";

const Start = () => {
  return (
    <div>
      {/* Background image section */}
      <div
        className="bg-cover bg-center min-h-screen"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1619059558110-c45be64b73ae?q=80&w=2574&auto=format&fit=crop')",
        }}
      >
        {/* Uber logo */}
        <img
          className="w-20 ml-8 pt-6"
          src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
          alt="Uber Logo"
        />

        {/* White box content */}
        <div className="bg-white pb-8 py-4 px-4 mt-32 max-w-md mx-auto rounded-lg shadow-md">
          <h2 className="text-[30px] font-semibold text-center">
            Get Started with Uber
          </h2>

          <Link
            to="/login"
            className="flex items-center justify-center w-full bg-black text-white py-3 rounded mt-5 hover:bg-gray-800 transition-all"
          >
            Continue
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Start;
