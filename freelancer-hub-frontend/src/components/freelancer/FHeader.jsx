import axios from "axios";
import React, { useState } from "react";
import { FaSearch, FaBell, FaUserCircle, FaComments, FaHome, FaCog } from "react-icons/fa";
import {  FaPlus, FaLock, FaEnvelope, FaUsers, } from "react-icons/fa";

import { FaDiagramProject } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import { motion,AnimatePresence } from 'framer-motion';
import { Tooltip, Badge, Input, AutoComplete } from 'antd';
import { useMediaQuery } from 'react-responsive';
import { RiMessage3Fill } from "react-icons/ri";
import PropTypes from 'prop-types';


const FHeader = ({ userId, role, isAuthenticated, isEditable }) => {
  const navigate = useNavigate();
  const [isProfileClicked, setIsProfileClicked] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadDirectMessages, setUnreadDirectMessages] = useState(0);
  const [unreadGroupMessages, setUnreadGroupMessages] = useState(0);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);

  const toggleProfileDropdown = () => {
    setIsProfileClicked(prevState => !prevState);
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

  return (
    <header className="bg-white border-b border-gray-100 h-16 flex items-center px-6 justify-between z-10 sticky top-0 shadow-sm backdrop-blur-lg bg-white/80">
      {/* Logo Section */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="flex items-center"
      >
        <Link to="/" className="text-xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-violet-800 to-violet-600 bg-clip-text text-transparent">
            Veloro
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
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative cursor-pointer group"
            onClick={(e) => {
              e.stopPropagation();
              setIsMessagesOpen(!isMessagesOpen);
            }}
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

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isMessagesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-50 border border-gray-200"
                  onClick={(e) => e.stopPropagation()}
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
          </motion.div>
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
        <motion.div 
          className="relative group pl-5 border-l border-gray-100"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaUserCircle
            className="text-2xl text-gray-600 hover:text-violet-700 cursor-pointer transition-all duration-300"
            onClick={toggleProfileDropdown}
          />
          
          {isProfileClicked && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="py-1">
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
        </motion.div>
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
