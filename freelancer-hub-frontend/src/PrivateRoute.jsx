import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie'; // Import js-cookie
import { verifyToken, refreshToken as refreshTokenFunction } from './utils/auth'; // Utility functions for token handling
import LoadingComponent from './components/LoadingComponent';
import FProfile from './pages/freelancer/FProfile';
import CProfile from './pages/client/CProfile';

const PrivateRoute = ({ element: Component, ...rest }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeId } = useParams(); // Extract the id from the route params
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isProfiled: false,
    role: '',
    userId: null,
    loading: true, // Initially true while we are verifying the authentication
  });
  const [isEditable, setIsEditable] = useState(false); // Moved here to ensure it's not re-rendered

  // Function to check if a token is expiring soon (within 60 seconds)
  const isTokenExpiringSoon = (token) => {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Current time in seconds
    return decoded.exp - currentTime < 60; // Token will expire in less than 60 seconds
  };

  // Function to refresh the access token using the refresh token
  const refreshAccessToken = async () => {
    const refreshToken = Cookies.get('refreshToken'); // Get refresh token from cookies
    if (!refreshToken) {
      return null; // No refresh token available
    }

    try {
      const newToken = await refreshTokenFunction(refreshToken);
      if (newToken) {
        Cookies.set('accessToken', newToken, { expires: 1, secure: true, sameSite: 'Strict' });
        return newToken;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
    return null;
  };

  // Function to authenticate the user and check the token status
  const authenticateUser = async () => {
    const token = Cookies.get('accessToken'); // Retrieve token from cookies
    const refresh = Cookies.get('refreshToken'); // Retrieve refresh token from cookies

    if (!token) {
      setAuthState((prevState) => ({ ...prevState, loading: false }));
      return;
    }

    try {
      // Check if the access token is about to expire
      if (isTokenExpiringSoon(token)) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          return authenticateUser(); // Retry with the new token
        }
      }

      // Verify the access token's validity using the refresh token
      const isTokenValid = await verifyToken(refresh);
      if (!isTokenValid && refresh) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          Cookies.set('accessToken', newToken, { expires: 1, secure: true, sameSite: 'Strict' });
          return authenticateUser(); // Retry with the new token
        } else {
          throw new Error('Token refresh failed');
        }
      } else if (!isTokenValid) {
        throw new Error('Invalid token and no refresh token available');
      }

      // Fetch user profile if the token is valid
      const response = await axios.get('http://127.0.0.1:8000/api/profile/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { is_profiled, role, id } = response.data.user;

      setAuthState({
        isAuthenticated: true,
        isProfiled: is_profiled,
        role,
        userId: id,  // Save user ID here
        loading: false,
      });

    } catch (error) {
      console.error('Authentication error:', error);
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      setAuthState((prevState) => ({ ...prevState, loading: false }));
      navigate('/login');
    }
  };

  // Periodically check token validity at regular intervals
  useEffect(() => {
    authenticateUser();

    const intervalId = setInterval(async () => {
      const token = Cookies.get('accessToken');
      
      if (token) {
        if (isTokenExpiringSoon(token)) {
          await refreshAccessToken();
          authenticateUser(); // Retry authentication after refreshing the token
        }
      } else {
        console.log("No token found.");
      }
    }, 30000); // Check every 30 seconds
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [navigate, location.pathname]);

  const { isAuthenticated, role, loading, userId } = authState;

  // Update isEditable state when userId and routeId match
  useEffect(() => {
    if (userId) {
      setIsEditable(routeId === userId.toString()); // Check if the route's id matches the authenticated userId
    }
  }, [userId, routeId]);

  if (loading) {
    // Show loading screen until authentication is completed
    return <LoadingComponent text="Please wait while we verify your session..." />;
  }

  if (!isAuthenticated) {
    // Show profile for unauthenticated users
    if (location.pathname.includes('/freelancer/profile/')) {
      return <FProfile {...rest} userId={routeId} isAuthenticated={isAuthenticated} isEditable={isEditable}/>;
    }
    if (location.pathname.includes('/client/profile/')) {
      return <CProfile  {...rest} userId={routeId} isAuthenticated={isAuthenticated} isEditable={isEditable}/>;
    }

    return <Navigate to="/login" />;
  }

  // Render the appropriate profile component based on the user's role and route
  if (isAuthenticated) {
    let Id = routeId === undefined ? userId : routeId;
    if (role === 'client' && location.pathname.includes('/freelancer/profile/')) {
      // If the user is a client and visiting the freelancer profile route, redirect to client profile
      return <CProfile {...rest} userId={Id} role={role} isAuthenticated={isAuthenticated} isEditable={isEditable} />;
    }
    if (role === 'freelancer' && location.pathname.includes('/client/profile/')) {
      // If the user is a freelancer and visiting the client profile route, redirect to freelancer profile
      return <FProfile {...rest} userId={Id} role={role} isAuthenticated={isAuthenticated} isEditable={isEditable} />;
    }

    // Otherwise render the intended component (CProfile for client or FProfile for freelancer)
    return <Component {...rest} userId={Id} role={role} isAuthenticated={isAuthenticated} isEditable={isEditable} />;
  }

  return <Navigate to="/login" />;
};

export default PrivateRoute;
