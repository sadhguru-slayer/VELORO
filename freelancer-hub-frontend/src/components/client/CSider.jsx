import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaPlusCircle, FaEye, FaSignOutAlt, FaChevronDown, FaUserAlt } from "react-icons/fa";
import { MdSpaceDashboard } from "react-icons/md";
import axios from "axios";
import Cookies from 'js-cookie';

const CSider = ({ dropdown, handleMenuClick, abcds, collapsed,handleProfileMenu,activeProfileComponent,userId, role }) => {
  
  const [isCollapsed, setIsCollapsed] = useState(collapsed); // State for toggling sidebar
  const [isTextVisible, setIsTextVisible] = useState(!collapsed); // State to control text visibility
  const [isDashboardDropdownOpen, setIsDashboardDropdownOpen] = useState(true); // State for dashboard dropdown
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(true); // State for profile dropdown

  const navigate = useNavigate();
  const location = useLocation(); // Hook to get the current route

  const handleSidebarToggle = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setIsTextVisible(false);
    } else {
      setTimeout(() => setIsTextVisible(true), 500); // Matches the transition duration
    }
  };

  const handleLogout = async () => {
    const refreshToken = Cookies.get("refreshToken");
    const accessToken = Cookies.get("accessToken");
    if (!refreshToken) {
      alert("Please login. Redirecting to login.");
      navigate("/login");
      return;
    }
    try {
      const tokens = { accessToken, refreshToken };
      await axios.post("http://127.0.0.1:8000/api/logout/", tokens, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const links = [
    { abcd: "post-project", to: "/client/post-project", icon: <FaPlusCircle />, text: "Post Project" },
    { abcd: "view-bids", to: "/client/view-bids", icon: <FaEye />, text: "View Bids" },
  ];

  const dashboardLinks = [
    { abcd: "overview", text: "Overview" },
    { abcd: "projects", text: "Projects" },
    { abcd: "recent_activity", text: "Recent Activity" },
    { abcd: "spendings", text: "Spendings" },
    { abcd: "upcoming-events", text: "Upcoming Events" },
  ];

 
  const profileLinks = [
    {component:"view_profile",text:"View Profile"},
    {component:"edit_profile",text:"Edit Profile"},
    {component:"reviews_ratings",text:"Reviews"},
    { component: 'collaborations', text: 'Collaborations' },
  ];

  return (
    <div
    className={`
      h-screen 
      bg-[#2C3E50] 
      text-gray-100 
      flex flex-col items-center 
      transition-all duration-500 
      overflow-x-hidden 
      absolute z-20 
    
      ${isCollapsed ? 
        'w-14 sm:w-16 md:w-16 lg:w-22' : 
        'w-44 sm:w-52 md:w-52 lg:w-64'}
    
      /* Custom scrollbar styling */
      scrollbar 
      scrollbar-thin 
      scrollbar-thumb-slate-700 
      scrollbar-thumb-rounded-full
      scrollbar-track-slate-300 
      scrollbar-track-rounded-full 
      scrollbar-slate-300
      overflow-y-auto
    `}
    >
      {/* Toggle Button */}
      <div className="flex w-[80%] border border-gray-600 rounded-lg mt-6 flex-col justify-center items-center p-3">
        <button
          className="p-3 focus:outline-none hover:bg-teal-600 transition-all rounded-full"
          onClick={handleSidebarToggle}
        >
          <FaBars className="text-gray-200" />
        </button>
        <div className={`text-center transition-opacity duration-500 ${isCollapsed || !isTextVisible ? 'opacity-0' : 'opacity-100'}`}>
          <h1 className="text-md sm:text-xl md:text-2xl font-bold tracking-wide whitespace-nowrap text-gray-100">
            CPanel
          </h1>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="my-3 sm:m-3 md:m-4 flex flex-col justify-center gap-4 w-[100%] p-3">
        {/* Dashboard Dropdown */}
        <div>
          <div
            className={`flex items-center justify-center gap-4 p-3 rounded-lg transition-all border border-gray-600 ${location.pathname.includes("/client/dashboard") ? "bg-teal-600" : "hover:bg-teal-500"}`}
            onClick={() => {
              if (!location.pathname.includes("/client/dashboard")) {
                navigate("/client/dashboard");
              }
              handleMenuClick('overview');
            }}
          >
            <div className="text-m text-gray-100">
              <MdSpaceDashboard />
            </div>
            <span
              className={`text-md whitespace-nowrap transition-opacity duration-500 ${location.pathname.includes("/client/dashboard") ? "text-white" : "text-gray-200"} ${isCollapsed || !isTextVisible ? "opacity-0 hidden" : "opacity-100"}`}
            >
              Dashboard
            </span>
            <FaChevronDown
              onClick={(e) => {
                e.stopPropagation();
                setIsDashboardDropdownOpen(!isDashboardDropdownOpen);
              }}
              className={`ml-auto transition-transform ${isDashboardDropdownOpen ? "rotate-180" : "rotate-0"} ${isCollapsed || !isTextVisible ? "opacity-0 hidden" : "opacity-100"}`}
            />
          </div>
          {/* Dropdown Links */}
          {isDashboardDropdownOpen && (
            <div className={`flex flex-col gap-2 mt-2 pl-6 transition-all duration-500 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
              {dashboardLinks.map((link) => (
                <div
                  key={link.abcd}
                  onClick={() => handleMenuClick(link.abcd)}
                  className={`text-md p-2 text-gray-100 border-b border-b-gray-600 hover:rounded-lg hover:bg-teal-500 cursor-pointer ${abcds === link.abcd ? "bg-teal-600 text-white rounded-lg" : ""}`}
                >
                  {link.text}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div>
          <div
            className={`flex items-center justify-center gap-4 p-3 rounded-lg transition-all border border-gray-600 hover:bg-teal-500 ${location.pathname.includes('client/profile')?"bg-teal-500":""}`}
            onClick={()=>{if (!location.pathname.includes('/client/profile')) {
              navigate(`/client/profile/${userId}`);
            }}}
          >
            <div className="text-m text-gray-100">
              <FaUserAlt />
            </div>
            <span
              className={`text-md whitespace-nowrap transition-opacity duration-500 ${isCollapsed || !isTextVisible ? "opacity-0 hidden" : "opacity-100"} `}
            
              >
              Profile
            </span>
            <FaChevronDown
              onClick={(e) => {
                e.stopPropagation();
                setIsProfileDropdownOpen(!isProfileDropdownOpen);
              }}
              className={`ml-auto transition-transform ${isProfileDropdownOpen ? "rotate-180" : "rotate-0"} ${isCollapsed || !isTextVisible ? "opacity-0 hidden" : "opacity-100"}`}
            />
          </div>
          {/* Dropdown Links */}
          {isProfileDropdownOpen && (
            <div
              className={`flex flex-col gap-2 mt-2 pl-6 transition-all duration-500 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}
            >
            {profileLinks.map((profileLink,index)=>(
              <div
              key={index}
              onClick={()=>handleProfileMenu(profileLink.component)}
                className={`text-md p-2 text-gray-100 border-b border-b-gray-600 rounded-lg hover:bg-teal-500 cursor-pointer 
                  ${profileLink.component === activeProfileComponent?"bg-teal-400":""}
                  `}
              >
              {profileLink.text}
              </div>
          ))}
            </div>
          )}
        </div>

        {/* Other Links */}
        {links.map((link) => (
          <div
            key={link.abcd}
            onClick={() => navigate(link.to)}
            className={`flex items-center justify-center gap-4 p-3 rounded-lg transition-all border border-gray-600 ${location.pathname.includes(link.to) ? "bg-teal-600" : "hover:bg-teal-500"}`}
          >
            <div className={`text-m ${location.pathname.includes(link.to) ? "text-white" : "text-gray-200"}`}>
              {link.icon}
            </div>
            <span
              className={`text-md whitespace-nowrap transition-opacity duration-500 ${location.pathname === link.to ? "text-white" : "text-gray-200"} ${isCollapsed || !isTextVisible ? "opacity-0 hidden" : "opacity-100"}`}
            >
              {link.text}
            </span>
          </div>
        ))}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-4 p-3 rounded-lg hover:border-red-600 transition-all w-full text-left border border-gray-600"
        >
          <div className="text-m text-gray-100">
            <FaSignOutAlt />
          </div>
          <span
            className={`text-md whitespace-nowrap transition-opacity duration-500 text-gray-100 ${isCollapsed || !isTextVisible ? "opacity-0 hidden" : "opacity-100"}`}
          >
            Logout
          </span>
        </button>
      </nav>

      {/* Footer */}
      <div
        className={`mt-auto mb-6 transition-opacity duration-500 ${isCollapsed || !isTextVisible ? "opacity-0" : "opacity-100"}`}
      >
        <p className="text-sm text-center text-gray-500">
          © {new Date().getFullYear()} Freelancer Hub
        </p>
      </div>
    </div>
  );
};

export default CSider;
