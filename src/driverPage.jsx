import { useEffect } from 'react';
import { io } from "socket.io-client";
import { Link } from 'react-router-dom';
const socket = io("http://localhost:8000"); // Connect to the WebSocket server

const DriverApp = () => {
  useEffect(() => {
    // Get the driver's location
    navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          driverId: localStorage.getItem('id'), 
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // Send the location to the server
        socket.emit("driverLocation", locationData);
      },
      (error) => console.error('Error getting location:', error),
      { enableHighAccuracy: true }
    );
  }, []);

  return (
    <div>
      <h2>Welcome Driver</h2>
      <nav>
        <Link to="/driver/inbox">Inbox</Link>
        <Link to="/driver/rides">View Rides</Link>
      </nav>
      
    </div>
  );
};

export default DriverApp;
