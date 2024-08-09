import React, { useState, useEffect } from 'react';

const DriversPopup = ({ onClose, onBookDriver }) => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/auth/drivers');
        if (!response.ok) {
          throw new Error('Failed to fetch drivers');
        }
        const data = await response.json();
        setDrivers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  return (
    <div className="drivers-popup">
      <div className="drivers-popup-content">
        <button onClick={onClose} className="close-button">Close</button>
        <h3>Available Drivers</h3>
        {loading ? (
          <p>Loading drivers...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : drivers.length > 0 ? (
          <ul>
            {drivers.map((driver) => (
              <li key={driver._id}>
                {driver.fullName} - {driver.vehicle?.make} {driver.vehicle?.model} ({driver.vehicle?.year}) - {driver.vehicle?.Type}
                <button onClick={() => onBookDriver(driver._id)} className="book-button">Book</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No drivers available</p>
        )}
      </div>
    </div>
  );
};

export default DriversPopup;
