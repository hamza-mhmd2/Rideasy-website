import { Link } from 'react-router-dom';

const PassengerApp = () => {
  return (
    <div>
      <h2>Welcome Passenger</h2>
      <nav>
        <Link to="/passenger/inbox">Inbox</Link>
        <Link to="/passenger/rides">View Rides</Link>
        <Link to="/book-map">Book Ride</Link>
      </nav>
    </div>
  );
};

export default PassengerApp