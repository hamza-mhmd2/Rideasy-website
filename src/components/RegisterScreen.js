import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // React Router for navigation
import { FaArrowLeft, FaUser, FaPhone, FaLock, FaCar, FaEnvelope } from 'react-icons/fa';
import axios from 'axios';

const RegisterScreen= () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("passenger");
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
      price_per_seat: "",
      available_seats: "",
    },
  });
  useEffect(() => {
    if (userData.vehicle.seats_in_vehicle && !userData.vehicle.available_seats) {
      setUserData((prevState) => ({
        ...prevState,
        vehicle: {
          ...prevState.vehicle,
          available_seats: prevState.vehicle.seats_in_vehicle,
        },
      }));
    }
  }, [userData.vehicle.seats_in_vehicle]);

  const handleBack = () => {
    navigate(-1); // Go back to the previous page (Welcome Screen)
  };

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    setUserData((prevState) => ({
      ...prevState,
      role: selectedRole,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("vehicle.")) {
      const vehicleField = name.split(".")[1];
      let updatedVehicle = {
        ...userData.vehicle,
        [vehicleField]: value,
      };

      if (vehicleField === "seats_in_vehicle" && !userData.vehicle.available_seats) {
        updatedVehicle = {
          ...updatedVehicle,
          available_seats: value,
        };
      }

      setUserData({
        ...userData,
        vehicle: updatedVehicle,
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
      const response = await axios.post("http://localhost:8000/api/v1/auth/register", userData);
      console.log('Signup response:', response.data);
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-600 px-4 md:px-8 lg:px-16">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl  rounded-lg shadow-lg p-8 space-y-6">
        {/* Back Arrow */}
        <button onClick={handleBack} className="text-gray-700 hover:text-gray-900">
          <FaArrowLeft size={24} />
        </button>

        {/* Register Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center">Register</h1>
        <p className="text-center text-gray-800 text-lg">Create your new account</p>

        {/* Input Fields */}
        <div className="space-y-4">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
            <FaUser className="text-gray-600 mr-3" />
            <input
              type="text"
              name="fullName"
              value={userData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              className="bg-transparent flex-1 focus:outline-none"
            />
          </div>
          
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
            <FaEnvelope className="text-gray-600 mr-3" />
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              placeholder="Email"
              className="bg-transparent flex-1 focus:outline-none"
            />
          </div>

          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
            <FaPhone className="text-gray-600 mr-3" />
            <input
              type="text"
              name="phone"
              value={userData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="bg-transparent flex-1 focus:outline-none"
            />
          </div>

          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
            <FaLock className="text-gray-600 mr-3" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={userData.password}
              onChange={handleChange}
              className="bg-transparent flex-1 focus:outline-none"
            />
          </div>

          {/* Role Dropdown */}
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
            <FaCar className="text-gray-600 mr-3" />
            <select
              name="role"
              value={userData.role}
              onChange={handleRoleChange}
              className="bg-transparent w-full focus:outline-none"
            >
              <option value="passenger">Passenger</option>
              <option value="driver">Driver</option>
            </select>
          </div>

          {/* Conditional Vehicle Details */}
          {role === "driver" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="vehicle.make"
                  placeholder="Vehicle Make"
                  value={userData.vehicle.make}
                  onChange={handleChange}
                  className="bg-gray-100 rounded-full px-4 py-2 flex-1 focus:outline-none"
                />
                <input
                  type="text"
                  name="vehicle.model"
                  placeholder="Vehicle Model"
                  value={userData.vehicle.model}
                  onChange={handleChange}
                  className="bg-gray-100 rounded-full px-4 py-2 flex-1 focus:outline-none"
                />
                <input
                  type="number"
                  name="vehicle.year"
                  placeholder="Vehicle Year"
                  value={userData.vehicle.year}
                  onChange={handleChange}
                  className="bg-gray-100 rounded-full px-4 py-2 flex-1 focus:outline-none"
                />
                <input
                  type="text"
                  name="vehicle.licensePlate"
                  placeholder="Vehicle License Plate"
                  value={userData.vehicle.licensePlate}
                  onChange={handleChange}
                  className="bg-gray-100 rounded-full px-4 py-2 flex-1 focus:outline-none"
                />
                <input
                  type="text"
                  name="vehicle.Type"
                  placeholder="Vehicle Type (AC/DC)"
                  value={userData.vehicle.Type}
                  onChange={handleChange}
                  className="bg-gray-100 rounded-full px-4 py-2 flex-1 focus:outline-none"
                />
                <input
                  type="number"
                  name="vehicle.seats_in_vehicle"
                  placeholder="Seats In Vehicle"
                  value={userData.vehicle.seats_in_vehicle}
                  onChange={handleChange}
                  className="bg-gray-100 rounded-full px-4 py-2 flex-1 focus:outline-none"
                />
                <input
                  type="number"
                  name="vehicle.price_per_seat"
                  placeholder="Price Per Seat"
                  value={userData.vehicle.price_per_seat}
                  onChange={handleChange}
                  className="bg-gray-100 rounded-full px-4 py-2 flex-1 focus:outline-none"
                />
                <input
                  type="number"
                  name="vehicle.available_seats"
                  placeholder="Available Seats"
                  value={userData.vehicle.seats_in_vehicle}
                  onChange={handleChange}
                  className="bg-gray-100 rounded-full px-4 py-2 flex-1 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sign Up Button */}
        <button onClick={signup} className="mt-4 w-full flex items-center justify-center bg-white border border-gray-300 py-3 rounded-full text-xl">
          Sign Up
        </button>

        {/* Or Divider */}
        <div className="flex items-center justify-center space-x-4 my-4">
          <span className="border-b w-full"></span>
          <span className="text-black">Or</span>
          <span className="border-b w-full"></span>
        </div>

        {/* Google Sign Up Button */}
        <button className="w-full flex items-center justify-center bg-white border border-gray-300 py-3 rounded-full text-lg">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png"
            alt="Google logo"
            className="w-20 h-6 mr-3"
          />
          Sign Up With Google
        </button>

        {/* Sign In Link */}
        <p className="text-center text-white mt-4">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/signin')}
            className="text-white font-bold cursor-pointer text-xl"
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default RegisterScreen;
