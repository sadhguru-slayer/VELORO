import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { Outlet, useLocation } from 'react-router-dom';
import FHeader from '../freelancer/FHeader';
import FSider from '../freelancer/FSider';

const DashboardLayout = ({userId, role, isAuthenticated, isEditable}) => {
  console.log(userId, role, isAuthenticated, isEditable)
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const location = useLocation();
  
  // Extract component from URL pathname
  const getComponentFromPath = () => {
    const path = location.pathname.split('/').pop();
    const componentMap = {
      'projects': 'projects',
      'project-management': 'project-management',
      'earnings': 'earnings',
      'bidding-overview': 'bidding-overview',
      'project-status-overview': 'project-status-overview',
      'upcoming-events': 'upcoming-events',
      'freelancer-analytics': 'freelancer-analytics',
      'dashboard': 'freelancer-analytics'
    };
    return componentMap[path] || 'freelancer-analytics';
  };

  const [activeComponent, setActiveComponent] = useState(getComponentFromPath());

  // Update active component when URL changes
  useEffect(() => {
    setActiveComponent(getComponentFromPath());
  }, [location.pathname]);

  // Handler for sidebar menu clicks
  const handleMenuClick = (component) => {
    setActiveComponent(component);
  };

  return (
    <motion.div 
      className="flex h-screen bg-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
    <FSider 
    userId={userId}
    role={role}
    isAuthenticated={isAuthenticated}
    isEditable={isEditable}
    dropdown={true} 
    collapsed={true}
  />
      
      <div className={`flex-1 flex flex-col overflow-x-hidden ${
        isMobile ? 'ml-0 pb-16' : 'ml-14 sm:ml-14 md:ml-14 lg:ml-14'
      }`}>
        <FHeader />
        
        <div className="flex-1 overflow-auto bg-gray-200">
          <Outlet />
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardLayout; 