/* global google */
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'; // Import Marker here

const socket = io(`${process.env.REACT_APP_REMOTE_URL}`); // Replace with your backend URL

function LocationComponent({ userType = 'driver' }) {
    const [location, setLocation] = useState({ latitude: null, longitude: null });
    const [nearestDrivers, setNearestDrivers] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (location.latitude && location.longitude) {
            const data = {
                type: userType, // 'driver' or 'passenger'
                location
            };
            socket.emit('new-member', data);
            console.log('Emitted location data:', data); // Debug log
            
        }
    }, [location, userType]);

    useEffect(() => {
        socket.on('nearest-drivers', (drivers) => {
            console.log('Received nearest drivers:', drivers); // Debug log
            setNearestDrivers(drivers);
        });
    }, []);

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    setError(null);
                    console.log('User location:', position.coords); // Debug log
                },
                (error) => {
                    setError(error.message);
                    setLocation({ latitude: null, longitude: null });
                }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
        }
    };

    const isValidLatLng = (lat, lng) => {
        return typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);
    };

    return (
        <div>
            <h1>{userType.charAt(0).toUpperCase() + userType.slice(1)} Location</h1>
            <button onClick={getLocation}>Get Location</button>
            {location.latitude && location.longitude ? (
                <LoadScript googleMapsApiKey="AIzaSyDtXKDh9X7rTW5qdp4b169mYjs9oAZvxs0">
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '400px' }}
                        center={isValidLatLng(location.latitude, location.longitude) ? { lat: location.latitude, lng: location.longitude } : { lat: 0, lng: 0 }}
                        zoom={12}
                    >
                        {isValidLatLng(location.latitude, location.longitude) && (
                            <Marker
                                position={{ lat: location.latitude, lng: location.longitude }}
                                label="You"
                            />
                        )}
                        {nearestDrivers.map(driver => (
                            isValidLatLng(driver.location.latitude, driver.location.longitude) && (
                                <Marker
                                    key={driver.id}
                                    position={{ lat: driver.location.latitude, lng: driver.location.longitude }}
                                    label="Driver"
                                    icon="https://uxwing.com/wp-content/themes/uxwing/download/transportation-automotive/car-top-view-icon.png"
                                />
                            )
                        ))}
                    </GoogleMap>
                </LoadScript>
            ) : (
                <p>{error ? error : 'Click the button to get your location.'}</p>
            )}
        </div>
    );
}

export default LocationComponent;
