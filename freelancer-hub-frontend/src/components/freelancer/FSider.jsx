import React, { useState, useEffect } from 'react';
import { FaHome, FaSearch, FaSignOutAlt, FaChevronDown, FaBars,FaUserCircle } from 'react-icons/fa';
import { MdSpaceDashboard } from 'react-icons/md';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';


const FSider = ({ collapsed, handleMenuClick, abcds, reference,handleProfileMenu,activeProfileComponent }) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [isTextVisible, setIsTextVisible] = useState(!collapsed);
  const [isDashboardDropdownOpen, setIsDashboardDropdownOpen] = useState(true); // dashboard dropdown
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(true); // profile dropdown
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isDashboardVisited = () => {
      if (location.pathname.includes('/freelancer/dashboard')) {
        setIsCollapsed(false);
        setIsTextVisible(true);
      }
    };
    isDashboardVisited();
  }, [location.pathname]);

  const handleSidebarToggle = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setIsTextVisible(false);
    } else {
      setTimeout(() => setIsTextVisible(true), 500);
    }
  };
  
  const role = Cookies.get('role');

  const handleLogout = async () => {
    const refreshToken = Cookies.get('refreshToken');
    const accessToken = Cookies.get('accessToken');
    if (!refreshToken) {
      alert('Please login. Redirecting to login.');
      navigate('/login');
      return;
    }
    try {
      const tokens = { accessToken, refreshToken };
      await axios.post('http://127.0.0.1:8000/api/logout/', tokens, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };

  const links = [
    { abcd: "homepage", to: "/freelancer/homepage", icon: <FaHome className='sm:text-sm md:text-md lg:text-md' />, text: "Home" },
    { abcd: "browse_project", to: "/freelancer/browse_project", icon: <FaSearch />, text: "Browse Projects" },
  ];

  const dashboardLinks = [
    { abcd: 'projects', text: 'Projects' },
    { abcd: 'bidding-overview', text: 'Bidding Overview' },
    { abcd: 'weekly-bidding-activity', text: 'Weekly Bidding Activity' },
    { abcd: 'upcoming-events', text: 'Upcoming Events' },
  ];

  const profileLinks = [
    { abcd: 'profile', text: 'View Profile' },
    { abcd: 'connections', text: 'Connections' },
    { abcd: 'collaborations', text: 'Collaborations' },
    { abcd: 'portfolio', text: 'Portfolio' },
    { abcd: 'settings', text: 'Settings' },
  ];

  return (
    <div
      ref={reference}
      className={`h-screen bg-charcolBlue text-gray-100 flex flex-col items-center transition-all duration-500 overflow-x-hidden ${isCollapsed ? 'w-14 sm:w-16 md:w-16 lg:w-24' : 'w-44 sm:w-52 md:w-52 lg:w-64'} absolute z-20 ${role === 'freelancer' ? 'scrollbar-violet' : 'scrollbar-teal'}`}
    >
      {/* Toggle Button */}
      <div className="flex w-[80%] border border-gray-600 rounded-lg mt-6 flex-col justify-center items-center p-3">
        <button
          className="p-3 focus:outline-none hover:bg-violet-500 transition-all rounded-full"
          onClick={handleSidebarToggle}
        >
          <FaBars className="text-gray-100" />
        </button>
        <div className={`text-center transition-opacity duration-500 ${isCollapsed || !isTextVisible ? 'opacity-0' : 'opacity-100'}`}>
          <h1 className="text-md sm:text-xl md:text-2xl font-bold tracking-wide whitespace-nowrap text-gray-100">
            FPanel
          </h1>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="my-3 sm:m-3 md:m-4 flex flex-col justify-center gap-4 w-[100%] p-3">
        {links.map((link) => (
          <div
            key={link.abcd}
            onClick={() => { navigate(link.to) }}
            className={`flex items-center justify-center gap-4 p-3 rounded-lg transition-all border border-gray-600 ${location.pathname.includes(link.to) ? " bg-violet-500" : "hover:bg-violet-500"}`}
          >
            {/* Icons */}
            <div
              className={`text-m ${location.pathname.includes(link.to) ? "text-white" : "text-gray-100"}`}
            >
              {link.icon}
            </div>
            {/* Text */}
            <span
              className={`text-xs sm:text-sm md:text-base lg:text-md whitespace-nowrap transition-opacity duration-500 ${location.pathname.includes(link.to) ? "text-white" : "text-gray-100"} ${isCollapsed || !isTextVisible ? "opacity-0 hidden" : "opacity-100"}`}
            >
              {link.text}
            </span>
          </div>
        ))}

        {/* Dashboard Dropdown */}
        <div>
          <div
            className={`flex items-center justify-center gap-4 p-3 rounded-lg transition-all border border-gray-600 ${location.pathname.includes('/freelancer/dashboard') ? ' bg-violet-500' : 'hover:bg-violet-500'}`}
            onClick={() => {
              if (!location.pathname.includes('/freelancer/dashboard')) {
                navigate('/freelancer/dashboard', { state: 'projects' });
              }
              setIsDashboardDropdownOpen(!isDashboardDropdownOpen);
            }}
          >
            <div className="text-m text-gray-100">
              <MdSpaceDashboard />
            </div>

            <span className={`${isCollapsed || !isTextVisible ? "opacity-0 hidden" : "opacity-100"} flex gap-3 items-center justify-between`}>
              <span className={`text-xs sm:text-sm md:text-base lg:text-md whitespace-nowrap transition-opacity duration-500 ${location.pathname.includes('/freelancer/dashboard') ? 'text-white' : 'text-gray-100'}`}>
                Dashboard
              </span>

              <FaChevronDown
                onClick={(e) => {
                  e.stopPropagation(); // Prevent parent click event
                  setIsDashboardDropdownOpen(!isDashboardDropdownOpen);
                }}
                className={`ml-auto cursor-pointer transition-transform ${isDashboardDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
              />
            </span>
          </div>

          {/* Dropdown Links */}
          {isDashboardDropdownOpen && (
            <div className={`flex flex-col gap-2 mt-2 ml-6 pl-6 transition-all duration-500 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
              {dashboardLinks.map((link) => (
                <div
                  key={link.abcd}
                  onClick={() => handleMenuClick(link.abcd)}
                  className={`text-xs sm:text-sm md:text-base lg:text-md p-2 cursor-pointer text-gray-100 border-b border-b-gray-600 hover:rounded-lg hover:bg-violet-400 ${abcds === link.abcd || location.pathname.includes(link.abcd) ? 'bg-violet-400 rounded-lg text-white' : ''}`}
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
            className={`flex items-center justify-center gap-4 p-3 rounded-lg transition-all border border-gray-600 ${location.pathname.includes('/freelancer/profile') ? ' bg-violet-500' : 'hover:bg-violet-500'}`}
            onClick={() => {
              if (!location.pathname.includes('/freelancer/profile')) {
                navigate('/freelancer/profile');
              }
              setIsProfileDropdownOpen(!isProfileDropdownOpen);
            }}
          >
            <div className="text-m text-gray-100">
              <FaUserCircle /> {/* Use an icon for the Profile section */}
            </div>

            <span className={`${isCollapsed || !isTextVisible ? "opacity-0 hidden" : "opacity-100"} flex gap-3 items-center justify-between`}>
              <span className={`text-xs sm:text-sm md:text-base lg:text-md whitespace-nowrap transition-opacity duration-500 ${location.pathname.includes('/freelancer/profile') ? 'text-white' : 'text-gray-100'}`}>
                Profile
              </span>

              <FaChevronDown
                onClick={(e) => {
                  e.stopPropagation(); // Prevent parent click event
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                }}
                className={`ml-auto cursor-pointer transition-transform ${isProfileDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
              />
            </span>
          </div>

          {/* Profile Dropdown Links */}
          {isProfileDropdownOpen && (
            <div className={`flex flex-col gap-2 mt-2 ml-6 pl-6 transition-all duration-500 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
              {profileLinks.map((link) => (
                <div
                  key={link.abcd}
                  onClick={() => handleProfileMenu(link.abcd)}
                  className={`text-xs sm:text-sm md:text-base lg:text-md p-2 cursor-pointer text-gray-100 border-b border-b-gray-600 hover:rounded-lg hover:bg-violet-400 ${activeProfileComponent === link.abcd || location.pathname.includes(link.to) ? 'bg-violet-400 rounded-lg text-white' : ''}`}
                >
                  {link.text}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout Button */}
        {/*<button
          onClick={handleLogout}
          className="flex items-center justify-center gap-4 p-3 rounded-lg hover:border border-gray-600-red-600 transition-all w-full text-left border border-gray-600"
        >
          <div className="text-m text-gray-100">
            <FaSignOutAlt />
          </div>
          <span
            className={`text-xs sm:text-sm md:text-base lg:text-md whitespace-nowrap transition-opacity duration-500 text-gray-100 ${isCollapsed || !isTextVisible ? "opacity-0 hidden" : "opacity-100"}`}
          >
            Logout
          </span>
        </button>*/}
      </nav>

      {/* Footer */}
      <div className={`mt-auto mb-6 transition-opacity duration-500 ${isCollapsed || !isTextVisible ? 'opacity-0' : 'opacity-100'}`}>
        <p className="text-xs sm:text-sm md:text-base lg:text-md text-center text-gray-500">
          © {new Date().getFullYear()} Freelancer Hub
        </p>
      </div>
    </div>
  );
};

export default FSider;
