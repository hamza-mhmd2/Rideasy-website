import React, { useState, useEffect } from 'react';

import { io } from "socket.io-client";

import axios from 'axios';
import { Link } from 'react-router-dom';

const socket = io(process.env.REACT_APP_BACKEND_HOST);  // Use the backendUrl for WebSocket connection

const DriverApp = () => {
  const [rides, setRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchRideHistory = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_HOST}/api/v1/rides/ride-history`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setRides(response.data);
      } catch (error) {
        console.error('Error fetching ride history:', error);
      }
    };
    fetchRideHistory();
  }, []);

  useEffect(() => {
    navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          driverId: localStorage.getItem('id'),
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        socket.emit("driverLocation", locationData);
      },
      (error) => console.error('Error getting location:', error),
      { enableHighAccuracy: true }
    );
  }, []);

  const handleSeeDetails = (ride) => {
    setSelectedRide(ride);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRide(null);
    setIsModalOpen(false);
  };

  const handleEndRide = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_HOST}/api/v1/rides/end/${selectedRide._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      alert('Ride ended successfully');
      closeModal();
    } catch (error) {
      console.error('Error ending the ride:', error);
      alert('Failed to end the ride');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className='flex justify-between w-full max-w-6xl mb-4'>
        <p className="text-2xl font-bold text-orange-600">Welcome Driver</p>
        <nav>
          <Link to="/driver/inbox" className="text-lg text-blue-600 mx-2">Inbox</Link>
          <Link to="/driver/rides" className="text-lg text-blue-600 mx-2">View Rides</Link>
        </nav>
      </div>

      {/* Ride History */}
      <div className="w-full max-w-6xl bg-white shadow-md rounded-lg p-4">
        <h3 className="text-xl font-semibold mb-4">Your Rides</h3>
        <ul className="space-y-2">
        {Array.isArray(rides) && rides
  .sort((a, b) => new Date(b.departureTime) - new Date(a.departureTime))
  .map((ride) => (
    <li key={ride._id} className="flex justify-between items-center border-b pb-2">
      <span>{ride.origin.address} - {new Date(ride.departureTime).toLocaleString()}</span>
      <button
        onClick={() => handleSeeDetails(ride)}
        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
      >
        See Details
      </button>
    </li>
  ))}

        </ul>
      </div>

      {/* Modal for Ride Details */}
      {isModalOpen && selectedRide && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-semibold mb-4">Ride Details</h3>
            <p><strong>Title:</strong> {selectedRide.title}</p>
            <p><strong>Date:</strong> {new Date(selectedRide.date).toLocaleString()}</p>
            <p><strong>Driver:</strong> {selectedRide.driver.name}</p>
            <p><strong>Passengers:</strong> {Array.isArray(selectedRide.passengers) ? selectedRide.passengers.map(p => p.name).join(', ') : 'No passengers'}</p>

            <p><strong>Status:</strong> {selectedRide.status}</p>

            {/* Show "End Ride" button if the ride is not completed */}
            {selectedRide.status !== 'completed' && (
              <button
                onClick={handleEndRide}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                End Ride
              </button>
            )}

            <button onClick={closeModal} className="mt-4 text-gray-500 underline">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverApp;
