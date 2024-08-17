// src/RideHistory.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RideHistory = () => {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRides = async () => {
            try {
                const token = localStorage.getItem('token'); // Get token from local storage
                if (!token) {
                    console.error('No token found in local storage');
                    return;
                }
                
                const response = await axios.get('http://localhost:8000/api/v1/rides/ride-history', {
                    headers: { Authorization: `Bearer ${token}` } // Send token in Authorization header
                });
                console.log('Response Data:', response.data); // Debug log
            } catch (error) {
                console.error('Error fetching ride history:', error); // Debug log
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
                    {rides.map(ride => (
                        <li key={ride._id}>
                            <p><strong>Driver:</strong> {ride.driver.fullName}</p>
                            <p><strong>Vehicle:</strong> {ride.driver.vehicle.make} {ride.driver.vehicle.model}</p>
                            <p><strong>Origin:</strong> {ride.origin.address}</p>
                            <p><strong>Destination:</strong> {ride.destination.address}</p>
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
