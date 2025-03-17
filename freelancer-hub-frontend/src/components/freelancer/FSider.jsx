import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Tooltip } from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';
import { CSSTransition } from 'react-transition-group';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import PropTypes from 'prop-types';

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

const FSider = ({ 
  userId, 
  role, 
  isAuthenticated, 
  isEditable,
  dropdown, 
  collapsed, 
  handleMenuClick, 
  abcds,
  handleProfileMenu,
  activeProfileComponent 
}) => {
  
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [showText, setShowText] = useState(!collapsed);
  const [isDashboardDropdownOpen, setIsDashboardDropdownOpen] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const currentUserId = userId;

  const iconClass = isMobile ? "w-4 h-4" : "w-5 h-5";

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

  const mobileMainLinks = [
    { 
      abcd: 'homepage', 
      to: '/freelancer/homepage', 
      icon: <FaHome className={iconClass} />,
      text: 'Home'
    },
    { 
      abcd: 'dashboard', 
      to: '/freelancer/dashboard', 
      icon: <FaChartBar className={iconClass} />,
      text: 'Dashboard'
    },
    { 
      abcd: 'browse_project', 
      to: '/freelancer/browse_project', 
      icon: <FaSearch className={iconClass} />,
      text: 'Browse'
    },
    { 
      abcd: 'profile', 
      to: `/freelancer/profile/${userId}`, 
      icon: <FaUserCircle className={iconClass} />,
      text: 'Profile'
    }
  ];

  const dashboardLinks = [
    { 
      abcd: 'freelancer-analytics', 
      to: '/freelancer/dashboard/freelancer-analytics',
      text: 'Analytics', 
      icon: <FaChartLine className={iconClass} />, 
      tooltip: 'Activity Overview' 
    },
    { 
      abcd: 'project-management', 
      to: '/freelancer/dashboard/project-management',
      text: 'Project Management', 
      icon: <FaProjectDiagram className={iconClass} />, 
      tooltip: 'Manage Projects' 
    },
    { 
      abcd: 'bidding-overview', 
      to: '/freelancer/dashboard/bidding-overview',
      text: 'Bidding Overview', 
      icon: <FaClipboardList className={iconClass} />, 
      tooltip: 'View Bids' 
    },
    { 
      abcd: 'upcoming-events', 
      to: '/freelancer/dashboard/upcoming-events',
      text: 'Upcoming Events', 
      icon: <FaCalendarAlt className={iconClass} />, 
      tooltip: 'View Events' 
    }
  ];

  const profileLinks = [
    { 
      abcd: 'view_profile', 
      to: `/freelancer/profile/${userId}/view_profile`, 
      text: 'View Profile', 
      icon: <FaUserCircle className={iconClass} />, 
      tooltip: 'View Your Profile' 
    },
    { 
      abcd: 'connections', 
      to: `/freelancer/profile/${userId}/connections`, 
      text: 'Connections', 
      icon: <FaHandshake className={iconClass} />, 
      tooltip: 'Manage Connections' 
    },
    { 
      abcd: 'collaborations', 
      to: `/freelancer/profile/${userId}/collaborations`, 
      text: 'Collaborations', 
      icon: <FaInbox className={iconClass} />, 
      tooltip: 'View Collaborations' 
    },
    { 
      abcd: 'portfolio', 
      to: `/freelancer/profile/${userId}/portfolio`, 
      text: 'Portfolio', 
      icon: <FaProjectDiagram className={iconClass} />, 
      tooltip: 'Manage Portfolio' 
    },
    { 
      abcd: 'settings', 
      to: `/freelancer/profile/${userId}/settings`, 
      text: 'Settings', 
      icon: <FaCog className={iconClass} />, 
      tooltip: 'Profile Settings' 
    }
  ];

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
      navigate('/freelancer/dashboard/freelancer-analytics');
      setIsDashboardDropdownOpen(true);
    }
  };

  const handleProfileNavigation = () => {
    if (!location.pathname.includes('/freelancer/profile')) {
      navigate(`/freelancer/profile/${userId}/view_profile`);
    }
    
    if (isCollapsed) {
      setIsCollapsed(false);
      setShowText(true);
    }
    
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleMobileNavClick = (link) => {
    if (link.abcd === 'dashboard' || link.abcd === 'profile') {
      setActiveMenu(link.abcd);
      setMobileMenuOpen(true);
    } else {
      handleMainLinkClick(link);
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
        onClick={() => isMain ? handleMainLinkClick(link) : navigate(link.to)}
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsCollapsed(true);
        setShowText(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const MobileMenu = () => {
    if (!mobileMenuOpen) return null;

    const menuItems = activeMenu === 'dashboard' ? dashboardLinks : profileLinks;
    const menuTitle = activeMenu === 'dashboard' ? 'Dashboard' : 'Profile';

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-violet-900/30 backdrop-blur-sm z-50"
        onClick={() => setMobileMenuOpen(false)}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ 
            type: 'spring', 
            damping: 30,
            stiffness: 300
          }}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-center pt-2 pb-4">
            <div className="w-12 h-1 rounded-full bg-violet-100" />
          </div>

          <div className="px-4 pb-4 flex items-center justify-between border-b border-violet-100">
            <h2 className="text-lg font-semibold text-violet-900">{menuTitle}</h2>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-violet-400 hover:text-violet-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-2 py-4 max-h-[60vh] overflow-y-auto">
            {menuItems.map((item) => (
              <motion.div
                key={item.abcd}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (activeMenu === 'dashboard') {
                    navigate(item.to);
                  } else {
                    navigate(item.to);
                  }
                  setMobileMenuOpen(false);
                }}
                className={`
                  flex items-center gap-3 p-4 rounded-xl mb-2 transition-all duration-200
                  ${(activeMenu === 'dashboard' ? location.pathname.includes(item.abcd) : location.pathname.includes(item.abcd))
                    ? 'bg-violet-50 text-violet-600 shadow-sm shadow-violet-100'
                    : 'text-gray-600 hover:bg-violet-50/60 hover:text-violet-500'
                  }
                `}
              >
                {item.icon}
                <span className="font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>

          <div className="h-safe-area bg-white" />
        </motion.div>
      </motion.div>
    );
  };

  if (isMobile) {
    return (
      <>
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-violet-100 shadow-lg"
        >
          <div className="flex items-center justify-around px-2 py-2 max-w-screen-xl mx-auto">
            {mobileMainLinks.map((link) => (
              <motion.div
                key={link.abcd}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleMobileNavClick(link)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                  location.pathname === link.to 
                    ? 'text-violet-600 bg-violet-50/80' 
                    : 'text-gray-400 hover:text-violet-500 hover:bg-violet-50/60'
                }`}
              >
                {link.icon}
                <span className="text-[10px] mt-1 font-medium">{link.text}</span>
              </motion.div>
            ))}
          </div>
          <div className="h-safe-area bg-white" />
        </motion.div>

        <AnimatePresence>
          {mobileMenuOpen && <MobileMenu />}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div
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
                    onClick={() => navigate(link.to)}
                    className={`
                      group flex items-center gap-3 px-3 py-2 rounded-lg 
                      transition-all duration-300 cursor-pointer
                      ${location.pathname.includes(link.abcd) ? 
                        'bg-violet-500/10 text-violet-400' : 
                        'text-gray-400 hover:bg-white/5 hover:text-violet-400'}
                    `}
                  >
                    <div className={`
                      flex items-center justify-center
                      ${location.pathname.includes(link.abcd) ? 
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
              onClick={handleProfileNavigation}
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
                  onClick={() => navigate(link.to)}
                  className={`
                    group flex items-center gap-3 px-3 py-2 rounded-lg 
                    transition-all duration-300 cursor-pointer
                    ${location.pathname.includes(link.abcd) ? 
                      'bg-violet-500/10 text-violet-400' : 
                      'text-gray-400 hover:bg-white/5 hover:text-violet-400'}
                  `}
                >
                  <div className={`
                    flex items-center justify-center
                    ${location.pathname.includes(link.abcd) ? 
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
              {new Date().getFullYear()} Freelancer Hub
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

FSider.propTypes = {
  userId: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  isEditable: PropTypes.bool.isRequired,
  dropdown: PropTypes.bool,
  collapsed: PropTypes.bool,
  handleMenuClick: PropTypes.func,
  abcds: PropTypes.string,
  handleProfileMenu: PropTypes.func,
  activeProfileComponent: PropTypes.string
};

export default FSider;

<style jsx global>{`
  .h-safe-area {
    height: env(safe-area-inset-bottom);
  }

  @supports not (height: env(safe-area-inset-bottom)) {
    .h-safe-area {
      height: 0px;
    }
  }

  @media (min-width: 768px) {
    .main-content {
      margin-left: 4rem;
    }
    
    .sidebar-expanded .main-content {
      margin-left: 16rem;
    }
  }

  @media (max-width: 767px) {
    .main-content {
      margin-left: 0 !important;
      padding-bottom: 5rem;
    }
  }

  .dropdown-enter {
    opacity: 0;
    transform: translateY(-10px);
  }
  
  .dropdown-enter-active {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 200ms, transform 200ms;
  }
  
  .dropdown-exit {
    opacity: 1;
    transform: translateY(0);
  }
  
  .dropdown-exit-active {
    opacity: 0;
    transform: translateY(-10px);
    transition: opacity 200ms, transform 200ms;
  }
`}</style>
