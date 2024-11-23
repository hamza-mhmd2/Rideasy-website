import React, { useEffect } from 'react';
 

const SplashScreen = ({ onSplashEnd }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onSplashEnd();
    }, 3000); // Duration of splash screen (3 seconds)
    return () => clearTimeout(timer);
  }, [onSplashEnd]);

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="text-center">
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-800 tracking-tight leading-tight">
  Welcome to,
</h1>

        <img src='image.png' alt="RideEasy Logo"   className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 mx-auto" />
        
      </div>
    </div>
  );
};

export default SplashScreen;
