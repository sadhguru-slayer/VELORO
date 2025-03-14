import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tooltip } from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';
import { CSSTransition } from 'react-transition-group';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  FaHome,
  FaSearch,
  FaSignOutAlt,
  FaUserCircle,
  FaBars,
  FaChevronDown,
  FaProjectDiagram,
  FaInbox,
  FaWallet,
  FaCalendarAlt,
  FaCog,
  FaHandshake,
  FaClipboardList,
  FaChartLine,
  FaChartBar
} from 'react-icons/fa';

const FSider = ({ collapsed, handleMenuClick, abcds, reference, handleProfileMenu, activeProfileComponent }) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [showText, setShowText] = useState(!collapsed);
  const [isDashboardDropdownOpen, setIsDashboardDropdownOpen] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const iconClass = "w-5 h-5";

  const mainLinks = [
    { 
      abcd: 'homepage', 
      to: '/freelancer/homepage', 
      icon: <FaHome className={iconClass} />,
      text: 'Home',
      tooltip: 'Home Page'
    },
    { 
      abcd: 'browse_project', 
      to: '/freelancer/browse_project', 
      icon: <FaSearch className={iconClass} />,
      text: 'Browse Projects',
      tooltip: 'Browse Available Projects'
    }
  ];

  const dashboardLinks = [
    { abcd: 'projects', text: 'Projects', icon: <FaProjectDiagram className={iconClass} />, tooltip: 'Manage Projects' },
    { abcd: 'bidding-overview', text: 'Bidding Overview', icon: <FaClipboardList className={iconClass} />, tooltip: 'View Bids' },
    { abcd: 'weekly-bidding-activity', text: 'Weekly Activity', icon: <FaChartLine className={iconClass} />, tooltip: 'Activity Overview' },
    { abcd: 'upcoming-events', text: 'Upcoming Events', icon: <FaCalendarAlt className={iconClass} />, tooltip: 'View Events' }
  ];

  const profileLinks = [
    { abcd: 'profile', text: 'View Profile', icon: <FaUserCircle className={iconClass} />, tooltip: 'View Your Profile' },
    { abcd: 'connections', text: 'Connections', icon: <FaHandshake className={iconClass} />, tooltip: 'Manage Connections' },
    { abcd: 'collaborations', text: 'Collaborations', icon: <FaInbox className={iconClass} />, tooltip: 'View Collaborations' },
    { abcd: 'portfolio', text: 'Portfolio', icon: <FaProjectDiagram className={iconClass} />, tooltip: 'Manage Portfolio' },
    { abcd: 'settings', text: 'Settings', icon: <FaCog className={iconClass} />, tooltip: 'Profile Settings' }
  ];

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

  const handleSidebarToggle = () => {
    setIsCollapsed(!isCollapsed);
    if (isCollapsed) {
      setTimeout(() => setShowText(true), 300);
    } else {
      setShowText(false);
    }
  };

  const handleMainLinkClick = (link) => {
    if (location.pathname === link.to && isCollapsed) {
      setIsCollapsed(false);
      setTimeout(() => setShowText(true), 300);
    } else if (location.pathname === link.to && !isCollapsed) {
      setIsCollapsed(true);
      setShowText(false);
    }
    navigate(link.to);
  };

  const handleDashboardClick = () => {
    if (location.pathname.includes('/freelancer/dashboard')) {
      if (isCollapsed) {
        setIsCollapsed(false);
        setTimeout(() => setShowText(true), 300);
        setIsDashboardDropdownOpen(true);
      } else {
        setIsDashboardDropdownOpen(!isDashboardDropdownOpen);
      }
    } else {
      navigate('/freelancer/dashboard');
      setIsDashboardDropdownOpen(true);
    }
  };

  const renderLink = (link, isMain = false) => (
    <Tooltip 
      title={isCollapsed ? link.tooltip : ''}
      placement="right"
      key={link.abcd}
    >
      <motion.div
        whileHover={{ x: 4 }}
        onClick={() => isMain ? handleMainLinkClick(link) : handleMenuClick(link.abcd)}
        className={`
          group flex items-center gap-3.5 p-3 rounded-xl transition-all duration-300
          hover:bg-violet-50/80 cursor-pointer relative
          ${location.pathname === link.to ? 
            'bg-gradient-to-r from-violet-50 to-indigo-50' : ''}
        `}
      >
        <div className={`
          absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full
          transition-all duration-300
          ${location.pathname === link.to ? 'bg-violet-600' : 'bg-transparent'}
        `} />

        <div className={`
          flex items-center justify-center min-w-[24px]
          ${location.pathname === link.to ? 
            'text-violet-600' : 'text-gray-500 group-hover:text-violet-600'}
        `}>
          {React.cloneElement(link.icon, { className: iconClass })}
        </div>

        {!isCollapsed && (
          <motion.span
            initial={false}
            animate={{ opacity: showText ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className={`
              text-sm font-medium whitespace-nowrap
              ${location.pathname === link.to ? 
                'text-violet-600' : 'text-gray-600 group-hover:text-violet-600'}
            `}
          >
            {link.text}
          </motion.span>
        )}
      </motion.div>
    </Tooltip>
  );

  const chevronStyles = `${iconClass} text-gray-400 transition-transform duration-300`;

  return (
    <div
      ref={reference}
      className={`
        h-screen 
        bg-white/90 backdrop-blur-xl
        flex flex-col items-center 
        transition-all duration-300 ease-in-out
        fixed z-20 
        ${isCollapsed ? 'w-16' : 'w-64'}
        shadow-lg border-r border-violet-100
      `}
    >
      <div className="w-full px-4 py-6 border-b border-violet-100">
        <div className="flex items-center justify-between">
          <motion.div
            initial={false}
            animate={{ opacity: showText ? 1 : 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            {!isCollapsed && (
              <h1 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                FPanel
              </h1>
            )}
          </motion.div>
          <Tooltip title={isCollapsed ? "Expand Menu" : "Collapse Menu"} placement="right">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSidebarToggle}
              className="p-2 rounded-lg hover:bg-violet-50 transition-all duration-300"
            >
              <FaBars className={`${iconClass} text-violet-600`} />
            </motion.button>
          </Tooltip>
        </div>
      </div>

      <nav className="w-full px-3 py-6 space-y-6 flex-1 overflow-y-auto">
        <div className="space-y-1.5">
          {mainLinks.map(link => renderLink(link, true))}
        </div>

        <div className="space-y-1">
          <Tooltip title={isCollapsed ? "Dashboard" : ""} placement="right">
            <motion.div
              whileHover={{ x: 4 }}
              onClick={handleDashboardClick}
              className={`
                group flex items-center gap-4 p-3 rounded-xl transition-all duration-300
                hover:bg-violet-50/80 cursor-pointer relative
                ${location.pathname.includes('/freelancer/dashboard') ? 
                  'bg-gradient-to-r from-violet-50 to-indigo-50' : ''}
              `}
            >
              <div className={`
                absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full
                ${location.pathname.includes('/freelancer/dashboard') ? 'bg-violet-600' : 'bg-transparent'}
              `} />

              <div className={`
                flex items-center justify-center min-w-[24px]
                ${location.pathname.includes('/freelancer/dashboard') ? 
                  'text-violet-600' : 'text-gray-400 group-hover:text-violet-600'}
              `}>
                <FaChartBar className={iconClass} />
              </div>

              {!isCollapsed && (
                <motion.div
                  initial={false}
                  animate={{ opacity: showText ? 1 : 0 }}
                  transition={{ duration: 0.2, delay: 0.2 }}
                  className="flex items-center justify-between flex-1"
                >
                  <span className={`
                    text-sm font-medium
                    ${location.pathname.includes('/freelancer/dashboard') ? 
                      'text-violet-600' : 'text-gray-500 group-hover:text-violet-600'}
                  `}>
                    Dashboard
                  </span>
                  <FaChevronDown 
                    className={`${iconClass} text-gray-400 transition-transform duration-300`}
                    style={{ transform: isDashboardDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </motion.div>
              )}
            </motion.div>
          </Tooltip>

          <AnimatePresence>
            {isDashboardDropdownOpen && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-4 pl-4 border-l border-violet-100 space-y-1 overflow-hidden"
              >
                {dashboardLinks.map(link => (
                  <div
                    key={link.abcd}
                    onClick={() => handleMenuClick(link.abcd)}
                    className={`
                      group flex items-center gap-3 px-3 py-2 rounded-lg 
                      transition-all duration-300 cursor-pointer
                      ${abcds === link.abcd ? 
                        'bg-violet-500/10 text-violet-400' : 
                        'text-gray-400 hover:bg-white/5 hover:text-violet-400'}
                    `}
                  >
                    <div className={`
                      flex items-center justify-center
                      ${abcds === link.abcd ? 
                        'text-violet-400' : 'text-gray-400 group-hover:text-violet-400'}
                    `}>
                      {link.icon}
                    </div>
                    <span className="text-sm">{link.text}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    
        <div className="space-y-1">
          <Tooltip title={isCollapsed ? "Profile" : ""} placement="right">
            <motion.div
              whileHover={{ x: 4 }}
              onClick={() => {
                if (!location.pathname.includes('/freelancer/profile')) {
                  navigate('/freelancer/profile');
                }
                setIsProfileDropdownOpen(!isProfileDropdownOpen);
              }}
              className={`
                group flex items-center gap-4 p-3 rounded-xl transition-all duration-300
                hover:bg-violet-50/80 cursor-pointer relative
                ${location.pathname.includes('/freelancer/profile') ? 
                  'bg-gradient-to-r from-violet-50 to-indigo-50' : ''}
              `}
            >
              <div className={`
                absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full
                ${location.pathname.includes('/freelancer/profile') ? 'bg-violet-600' : 'bg-transparent'}
              `} />

              <div className={`
                flex items-center justify-center min-w-[24px]
                ${location.pathname.includes('/freelancer/profile') ? 
                  'text-violet-600' : 'text-gray-400 group-hover:text-violet-600'}
              `}>
                <FaUserCircle className={iconClass} />
              </div>

              {!isCollapsed && (
                <motion.div
                  initial={false}
                  animate={{ opacity: showText ? 1 : 0 }}
                  transition={{ duration: 0.2, delay: 0.2 }}
                  className="flex items-center justify-between flex-1"
                >
                  <span className={`
                    text-sm font-medium
                    ${location.pathname.includes('/freelancer/profile') ? 
                      'text-violet-600' : 'text-gray-500 group-hover:text-violet-600'}
                  `}>
                    Profile
                  </span>
                  <FaChevronDown 
                    className={`${iconClass} text-gray-400 transition-transform duration-300`}
                    style={{ transform: isProfileDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </motion.div>
              )}
            </motion.div>
          </Tooltip>

          <CSSTransition
            in={isProfileDropdownOpen && !isCollapsed}
            timeout={300}
            classNames="dropdown"
            unmountOnExit
          >
            <div className="ml-4 pl-4 border-l border-violet-100 space-y-1">
              {profileLinks.map(link => (
                <div
                  key={link.abcd}
                  onClick={() => handleProfileMenu(link.abcd)}
                  className={`
                    group flex items-center gap-3 px-3 py-2 rounded-lg 
                    transition-all duration-300 cursor-pointer
                    ${activeProfileComponent === link.abcd ? 
                      'bg-violet-500/10 text-violet-400' : 
                      'text-gray-400 hover:bg-white/5 hover:text-violet-400'}
                  `}
                >
                  <div className={`
                    flex items-center justify-center
                    ${activeProfileComponent === link.abcd ? 
                      'text-violet-400' : 'text-gray-400 group-hover:text-violet-400'}
                  `}>
                    {link.icon}
                  </div>
                  <span className="text-sm">{link.text}</span>
                </div>
              ))}
            </div>
          </CSSTransition>
        </div>
      </nav>

      <AnimatePresence>
        {!isCollapsed ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full px-4 py-4 border-t border-violet-100"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center gap-3.5 p-2.5 rounded-lg 
                hover:bg-red-50/80 transition-all duration-300 group"
            >
              <FaSignOutAlt className={`${iconClass} text-gray-500 group-hover:text-red-500`} />
              <span className="text-sm font-medium text-gray-600 group-hover:text-red-500">
                Logout
              </span>
            </motion.button>
            <p className="mt-4 text-xs text-center text-gray-500">
              © {new Date().getFullYear()} Freelancer Hub
            </p>
          </motion.div>
        ) : (
          <Tooltip title="Logout" placement="right">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLogout}
              className="p-2.5 mb-4 rounded-lg hover:bg-red-50/80 
                transition-all duration-300 group"
            >
              <FaSignOutAlt className={`${iconClass} text-gray-500 group-hover:text-red-500`} />
            </motion.button>
          </Tooltip>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-violet-50/30 backdrop-blur-sm -z-10" />
    </div>
  );
};

export default FSider;
