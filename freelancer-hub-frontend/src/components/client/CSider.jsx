import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tooltip } from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';
import { CSSTransition } from 'react-transition-group';
import { FaSignOutAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';

import { 
  FaHome,
  FaProjectDiagram,
  FaUserCircle,
  FaChartBar,
  FaBars,
  FaChevronDown,
  FaClipboardList,
  FaUsers,
  FaBell,
  FaHandshake,
  FaStar,
  FaCog,
  FaWallet,
  FaChartLine,
  FaCalendarAlt,
  FaInbox,
  FaPlus,
  FaComments,
  FaEnvelope,
  FaArchive,
  FaUserFriends,
  FaPlusCircle,
  FaGlobe,
  FaPalette
} from 'react-icons/fa';

const CSider = ({ collapsed, abcds, reference, activeProfileComponent, userId }) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [isTextVisible, setIsTextVisible] = useState(!collapsed);
  const [isDashboardDropdownOpen, setIsDashboardDropdownOpen] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(true);
  const [showText, setShowText] = useState(!collapsed);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const iconClass = isMobile ? "w-4 h-4" : "w-5 h-5";

  const mainLinks = [
    { 
      abcd: 'homepage', 
      to: '/client/homepage', 
      icon: <FaHome className={iconClass} />,
      text: 'Home',
      tooltip: 'Home Page'
    },
    { 
      abcd: 'post-project', 
      to: '/client/post-project', 
      icon: <FaProjectDiagram className={iconClass} />,
      text: 'Post Project',
      tooltip: 'Create New Project'
    },
    { 
      abcd: 'view-bids', 
      to: '/client/view-bids', 
      icon: <FaClipboardList className={iconClass} />,
      text: 'View Bids',
      tooltip: 'View Project Bids'
    },

  ];

  const dashboardLinks = [
    { 
      abcd: 'overview', 
      to: '/client/dashboard/overview',
      text: 'Overview', 
      icon: <FaChartLine className={iconClass} />, 
      tooltip: 'Dashboard Overview' 
    },
    { 
      abcd: 'projects', 
      to: '/client/dashboard/projects',
      text: 'Projects', 
      icon: <FaProjectDiagram className={iconClass} />, 
      tooltip: 'Manage Projects' 
    },
    { 
      abcd: 'recent_activity', 
      to: '/client/dashboard/recent_activity',
      text: 'Recent Activity', 
      icon: <FaInbox className={iconClass} />, 
      tooltip: 'View Recent Activity' 
    },
    { 
      abcd: 'spendings', 
      to: '/client/dashboard/spendings',
      text: 'Spendings', 
      icon: <FaWallet className={iconClass} />, 
      tooltip: 'Track Spendings' 
    },
    { 
      abcd: 'upcoming-events', 
      to: '/client/dashboard/upcoming-events',
      text: 'Upcoming Events', 
      icon: <FaCalendarAlt className={iconClass} />, 
      tooltip: 'View Events' 
    }
  ];

  const messageLinks = [
    { 
      abcd: 'direct', 
      to: '/client/messages/direct',
      text: 'Direct Messages', 
      icon: <FaEnvelope className={iconClass} />, 
      tooltip: 'Direct Messages' 
    },
    { 
      abcd: 'groups', 
      to: '/client/messages/groups',
      text: 'Group Chats', 
      icon: <FaUsers className={iconClass} />, 
      tooltip: 'Group Chats' 
    },

    { 
      abcd: 'settings', 
      to: '/client/messages/settings',
      text: 'Chat Settings', 
      icon: <FaCog className={iconClass} />, 
      tooltip: 'Chat Settings' 
    }
  ];

  const profileLinks = [
    { abcd: 'view_profile', to: `/client/profile/${userId}/view_profile`, text: 'View Profile', icon: <FaUserCircle className={iconClass} />, tooltip: 'View Your Profile' },
    { abcd: 'edit_profile', to: `/client/profile/${userId}/edit_profile`, text: 'Edit Profile', icon: <FaCog className={iconClass} />, tooltip: 'Edit Profile Settings' },
    { abcd: 'reviews_ratings', to: `/client/profile/${userId}/reviews_ratings`, text: 'Reviews', icon: <FaStar className={iconClass} />, tooltip: 'View Reviews & Ratings' },
    { abcd: 'collaborations', to: `/client/profile/${userId}/collaborations`, text: 'Collaborations', icon: <FaHandshake className={iconClass} />, tooltip: 'View Collaborations' }
  ];

  const mobileMainLinks = [
    { 
      abcd: 'homepage', 
      to: '/client/homepage', 
      link: '/client/homepage',
      icon: <FaHome className={iconClass} />,
      text: 'Home'
    },
    { 
      abcd: 'dashboard', 
      to: '/client/dashboard', 
      link: '/client/dashboard',
      icon: <FaChartBar className={iconClass} />,
      text: 'Dashboard'
    },



 
    { 
      abcd: 'post-project', 
      to: '/client/post-project', 
      link: '/client/post-project',
      icon: <FaPlus className="text-lg" />,
      text: 'Post'
    },
    { 
      abcd: 'view-bids', 
      to: '/client/view-bids', 
      icon: <FaClipboardList className={iconClass} />,
      text: 'View Bids',
      tooltip: 'View Project Bids'
    },


  ];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isMessagesDropdownOpen, setIsMessagesDropdownOpen] = useState(true);

  const handleSidebarToggle = () => {
    setIsCollapsed(!isCollapsed);
    if (isCollapsed) {
      setTimeout(() => setShowText(true), 300);
    } else {
      setShowText(false);
    }
  };

  const handleLogout = async () => {
    try {
    const refreshToken = Cookies.get('refreshToken');
    const accessToken = Cookies.get('accessToken');
      
    if (!refreshToken) {
      navigate('/login');
      return;
    }

      await axios.post('http://127.0.0.1:8000/api/logout/', 
        { accessToken, refreshToken },
        { headers: { Authorization: `Bearer ${accessToken}` }}
      );
      
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
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
    if (location.pathname.includes('/dashboard')) {
      if (isCollapsed) {
        setIsCollapsed(false);
        setTimeout(() => setShowText(true), 300);
        setIsDashboardDropdownOpen(true);
      } else {
        setIsDashboardDropdownOpen(!isDashboardDropdownOpen);
      }
    } else {
      handleMenuClick('overview');
      setIsDashboardDropdownOpen(true);
    }
  };

  const handleMobileNavClick = (link) => {
    if (link.abcd === 'dashboard' || link.abcd === 'profile') {
      setActiveMenu(link.abcd);
      setMobileMenuOpen(true);
    } else {
      handleMainLinkClick(link);
    }
  };

  const handleProfileNavigation = () => {
    const currentUserId = Cookies.get('userId') || userId;
    
    if (!location.pathname.includes('/profile')) {
      navigate(`/client/profile/${currentUserId}/view_profile`);
    }
    
    if (isCollapsed) {
      setIsCollapsed(false);
      setShowText(true);
    }
    
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
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
          group flex items-center gap-4 p-3 rounded-xl transition-all duration-300
          hover:bg-gray-50/80 cursor-pointer relative
          ${location.pathname === link.to ? 
            'bg-gradient-to-r from-teal-50 to-blue-50' : ''}
        `}
      >
        <div className={`
          absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full
          transition-all duration-300
          ${(isMain ? location.pathname === link.to : abcds === link.abcd) ? 
            'bg-teal-500' : 'bg-transparent'}
        `} />

        <div className={`
          flex items-center justify-center min-w-[24px]
          ${(isMain ? location.pathname === link.to : abcds === link.abcd) ? 
            'text-teal-500' : 'text-gray-400 group-hover:text-teal-500'}
        `}>
          {React.cloneElement(link.icon, { className: iconClass })}
        </div>

        {!isCollapsed && (
          <motion.span
            initial={false}
            animate={{ opacity: showText ? 1 : 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className={`
              text-sm font-medium whitespace-nowrap flex-1
              ${(isMain ? location.pathname === link.to : abcds === link.abcd) ? 
                'text-teal-500' : 'text-gray-500 group-hover:text-teal-500'}
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

  const handleMenuClick = (component) => {
    console.log(component)
    if (location.pathname !== "/client/dashboard") {
      navigate(`/client/dashboard/${component}`);
    }
  };
  const handleProfileMenu = (component) => {
    console.log(component)
    if (location.pathname !== "/client/profile") {
      navigate(`/client/profile/${userId}/${component}`);
    }
  };

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
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
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
            <div className="w-12 h-1 rounded-full bg-gray-200" />
          </div>

          <div className="px-4 pb-4 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">{menuTitle}</h2>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600"
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
                    handleMenuClick(item.abcd);
                  } else {
                    handleProfileMenu(item.abcd);
                  }
                  setMobileMenuOpen(false);
                }}
                className={`
                  flex items-center gap-3 p-4 rounded-xl mb-2
                  ${(activeMenu === 'dashboard' ? abcds === item.abcd : activeProfileComponent === item.abcd)
                    ? 'bg-teal-50 text-teal-600'
                    : 'text-gray-600 hover:bg-gray-50'
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
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg"
        >
          <div className="flex items-center justify-around px-2 py-2 max-w-screen-xl mx-auto">
            {mobileMainLinks.map((link) => (
              <motion.div
                key={link.abcd}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleMobileNavClick(link)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                  location.pathname.includes(link.link)
                    ? 'text-teal-500 bg-teal-50' 
                    : 'text-gray-400'
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
    <>
    <div
      ref={reference}
        className={`
          h-screen 
          bg-white/90 backdrop-blur-xl
      flex flex-col items-center 
          transition-all duration-300 ease-in-out
          fixed z-50 
          ${isCollapsed ? 'w-14' : 'w-56'}
          shadow-lg border-r border-gray-100
        `}
      >
        <div className="w-full px-3 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
            <motion.div
              initial={false}
              animate={{ opacity: showText ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
          {!isCollapsed && (
                <h1 className="text-base font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Veloro
            </h1>
          )}
            </motion.div>
            <Tooltip title={isCollapsed ? "Expand" : "Collapse"} placement="right">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            onClick={handleSidebarToggle}
                className="p-1.5 rounded-lg hover:bg-gray-50"
          >
                <FaBars className={iconClass + " text-gray-400"} />
              </motion.button>
            </Tooltip>
        </div>
      </div>

        <nav className="w-full px-2 py-4 space-y-4 flex-1 overflow-y-auto">
          <div className="space-y-0.5">
            {mainLinks.map(link => renderLink(link, true))}
          </div>

          <div className="space-y-1">
            <Tooltip title={isCollapsed ? "Dashboard" : ""} placement="right">
              <motion.div
                whileHover={{ x: 4 }}
                onClick={handleDashboardClick}
                className={`
                  group flex items-center gap-4 p-3 rounded-xl transition-all duration-300
                  hover:bg-gray-50/80 cursor-pointer relative
                  ${location.pathname.includes('/dashboard') ? 
                    'bg-gradient-to-r from-teal-50 to-blue-50' : ''}
                `}
              >
                <div className={`
                  absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full
                  ${location.pathname.includes('/dashboard') ? 'bg-teal-500' : 'bg-transparent'}
                `} />

                <div className={`
                  flex items-center justify-center min-w-[24px]
                  ${location.pathname.includes('/dashboard') ? 
                    'text-teal-500' : 'text-gray-400 group-hover:text-teal-500'}
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
                      ${location.pathname.includes('/dashboard') ? 
                        'text-teal-500' : 'text-gray-500 group-hover:text-teal-500'}
                    `}>
                  Dashboard
                </span>
                    <FaChevronDown 
                      className={chevronStyles}
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
                  className="ml-4 pl-4 border-l border-gray-100 space-y-1 overflow-hidden"
                >
                  {dashboardLinks.map(link => (
                <div
                  key={link.abcd}
                  onClick={() => navigate(link.to)}
                      className={`
                        group flex items-center gap-2 px-3 py-2 rounded-lg 
                        transition-all duration-300 cursor-pointer
                        ${location.pathname.includes(link.abcd) ? 
                          'bg-teal-500/10 text-teal-400' : 
                          'text-gray-400 hover:bg-white/5 hover:text-teal-400'}
                      `}
                    >
                      {link.icon}
                      <span className="text-sm">{link.text}</span>
                </div>
              ))}
                </motion.div>
              )}
            </AnimatePresence>
        </div>

  {/*        <div className="space-y-1">
            <Tooltip title={isCollapsed ? "Messages" : ""} placement="right">
              <motion.div
                whileHover={{ x: 4 }}
                onClick={() => {
                  if (isCollapsed) {
                    setIsCollapsed(false);
                    setTimeout(() => setShowText(true), 300);
                    setIsMessagesDropdownOpen(true);
                  } else {
                    setIsMessagesDropdownOpen(!isMessagesDropdownOpen);
                  }
                }}
                className={`
                  group flex items-center gap-4 p-3 rounded-xl transition-all duration-300
                  hover:bg-gray-50/80 cursor-pointer relative
                  ${location.pathname.includes('/messages') ? 
                    'bg-gradient-to-r from-teal-50 to-blue-50' : ''}
                `}
              >
                <div className={`
                  absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full
                  ${location.pathname.includes('/messages') ? 'bg-teal-500' : 'bg-transparent'}
                `} />

                <div className={`
                  flex items-center justify-center min-w-[24px]
                  ${location.pathname.includes('/messages') ? 
                    'text-teal-500' : 'text-gray-400 group-hover:text-teal-500'}
                `}>
                  <FaComments className={iconClass} />
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
                      ${location.pathname.includes('/messages') ? 
                        'text-teal-500' : 'text-gray-500 group-hover:text-teal-500'}
                    `}>
                      Messages
                    </span>
                    <FaChevronDown 
                      className={chevronStyles}
                      style={{ transform: isMessagesDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </motion.div>
                )}
              </motion.div>
            </Tooltip>

            <AnimatePresence>
              {isMessagesDropdownOpen && !isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-4 pl-4 border-l border-gray-100 space-y-1 overflow-hidden"
                >
                  {messageLinks.map(link => (
                    <div
                      key={link.abcd}
                      onClick={() => navigate(link.to)}
                      className={`
                        group flex items-center gap-2 px-3 py-2 rounded-lg 
                        transition-all duration-300 cursor-pointer
                        ${location.pathname.includes(link.abcd) ? 
                          'bg-teal-500/10 text-teal-400' : 
                          'text-gray-400 hover:bg-white/5 hover:text-teal-400'}
                      `}
                    >
                      {link.icon}
                      <span className="text-sm">{link.text}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div> */}

          <Tooltip title={isCollapsed ? "Profile" : ""} placement="right">
            <div className="space-y-1">
              <motion.div
                whileHover={{ x: 4 }}
            onClick={handleProfileNavigation}
                className={`
                  group flex items-center gap-4 p-3 rounded-xl transition-all duration-300
                  hover:bg-gray-50/80 cursor-pointer relative
                  ${location.pathname.includes('/profile') ? 
                    'bg-gradient-to-r from-teal-50 to-blue-50' : ''}
                `}
              >
                <div className={`
                  absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full
                  ${location.pathname.includes('/profile') ? 'bg-teal-500' : 'bg-transparent'}
                `} />

                <div className={`
                  flex items-center justify-center min-w-[24px]
                  ${location.pathname.includes('/profile') ? 
                    'text-teal-500' : 'text-gray-400 group-hover:text-teal-500'}
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
                      ${location.pathname.includes('/profile') ? 
                        'text-teal-500' : 'text-gray-500 group-hover:text-teal-500'}
                    `}>
                  Profile
                </span>
                    <FaChevronDown 
                      className={chevronStyles}
                      style={{ transform: isProfileDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </motion.div>
                )}
              </motion.div>

              <CSSTransition
                in={isProfileDropdownOpen && !isCollapsed}
                timeout={300}
                classNames="dropdown"
                unmountOnExit
              >
            <div className="ml-4 pl-4 border-l border-gray-700/30 space-y-1">
                  {profileLinks.map(link => (
                <div
                  key={link.abcd}
                  onClick={() => navigate(link.to)}
                      className={`
                        group flex items-center gap-2 px-3 py-2 rounded-lg 
                        transition-all duration-300 cursor-pointer
                        ${location.pathname.includes(link.abcd) ? 
                          'bg-teal-500/10 text-teal-400' : 
                          'text-gray-400 hover:bg-white/5 hover:text-teal-400'}
                      `}
                    >
                      {link.icon}
                      <span className="text-sm">{link.text}</span>
                </div>
              ))}
            </div>
          </CSSTransition>
        </div>
          </Tooltip>
      </nav>

        <AnimatePresence>
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full px-3 py-3 border-t border-gray-100"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-red-50 text-sm"
              >
                <FaSignOutAlt className={iconClass + " text-gray-400"} />
                <span className="font-medium text-gray-400">Logout</span>
              </motion.button>
              <p className="mt-3 text-[10px] text-center text-gray-400">
                © {new Date().getFullYear()} Veloro
              </p>
            </motion.div>
          ) : (
            <Tooltip title="Logout" placement="right">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLogout}
                className="p-2 mb-3 rounded-lg hover:bg-red-50"
              >
                <FaSignOutAlt className={iconClass + " text-gray-400"} />
              </motion.button>
            </Tooltip>
          )}
        </AnimatePresence>
    </div>

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
            margin-left: 3.5rem;
          }
          
          .sidebar-expanded .main-content {
            margin-left: 14rem;
          }
        }

        @media (max-width: 767px) {
          .main-content {
            margin-left: 0 !important;
            padding-bottom: 4rem;
          }
        }
      `}</style>
    </>
  );
};

export default CSider;
