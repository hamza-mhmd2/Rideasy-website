import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SplashScreen from './components/splashScreen';
import WelcomeScreen from './components/WelcomeScreen';
import RegisterScreen from './components/RegisterScreen';
import Login from './Login'
import PrivateRoute from './privateRouter';
import BookingGoogleMap from './BookingGoogleMap';
import DriverApp from './driverPage';
import DriverInbox from './DriverInbox';
import PassengerApp from './PassengerApp';
import PassengerInbox from './PassengerInbox';
import { io } from "socket.io-client";
function App() {
  const [splashVisible, setSplashVisible] = useState(true);
  const socket = io("http://localhost:8000"); // Connect to the WebSocket server

  const handleSplashEnd = () => {
    setSplashVisible(false);
  };


  useEffect(() => {
    socket.on('connect', () => {
      console.log(`connected to server | socket id : ${socket.id}`);
    })
  }, [])

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
              path="/book-map"
              element={
                <PrivateRoute element={<BookingGoogleMap />} />
              }
            />
            <Route
              path="/driver-app"
              element={
                <PrivateRoute element={<DriverApp />} />
              }
            />
            <Route
              path="/passenger-app"
              element={
                <PrivateRoute element={<PassengerApp />} />
              }
            />
            <Route path="/driver/inbox" element={<DriverInbox />} />
            <Route path="/passenger/inbox" element={<PassengerInbox />} />
            <Route path="/driver/rides" element={<DriverApp />} /> {/* Add driver rides page here */}
            <Route path="/passenger/rides" element={<PassengerApp />} /> {/* Add passenger rides page here */}
          </Routes>
        </Router>
      )}
    </div>
  );
}

export default App;