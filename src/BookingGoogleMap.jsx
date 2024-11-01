/* global google */
import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import DriversPopup from './DriversPopup';
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import PlacesSearch from './PlacesSearch';
import { FaMapMarkerAlt, FaMapPin } from 'react-icons/fa';

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
  const [driversList, setDriversList] = useState([]);
  const socket = io(`${process.env.REACT_APP_BACKEND_HOST}`); // Connect to the WebSocket server

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

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/signin';
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
            className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
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

      } else {
        alert('Please ensure the number of booked seats is within the available seats and that passenger genders are selected.');
      }
    } else {
      alert('Please provide all necessary details');
    }
  };
  const BookRide = async () => {
    if (pickup && destination && departureTime && bookedSeats > 0 && selectedDriver) {
      if (passengerGenders.length === bookedSeats && bookedSeats <= driverAvailableSeats) {
        const totalPrice = distance * driverPricePerSeat * bookedSeats;
        setPrice(totalPrice);
        setShowResults(true);

        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_HOST}/api/v1/rides/create`, {
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
            alert('Ride Booked successfully');
          } else {
            alert(`Failed to book ride: ${data.error}`);
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
      const response = await fetch(`${process.env.REACT_APP_BACKEND_HOST}/api/v1/auth/drivers/${driverId}`);
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

  const showDrivers = async () => {
    try {
      setShowDriversPopup(true);
      
      // Fetch all drivers from the backend
      const response = await fetch(`${process.env.REACT_APP_BACKEND_HOST}/api/v1/auth/drivers`);
      if (!response.ok) {
        throw new Error('Failed to fetch drivers');
      }
      const drivers = await response.json();
      
      // Filter drivers whose location is available in the driverLocations state (i.e., they're shown on the map)
      const availableDrivers = drivers.filter(driver => driverLocations[driver._id]);
  
      // Set the filtered list of drivers
      setDriversList(availableDrivers);
  
      setShowDriversPopup(true);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
   <div className='flex'> 
      <p className="text-2xl font-bold text-orange-600 my-4 mr-96">Welcome,  Book ride</p>
      <button
        onClick={logout}
        className="my-4 ml-96 text-2xl bg-red-600 text-white py-2 px-2 rounded-md hover:bg-red-700 w-full max-w-xs"
      >
        Logout
      </button>
      </div>
      <div className="w-full max-w-6xl p-4 bg-white shadow-md rounded-lg">
        <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={['places']}>
          <GoogleMap
            center={pickup || { lat: 31.5204, lng: 74.3587 }}
            zoom={13}
            mapContainerStyle={{ height: '500px', width: '100%' }}
            className="rounded-lg overflow-hidden"
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
          <div className="flex mt-4 space-x-4">
  {/* Pickup Location */}
  <div className="relative w-full">
    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
    
    </div>
    <PlacesSearch
      onPlaceSelected={(place) => handlePlaceSearch(place, 'pickup')}
      placeholder="Enter Pickup Point"
      className="w-full pl-10 p-2 border border-gray-400 rounded-md"
    />
  </div>
  
  {/* Destination Location */}
  <div className="relative w-full">
  
    <PlacesSearch
      onPlaceSelected={(place) => handlePlaceSearch(place, 'destination')}
      placeholder="Enter Destination"
      className="w-full pl-10 p-2 border border-gray-400 rounded-md"
    />
  </div>
</div>



        </LoadScript>
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700">Departure Time:</label>
          <input
            type="datetime-local"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          />
        </div>
        <div className="flex flex-col mt-4 space-y-4">
          <label className="text-sm font-medium text-gray-700">Number of Seats:</label>
          <input
            type="number"
            value={bookedSeats}
            onChange={(e) => setBookedSeats(parseInt(e.target.value, 10))}
            placeholder='Enter number of seats'
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          />
          {renderGenderInputs()}
          <button
            onClick={calculateRide}
            className="bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700"
          >
            Calculate Ride
          </button>
          {showResults && (
            <>
              <p className="text-gray-700">Distance: {distance} km</p>
              <p className="text-gray-700">Total Price: PKR.{price}</p>
              <button
                onClick={BookRide}
                className="bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700"
              >
                Book Ride
              </button>
            </>
          )}
        </div>
        <div className="w-full max-w-6xl mt-8">
        <button
          onClick={showDrivers}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 w-full "
        >
          Show Available Drivers
        </button>
      </div>
      
      </div>

      

  
      {showDriversPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-xl font-semibold mb-4">Available Drivers</h3>
              <ul>
                {driversList.length > 0 ? (
                  driversList.map((driver) => (
                    <li key={driver._id} className="border-b py-2">
                      <div className="flex justify-between items-center">
                        <span>{driver.fullName} (Price per seat: PKR.{driver.vehicle.price_per_seat})</span>
                        <button
                          className="bg-green-500 text-white px-4 py-2 rounded"
                          onClick={() => handleBookDriver(driver._id)}
                        >
                          Book Driver
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <p>No drivers available at the moment.</p>
                )}
              </ul>
              <button
                className="mt-4 bg-red-500 text-white py-2 px-4 rounded"
                onClick={() => setShowDriversPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

export default BookingGoogleMap;
