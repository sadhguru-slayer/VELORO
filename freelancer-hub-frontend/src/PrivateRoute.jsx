import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie'; // Import js-cookie
import { verifyToken, refreshToken as refreshTokenFunction } from './utils/auth'; // Utility functions for token handling
import LoadingComponent from './components/LoadingComponent';

const PrivateRoute = ({ element: Component, ...rest }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isProfiled: false,
    role: '',
    loading: true,
  });

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
      navigate('/login');
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

      const { is_profiled, role } = response.data.user;
      // Handle route redirects based on role
      if (role === 'client' && location.pathname.includes('freelancer')) {
        navigate('/');
        return;
      }
      if (role === 'freelancer' && location.pathname.includes('client')) {
        navigate('/');
        return;
      }

      setAuthState({
        isAuthenticated: true,
        isProfiled: is_profiled,
        role,
        loading: false,
      });

    } catch (error) {
      console.error('Authentication error:', error);
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
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

  const { isAuthenticated, role, loading } = authState;

  if (loading) {
    return <LoadingComponent text="Please wait while we verify your session..." />;
  }

  return isAuthenticated ? (
    <Component {...rest} />
  ) : (
    <Navigate to="/login" />
  );
};

export default PrivateRoute;
