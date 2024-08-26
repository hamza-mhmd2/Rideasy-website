/* global google */

import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import DriversPopup from './DriversPopup';
import { useNavigate } from 'react-router-dom';
import PlacesSearch from './PlacesSearch';

const BookingGoogleMap = () => {
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState(null);
  const [price, setPrice] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [departureTime, setDepartureTime] = useState('');
  const [bookedSeats, setBookedSeats] = useState(0);
  const [showDriversPopup, setShowDriversPopup] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [driverPricePerSeat, setDriverPricePerSeat] = useState(null);
  const [passengerGenders, setPassengerGenders] = useState([]);
  const [driverAvailableSeats, setAvailableSeats] = useState(0);
  const [fullName, setFullName] = useState('');
  const [id, setId] = useState('');

  const navigate = useNavigate();

  const googleMapsApiKey = 'AIzaSyDtXKDh9X7rTW5qdp4b169mYjs9oAZvxs0'; // Replace with your Google Maps API key

  useEffect(() => {
    const storedName = localStorage.getItem('fullName');
    if (storedName) {
      setFullName(storedName);
    }
  }, []);

  useEffect(() => {
    const storedId = localStorage.getItem('id');
    if (storedId) {
      setId(storedId);
    }
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setPickup(currentLocation);
      },
      (error) => console.error('Error getting current location:', error),
      { enableHighAccuracy: true }
    );
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleGenderChange = (index, gender) => {
    const updatedGenders = [...passengerGenders];
    updatedGenders[index] = gender;
    setPassengerGenders(updatedGenders);
  };

  const renderGenderInputs = () => {
    const inputs = [];
    for (let i = 0; i < bookedSeats; i++) {
      inputs.push(
        <div key={i}>
          <label>Passenger {i + 1} Gender:</label>
          <select
            value={passengerGenders[i] || ''}
            onChange={(e) => handleGenderChange(i, e.target.value)}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      );
    }
    return inputs;
  };

  const calculateRoute = async () => {
    if (!pickup || !destination) return;

    const directionsService = new google.maps.DirectionsService();
    const result = await directionsService.route({
      origin: pickup,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
    });

    if (result.status === 'OK') {
      setDirectionsResponse(result);
      const distanceInKm = result.routes[0].legs[0].distance.value / 1000;
      setDistance(distanceInKm);
      const totalPrice = distanceInKm * driverPricePerSeat * bookedSeats;
      setPrice(totalPrice);
      setShowResults(true);
    } else {
      console.error('Error fetching directions:', result);
    }
  };

  const calculateRide = async () => {
    if (pickup && destination && departureTime && bookedSeats > 0 && selectedDriver) {
      if (passengerGenders.length === bookedSeats && bookedSeats <= driverAvailableSeats) {
        const totalPrice = distance * driverPricePerSeat * bookedSeats;
        setPrice(totalPrice);
        setShowResults(true);

        try {
          const response = await fetch('http://localhost:8000/api/v1/rides/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              driver: selectedDriver,
              passenger: id,
              origin: {
                address: 'Pickup Location',
                coordinates: [pickup.lng, pickup.lat], // Ensure correct order: [lng, lat]
              },
              destination: {
                address: 'Destination Location',
                coordinates: [destination.lng, destination.lat], // Ensure correct order: [lng, lat]
              },
              departureTime,
              bookedSeats,
              price: totalPrice,
              passengers_gender: passengerGenders,
            }),
          });
          const data = await response.json();
          if (response.ok) {
            alert('Ride created successfully');
          } else {
            alert(`Failed to create ride: ${data.error}`);
          }
        } catch (error) {
          console.error('Error creating ride:', error);
          alert('Error creating ride');
        }
      } else {
        alert('Please ensure the number of booked seats is within the available seats and that passenger genders are selected.');
      }
    } else {
      alert('Please provide all necessary details');
    }
  };

  const handleBookDriver = async (driverId) => {
    setSelectedDriver(driverId);
    setShowDriversPopup(false);

    try {
      const response = await fetch(`http://localhost:8000/api/v1/auth/drivers/${driverId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const driver = await response.json();
      if (driver && driver.vehicle && driver.vehicle.price_per_seat) {
        setDriverPricePerSeat(driver.vehicle.price_per_seat);
        setAvailableSeats(driver.vehicle.available_seats);
      } else {
        alert('Failed to fetch driver price per seat');
      }
    } catch (error) {
      console.error('Error fetching driver details:', error);
      alert(`Error fetching driver details: ${error.message}`);
    }
  };

  const handlePlaceSearch = (place, type) => {
    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    if (type === 'pickup') {
      setPickup(location);
    } else {
      setDestination(location);
    }

    if (pickup && destination) {
      calculateRoute();
    }
  };

  return (
    <div>
      <h2>Welcome {fullName}</h2>
      <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={['places']}>
        <GoogleMap
          center={pickup || { lat: 31.5204, lng: 74.3587 }}
          zoom={13}
          mapContainerStyle={{ height: '500px', width: '100%' }}
        >
          {pickup && <Marker position={pickup} />}
          {destination && <Marker position={destination} />}
          {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
        </GoogleMap>
        <PlacesSearch
          onPlaceSelected={(place) => handlePlaceSearch(place, 'pickup')}
          placeholder="Enter Pickup Point"
        />
        <PlacesSearch
          onPlaceSelected={(place) => handlePlaceSearch(place, 'destination')}
          placeholder="Enter Destination"
        />
      </LoadScript>
      <input
        type="datetime-local"
        value={departureTime}
        onChange={(e) => setDepartureTime(e.target.value)}
        className="datetime-input"
      />
      <input
        type="number"
        value={bookedSeats}
        onChange={(e) => setBookedSeats(Number(e.target.value))}
        className="seats-input"
        placeholder="Booked Seats"
      />
      {renderGenderInputs()}
      <button onClick={calculateRide} className="calculate-ride-button">Calculate Ride</button>
      {showResults && distance && (
        <div className="info-container">
          <p>Distance: {distance.toFixed(2)} km</p>
          <p>Total Price: {price.toFixed(2)} PKR</p>
        </div>
      )}
      <button onClick={() => setShowDriversPopup(true)} className="show-drivers-button">
        Show Drivers
      </button>
      {showDriversPopup && (
        <DriversPopup onClose={() => setShowDriversPopup(false)} onBookDriver={handleBookDriver} />
      )}
      <button onClick={logout} className="logout-button">Logout</button>
    </div>
  );
};

export default BookingGoogleMap;
