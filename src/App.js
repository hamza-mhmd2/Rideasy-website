import React, { useState } from 'react';
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
import RideHistory from './RideHistory';
import ChatRoom from './ChatRoom';

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
            <Route path="/ride-details" element={<RideHistory />} /> {/* Add passenger rides page here */}
            <Route path="/chat/:rideId" element={<ChatRoom />} />
          </Routes>
        </Router>
      )}
    </div>
  );
}

export default App;