import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import FSider from "../../components/freelancer/FSider";
import FHeader from "../../components/freelancer/FHeader";
import IndividualLoadingComponent from "../../components/IndividualLoadingComponent";
import Cookies from "js-cookie";
import axios from "axios";
import { useMediaQuery } from "react-responsive";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { verifyToken, refreshToken as refreshTokenFunction } from '../../utils/auth';
import NotAuthProfile from './profile/NotAuthProfile';
import OtherProfile from './profile/OtherProfile';
const FProfile = ({ userId, isAuthenticated, isEditable }) => {
  const [role, setRole] = useState(null);
  
  // Fetch role when component mounts
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
          console.error('No access token found');
          return;
        }

        const response = await axios.get('http://127.0.0.1:8000/api/profile/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        setRole(response.data.user.role);
      } catch (error) {
        console.error('Error fetching role:', error);
      }
    };

    fetchRole();
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const [individualLoading, setIndividualLoading] = useState(false);
  const [activeProfileComponent, setActiveProfileComponent] = useState("");
  const [activeComponent, setActiveComponent] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  // Extract the current profile section from the URL
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    const validSections = ["view_profile", "connections", "collaborations", "portfolio", "settings"];
    if (validSections.includes(lastPart)) {
      setActiveProfileComponent(lastPart);
    } else {
      setActiveProfileComponent("view_profile");
    }
  }, [location.pathname]);

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

  if (individualLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <IndividualLoadingComponent />
      </div>
    );
  }

  // Not authenticated - Show minimal header
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-indigo-600/5 pointer-events-none" />
          <FHeader 
            isAuthenticated={isAuthenticated} 
            isEditable={isEditable}
            userId={userId}
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-8"
        >
          <NotAuthProfile userId={userId} role={role} isEditable={false} />

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

        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-full filter blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-l from-violet-500/10 to-indigo-500/10 rounded-full filter blur-[100px]" />
        </div>
      </div>
    );
  }

  // Authenticated but not editable - Show NotAuthProfile with full header
  if (isAuthenticated && !isEditable) {
    return (
      <div className={`flex h-screen bg-white`}>
        <FSider
          userId={userId}
          role={role}
          isAuthenticated={isAuthenticated}
          isEditable={isEditable}
          dropdown={true}
          collapsed={true}
          handleMenuClick={handleMenuClick}
          abcds={activeComponent}
          handleProfileMenu={handleProfileMenu}
          activeProfileComponent={activeProfileComponent}
        />
        <div className={`flex-1 flex flex-col overflow-x-hidden ${isMobile ? 'ml-0' : 'ml-16'}`}>
          <FHeader 
            userId={userId}
            role={role}
            isAuthenticated={isAuthenticated}
            isEditable={isEditable}
          />
          <div className="flex-1 overflow-auto bg-gray-100 flex justify-center w-full p-4">
            <OtherProfile 
              userId={userId} 
              role={role} 
              isAuthenticated={isAuthenticated} 
            />
          </div>
        </div>
      </div>
    );
  }

  // Authenticated and editable - Show full profile
  return (
    <div className="flex h-screen bg-gray-50">
      <FSider
        userId={userId}
        role={role}
        isAuthenticated={isAuthenticated}
        isEditable={isEditable}
        dropdown={true}
        collapsed={true}
        handleMenuClick={handleMenuClick}
        abcds={activeComponent}
        handleProfileMenu={handleProfileMenu}
        activeProfileComponent={activeProfileComponent}
      />
      <div className={`flex-1 flex flex-col ${isMobile ? 'ml-0' : 'ml-14 sm:ml-14 md:ml-14 lg:ml-14'}`}>
        <div className="sticky top-0 z-10 w-full">
          <FHeader 
            userId={userId}
            role={role}
            isAuthenticated={isAuthenticated}
            isEditable={isEditable}
          />
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="min-h-full pb-16">
            <Outlet context={{ 
              userId, 
              role,
              isEditable,
              currentUserId: userId
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FProfile;
