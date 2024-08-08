// MapWithSearch.js
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; 
import axios from 'axios';
import './MapWithSearch.css';

const pickupIcon = new L.Icon({
  iconUrl: 'https://cdn4.iconfinder.com/data/icons/small-n-flat/24/map-marker-512.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://cdn4.iconfinder.com/data/icons/small-n-flat/24/map-marker-512.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const SearchControl = ({ onResult, placeholder, type }) => {
  const [query, setQuery] = useState('');
  const map = useMap();

  const search = async () => {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json`);
    const results = await response.json();
    if (results.length > 0) {
      const { lat, lon, display_name } = results[0];
      const position = [parseFloat(lat), parseFloat(lon)];
      map.setView(position, 13);
      onResult(position, display_name, type);
    }
  };

  return (
    <div className='search-contains'>
      <div className="search-control">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="search-input"
        />
        <button onClick={search} className="search-button">Search</button>
      </div>
    </div>
  );
};

const MapWithSearch = () => {
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [distance, setDistance] = useState(null);
  const [price, setPrice] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [departureTime, setDepartureTime] = useState('');
  const [availableSeats, setAvailableSeats] = useState(0);

  const calculateDistance = (latlng1, latlng2) => {
    const [lat1, lon1] = latlng1;
    const [lat2, lon2] = latlng2;

    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleResult = (position, display_name, type) => {
    if (type === 'pickup') {
      setPickup(position);
    } else {
      setDestination(position);
    }

    if (pickup && destination && showResults) {
      const dist = calculateDistance(pickup, destination);
      setDistance(dist);
      setPrice(dist * 150);
    }
  };

  const calculateRide = async () => {
    if (pickup && destination && departureTime && availableSeats > 0) {
      const dist = calculateDistance(pickup, destination);
      setDistance(dist);
      setPrice(dist * 150);
      setShowResults(true);

      try {
        const response = await axios.post('http://localhost:8000/api/v1/rides/create', {
          driver: "66b35c8030aefc74054f3d50", // Replace with an actual ObjectId for a driver
          passengers: [
          "66b09fed3fd1882ca201fec0" // Replace with actual ObjectIds for passengers
        ],
          origin: {
            address: 'Pickup Location',
            coordinates: pickup,
          },
          destination: {
            address: 'Destination Location',
            coordinates: destination,
          },
          departureTime,
          availableSeats,
          pricePerSeat: price / distance,
        });

        if (response.status === 201) {
          alert('Ride created successfully');
        } else {
          alert(`Failed to create ride: ${response.data.error}`);
        }
      } catch (error) {
        console.error('Error creating ride:', error);
        alert('Error creating ride');
      }
    } else {
      alert('Please provide all necessary details');
    }
  };

  const position = [31.5204, 74.3587];

  return (
    <div>
      <MapContainer center={position} zoom={13} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {pickup && <Marker position={pickup} icon={pickupIcon}>
          <Popup>Pickup Point</Popup>
        </Marker>}
        {destination && <Marker position={destination} icon={destinationIcon}>
          <Popup>Destination</Popup>
        </Marker>}
        <SearchControl onResult={handleResult} placeholder="Enter Pickup Point" type="pickup" />
        <SearchControl onResult={handleResult} placeholder="Enter Destination" type="destination" />
      </MapContainer>
      <input
        type="datetime-local"
        value={departureTime}
        onChange={(e) => setDepartureTime(e.target.value)}
        className="datetime-input"
      />
      <input
        type="number"
        value={availableSeats}
        onChange={(e) => setAvailableSeats(Number(e.target.value))}
        className="seats-input"
        placeholder="Available Seats"
      />
      <button onClick={calculateRide} className="calculate-ride-button">Calculate Ride</button>
      {showResults && distance && <div className="info-container">
        <p>Distance: {distance.toFixed(2)} km</p>
        <p>Price: {price.toFixed(2)} PKR</p>
      </div>}
    </div>
  );
};

export default MapWithSearch;
