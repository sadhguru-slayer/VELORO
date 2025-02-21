import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, notification, Checkbox } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CHeader from '../../components/client/CHeader';
import CSider from '../../components/client/CSider';
import Cookies from 'js-cookie'
import axios from 'axios';


const CConnections = () => {
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
        <div className="flex-1 overflow-auto bg-gray-200 p-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
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
                        <p className="text-xs text-gray-500 mt-1">{format_timeStamp(connection.created_at)}</p>
                      </div>
                      <div className="flex space-x-2 items-center">
                        <Link
                          to={`/profile/${connection.id}`} // Assuming we have profile routes
                          className="px-3 py-1 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700"
                        >
                          View Profile
                        </Link>
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
