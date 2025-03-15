import React, { useState, useEffect } from "react";
import CHeader from "../../components/client/CHeader";
import CSider from "../../components/client/CSider";
import { Link, useLocation, useNavigate } from "react-router-dom";
import IndividualLoadingComponent from "../../components/IndividualLoadingComponent";
import Cookies from "js-cookie";
import AuthProfile from "./profile/AuthProfile";
import axios from "axios";
import { Button, Pagination, Table } from "antd";
import { FaEye } from "react-icons/fa";
import EditProfile from "./profile/EditProfile";
import ReviewsRatings from "./profile/RatingsRatings";
import Collaboration from "./profile/Collaboration";
import Collaborations from "./profile/Collaboration";
import NotAuthProfile from "./profile/NotAuthProfile";
import OtherProfile from "./profile/OtherProfile";
import { motion } from "framer-motion";
import { useMediaQuery } from "react-responsive";

const CProfile = ({ userId, role, isEditable }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const [individualLoading, setIndividualLoading] = useState(false);
  const [activeProfileComponent, setActiveProfileComponent] = useState("");
  const [activeComponent, setActiveComponent] = useState("");
  const [clientInfo, setClientInfo] = useState({});
  const [projects, setProjects] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [connectionCount, setConnectionCount] = useState(0); // To store connection count
  const [averageRating, setAverageRating] = useState(0); // To store average rating

  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true); // Track auth loading
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const currentProfileComponent = location.state?.profileComponent;
    if (currentProfileComponent) {
      setActiveProfileComponent(currentProfileComponent);
    } else {
      setActiveProfileComponent("view_profile");
    }
    setLoading(false);
  }, [location.state]);

  // Check if the user is authenticated
  useEffect(() => {
    const getIsAuthenticated = async () => {
      
      const accessToken = Cookies.get("accessToken");
      if (accessToken) {
        try {
          const response = await axios.get("http://127.0.0.1:8000/api/profile/", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if(response.status>=200){
            setIsAuthenticated(true);
            
          }
        } catch (error) {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setAuthLoading(false); // Set authLoading to false after the check
    };

    getIsAuthenticated();
  }, []);

  const handleMenuClick = (component) => {
    if (location.pathname !== "/client/dashboard") {
      navigate("/client/dashboard", { state: { component } });
    } else {
      setActiveComponent(component);
    }

    setIndividualLoading(true);
    setTimeout(() => {
      setIndividualLoading(false);
    }, 500);
  };

  const handleProfileMenu = (profileComponent) => {
    if (location.pathname !== "/client/profile") {
      navigate(`/client/profile/${userId}`, { state: { profileComponent } });
      
    } else {
      setActiveProfileComponent(profileComponent);
    }

    setIndividualLoading(true);
    setTimeout(() => {
      setIndividualLoading(false);
    }, 500);
  };

  const pathnames = location.pathname.split("/").filter((x) => x);

  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const paginatedData = projects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  console.log(isAuthenticated,isEditable,userId)
  const renderProfile = () => {
    if (!isAuthenticated && !isEditable) {
      // Case 1: Not authenticated, not isEditable - Show NonAuth with minimal header
      return (
        <div className="min-h-screen bg-gray-50">
          {/* Header with gradient background */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600/5 to-blue-600/5 pointer-events-none" />
            <CHeader 
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
            className=""
          >
           
            {/* Profile content with card style */}
              <NotAuthProfile 
                userId={userId} 
                role={role} 
                isEditable={isEditable} 
              />

            {/* Optional: Footer info */}
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>Want to see more? 
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className="ml-2 text-teal-600 hover:text-teal-700 font-medium"
                >
                  Sign in to connect
                </motion.button>
              </p>
            </div>
          </motion.div>

          {/* Background decoration */}
          <div className="fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-full filter blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-l from-teal-500/10 to-blue-500/10 rounded-full filter blur-[100px]" />
          </div>
        </div>
      );
    } else if (isAuthenticated && !isEditable) {
      // Case 2: Authenticated but not isEditable - Show OtherProfile with header/sider
      return (
        <div className={`flex h-screen bg-white ${isMobile ? 'ml-0' : 'ml-14'}`}>
          <CSider
            userId={userId}
            role={role}
            dropdown={true}
            collapsed={true}
            handleMenuClick={handleMenuClick}
            abcds={activeComponent}
            handleProfileMenu={handleProfileMenu}
            activeProfileComponent={activeProfileComponent}
          />
          <div className="flex-1 flex flex-col overflow-x-hidden">
            <CHeader 
              isAuthenticated={isAuthenticated} 
              isEditable={isEditable}
              userId={userId}
            />
            <div className="flex-1 overflow-auto bg-gray-100 p-4 flex justify-center w-full">
              {activeProfileComponent === "view_profile" && (
                <OtherProfile userId={userId} role={role} isEditable={isEditable} />
              )}
              {/* Other profile components... */}
            </div>
          </div>
        </div>
      );
    } else if (isAuthenticated && isEditable) {
      // Case 3: Authenticated and isEditable - Show AuthProfile with header/sider
      return (
        <div className={`flex h-screen bg-white `}>
          <CSider
            userId={userId}
            role={role}
            dropdown={true}
            collapsed={true}
            handleMenuClick={handleMenuClick}
            abcds={activeComponent}
            handleProfileMenu={handleProfileMenu}
            activeProfileComponent={activeProfileComponent}
          />
          <div className={`flex-1 flex flex-col overflow-x-hidden ${isMobile ? 'ml-0' : 'ml-14'}`}>
            <CHeader 
              isAuthenticated={isAuthenticated} 
              isEditable={isEditable}
              userId={userId}
            />
            <div className="flex-1 overflow-auto bg-gray-50 flex justify-center min-h-fit min-w-fit pb-16">
              {activeProfileComponent === "view_profile" && (
                <AuthProfile userId={userId} role={role} isEditable={isEditable} />
              )}
              {activeProfileComponent === "edit_profile" && (
                <EditProfile userId={userId} role={role} />
              )}
              {activeProfileComponent === "reviews_ratings" && (
                <ReviewsRatings />
              )}
              {activeProfileComponent === "collaborations" && (
                <Collaborations />
              )}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      {authLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <IndividualLoadingComponent />
        </div>
      ) : individualLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <IndividualLoadingComponent />
        </div>
      ) : (
        renderProfile()
      )}
    </>
  );
};

export default CProfile;
