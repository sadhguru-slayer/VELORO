import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import FSider from "../freelancer/FSider";
import FHeader from "../freelancer/FHeader";
import IndividualLoadingComponent from "../IndividualLoadingComponent";
import Cookies from "js-cookie";
import axios from "axios";
import { useMediaQuery } from "react-responsive";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { verifyToken, refreshToken as refreshTokenFunction } from '../../utils/auth';

const FreelancerProfilePageLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const [individualLoading, setIndividualLoading] = useState(false);
  const [activeProfileComponent, setActiveProfileComponent] = useState("");
  const [activeComponent, setActiveComponent] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [userId, setUserId] = useState(id);
  const [userRole, setUserRole] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  // Extract the current profile section from the URL
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    // Check if the last part is a valid profile section
    const validSections = ["profile", "connections", "collaborations", "portfolio", "settings"];
    if (validSections.includes(lastPart)) {
      setActiveProfileComponent(lastPart);
    } else {
      setActiveProfileComponent("profile");
    }
  }, [location.pathname]);

  // Function to check if a token is expiring soon (within 60 seconds)
  const isTokenExpiringSoon = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Current time in seconds
      return decoded.exp - currentTime < 60; // Token will expire in less than 60 seconds
    } catch (error) {
      console.error("Error decoding token:", error);
      return true; // Assume token is expiring if we can't decode it
    }
  };

  // Function to refresh the access token
  const refreshAccessToken = async () => {
    const refreshToken = Cookies.get('refreshToken');
    if (!refreshToken) return null;

    try {
      const newToken = await refreshTokenFunction(refreshToken);
      if (newToken) {
        Cookies.set('accessToken', newToken, { 
          expires: 1, 
          secure: true, 
          sameSite: 'Strict' 
        });
        return newToken;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
    return null;
  };

  // Check authentication status and get user info
  useEffect(() => {
    const authenticateUser = async () => {
      const accessToken = Cookies.get('accessToken');
      const refreshTokenValue = Cookies.get('refreshToken');
      
      if (!accessToken) {
        setIsAuthenticated(false);
        setAuthLoading(false);
        return;
      }

      try {
        // Check if token is expiring soon and refresh if needed
        if (isTokenExpiringSoon(accessToken)) {
          const newToken = await refreshAccessToken();
          if (!newToken) {
            throw new Error('Token refresh failed');
          }
        }

        // Verify token validity
        const isValid = await verifyToken(refreshTokenValue);
        if (!isValid && refreshTokenValue) {
          const newToken = await refreshAccessToken();
          if (!newToken) {
            throw new Error('Token refresh failed');
          }
        } else if (!isValid) {
          throw new Error('Invalid token');
        }

        // Get user profile
        const response = await axios.get("http://127.0.0.1:8000/api/profile/", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.status >= 200) {
          setIsAuthenticated(true);
          setUserRole(response.data.user.role);
          
          // Store the authenticated user's ID
          const authUserId = response.data.user.id.toString();
          setCurrentUserId(authUserId);
          
          // Check if the profile being viewed is the user's own profile
          setIsEditable(authUserId === id);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setIsAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    };

    authenticateUser();
  }, [id]);

  const handleMenuClick = (component) => {
    if (location.pathname !== "/freelancer/dashboard") {
      navigate("/freelancer/dashboard", { state: { component } });
    } else {
      setActiveComponent(component);
    }

    setIndividualLoading(true);
    setTimeout(() => {
      setIndividualLoading(false);
    }, 500);
  };

  const handleProfileMenu = (profileComponent) => {
    const profilePath = location.pathname.split('/').slice(0, 3).join('/');
    navigate(`${profilePath}/${profileComponent}`);
    
    setIndividualLoading(true);
    setTimeout(() => {
      setIndividualLoading(false);
    }, 500);
  };

  if (authLoading || individualLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <IndividualLoadingComponent />
      </div>
    );
  }

  // Case 1: Not authenticated - Show minimal header with NotAuthProfile
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with gradient background */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-indigo-600/5 pointer-events-none" />
          <FHeader 
            isAuthenticated={isAuthenticated} 
            isEditable={isEditable}
            userId={userId}
          />
        </div>

        {/* Main content with subtle animation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-8"
        >
          <Outlet context={{ 
            userId, 
            isEditable: false, 
            isAuthenticated: false,
            role: null,
            currentUserId: null
          }} />

          {/* Footer info */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Want to see more? 
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="ml-2 text-violet-600 hover:text-violet-700 font-medium"
              >
                Sign in to connect
              </motion.button>
            </p>
          </div>
        </motion.div>

        {/* Background decoration */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-full filter blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-l from-violet-500/10 to-indigo-500/10 rounded-full filter blur-[100px]" />
        </div>
      </div>
    );
  }

  // Case 2: Authenticated but viewing someone else's profile - Show OtherProfile
  if (isAuthenticated && !isEditable) {
    return (
      <div className={`flex h-screen bg-white`}>
        <FSider
          userId={currentUserId}
          dropdown={true}
          collapsed={true}
          handleMenuClick={handleMenuClick}
          abcds={activeComponent}
          handleProfileMenu={handleProfileMenu}
          activeProfileComponent={activeProfileComponent}
        />
        <div className={`flex-1 flex flex-col overflow-x-hidden ${isMobile ? 'ml-0' : 'ml-16'}`}>
          <FHeader 
            isAuthenticated={isAuthenticated} 
            isEditable={isEditable}
            userId={userId}
          />
          <div className="flex-1 overflow-auto bg-gray-100 p-4 flex justify-center w-full">
            <Outlet context={{ 
              userId, 
              isEditable: false, 
              isAuthenticated: true,
              role: userRole,
              currentUserId
            }} />
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Authenticated and viewing own profile - Show AuthProfile
  return (
    <div className={`flex h-screen bg-white`}>
      <FSider
        userId={userId}
        dropdown={true}
        collapsed={true}
        handleMenuClick={handleMenuClick}
        abcds={activeComponent}
        handleProfileMenu={handleProfileMenu}
        activeProfileComponent={activeProfileComponent}
      />
      <div className={`flex-1 flex flex-col overflow-x-hidden ${isMobile ? 'ml-0' : 'ml-16'}`}>
        <FHeader 
          isAuthenticated={isAuthenticated} 
          isEditable={isEditable}
          userId={userId}
        />
        <div className="flex-1 overflow-auto bg-gray-50 flex justify-center min-h-fit min-w-fit pb-16">
          <Outlet context={{ 
            userId, 
            isEditable: true, 
            isAuthenticated: true,
            role: userRole,
            currentUserId
          }} />
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfilePageLayout; 