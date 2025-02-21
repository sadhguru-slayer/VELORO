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

const CProfile = ({ userId, role, editable }) => {
  const navigate = useNavigate();
  const location = useLocation();

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
          setIsAuthenticated(true);
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

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-x-hidden ml-14 sm:ml-16 md:ml-16 lg:ml-22">
        {/* Header */}
        <CHeader />

        {/* Profile Content */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4 flex justify-center w-full">
          {authLoading ? ( // Check if authentication check is still loading
            <div>Loading...</div>
          ) : individualLoading ? (
            <IndividualLoadingComponent />
          ) : (
            <>
              {activeProfileComponent === "view_profile" && (
                <>
                  {isAuthenticated ? (
                    editable ? (
                      <AuthProfile userId={userId} role={role} editable={editable} />
                    ) : (
                      <OtherProfile userId={userId} role={role} editable={editable} />
                    )
                  ) : (
                    <NotAuthProfile userId={userId} role={role} editable={editable} />
                  )}
                </>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CProfile;
