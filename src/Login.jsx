import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPhone, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = () => {
    if (phoneNumber === '' || password === '') {
      setError('Please fill in all fields.');
    } else {
      setError('');
      // Handle login logic here
    }
  };
  const loginwithgoogle = ()=>{
    window.open("http://localhost:8000/auth/google/callback","_self")
}
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="relative w-full max-w-md md:max-w-lg lg:max-w-xl">
        {/* Curved Orange Background at the Top */}
        <div className="absolute top-0 left-0 right-0 h-[100%] bg-orange-600 rounded-t-[15%]"></div>

        {/* Content on the Orange Background */}
        <div className="relative z-10 p-8 space-y-6 text-center mt-16">
          {/* Back Arrow */}
          <button onClick={() => navigate(-1)} className="absolute top-4 left-4 text-white hover:text-gray-200">
            <FaArrowLeft size={24} />
          </button>

          {/* Welcome Back Heading */}
          <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-white">Sign in to your account</p>

          {/* Input Fields */}
          <div className="space-y-4">
            <div className="flex items-center bg-white rounded-full px-4 py-3">
              <FaPhone className="text-gray-600 mr-3" />
              <input
                type="text"
                placeholder="Phone Number"
                className="bg-transparent flex-1 focus:outline-none"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="flex items-center bg-white rounded-full px-4 py-3 relative">
              <FaLock className="text-gray-600 mr-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="bg-transparent flex-1 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button onClick={togglePasswordVisibility} className="absolute right-4">
                {showPassword ? <FaEyeSlash className="text-gray-600" /> : <FaEye className="text-gray-600" />}
              </button>
            </div>
          </div>

          {/* Remember Me and Forgot Password */}
          <div className="flex justify-between items-center text-white">
            <label className="flex items-center space-x-3">
            <input type="checkbox" className="form-checkbox text-orange-600 h-6 w-6" />

              <span className='text-lg'>Remember me</span>
            </label>
            <button className="hover:text-gray-200 text-lg">Forgot Password?</button>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500">{error}</p>}

          {/* Sign In Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-white text-orange-700 py-3 rounded-full text-xl font-bold"
          >
            Sign In
          </button>

          {/* Or Divider */}
          <div className="flex items-center justify-center space-x-4 text-white">
            <span className="border-b w-full"></span>
            <span className="text-white">Or</span>
            <span className="border-b w-full"></span>
          </div>

          {/* Google Sign In Button */}
          <button className="w-full flex items-center justify-center bg-white border border-gray-300 py-4 rounded-full text-lg font-bold text-gray-700"onClick={loginwithgoogle}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png"
              alt="Google logo"
              className="w- 7 h-7 mr-3"
            />
            Sign In With Google
          </button>

          {/* Sign Up Link */}
          <p className="text-white mt-4">
            Don't have an account?{' '}
            <span
              onClick={() => navigate('/register')}
              className="font-bold underline cursor-pointer text-xl "
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
