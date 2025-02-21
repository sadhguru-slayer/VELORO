import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, notification, Checkbox } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CHeader from '../../components/client/CHeader';
import CSider from '../../components/client/CSider';
import Cookies from 'js-cookie'
import axios from 'axios';
import { FaTimes,FaCheck } from "react-icons/fa";


const CConnections = (userId, role) => {
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
      navigate(`/client/profile/${userId}`, { state: { profileComponent } });
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
        const response = await axios.get('http://127.0.0.1:8000/api/client/get_connections',
          {
            headers: {
              'Authorization': `Bearer ${Cookies.get('accessToken')}`,
              },
              }
              );


        const connectionData = response.data;
        console.log(connectionData)
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
    console.log('Connection accepted:', response.data);
  } catch (error) {
    console.error('Error accepting connection:', error);
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
    console.log('Connection rejected:', response.data);
  } catch (error) {
    console.error('Error rejecting connection:', error);
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
        <div className="flex justify-center overflow-auto items-center bg-gray-200 h-screen p-4 w-full  ">
          <div className="flex-1 overflow-auto h-full bg-gray-100 rounded-lg p-4 max-w-[30rem]">
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
                  className={`p-4 
                    ${connection.role === 'client' ? 'border-l-teal-600 shadow-md border-l-4' : ''}
                  rounded-lg bg-gray-50 hover:bg-gray-100 transition duration-200`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 flex gap-1 items-center">
                    <span>
                    <h2 className=' transform rotate-[270deg] text-xs text-teal-700'>{connection.role}</h2>
                    </span>
                    <div className="flex-1 flex gap-2 items-center">
                    <span className='flex gap-2 items-center'>
                    {connection.profile_picture ?(
                      <img
                      src={connection.profile_picture}
                      alt={connection.name}
                      className="w-10 h-10 rounded-full object-cover object-center"
                      />
                    ):(
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">{connection.user_name[0]}</span>
              </div>
                    )

                    }
                    </span>
                    <span className='flex flex-col justify-center'>
                    <h3 className="text-lg font-semibold text-teal-600">{connection.user_name}</h3>
                    <p className="text-sm text-gray-600">{connection.bio}</p>
                    <p className="text-[8px] md:text-[11px] lg:text-xs sm:text-[8px] text-gray-500 mt-1">{format_timeStamp(connection.created_at)}</p>
                    </span>
                    </div>
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

export default CConnections;
