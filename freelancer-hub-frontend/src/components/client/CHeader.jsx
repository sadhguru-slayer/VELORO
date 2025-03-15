import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaBell, FaUserCircle, FaPlus, FaLock } from "react-icons/fa";
import { MdDashboard, MdWork } from "react-icons/md";
import { IoMdBriefcase } from "react-icons/io";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from 'antd';

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

  // Quick actions menu items
  const quickActions = [
    {
      icon: <FaPlus className="text-lg" />,
      label: 'Post Project',
      path: '/client/post-project',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      icon: <MdDashboard className="text-lg" />,
      label: 'Dashboard',
      path: '/client/dashboard',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: <IoMdBriefcase className="text-lg" />,
      label: 'My Projects',
      path: '/client/projects',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
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
      setSearchResults({
        users: data.users || [],
        projects: data.projects || [],
        categories: data.categories || [],
      });
      setShowResults(true);
    };

    socketRef.current.onclose = () => console.log("WebSocket Disconnected");

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);
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
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/");
    }
  };

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);

    if (term.length >= 2) {
      setIsSearchActive(true);
    const token = Cookies.get("accessToken");
      if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ query: term, token }));
    }
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
            className="w-full px-4 py-3 pl-10 pr-16 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
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
                          navigate(`/${user.role}/profile/${user.id}`);
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
                          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                            <FaUserCircle className="text-teal-500 text-xl" />
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
                          navigate(`/project/${project.id}`);
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

  return (
    <>
      <header className="sticky top-0 bg-white border-b border-gray-200 h-16 flex items-center px-6 justify-between shadow-sm z-10">
        {/* Logo Section - Always visible */}
      <div className="flex items-center">
          <Link 
            to="/" 
            className="text-xl font-bold tracking-wide text-gray-800 hover:text-teal-600 transition-colors"
          >
            Veloro
          </Link>
        </div>

        {/* Conditional rendering based on authentication status */}
        {shouldShowRestricted() ? (
          // Restricted view for explicitly non-authenticated users
          <div className="flex items-center gap-6 ml-auto">
            {/* Blurred/Locked Quick Actions */}
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
                    <FaLock className="text-gray-400" />
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Login Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-all duration-300"
            >
              Sign In
            </motion.button>
          </div>
        ) : (
          // Full header for all other cases
          <>
            {/* Quick Actions */}
            <div className="hidden md:flex items-center gap-2 ml-8">
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
                    className={`relative p-2 rounded-lg ${action.bgColor} ${
                      location.pathname === action.path ? 'ring-2 ring-offset-2 ring-teal-500' : ''
                    } hover:shadow-md transition-all duration-200`}
                  >
                    <span className={`${action.color}`}>
                      {action.icon}
                    </span>
                  </motion.button>
                </Tooltip>
              ))}
          </div>

      {/* Search Bar */}
            <div className="relative hidden md:block flex-1 max-w-2xl mx-12">
              <div className="relative">
        <input
          type="text"
                  placeholder="Search projects, freelancers, or skills..."
                  className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-200 bg-gray-50 hover:bg-white"
          value={searchTerm}
          onChange={handleSearch}
        />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

        {/* Search Results Dropdown - Desktop */}
              <AnimatePresence>
                {showResults && searchTerm.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-[100] top-full left-0 right-0 bg-white mt-1 rounded-lg shadow-lg border border-gray-200 overflow-hidden"
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
                                onClick={() => navigate(`/${user.role}/profile/${user.id}`)}
                              >
                                {user.profile_picture ? (
                                  <img 
                                    src={`http://localhost:8000/${user.profile_picture}`} 
                                    alt="" 
                                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                                    <FaUserCircle className="text-teal-500" />
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

      {/* Actions Section */}
      <div className="flex items-center gap-6">
              {/* Mobile Quick Actions */}
              <div className="md:hidden relative mobile-actions">
                <Tooltip title="Quick Actions">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowMobileActions(!showMobileActions)}
                    className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"
                  >
                    <FaPlus className="text-lg" />
                  </motion.button>
                </Tooltip>

                <AnimatePresence>
                  {showMobileActions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                    >
                      <div className="py-2">
                        {quickActions.map((action) => (
                          <motion.button
                            key={action.path}
                            whileHover={{ x: 4 }}
                            onClick={() => {
                              navigate(action.path);
                              setShowMobileActions(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                          >
                            <span className={`${action.color} p-2 rounded-lg ${action.bgColor}`}>
                              {action.icon}
                            </span>
                            <span className="text-gray-700">{action.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

        {/* Notifications */}
              <Tooltip title="Notifications">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative cursor-pointer"
                  onClick={() => navigate('/client/notifications')}
                >
                  <FaBell className="text-xl text-gray-600 hover:text-teal-600 transition-colors" />
                  {notificationsCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    >
            {notificationsCount}
                    </motion.span>
                  )}
                </motion.div>
              </Tooltip>

              {/* Profile Dropdown */}
              <div className="relative profile-dropdown">
                <Tooltip title="Profile & Settings">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsProfiledClicked(!isProfiledClicked)}
                    className="cursor-pointer"
                  >
                    <FaUserCircle className="text-2xl text-gray-600 hover:text-teal-600 transition-colors" />
                  </motion.div>
                </Tooltip>

                <AnimatePresence>
                  {isProfiledClicked && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg border border-gray-200 overflow-hidden"
                    >
                      <div className="py-2">
                        <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                              <span className="text-lg font-semibold text-white">
                                {user.profile_picture ? (
                                  <img 
                                    src={`http://localhost:8000${user.profile_picture}`} 
                                    alt="" 
                                    className="w-10 h-10 object-cover rounded-full"
                                  />
                                ) : (
                                  <FaUserCircle className="text-teal-500" />
                                )}
          </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.username}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span>Online</span>
                          </div>
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

              {/* Mobile Search Button */}
              <div className="md:hidden">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMobileSearchOpen(true)}
                  className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"
                >
                  <FaSearch className="text-lg" />
                </motion.button>
        </div>
      </div>
          </>
        )}
    </header>
      
      <AnimatePresence>
        {isMobileSearchOpen && <MobileSearch />}
      </AnimatePresence>
      
      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #94a3b8;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #64748b;
        }
      `}</style>
    </>
  );
};

export default CHeader;
