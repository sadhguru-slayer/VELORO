import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; 
import Cookies from 'js-cookie';  // Import js-cookie
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

  const refreshAccessToken = async () => {
    const refresh = Cookies.get('refreshToken');  // Get refresh token from cookies
    if (refresh) {
      const newToken = await refreshTokenFunction(refresh);
      if (newToken) {
        Cookies.set('accessToken', newToken, { expires: 1, secure: true, sameSite: 'Strict' });  // Set new access token in cookies
        return newToken;
      }
    }
    return null;
  };

  const isTokenExpiringSoon = (token) => {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Current time in seconds
    return decoded.exp - currentTime < 60; // Token will expire in less than 60 seconds
  };

  useEffect(() => {
    const authenticateUser = async () => {
      const token = Cookies.get('accessToken');  // Retrieve token from cookies
      const refresh = Cookies.get('refreshToken');  // Retrieve refresh token from cookies

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

        // Verify the access token's validity
        const isTokenValid = await verifyToken(token);
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

        // Fetch user profile
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

        if (!is_profiled && role !== 'client') {
          navigate('/profiling');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        navigate('/login');
      }
    };

    authenticateUser();
  }, [navigate, location.pathname]);

  const { isAuthenticated, isProfiled, role, loading } = authState;

  if (loading) {
    return <LoadingComponent text="Please wait while we verify your session..." />;
  }

  return isAuthenticated && (isProfiled || role === 'client') ? (
    <Component {...rest} />
  ) : (
    <Navigate to="/login" />
  );
};

export default PrivateRoute;
