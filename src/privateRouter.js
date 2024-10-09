// components/PrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ element: Component, ...rest }) => {
  const isAuthenticated = !!localStorage.getItem('token'); // Check for authentication
  const location = useLocation();

  return isAuthenticated ? (
    Component
  ) : (
    <Navigate to="/signin" state={{ from: location }} />
  );
};

export default PrivateRoute;
