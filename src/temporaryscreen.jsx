/* global google */
import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { Grid, Button, TextField, Typography, Box, Select, MenuItem } from '@mui/material'; // Material UI components
import DriversPopup from './DriversPopup';
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import PlacesSearch from './PlacesSearch';

const BookingGoogleMap = () => {
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
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
  const [userLocation, setUserLocation] = useState(null);
  const [driverLocations, setDriverLocations] = useState({});
  const navigate = useNavigate();
  const socket = io("http://localhost:8000"); //Web socket connection

  useEffect(() => {
    // Listen for driver's location updates
    socket.on("locationUpdate", (locationData) => {
      const { driverId, lat, lng } = locationData;
      setDriverLocations((prevLocations) => ({
        ...prevLocations,
        [driverId]: { lat, lng },
      }));
    });

    // Listen for driver's disconnection
    socket.on("driverDisconnected", ({ driverId }) => {
      setDriverLocations((prevLocations) => {
        const updatedLocations = { ...prevLocations };
        delete updatedLocations[driverId];
        return updatedLocations;
      });
    });

    return () => {
      socket.off("locationUpdate");
      socket.off("driverDisconnected"); // Clean up the event listener
    };
  }, [socket]);

  const googleMapsApiKey = 'AIzaSyDtXKDh9X7rTW5qdp4b169mYjs9oAZvxs0'; // Replace with your Google Maps API key
  const handleLoad = () => {
    console.log("Google Maps API loaded");
    // Now you can use google.maps safely
  };
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
      async (position) => {
        const currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setPickup(currentLocation);
        setUserLocation(currentLocation);
      },
      (error) => console.error('Error getting current location:', error),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    const rideId = localStorage.getItem('rideId');
    const userId = localStorage.getItem('id');
  
    if (rideId && userId) {
      socket.emit("joinRoom", { rideId, userId });
    }
  
    return () => {
      socket.off("joinRoom");
    };
  }, [socket]);

// Logout function
  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

// Handle gender selection for each booked seat
  const handleGenderChange = (index, gender) => {
    const updatedGenders = [...passengerGenders];
    updatedGenders[index] = gender;
    setPassengerGenders(updatedGenders);
  };

// Render gender selection inputs based on the number of booked seats
  const renderGenderInputs = () => {
    return [...Array(bookedSeats).keys()].map((index) => (
      <Box key={index} mb={2}>
        <Typography>Passenger {index + 1} Gender</Typography>
        <Select
          fullWidth
          value={passengerGenders[index] || ''}
          onChange={(e) => handleGenderChange(index, e.target.value)}
        >
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </Select>
      </Box>
    ));
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

  useEffect(() => {
    // Automatically calculate route when both pickup and destination are set
    if (pickup && destination) {
      calculateRoute();
    }
  }, [pickup, destination]); // Runs whenever pickup or destination changes

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
            localStorage.setItem('rideId', data.ride._id);
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
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Box p={3} sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
          <Typography variant="h4" gutterBottom>Welcome {fullName}</Typography>

          <Box mb={2}>
            <Typography>Pickup Location</Typography>
            <PlacesSearch
              onPlaceSelected={(place) => handlePlaceSearch(place, 'pickup')}
              placeholder="Enter Pickup Point"
            />
          </Box>

          <Box mb={2}>
            <Typography>Destination</Typography>
            <PlacesSearch
              onPlaceSelected={(place) => handlePlaceSearch(place, 'destination')}
              placeholder="Enter Destination"
            />
          </Box>

          <TextField
            fullWidth
            label="Departure Time"
            type="datetime-local"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Number of Seats"
            type="number"
            value={bookedSeats}
            onChange={(e) => setBookedSeats(parseInt(e.target.value, 10))}
            sx={{ mb: 2 }}
          />

          {renderGenderInputs()}

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={calculateRide}
          >
            Calculate Ride
          </Button>

          {showResults && (
            <Box mt={2}>
              <Typography>Distance: {distance} km</Typography>
              <Typography>Total Price: ${price}</Typography>
            </Box>
          )}

          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            onClick={() => setShowDriversPopup(true)}
            sx={{ mt: 2 }}
          >
            Show Available Drivers
          </Button>

          {showDriversPopup && (
            <DriversPopup
              onClose={() => setShowDriversPopup(false)}
              onBookDriver={handleBookDriver}
            />
          )}

          <Button
            fullWidth
            variant="outlined"
            color="error"
            onClick={logout}
            sx={{ mt: 2 }}
          >
            Logout
          </Button>
        </Box>
      </Grid>

      <Grid item xs={12} md={8}>
        <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={['places']} onLoad={handleLoad}>
        <GoogleMap
          center={pickup || { lat: 31.5204, lng: 74.3587 }}
          zoom={13}
          mapContainerStyle={{ height: '500px', width: '100%' }}
        >
          {pickup && <Marker position={pickup} />}
          {destination && <Marker position={destination} />}
          {Object.values(driverLocations).map((location, index) => (
            <Marker
              key={index}
              position={location}
              icon={{
                url: "https://cdn-icons-png.flaticon.com/512/5193/5193688.png",
                scaledSize: new window.google.maps.Size(30, 30), // Adjust the size as needed
              }}
            />
          ))}
          {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
        </GoogleMap>
        </LoadScript>
      </Grid>
    </Grid>
  );
};

export default BookingGoogleMap;
