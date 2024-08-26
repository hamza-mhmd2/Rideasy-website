import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Register from './Register';
import MapWithSearch from './MapWithSearch'; // Import the MapWithSearch component
import Login from "./Login";
import RideHistory from './RideHistory';
import PrivateRoute from './privateRouter'; 
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/register" element={<Register />} />
         
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/history" element={<RideHistory />} />
          <Route
          path="/map"
          element={
            <PrivateRoute element={<MapWithSearch />} />
          }
        />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
