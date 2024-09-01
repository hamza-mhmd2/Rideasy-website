import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SplashScreen from './components/splashScreen';
import WelcomeScreen from './components/WelcomeScreen';
import RegisterScreen from './components/RegisterScreen';
import Login from './Login'
import MapWithSearch from './MapWithSearch';
import PrivateRoute from './privateRouter';

function App() {
  const [splashVisible, setSplashVisible] = useState(true);

  const handleSplashEnd = () => {
    setSplashVisible(false);
  };

  return (
    <div className="App">
      {splashVisible ? (
        <SplashScreen onSplashEnd={handleSplashEnd} />
      ) : (
        <Router>
          <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/signin" element={<Login />} />
            <Route
              path="/map"
              element={
                <PrivateRoute element={<MapWithSearch />} />
              }
            />
          </Routes>
        </Router>
      )}
    </div>
  );
}

export default App;
