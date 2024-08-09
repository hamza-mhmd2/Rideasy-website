import { useNavigate } from 'react-router-dom';

function useAuth() {
  const navigate = useNavigate();
  
  // Check if token exists and is valid
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return token !== null; // In a real application, you'd validate the token here
  };

  // Redirect to login if not authenticated
  const checkAuth = () => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  };

  return { isAuthenticated, checkAuth };
}

export default useAuth;
