import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, notification, Checkbox } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CHeader from '../../components/client/CHeader';
import CSider from '../../components/client/CSider';
import Cookies from 'js-cookie'
import axios from 'axios';
import { FaTimes,FaCheck } from "react-icons/fa";


const CConnectionRequests = ({userId, role}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const location = useLocation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeComponent, setActiveComponent] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    skills: [],
    availability: '',
  });

  // Handle the navigation on menu item click
  const handleMenuClick = (component) => {
    if (component !== 'connections') {
      navigate('/client/dashboard', { state: { component } });
    }
  };

  const handleProfileMenu = (profileComponent) => {

    if (location.pathname !== '/client/profile') {
      navigate('/client/profile', { state: { profileComponent } });
    }
  };
  // Handle the filter change
  const handleFilterChange = (filterName, value) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };

  // Fetch connections data
  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/client/get_connection_requests',
          {
            headers: {
              'Authorization': `Bearer ${Cookies.get('accessToken')}`,
              },
              }
              );


        const connectionData = response.data;
        setConnections(connectionData);
      } catch (error) {
        console.error("Error fetching connections", error);
        notification.error({ message: 'Error loading connections.' });
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);


  const handleAccept = async (connectionId) => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/client/connections/${connectionId}/accept_connection/`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${Cookies.get('accessToken')}`, // Include auth token if necessary
          },
        }
      );
  
      // Check if connection is accepted
      if (response.data.status === 'accepted') {
        // Show success notification
        notification.success({ message: 'Connection Accepted!', description: `You have successfully accepted the connection.` });
        
        // Remove the accepted connection from the state
        setConnections((prevConnections) =>
          prevConnections.filter((connection) => connection.id !== connectionId)
        );
      } else {
        notification.error({ message: 'Failed to accept the connection.' });
      }
    } catch (error) {
      console.error('Error accepting connection:', error);
      notification.error({ message: 'Error accepting the connection.' });
    }
  };
  
  const handleReject = async (connectionId) => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/client/connections/${connectionId}/reject_connection/`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${Cookies.get('accessToken')}`, // Include auth token if necessary
          },
        }
      );
  
      // Check if connection is rejected
      if (response.data.status === 'rejected') {
        // Show success notification
        notification.success({ message: 'Connection Rejected!', description: `You have successfully rejected the connection.` });
  
        // Remove the rejected connection from the state
        setConnections((prevConnections) =>
          prevConnections.filter((connection) => connection.id !== connectionId)
        );
      } else {
        notification.error({ message: 'Failed to reject the connection.' });
      }
    } catch (error) {
      console.error('Error rejecting connection:', error);
      notification.error({ message: 'Error rejecting the connection.' });
    }
  };
  

  const format_timeStamp = (date)=>{
    const dateObject = new Date(date);
    return dateObject.toLocaleString();
  }

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <CSider 
      userId={userId} 
      role={role}
      dropdown={true} 
      collapsed={true} 
      handleMenuClick={handleMenuClick} 
      activeComponent={activeComponent} 
      handleProfileMenu={handleProfileMenu} 
    />
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-x-hidden ml-14 sm:ml-16 md:ml-16 lg:ml-22">
        {/* Header */}
        <CHeader />

        {/* Connections Content */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4 flex justify-center w-full">
        <div className="flex flex-col items-start gap-2 max-w-[80rem] w-fit min-h-fit bg-white rounded-lg p-4 ">

            {/* Connections Header */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-teal-600">Your Connections</h1>
            </div>

            {/* Connections List */}
            <div className="space-y-4">
            {connections.length > 0 ? (
              connections.map((connection) => (
                <div
                  key={connection.id}
                  className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-teal-600">{connection.user_name}</h3>
                      <p className="text-sm text-gray-600">{connection.bio}</p>
                      <p className="text-[8px] md:text-[11px] lg:text-xs sm:text-[8px] text-gray-500 mt-1">{format_timeStamp(connection.created_at)}</p>
                    </div>
                    <div className="flex space-x-2 items-center">
                      {/* Accept button */}
                      <button
                        className="flex items-center justify-center w-8 h-8 bg-teal-700 text-white rounded-full hover:bg-teal-800 transition"
                        onClick={() => handleAccept(connection.id)} // Add your accept handler
                      >
                      <FaCheck /> 
                      </button>
          
                      {/* Reject button */}
                      <button
                        className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition"
                        onClick={() => handleReject(connection.id)} // Add your reject handler
                      >
                      <FaTimes /> 
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600">You have no connections yet.</p>
              </div>
            )}
          </div>
          
          </div>
        </div>
      </div>
    </div>
  );
};

export default CConnectionRequests;
