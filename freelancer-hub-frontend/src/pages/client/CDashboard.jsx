import React, { useState, useEffect } from 'react';
import CHeader from '../../components/client/CHeader';
import CSider from '../../components/client/CSider';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';

import { BiddingOverview, Notifications, ProjectManagementPage, ProjectStatusOverview, UpcomingEvents, WeeklyBiddingActivity } from '../freelancer/dashboard';
import IndividualLoadingComponent from '../../components/IndividualLoadingComponent';
import DashboardOverview from './dashboard/DashboardOverview';
import RecentActivity from './dashboard/RecentActivity';
import Spendings from './dashboard/Spendings';
import PostedProjects from './dashboard/PostedProjects';

const CDashboard = ({ userId, role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  
  const [activeComponent, setActiveComponent] = useState('overview');
  const [activeProfileComponent, setActiveProfileComponent] = useState('');
  
  const [individualLoading, setIndividualLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentState = location.state?.component;
    if (currentState) {
      setActiveComponent(currentState);
    } else {
      // Default to 'overview' if no component is passed via state
      setActiveComponent('overview');
    }
    setLoading(false);
  }, [location.state]);

  const handleProfileMenu = (profileComponent) => {
    if (location.pathname !== '/client/profile') {
      navigate(`/client/profile/${userId}`, { state: { profileComponent } });
    } else {
      setActiveProfileComponent(profileComponent);
    }

    setIndividualLoading(true);

    setTimeout(() => {
      setIndividualLoading(false);
    }, 500);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <CSider  
        userId={userId} 
        role={role} 
        dropdown={true} 
        collapsed={true} 
        abcds={activeComponent} 
        handleProfileMenu={handleProfileMenu} 
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
          {/* Content Section */}
          {loading ? (
            <div>Loading...</div>
          ) : individualLoading ? (
            <IndividualLoadingComponent role={'client'}/>
          ) : (
            <>
              {activeComponent === 'projects' && <PostedProjects />}
              {activeComponent === 'overview' && <DashboardOverview />}
              {/*{activeComponent === 'notifications' && <Notifications />}*/}
              {activeComponent === 'recent_activity' && <RecentActivity />}
              {activeComponent === 'spendings' && <Spendings />}
              {activeComponent === 'upcoming-events' && <UpcomingEvents />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CDashboard;