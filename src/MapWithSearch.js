import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapWithSearch.css';
import DriversPopup from './DriversPopup'; // Correct casing

// Custom icons
const pickupIcon = new L.Icon({
  iconUrl: 'https://cdn4.iconfinder.com/data/icons/small-n-flat/24/map-marker-512.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://cdn4.iconfinder.com/data/icons/small-n-flat/24/map-marker-512.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
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
  const [bookedSeats, setBookedSeats] = useState(0);
  const [showDriversPopup, setShowDriversPopup] = useState(false); // Popup visibility state
  const [selectedDriver, setSelectedDriver] = useState(''); // Selected driver ID state
  const [passengerGenders, setPassengerGenders] = useState([]); // State to store passenger genders

  const [fullName, setFullName] = useState('');
  const [id, setId] = useState('');

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

  const calculateDistance = (latlng1, latlng2) => {
    const [lat1, lon1] = latlng1;
    const [lat2, lon2] = latlng2;

    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
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
      setPrice(dist * 150); // Assuming 150 PKR per km
    }
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

  const calculateRide = async () => {
    if (pickup && destination && departureTime && bookedSeats > 0 && selectedDriver && passengerGenders.length === bookedSeats) {
      const dist = calculateDistance(pickup, destination);
      setDistance(dist);
      const totalPrice = dist * 150 * bookedSeats; // Calculated total price based on booked seats
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
              address: 'Pickup Location', // Replace with actual address
              coordinates: pickup,
            },
            destination: {
              address: 'Destination Location', // Replace with actual address
              coordinates: destination,
            },
            departureTime,
            bookedSeats,
            price: totalPrice, // Pass the total price to the ride object
            passengers_gender: passengerGenders, // Send passenger genders
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
      alert('Please provide all necessary details');
    }
  };

  const handleBookDriver = (driverId) => {
    setSelectedDriver(driverId);
    setShowDriversPopup(false); // Optionally close the popup after booking
  };

  const position = [31.5204, 74.3587]; // Default position (Lahore, Pakistan)

  return (
    <div>
      <h2>Welcome {fullName}</h2>
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
        value={bookedSeats}
        onChange={(e) => setBookedSeats(Number(e.target.value))}
        className="seats-input"
        placeholder="Booked Seats"
      />
      {renderGenderInputs()} {/* Render gender selection inputs */}
      <button onClick={calculateRide} className="calculate-ride-button">Calculate Ride</button>
      {showResults && distance && <div className="info-container">
        <p>Distance: {distance.toFixed(2)} km</p>
        <p>Total Price: {price} PKR</p>
      </div>}
      <button onClick={() => setShowDriversPopup(true)} className="show-drivers-button">Show Drivers</button>
      {showDriversPopup && <DriversPopup onClose={() => setShowDriversPopup(false)} onBookDriver={handleBookDriver} />}
    </div>
  );
};

export default MapWithSearch;
