import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaBell, FaUserCircle, FaComments, FaHome, FaWallet, FaCog } from "react-icons/fa";
import { FaPlus, FaLock, FaEnvelope, FaUsers } from "react-icons/fa";

import { FaDiagramProject } from "react-icons/fa6";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, Badge, Input, AutoComplete, Spin } from 'antd';
import { useMediaQuery } from 'react-responsive';
import { RiMessage3Fill } from "react-icons/ri";
import PropTypes from 'prop-types';


const FHeader = ({ userId, role, isAuthenticated, isEditable }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileClicked, setIsProfileClicked] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadDirectMessages, setUnreadDirectMessages] = useState(0);
  const [unreadGroupMessages, setUnreadGroupMessages] = useState(0);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [user, setUser] = useState(null);
  
  // Refs for dropdown menus
  const profileDropdownRef = useRef(null);
  const messagesDropdownRef = useRef(null);
  
  const toggleProfileDropdown = () => {
    setIsProfileClicked(prevState => !prevState);
    // Close messages dropdown if open
    if (isMessagesOpen) setIsMessagesOpen(false);
  };

  const toggleMessagesDropdown = (e) => {
    e.stopPropagation();
    setIsMessagesOpen(prevState => !prevState);
    // Close profile dropdown if open
    if (isProfileClicked) setIsProfileClicked(false);
  };

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close profile dropdown if clicked outside
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileClicked(false);
      }
      
      // Close messages dropdown if clicked outside
      if (messagesDropdownRef.current && !messagesDropdownRef.current.contains(event.target)) {
        setIsMessagesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/profile/', {
          headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` },
        });
        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  // Fetch wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/finance/wallet/balance/', {
          headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` },
        });
        setWalletBalance(response.data.balance);
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      } finally {
        setIsLoadingWallet(false);
      }
    };

    fetchWalletBalance();
    // Set up polling every 30 seconds to update balance
    const intervalId = setInterval(fetchWalletBalance, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

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
      Cookies.remove("role");
      Cookies.remove("userId");
      localStorage.clear();
      setTimeout(() => {  
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    // Simulate search results (replace with actual API call)
    setSearchResults([
      { value: 'Web Development Project', link: '/projects/1' },
      { value: 'Graphic Design Task', link: '/projects/2' },
      { value: 'Social Media Marketing', link: '/projects/3' },
    ]);
  };

  // Wallet display component
  const WalletDisplay = ({ isCompact = false }) => {
    const formatBalance = (balance) => {
      if (balance === null) return '---';
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(balance);
    };

    if (isCompact) {
      return (
        <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaWallet className="text-violet-600" />
            <span className="text-sm text-gray-600">Balance:</span>
          </div>
          {isLoadingWallet ? (
            <Spin size="small" />
          ) : (
            <span className="text-sm font-medium text-gray-900">
              {formatBalance(walletBalance)}
            </span>
          )}
        </div>
      );  
    }

    return (
      <Tooltip title="Wallet Balance">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative cursor-pointer group"
          onClick={() => navigate('/freelancer/wallet')}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200">
            <FaWallet className="text-violet-600" />
            {isLoadingWallet ? (
              <Spin size="small" />
            ) : (
              <span className="text-sm font-medium text-gray-900">
                {formatBalance(walletBalance)}
              </span>
            )}
          </div>
        </motion.div>
      </Tooltip>
    );
  };

  return (
    <header className="bg-white border-b border-gray-100 h-16 flex items-center px-6 justify-between z-20 sticky top-0 shadow-sm backdrop-blur-lg bg-white/80">
      {/* Logo Section */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="flex items-center"
      >
        <Link to="/" className="text-xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-violet-800 to-violet-600 bg-clip-text text-transparent">
            Talintz
          </span>
        </Link>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        className={`relative transition-all duration-300 ${isSearchFocused ? 'w-96' : 'w-72'} ${isMobile ? 'hidden' : 'block'}`}
        whileHover={{ scale: 1.01 }}
      >
        <AutoComplete
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          options={searchResults.map(result => ({ 
            value: result.value, 
            label: <Link to={result.link}>{result.value}</Link> 
          }))}
          className="w-full"
        >
          <Input
            prefix={<FaSearch className="text-gray-400" />}
            className="rounded-full px-4 py-2 bg-gray-50/80 hover:bg-gray-50 focus:bg-white
              border border-gray-200 hover:border-violet-200 focus:border-violet-300
              transition-all duration-300 focus:ring-2 focus:ring-violet-100"
            placeholder="Search projects, skills..."
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </AutoComplete>
      </motion.div>

      {/* Actions Section */}
      <div className="flex items-center gap-5">
        {/* Wallet - Hidden on mobile */}
        <div className="hidden md:block">
          <WalletDisplay />
        </div>

        {/* Quick Actions */}
        <motion.div className="flex items-center gap-5">
          <Tooltip title="My Projects" placement="bottom">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 text-gray-600 hover:text-violet-700 transition-all duration-300 hover:bg-violet-50 ${location.pathname === '/freelancer/dashboard/project-management' ? 'text-violet-700 bg-violet-50 rounded-full' : ''}`}
              onClick={() => navigate('/freelancer/dashboard/project-management')}
            >
              <FaDiagramProject className="text-xl" />
            </motion.button>
          </Tooltip>

          <Tooltip title="Messages">
          <div
            ref={messagesDropdownRef}
            className="relative"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative cursor-pointer group"
              onClick={toggleMessagesDropdown}
            >
              <div className="relative">
                <RiMessage3Fill className={`text-xl text-gray-600 group-hover:text-violet-600 transition-colors
                  ${location.pathname.includes('/freelancer/messages') ? 'text-violet-600 ' : 'text-gray-600'}
                  `} />
                {unreadMessages > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-violet-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm"
                  >
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </motion.div>
                )}
                <motion.div
                  className="absolute inset-0 rounded-full bg-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                  whileHover={{
                    scale: 1.8,
                    opacity: 0.15,
                  }}
                />
              </div>
            </motion.div>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isMessagesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-50 border border-gray-200"
                >
                  <div className="py-2">
                    <Link
                      to="/freelancer/messages/direct"
                      className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100
                        ${location.pathname === '/freelancer/messages/direct' ? 'text-violet-600 ' : 'text-gray-600'}
                        `}
                      onClick={() => setIsMessagesOpen(false)}
                    >
                      <FaEnvelope className="w-4 h-4 mr-3" />
                      Direct Messages
                      {unreadDirectMessages > 0 && (
                        <span className={`ml-auto bg-violet-500 text-white text-xs px-2 py-1 rounded-full
                          ${location.pathname === '/freelancer/messages/direct' ? 'text-violet-600 ' : 'text-gray-600'}
                          `}
                        >
                          {unreadDirectMessages > 99 ? '99+' : unreadDirectMessages}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/freelancer/messages/groups"
                      className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100
                        ${location.pathname === '/freelancer/messages/groups' ? 'text-violet-600 ' : 'text-gray-600'}
                        `}
                      onClick={() => setIsMessagesOpen(false)}
                    >
                      <FaUsers className="w-4 h-4 mr-3" />
                      Group Chats
                      {unreadGroupMessages > 0 && (
                        <span className={`ml-auto bg-violet-500 text-white text-xs px-2 py-1 rounded-full
                          ${location.pathname === '/freelancer/messages/groups' ? 'text-violet-600 ' : 'text-gray-600'}
                          `}
                        >
                          {unreadGroupMessages > 99 ? '99+' : unreadGroupMessages}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/freelancer/messages/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMessagesOpen(false)}
                    >
                      <FaCog className="w-4 h-4 mr-3" />
                      Chat Settings
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications" placement="bottom">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/freelancer/notifications')} 
              className="relative cursor-pointer"
            >
              <FaBell className="text-xl text-gray-600 hover:text-violet-700 transition-all duration-300" />
              <Badge 
                count={5} 
                className="absolute -top-2 -right-2"
                style={{ 
                  backgroundColor: '#8B5CF6',
                  boxShadow: '0 0 0 2px #fff'
                }}
              />
            </motion.div>
          </Tooltip>
        </motion.div>

        {/* User Profile */}
        <div 
          className="relative group pl-5 border-l border-gray-100"
          ref={profileDropdownRef}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaUserCircle
              className="text-2xl text-gray-600 hover:text-violet-700 cursor-pointer transition-all duration-300"
              onClick={toggleProfileDropdown}
            />
          </motion.div>
          
          <AnimatePresence>
            {isProfileClicked && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute right-0 mt-3 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-[100]"
              >
                <div className="py-2">
                  {/* User info section */}
                  <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                        {user?.profile_picture ? (
                          <img 
                            src={`http://localhost:8000${user.profile_picture}`} 
                            alt="" 
                            className="w-10 h-10 object-cover rounded-full"
                          />
                        ) : (
                          <FaUserCircle className="text-white text-2xl" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span>Online</span>
                    </div>
                  </div>
                  
                  {/* Add wallet display for mobile */}
                  <div className="md:hidden">
                    <WalletDisplay isCompact={true} />
                  </div>

                  <div className="py-2">
                    <motion.span
                      whileHover={{ x: 4 }}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer transition-all duration-200"
                      onClick={() => { 
                        setIsProfileClicked(false);
                        navigate('/freelancer/profile');
                      }}
                    >
                      Profile
                    </motion.span>
                    <motion.span
                      whileHover={{ x: 4 }}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer transition-all duration-200"
                      onClick={() => {
                        setIsProfileClicked(false);
                        navigate('/settings');
                      }}
                    >
                      Settings
                    </motion.span>
                  </div>

                  <div className="my-2 border-t border-gray-200" />
                  
                  <motion.span
                    whileHover={{ x: 4 }}
                    className="block px-4 py-2 text-red-600 hover:bg-gray-50 cursor-pointer transition-all duration-200"
                    onClick={() => {
                      handleLogout();
                      setIsProfileClicked(false);
                    }}
                  >
                    Logout
                  </motion.span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

FHeader.propTypes = {
  userId: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  isEditable: PropTypes.bool.isRequired
};

export default FHeader;
