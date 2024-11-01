import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "passenger",
    vehicle: {
      make: "",
      model: "",
      year: "",
      licensePlate: "",
      Type: "",
      seats_in_vehicle: "",
      price_per_seat:"",
      available_seats:"",
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("vehicle.")) {
      const vehicleField = name.split(".")[1];
      setUserData({
        ...userData,
        vehicle: {
          ...userData.vehicle,
          [vehicleField]: value,
        },
      });
    } else {
      setUserData({
        ...userData,
        [name]: value,
      });
    }
  };

  const signup = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_HOST}/api/v1/auth/register`, userData);
      console.log('Signup response:', response.data);
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        name="fullName"
        value={userData.fullName}
        onChange={handleChange}
        placeholder="Full Name"
      />
      <input
        type="email"
        name="email"
        value={userData.email}
        onChange={handleChange}
        placeholder="Email"
      />
      <input
        type="password"
        name="password"
        value={userData.password}
        onChange={handleChange}
        placeholder="Password"
      />
      <input
        type="text"
        name="phone"
        value={userData.phone}
        onChange={handleChange}
        placeholder="Phone Number"
      />
      <select
        name="role"
        value={userData.role}
        onChange={handleChange}
      >
        <option value="passenger">Passenger</option>
        <option value="driver">Driver</option>
      </select>
      {userData.role === "driver" && (
        <div>
          <input
            type="text"
            name="vehicle.make"
            value={userData.vehicle.make}
            onChange={handleChange}
            placeholder="Vehicle Make"
          />
          <input
            type="text"
            name="vehicle.model"
            value={userData.vehicle.model}
            onChange={handleChange}
            placeholder="Vehicle Model"
          />
          <input
            type="number"
            name="vehicle.year"
            value={userData.vehicle.year}
            onChange={handleChange}
            placeholder="Vehicle Year"
          />
          <input
            type="text"
            name="vehicle.licensePlate"
            value={userData.vehicle.licensePlate}
            onChange={handleChange}
            placeholder="Vehicle License Plate"
          />
          <input
            type="text"
            name="vehicle.Type"
            value={userData.vehicle.Type}
            onChange={handleChange}
            placeholder="Vehicle Type (AC/DC)"
          />
          <input
            type="number"
            name="vehicle.seats_in_vehicle"
            value={userData.vehicle.seats_in_vehicle}
            onChange={handleChange}
            placeholder="Enter number of seats for passengers"
          />
          <input
            type="number"
            name="vehicle.price_per_seat"
            value={userData.vehicle.price_per_seat}
            onChange={handleChange}
            placeholder="Set Price Per Seat"
          />
          <input
            type="number"
            name="vehicle.available_seats"
            value={userData.vehicle.available_seats}
            onChange={handleChange}
            placeholder={userData.vehicle.seats_in_vehicle}
          />
        </div>
      )}
      <button onClick={signup}>Sign Up</button>
    </div>
  );
}

export default Register;





