import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { Outlet, useLocation } from 'react-router-dom';
import CHeader from '../client/CHeader';
import CSider from '../client/CSider';

const ClientDashboardLayout = ({ userId }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const location = useLocation();
  
  // Extract component from URL pathname
  const getComponentFromPath = () => {
    const path = location.pathname.split('/').pop();
    const componentMap = {
      'overview': 'overview',
      'projects': 'projects',
      'recent_activity': 'recent_activity',
      'spendings': 'spendings',
      'upcoming-events': 'upcoming-events',
      'dashboard': 'overview' // Default for base dashboard URL
    };
    return componentMap[path] || 'overview';
  };

  const [activeComponent, setActiveComponent] = useState(getComponentFromPath());
  const [activeProfileComponent, setActiveProfileComponent] = useState('view_profile');

  // Update active component when URL changes
  useEffect(() => {
    setActiveComponent(getComponentFromPath());
  }, [location.pathname]);
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <CSider  
        userId={userId} 
        dropdown={true} 
        collapsed={true} 
        abcds={activeComponent} 
        activeProfileComponent={activeProfileComponent}
      />
      
      {/* Main Content Area */}
      <div className={`
        bg-gray-100 flex-1 flex flex-col overflow-x-hidden
        ${isMobile ? 'ml-0 pb-16' : 'ml-14'}
      `}>
        {/* Header */}
        <CHeader userId={userId}/>
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ClientDashboardLayout; 