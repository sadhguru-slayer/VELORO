import axios from "axios";
import React, { useState } from "react";
import { FaSearch, FaBell, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';


const FHeader = () => {
const navigate = useNavigate();
const [isprofiledClicked,setIsProfiledClicked]=useState(false);
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
        />
        <FaSearch className="absolute right-3 top-2 text-gray-900" />
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div onClick={()=>navigate('/freelancer/notifications')} className="relative cursor-pointer">
          <FaBell className="text-lg" />
          <span className="absolute -top-1 -right-1 bg-red-600 text-xs text-black rounded-full px-1">
            5
          </span>
        </div>

        {/* User Dropdown */}
        <div className="relative group">
        <FaUserCircle
          className="text-xl cursor-pointer"
          onClick={toggleProfileDropdown}
        />
        {isprofiledClicked && (
          <div className="absolute right-0 bg-white text-black rounded-lg shadow-md mt-2 w-48">
            <span
              
              className="block px-4 py-2 hover:bg-gray-100 transition"
              onClick={() =>{ 
                setIsProfiledClicked(false)
                navigate('/freelancer/profile')
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

export default FHeader;
