import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RideHistory = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in local storage');
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_BACKEND_HOST}/api/v1/rides/ride-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRides(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ride history:', error);
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Your Ride History</h1>
      {rides.length === 0 ? (
        <p>No rides found.</p>
      ) : (
        <ul>
          {rides.map((ride) => (
            <li
              key={ride._id}
              onClick={() => navigate(`/chat/${ride._id}`, { state: { driverId: ride.driver, passengerId: ride.passenger, role: ride.role } })}
              style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
            >
              <p><strong>Driver:</strong> {ride.driver ? ride.driver.fullName : 'Unknown Driver'}</p>
              <p>
                <strong>Vehicle:</strong>
                {ride.driver && ride.driver.vehicle
                  ? `${ride.driver.vehicle.make} ${ride.driver.vehicle.model}`
                  : 'Unknown Vehicle'}
              </p>
              <p><strong>Origin:</strong> {ride.origin ? ride.origin.address : 'Unknown Origin'}</p>
              <p><strong>Destination:</strong> {ride.destination ? ride.destination.address : 'Unknown Destination'}</p>
              <p><strong>Departure Time:</strong> {new Date(ride.departureTime).toLocaleString()}</p>
              <p><strong>Available Seats:</strong> {ride.availableSeats}</p>
              <p><strong>Price Per Seat:</strong> ${ride.pricePerSeat}</p>
              <p><strong>Status:</strong> {ride.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RideHistory;
