import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams, Outlet } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie'; // Import js-cookie
import { verifyToken, refreshToken as refreshTokenFunction } from './utils/auth'; // Utility functions for token handling
import LoadingComponent from './components/LoadingComponent';
import FProfile from './pages/freelancer/FProfile';
import CProfile from './pages/client/CProfile';
import ProfilePageLayout from './components/layouts/ProfilePageLayout';

const PrivateRoute = ({ element: Component, allowedRoles = [], ...rest }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isProfiled: false,
    role: '',
    userId: null,
    loading: true,
    hasPermission: false
  });
  const [isEditable, setIsEditable] = useState(false);

  // Move token and role outside useEffect to avoid recreation on each render
  const token = Cookies.get('accessToken');
  const role = Cookies.get('role');

  // Function to check if a token is expiring soon (within 60 seconds)
  const isTokenExpiringSoon = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Current time in seconds
      return decoded.exp - currentTime < 60; // Token will expire in less than 60 seconds
    } catch (error) {
      console.error('Token decode error:', error);
      return true;
    }
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
    }
    return null;
  };

  // Authenticate user function
  const authenticateUser = async () => {
    if (!token) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      if (isTokenExpiringSoon(token)) {
        const newToken = await refreshAccessToken();
        if (!newToken) {
          throw new Error('Token refresh failed');
        }
      }

      const refresh = Cookies.get('refreshToken');
      const isTokenValid = await verifyToken(refresh);
      
      if (!isTokenValid && refresh) {
        const newToken = await refreshAccessToken();
        if (!newToken) {
          throw new Error('Token refresh failed');
        }
      }

      const response = await axios.get('http://127.0.0.1:8000/api/profile/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { is_profiled, role, id } = response.data.user;
      const hasPermission = allowedRoles.length === 0 || allowedRoles.includes(role);

      setAuthState({
        isAuthenticated: true,
        isProfiled: is_profiled,
        role,
        userId: id,
        loading: false,
        hasPermission,
      });

      Cookies.set('userId', id, { 
        expires: 1, 
        secure: true, 
        sameSite: 'Strict' 
      });

    } catch (error) {
      console.error('Authentication error:', error);
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      Cookies.remove('userId');
      setAuthState(prev => ({ ...prev, loading: false }));
      navigate('/login');
    }
  };

  // Initial authentication check
  useEffect(() => {
    authenticateUser();
  }, [token]); // Only re-run when token changes

  // Periodic token check
  useEffect(() => {
    const intervalId = setInterval(async () => {
      const currentToken = Cookies.get('accessToken');
      if (currentToken && isTokenExpiringSoon(currentToken)) {
        await refreshAccessToken();
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array as this should only run once

  // Update isEditable state
  useEffect(() => {
    if (authState.userId) {
      setIsEditable(routeId === authState.userId.toString());
    }
  }, [authState.userId, routeId]); // Only depend on userId and routeId

  const { isAuthenticated,  loading,  hasPermission } = authState;
  const userId = authState.userId;

  if (loading) {
    // Show loading screen until authentication is completed
    return <LoadingComponent text="Please wait while we verify your session..." />;
  }

  // Handle public routes
  if (!allowedRoles.length) {
    return <Component {...rest} />;
  }

  // Handle profile routes for unauthenticated users
  if (!isAuthenticated) {
    if (location.pathname.includes('/freelancer/profile/')) {
      return <FProfile {...rest} userId={routeId} isAuthenticated={false} isEditable={false}/>;
    }
    if (location.pathname.includes('/client/profile/')) {
      return <CProfile {...rest} userId={routeId} isAuthenticated={false} isEditable={false}/>;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle unauthorized access
  if (!hasPermission) {
    return <Navigate to={`/${role}/homepage`} replace />;
  }

  // Handle profile routes for authenticated users
  const currentId = routeId || userId;
  
  if (location.pathname.includes('/profile/')) {
    if (role === 'client' && location.pathname.includes('/freelancer/')) {
      return <FProfile {...rest} userId={currentId} role={role} isAuthenticated={true} isEditable={isEditable} />;
    }
    if (role === 'freelancer' && location.pathname.includes('/client/')) {
      return <CProfile {...rest} userId={currentId} role={role} isAuthenticated={true} isEditable={isEditable} />;
    }
  }

  // Handle messages and other routes
  if (location.pathname.includes('/messages/')) {
    return (
      <Component 
        {...rest} 
        userId={userId} 
        role={role} 
        isAuthenticated={isAuthenticated} 
        isEditable={isEditable}
      >
        <Outlet context={{ userId, role, isAuthenticated, isEditable }} />
      </Component>
    );
  }

  // Handle all other authenticated routes
  return (
    <Component 
      {...rest} 
      userId={userId} 
      role={role} 
      isAuthenticated={isAuthenticated} 
      isEditable={isEditable} 
    />
  );
};

export default PrivateRoute;
