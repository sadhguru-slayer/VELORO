import React, { useState, useEffect } from 'react';
import FHeader from '../../components/freelancer/FHeader';
import FSider from '../../components/freelancer/FSider';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { BiddingOverview, Notifications, ProjectManagementPage, ProjectStatusOverview, UpcomingEvents, WeeklyBiddingActivity } from './dashboard';
import IndividualLoadingComponent from '../../components/IndividualLoadingComponent';
import Earnings from './dashboard/Earnings';

const FDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeComponent, setActiveComponent] = useState('projects');
  const [activeProfileComponent, setActiveProfileComponent] = useState('view_profile');
  const [individualLoading, setIndividualLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentState = location.state?.component;
    const currentProfileState = location.state?.profileComponent;
    if (currentState) {
      setActiveComponent(currentState);
    }else{
setActiveComponent('projects')
    }
    
    if(currentProfileState){
      setActiveProfileComponent(currentProfileState);
    }
    else {
      setActiveProfileComponent(currentProfileState)
    }
    setLoading(false);
  }, [location.state]);

  const handleMenuClick = (component) => {
    if (location.pathname !== '/freelancer/dashboard') {
      navigate('/freelancer/dashboard', { state: { component } });
    } else {
      setActiveComponent(component);
    }

    setIndividualLoading(true);

    setTimeout(() => {
      setIndividualLoading(false);
    }, 500);
  };

  const handleProfileMenu = (profileComponent) => {
    if (location.pathname !== '/freelancer/profile') {
      navigate('/freelancer/profile', { state: { profileComponent } });
    }
    else{
      setActiveProfileComponent(profileComponent);
    }

    setIndividualLoading(true);

    setTimeout(()=>{
      setIndividualLoading(false);
    },500);
  };

  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <FSider dropdown={true} collapsed={true} handleMenuClick={handleMenuClick} abcds={activeComponent} activeProfileComponent={activeComponent} handleProfileMenu={handleProfileMenu}/>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-x-hidden 
  ml-14 sm:ml-16 md:ml-16 lg:ml-24">  
  {/* Header */}
        <FHeader />
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gray-200 p-2">
        

          {/* Content Section */}
          {loading ? (
            <div>Loading...</div>
          ) : individualLoading ? (
            <IndividualLoadingComponent />
          ) : (
            <>
              {activeComponent === 'projects' && <ProjectManagementPage />}
              {activeComponent === 'earnings' && <Earnings />}
              {activeComponent === 'bidding-overview' && <BiddingOverview />}
              {/*{activeComponent === 'notifications' && <Notifications />}*/}
              {activeComponent === 'project-status-overview' && <ProjectStatusOverview />}
              {activeComponent === 'upcoming-events' && <UpcomingEvents />}
              {activeComponent === 'weekly-bidding-activity' && <WeeklyBiddingActivity />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FDashboard;
