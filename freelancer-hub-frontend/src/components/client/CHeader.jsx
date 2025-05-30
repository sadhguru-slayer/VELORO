import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaBell, FaUserCircle, FaPlus, FaLock, FaEnvelope, FaUsers, FaCog, FaWallet } from "react-icons/fa";
import { MdDashboard, MdWork } from "react-icons/md";
import { IoMdBriefcase } from "react-icons/io";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, Spin } from 'antd';
import { RiMessage3Fill } from "react-icons/ri";

const CHeader = ({ isAuthenticated = true, isEditable = true, userId }) => {
  
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState({
    users: [],
    projects: [],
    categories: [],
  });
  const [showResults, setShowResults] = useState(false);
  const [isProfiledClicked, setIsProfiledClicked] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const socketRef = useRef(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadDirectMessages, setUnreadDirectMessages] = useState(0);
  const [unreadGroupMessages, setUnreadGroupMessages] = useState(0);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);

  // Updated Quick Actions with new color scheme
  const quickActions = [
    {
      icon: <FaPlus className="text-lg" />,
      label: 'Post Project',
      path: '/client/post-project',
      color: 'text-client-primary',
      bgColor: 'bg-client-primary/10',
    },
    {
      icon: <MdDashboard className="text-lg" />,
      label: 'Dashboard',
      path: '/client/dashboard',
      color: 'text-client-primary',
      bgColor: 'bg-client-primary/10',
    },
    {
      icon: <IoMdBriefcase className="text-lg" />,
      label: 'My Projects',
      path: '/client/dashboard/projects',
      color: 'text-client-primary',
      bgColor: 'bg-client-primary/10',
    },
  ];

  // WebSocket connection for notifications
  useEffect(() => {
    const socket = new WebSocket(
      `ws://localhost:8000/ws/notification_count/?token=${Cookies.get('accessToken')}`
    );
  
    socket.onmessage = function (event) {
      const data = JSON.parse(event.data);
      if (data.notifications_count !== undefined) {
        setNotificationsCount(data.notifications_count);
      }
    };
  
    socket.onclose = function (event) {
      if (event.code !== 1000) {
        console.error("WebSocket closed unexpectedly");
      }
    };
  
    socket.onerror = function (error) {
      console.error("WebSocket Error", error);
    };
  
    return () => {
      socket.close();
    };
  }, []);

  // WebSocket connection for search
  useEffect(() => {
    const connectWebSocket = () => {
      socketRef.current = new WebSocket("ws://localhost:8000/ws/search/");
      
      socketRef.current.onopen = () => {
        console.log("WebSocket Connected for Search");
        const token = Cookies.get("accessToken");
        if (token) {
          socketRef.current.send(JSON.stringify({ type: "auth", token }));
        }
      };

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.error) {
          console.error("Search WebSocket error:", data.error);
          return;
        }
        setSearchResults({
          users: data.users || [],
          projects: data.projects || [],
          categories: data.categories || [],
        });
        setShowResults(true);
      };

      socketRef.current.onclose = () => {
        console.log("WebSocket Disconnected, attempting to reconnect...");
        setTimeout(connectWebSocket, 3000);
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // Add this effect to handle message count updates
  // useEffect(() => {
  //   const messageSocket = new WebSocket(
  //     `ws://localhost:8000/ws/messages_count/?token=${Cookies.get('accessToken')}`
  //   );
  
  //   messageSocket.onmessage = function (event) {
  //     const data = JSON.parse(event.data);
  //     if (data.unread_messages !== undefined) {
  //       setUnreadMessages(data.unread_messages);
  //     }
  //   };
  
  //   messageSocket.onclose = function (event) {
  //     if (event.code !== 1000) {
  //       console.error("Message WebSocket closed unexpectedly");
  //     }
  //   };
  
  //   return () => {
  //     messageSocket.close();
  //   };
  // }, []);

  const [user, setUser] = useState(null);
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
  
  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown') && !event.target.closest('.mobile-actions')) {
        setIsProfiledClicked(false);
        setShowMobileActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
    const refreshToken = Cookies.get("refreshToken");
    const accessToken = Cookies.get("accessToken");
      
    if (!refreshToken) {
      navigate("/login");
      return;
    }

      await axios.post(
        "http://localhost:8000/api/logout/",
        { refreshToken, accessToken },
        {
        headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      Cookies.remove("role");
      Cookies.remove("userId");
      localStorage.clear();
      setTimeout(() => {  
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/");
    }
  };

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);

    if (term.length >= 2 && socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ 
        query: term,
        token: Cookies.get("accessToken")
      }));
      setIsSearchActive(true);
    } else {
      setShowResults(false);
      setIsSearchActive(false);
    }
  };

  const handleCloseSearch = () => {
    setIsSearchActive(false);
    setSearchTerm("");
    setSearchResults({ users: [], projects: [], categories: [] });
    setIsMobileSearchOpen(false);
  };

  // Helper function to determine if header should be restricted
  const shouldShowRestricted = () => {
    // Show restricted view ONLY if explicitly set to false
    return isAuthenticated === false;
  };

  const MobileSearch = () => {
    if (!isMobileSearchOpen) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white z-[100] mt-16"
      >
        {/* Search Input */}
        <div className="sticky top-0 p-4 bg-white border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search projects, freelancers, or skills..."
            className="w-full px-4 py-3 pl-10 pr-16 rounded-lg border border-client-border focus:border-client-primary focus:ring-1 focus:ring-client-primary/20"
            value={searchTerm}
            onChange={handleSearch}
            autoFocus
          />
          <button
            onClick={handleCloseSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      

        {/* Search Results */}
        <div className="h-[calc(100vh-4rem)] z-10 overflow-y-auto pb-20">
          {searchTerm.length >= 2 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4"
            >
              {/* Users Section */}
              {searchResults.users.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2 px-2">USERS</h3>
                  <div className="space-y-2">
                    {searchResults.users.map((user) => (
                      <motion.div
                        key={user.id}
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-3 p-4 hover:bg-gray-50 rounded-md cursor-pointer"
                        onClick={() => {
                          navigate(`/${user.pathrole}/profile/${user.id}/view_profile`);
                          setIsMobileSearchOpen(false);
                        }}
                      >
                        {user.profile_picture ? (
                          <img 
                            src={`http://localhost:8000${user.profile_picture}`} 
                            alt="" 
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-client-primary/10 flex items-center justify-center">
                            <FaUserCircle className="text-client-primary text-xl" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{user.username}</p>
                          <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Section */}
              {searchResults.projects.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2 px-2">PROJECTS</h3>
                  <div className="space-y-2">
                    {searchResults.projects.map((project) => (
                      <motion.div
                        key={project.id}
                        whileHover={{ x: 4 }}
                        className="p-4 hover:bg-gray-50 rounded-md cursor-pointer"
                        onClick={() => {
                          navigate(`/project/${project.id}/view_project`);
                          setIsMobileSearchOpen(false);
                        }}
                      >
                        <p className="font-medium text-gray-900">{project.title}</p>
                        <div 
                          className="text-sm text-gray-500 line-clamp-2"
                          dangerouslySetInnerHTML={{ 
                            __html: DOMPurify.sanitize(project.description) 
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {!searchResults.users.length && !searchResults.projects.length && (
                <div className="p-8 text-center">
                  <p className="text-gray-500">
                    {searchTerm.length >= 2 ? `No results found for "${searchTerm}"` : 'Start typing to search...'}
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Start typing to search...
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  //fetch wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/finance/wallet/balance/', {
          headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` },
        });
        console.log(response.data);
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
            <FaWallet className="text-client-primary" />
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
          onClick={() => navigate('/client/wallet')}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200">
            <FaWallet className="text-client-primary" />
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
    <>
      <header className="sticky top-0 bg-white border-b border-client-border h-16 flex items-center p-4 px-6 justify-between shadow-client-sm z-50">
        {/* Logo Section */}
        <div className="flex items-center">
          <Link 
            to="/" 
            className="text-xl font-bold tracking-wide text-client-primary hover:text-client-primary-light transition-colors"
          >
            Talintz
          </Link>
        </div>

        {shouldShowRestricted() ? (
          // Restricted view styling updated
          <div className="flex items-center gap-6 ml-auto">
            <div className="relative hidden md:flex items-center gap-4">
              {quickActions.map((action) => (
                <motion.div
                  key={action.path}
                  className="relative"
                >
                  <div className="filter blur-[2px] pointer-events-none">
                    <button className={`p-2 rounded-lg ${action.bgColor}`}>
                      <span className={action.color}>{action.icon}</span>
                    </button>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate('/login')}
                    className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm rounded-lg cursor-pointer"
                  >
                    <FaLock className="text-client-text-secondary" />
                  </motion.div>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-client-bg-gradient-start to-client-bg-gradient-end text-white rounded-xl hover:shadow-client-button-hover transition-all duration-300"
            >
              Sign In
            </motion.button>
          </div>
        ) : (
          <>
            {/* Quick Actions with updated styling */}
            <div className="hidden md:flex items-center gap-3 ml-8">
              {quickActions.map((action) => (
                <Tooltip 
                  key={action.path} 
                  title={action.label}
                  placement="bottom"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(action.path)}
                    className={`relative p-2.5 rounded-xl ${action.bgColor} ${
                      location.pathname === action.path 
                        ? 'ring-2 ring-offset-2 ring-client-primary/30' 
                        : ''
                    } hover:shadow-client-sm transition-all duration-200`}
                  >
                    <span className={action.color}>{action.icon}</span>
                  </motion.button>
                </Tooltip>
              ))}
            </div>

            {/* Enhanced Search Bar */}
            <div className="relative hidden md:block flex-1 max-w-2xl mx-12">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects, freelancers, or skills..."
                  className="w-full px-4 py-2.5 pl-10 pr-4 rounded-xl border border-client-border focus:border-client-primary focus:ring-1 focus:ring-client-primary/20 transition-all duration-200 bg-client-bg-primary hover:bg-white"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-client-text-secondary" />
              </div>

              {/* Search Results Dropdown with updated styling */}
              <AnimatePresence>
                {showResults && searchTerm.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-[100] top-full left-0 right-0 bg-white mt-2 rounded-xl shadow-client-md border border-client-border overflow-hidden"
                  >
                    <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                      {/* Users Section */}
                      {searchResults.users.length > 0 && (
                        <div className="p-4">
                          <h3 className="text-sm font-semibold text-gray-500 mb-2">USERS</h3>
                          <div className="space-y-2">
                            {searchResults.users.map((user) => (
                              <motion.div
                                key={user.id}
                                whileHover={{ x: 4 }}
                                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                                onClick={() => navigate(`/${user.pathrole}/profile/${user.id}/view_profile`)}
                              >
                                {user.profile_picture ? (
                                  <img 
                                    src={`http://localhost:8000/${user.profile_picture}`} 
                                    alt="" 
                                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-client-primary/10 flex items-center justify-center">
                                    <FaUserCircle className="text-client-primary" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-gray-900">{user.username}</p>
                                  <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Projects Section */}
                      {searchResults.projects.length > 0 && (
                        <div className="p-4 border-t border-gray-100">
                          <h3 className="text-sm font-semibold text-gray-500 mb-2">PROJECTS</h3>
                          <div className="space-y-2">
                            {searchResults.projects.map((project) => (
                              <motion.div
                                key={project.id}
                                whileHover={{ x: 4 }}
                                className="p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                              >
                                <p className="font-medium text-gray-900">{project.title}</p>
                                <div 
                                  className="text-sm text-gray-500 line-clamp-2"
                                  dangerouslySetInnerHTML={{ 
                                    __html: DOMPurify.sanitize(project.description) 
                                  }}
                                />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No Results */}
                      {!searchResults.users.length && !searchResults.projects.length && (
                        <div className="p-8 text-center">
                          <p className="text-gray-500">No results found for "{searchTerm}"</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions Section with updated styling */}
            <div className="flex items-center gap-6">
              {/* Wallet Display */}
              <div className="hidden md:block">
                <WalletDisplay />
              </div>

              {/* Mobile Search Button */}
              <div className="md:hidden">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMobileSearchOpen(true)}
                  className="p-2.5 rounded-xl bg-client-bg-primary text-client-text-secondary hover:bg-client-accent-gray-lighter"
                >
                  <FaSearch className="text-lg" />
                </motion.button>
              </div>

              {/* Notifications with updated styling */}
              <Tooltip title="Notifications">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative cursor-pointer group"
                  onClick={() => navigate('/client/notifications')}
                >
                  <div className="relative p-2 rounded-xl hover:bg-client-bg-primary transition-colors">
                    <FaBell className={`text-xl ${
                      location.pathname === '/client/notifications' 
                        ? 'text-client-primary' 
                        : 'text-client-text-secondary group-hover:text-client-primary'
                    } transition-colors`} />
                    {notificationsCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-client-status-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-client-sm"
                      >
                        {notificationsCount > 99 ? '99+' : notificationsCount}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </Tooltip>

              {/* Messages Icon with updated styling */}
              <Tooltip title="Messages">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative cursor-pointer group"
                  onClick={() => setIsMessagesOpen(!isMessagesOpen)}
                >
                  <div className="relative p-2 rounded-xl hover:bg-client-bg-primary transition-colors">
                    <RiMessage3Fill className={`text-xl ${
                      location.pathname.includes('/client/messages') 
                        ? 'text-client-primary' 
                        : 'text-client-text-secondary group-hover:text-client-primary'
                    } transition-colors`} />
                    {unreadMessages > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-client-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-client-sm"
                      >
                        {unreadMessages > 99 ? '99+' : unreadMessages}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </Tooltip>

              {/* Profile Dropdown with updated styling */}
              <div className="relative profile-dropdown">
                <Tooltip title="Profile & Settings">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsProfiledClicked(!isProfiledClicked)}
                    className="cursor-pointer p-2 rounded-xl hover:bg-client-bg-primary transition-colors"
                  >
                    <FaUserCircle className="text-2xl text-client-text-secondary hover:text-client-primary transition-colors" />
                  </motion.div>
                </Tooltip>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {isProfiledClicked && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-client-md border border-client-border overflow-hidden z-[100]"
                    >
                      <div className="py-2">
                        <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-client-primary to-client-primary-light flex items-center justify-center">
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
                          <motion.button
                            whileHover={{ x: 4 }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                            onClick={() => { 
                              setIsProfiledClicked(false);
                              navigate(`/client/profile/${userId}`);
                            }}
                          >
                            <span className="text-gray-900">Profile</span>
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ x: 4 }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                            onClick={() => {
                              setIsProfiledClicked(false);
                              navigate('/settings');
                            }}
                          >
                            <span className="text-gray-900">Settings</span>
                          </motion.button>
                        </div>

                        <div className="my-2 border-t border-gray-200" />
                        
                        <motion.button
                          whileHover={{ x: 4 }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-red-600"
                          onClick={() => {
                            handleLogout();
                            setIsProfiledClicked(false);
                          }}
                        >
                          <span>Logout</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        )}
      </header>

      <AnimatePresence>
        {isMobileSearchOpen && <MobileSearch />}
      </AnimatePresence>
      
      {/* Updated styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: var(--client-secondary);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: var(--client-secondary-dark);
        }

        .header-icon {
          position: relative;
          transition: all 0.2s ease;
        }

        .header-icon:hover::after {
          content: '';
          position: absolute;
          inset: -8px;
          background: currentColor;
          opacity: 0.1;
          border-radius: 50%;
          z-index: -1;
        }

        .badge-pulse {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(27, 43, 101, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(27, 43, 101, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(27, 43, 101, 0);
          }
        }
      `}</style>
    </>
  );
};

export default CHeader;
