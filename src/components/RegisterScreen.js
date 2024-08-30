import React from 'react';
import { useNavigate } from 'react-router-dom'; // React Router for navigation
import { FaArrowLeft, FaUser, FaPhone, FaLock } from 'react-icons/fa';

const RegisterScreen = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to the previous page (Welcome Screen)
  };

  return (
    <div className="flex items-center justify-center h-screen bg-orange-600 px-4 md:px-8 lg:px-16">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl  rounded-lg shadow-lg p-8 space-y-6">
        {/* Back Arrow */}
        <button onClick={handleBack} className="text-gray-700 hover:text-gray-900">
          <FaArrowLeft size={24} />
        </button>

        {/* Register Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center ">Register</h1>
        <p className="text-center text-gray-800 text-lg">Create your new account</p>

        {/* Input Fields */}
        <div className="space-y-4">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
            <FaUser className="text-gray-600 mr-3" />
            <input
              type="text"
              placeholder="Full name"
              className="bg-transparent flex-1 focus:outline-none"
            />
          </div>

          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
            <FaPhone className="text-gray-600 mr-3" />
            <input
              type="text"
              placeholder="Phone Number"
              className="bg-transparent flex-1 focus:outline-none"
            />
          </div>

          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
            <FaLock className="text-gray-600 mr-3" />
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent flex-1 focus:outline-none"
            />
          </div>
        </div>

        {/* Sign Up Button */}
        <button className="mt-4 w-full flex items-center justify-center bg-white border border-gray-300 py-3 rounded-full text-xl  ">
          Sign Up
        </button>

        {/* Or Divider */}
        <div className="flex items-center justify-center space-x-4">
          <span className=" border-b w-full"></span>
          <span className="text-black">Or</span>
          <span className="border-b w-full"></span>
        </div>

        {/* Google Sign Up Button */}
        <button className="w-full flex items-center justify-center bg-white border border-gray-300 py-3 rounded-full text-lg  ">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png"
            alt="Google logo"
            className="w-20 h-6 mr-3"
          />
          Sign Up With Google
        </button>

        {/* Sign In Link */}
        <p className="text-center text-white mt-4">
          Already have an account? {' '}
          <span
            onClick={() => navigate('/signin')}
            className="text-white font-bold cursor-pointer text-xl"
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default RegisterScreen;
