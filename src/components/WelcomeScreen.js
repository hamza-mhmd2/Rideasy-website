import React from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomeScreen = () => {
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    navigate('/register');
  };

  return (
    <div className="flex items-center justify-center h-screen bg-orange-600">
      <div className="text-center">
        <h1 className="text-white text-3xl md:text-5xl font-bold mb-8">
          Lets Start<br />The Journey !
        </h1>
        <div className="space-y-4">
          <button onClick={() => navigate('/signin')}
            className="bg-white text-orange-600 py-2 px-8 rounded-full text-lg w-full md:w-1/2 lg:w-1/2">
            Sign In
          </button>
          <button
            onClick={handleCreateAccount}
            className="text-white border-2 border-white py-2 px-15 ml-2 rounded-full text-lg w-full md:w-1/2 lg:w-1/2"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
