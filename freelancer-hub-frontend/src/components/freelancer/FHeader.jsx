import axios from "axios";
import React, { useState } from "react";
import { FaSearch, FaBell, FaUserCircle, FaComments, FaHome, FaCog } from "react-icons/fa";

import { FaDiagramProject } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { Tooltip, Badge, Input, AutoComplete } from 'antd';
import { useMediaQuery } from 'react-responsive';
import { RiMessage3Fill } from "react-icons/ri";


const FHeader = () => {
  const navigate = useNavigate();
  const [isProfileClicked, setIsProfileClicked] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const isMobile = useMediaQuery({ maxWidth: 767 });

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
      navigate("/login");
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
    <header className="border-b-gray-300 bg-white text-black border h-16 flex items-center px-4 justify-between z-10 shadow-sm">
      {/* Logo Section */}
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="flex items-center"
      >
        <Link to="/" className="text-xl font-bold tracking-wide text-violet-700">
          Veloro<span className="text-violet-500">Freelance</span>
        </Link>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        className={`relative transition-all duration-300 ${isSearchFocused ? 'w-96' : 'w-72'} ${isMobile ? 'hidden' : 'block'}`}
        whileHover={{ scale: 1.02 }}
      >
        <AutoComplete
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          options={searchResults.map(result => ({ value: result.value, label: <Link to={result.link}>{result.value}</Link> }))}
          placeholder="Search projects, clients, skills..."
          className="w-full"
        >
          <Input
            prefix={<FaSearch className="text-gray-500" />}
            className="rounded-full px-4 py-2 bg-gray-100 text-gray-900 focus:outline-none"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </AutoComplete>
      </motion.div>

      {/* Actions Section */}
      <div className="flex items-center gap-4">
        {/* Quick Actions */}
        <motion.div 
          className="flex items-center gap-4"
        >

          <Tooltip title="My Projects">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-violet-700 hover:text-violet-900 transition-all duration-300"
              onClick={() => navigate('/freelancer/my-projects')}
            >
              <FaDiagramProject className="text-xl" />
            </motion.button>
          </Tooltip>

          <Tooltip title="Messages">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-violet-700 hover:text-violet-900 transition-all duration-300"
              onClick={() => navigate('/freelancer/messages')}
            >
            <RiMessage3Fill className="text-xl" />
            </motion.button>
          </Tooltip>
        </motion.div>

        {/* Notifications */}
        <motion.div 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/freelancer/notifications')} 
          className="relative cursor-pointer"
        >
          <FaBell className="text-xl text-violet-700" />
          <Badge count={5} className="absolute -top-2 -right-2" />
        </motion.div>

        {/* User Dropdown */}
        <motion.div 
          className="relative group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaUserCircle
            className="text-2xl text-violet-700 cursor-pointer"
            onClick={toggleProfileDropdown}
          />
          {isProfileClicked && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 bg-white text-black rounded-lg shadow-md mt-2 w-48"
            >
              <span
                className="block px-4 py-2 hover:bg-gray-100 transition"
                onClick={() => { 
                  setIsProfileClicked(false);
                  navigate('/freelancer/profile');
                }}
              >
                <p className="text-black">Profile</p>
              </span>
              <Link
                to="/settings"
                className="block px-4 py-2 hover:bg-gray-100 transition"
                onClick={() => setIsProfileClicked(false)}
              >
                <p className="text-black">Settings</p>
              </Link>
              <Link
                onClick={() => {
                  handleLogout();
                  setIsProfileClicked(false);
                }}
                className="block px-4 py-2 hover:bg-gray-100 transition"
              >
                <p className="text-black">Logout</p>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </header>
  );
};

export default FHeader;
