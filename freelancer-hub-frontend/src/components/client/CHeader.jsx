import axios from "axios";
import React, { useState ,useEffect,useRef} from "react";
import { FaSearch, FaBell, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import DOMPurify from 'dompurify';

const CHeader = () => {
  const navigate = useNavigate();
  const [isProfiledClicked, setIsProfiledClicked] = useState(false);
  const toggleProfileDropdown = () => {
    setIsProfiledClicked(prevState => !prevState);
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

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState({
    users: [],
    projects: [],
    categories: [],
  });
  const [showResults, setShowResults] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket only once
    socketRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/search/`);

    socketRef.current.onopen = () => {
      console.log("WebSocket Connected");

      // Send authentication token when WebSocket opens
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

    return () => socketRef.current.close();
  }, []);

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);

    if (term.length < 2) {
      setSearchResults({ users: [], projects: [], categories: [] });
      setShowResults(false);
      return;
    }

    // Get JWT Token from Cookies
    const token = Cookies.get("accessToken");

    // Send search query via WebSocket
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ query: term, token }));
    }
  }
  
  const [notificationsCount, setNotificationsCount] = useState(0);

useEffect(() => {
  // Construct WebSocket URL with the token as a query parameter
  const socket = new WebSocket(
    `ws://127.0.0.1:8000/ws/notification_count/?token=${Cookies.get('accessToken')}`
  );
  

  socket.onmessage = function (event) {
    const data = JSON.parse(event.data);  // Parse the incoming JSON data
    if (data.notifications_count !== undefined) {
      setNotificationsCount(data.notifications_count);  // Update the object count state
    }
  };

  socket.onclose = function (event) {
    if (event.code !== 1000) {
      // 
    }
  };

  // Handle WebSocket errors
  socket.onerror = function (error) {
    console.error("WebSocket Error");
  };

  // Cleanup WebSocket connection when the component unmounts
  return () => {
    socket.close();
  };
}, []);


  return (
    <header className="border-b-gray-300 bg-gray-200 text-black border h-12 flex items-center px-4 justify-between z-10">
      {/* Logo Section */}
      <div className="flex items-center">
        <Link to="/" className="text-xl font-bold tracking-wide text-textPrimary">
          Freelancer Hub
          </Link>
          </div>

      {/* Search Bar */}
      <div className="relative hidden md:block">
        <input
          type="text"
          placeholder="Search..."
          className="rounded-full px-4 py-1 bg-gray-100 text-gray-900 focus:outline-none w-72"
          value={searchTerm}
          onChange={handleSearch}
        />
        <FaSearch className="absolute right-3 top-2 text-teal-400" />

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-12 bg-white shadow-lg mt-1 w-72 rounded-lg p-2 max-h-72 overflow-y-auto">
            {/* Users */}
            {searchResults.users.length > 0 ? (
              <div>
                <p className="font-bold text-lg mb-2 text-teal-700">Users</p>
                {searchResults.users.map((user) => (
                  <div key={user.id} className="p-2 hover:bg-gray-100 rounded-md flex items-center gap-2">
                  {user.profile_picture?
                    <img className="w-6 h-6 rounded-full" src={`http://127.0.0.1:8000/${user.profile_picture}`} alt="" />
                    :
                    <FaUserCircle className="text-gray-500 h-6 w-6" />
                  }
                    
                    <p onClick={()=>navigate(`/${user.role}/profile/${user.id}`)}>
  {user.role === "client" ? "Client" : "Freelancer"} :
  <span className="font-semibold"> {user.username}</span>
</p>

                  </div>
                ))}
              </div>
            ) : null}
        
            {/* Projects */}
            {searchResults.projects.length > 0 ? (
              <div className="mt-4">
                <p className="font-bold text-lg mb-2 text-teal-700">Projects</p>
                {searchResults.projects.map((project) => {
                  const MAX_DESCRIPTION_LENGTH = 50; // Adjust this value as needed

const sanitizedDescription = DOMPurify.sanitize(project.description);
const shortDescription =
  sanitizedDescription.length > MAX_DESCRIPTION_LENGTH
    ? sanitizedDescription.slice(0, MAX_DESCRIPTION_LENGTH) + "..."
    : sanitizedDescription;

return (
  <div key={project.id} className="p-2 hover:bg-gray-100 rounded-md">
    <p className="font-semibold">{project.title}</p>
    <div dangerouslySetInnerHTML={{ __html: shortDescription }} />
  </div>
);

                })}
              </div>
            ) : null}
        
            {/* Categories */}
            {searchResults.categories.length > 0 ? (
              <div className="mt-4">
                <p className="font-bold text-lg mb-2 text-teal-700">Categories</p>
                {searchResults.categories.map((category) => (
                  <div key={category.id} className="p-2 hover:bg-gray-100 rounded-md">
                    <p className="text-gray-600">{category.name}</p>
                  </div>
                ))}
              </div>
            ) : null}
        
            {/* No Data Message */}
            {searchResults.users.length === 0 && searchResults.projects.length === 0 && searchResults.categories.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <p>No data available</p>
              </div>
            )}
          </div>
        )}
        
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div onClick={() => navigate('/client/notifications')} className="relative cursor-pointer">
          <FaBell className="text-lg" />
          <span className="absolute -top-1 -right-1 bg-red-600 text-xs text-black rounded-full px-1">
            {notificationsCount}
          </span>
        </div>

        {/* User Dropdown */}
        <div className="relative group">
          <FaUserCircle
            className="text-xl cursor-pointer"
            onClick={toggleProfileDropdown}
          />
          {isProfiledClicked && (
            <div className="absolute right-0 bg-white text-black rounded-lg shadow-md mt-2 w-48">
              <span
                className="block px-4 py-2 hover:bg-gray-100 transition"
                onClick={() => { 
                  setIsProfiledClicked(false);
                  navigate('/client/profile');
                }} // Close on click
              >
                <p className="text-black">Profile</p>
              </span>
              <Link
                to="/settings"
                className="block px-4 py-2 hover:bg-blue-300 transition"
                onClick={() => setIsProfiledClicked(false)} // Close on click
              >
                <p className="text-black">Settings</p>
              </Link>
              <Link
                onClick={() => {
                  handleLogout();
                  setIsProfiledClicked(false); // Close dropdown on logout
                }}
                className="block px-4 py-2 hover:bg-blue-300 transition"
              >
                <p className="text-black">Logout</p>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default CHeader;
