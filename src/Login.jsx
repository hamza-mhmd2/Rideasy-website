import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_HOST}/api/v1/auth/login`, formData);
      console.log('Login response:', response.data);

      // Store the JWT token and user information in local storage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('fullName', response.data.user.fullName);
      localStorage.setItem('id', response.data.user.id);
      localStorage.setItem('role', response.data.user.role); // Store the user's role

      // Redirect based on the user's role
      if (response.data.user.role === 'driver') {
        navigate('/driver-app');
      } else if (response.data.user.role === 'passenger') {
        navigate('/passenger-app');
      } else {
        alert('Unknown role:', response.data.user.role);
        // Optionally handle unknown roles, e.g., navigate to an error page
      }
    } catch (error) {
      console.log(`Login error: ${JSON.stringify(error)}`);
      if (error.status === 404) alert('Failed to connect with server')
      if (error.status === 400) alert('Some fields have invalid input')
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
