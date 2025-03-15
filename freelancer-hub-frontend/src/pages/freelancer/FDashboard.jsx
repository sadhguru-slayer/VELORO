import React, { useState, useEffect, Suspense } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';

import FHeader from '../../components/freelancer/FHeader';
import FSider from '../../components/freelancer/FSider';
import ErrorBoundary from '../../components/ErrorBoundary';
import LoadingComponent from '../../components/LoadingComponent';

import { BiddingOverview, Notifications, ProjectManagementPage, ProjectStatusOverview, UpcomingEvents } from './dashboard';
import FreelancerAnalyticsPage from './dashboard/FreelancerAnalyticsPage';
import Earnings from './dashboard/Earnings';

// File upload constants based on Starter Tier
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const FDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const [state, setState] = useState({
    activeComponent: 'freelancer-analytics',
    activeProfileComponent: 'view_profile',
    loading: true,
    individualLoading: false,
    error: null
  });

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const currentState = location.state?.component;
        const currentProfileState = location.state?.profileComponent;
        
        setState(prev => ({
          ...prev,
          activeComponent: currentState || 'freelancer-analytics',
          activeProfileComponent: currentProfileState || prev.activeProfileComponent,
          loading: false
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Failed to initialize dashboard',
          loading: false
        }));
        toast.error('Failed to load dashboard. Please try again.');
      }
    };

    initializeDashboard();
  }, [location.state]);

  const validateFile = (file) => {
    if (!file) return false;
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds 10MB limit');
      return false;
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Please upload images, PDFs, or Word documents.');
      return false;
    }
    return true;
  };

  const handleMenuClick = async (component) => {
    try {
      setState(prev => ({ ...prev, individualLoading: true }));
      
      if (location.pathname !== '/freelancer/dashboard') {
        navigate('/freelancer/dashboard', { state: { component } });
      } else {
        setState(prev => ({ ...prev, activeComponent: component }));
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setState(prev => ({ ...prev, individualLoading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message, individualLoading: false }));
      toast.error('Failed to switch components. Please try again.');
    }
  };

  const handleProfileMenu = async (profileComponent) => {
    try {
      setState(prev => ({ ...prev, individualLoading: true }));
      
      if (location.pathname !== '/freelancer/profile') {
        navigate('/freelancer/profile', { state: { profileComponent } });
      } else {
        setState(prev => ({ ...prev, activeProfileComponent: profileComponent }));
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setState(prev => ({ ...prev, individualLoading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message, individualLoading: false }));
      toast.error('Failed to switch profile view. Please try again.');
    }
  };

  const renderComponent = () => {
    const components = {
      'projects': ProjectManagementPage,
      'earnings': Earnings,
      'bidding-overview': BiddingOverview,
      'project-status-overview': ProjectStatusOverview,
      'upcoming-events': UpcomingEvents,
      'freelancer-analytics': FreelancerAnalyticsPage
    };

    const Component = components[state.activeComponent];
    if (!Component) return null;

    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingComponent variant="dashboard" role="freelancer" className="bg-violet-200 animate-pulse" />}>
          <Component />
        </Suspense>
      </ErrorBoundary>
    );
  };

  return (
    <motion.div 
      className="flex h-screen bg-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <FSider 
        dropdown={true} 
        collapsed={true} 
        handleMenuClick={handleMenuClick} 
        abcds={state.activeComponent}
        activeProfileComponent={state.activeComponent}
        handleProfileMenu={handleProfileMenu}
      />
      
      <div className={`flex-1 flex flex-col overflow-x-hidden ${
        isMobile ? 'ml-0 pb-16' : 'ml-14 sm:ml-14 md:ml-14 lg:ml-14'
      }`}>
        <FHeader />
        
        <div className="flex-1 overflow-auto bg-gray-200 p-2">
          {state.loading ? (
            <LoadingComponent variant="dashboard" role="freelancer" className="bg-violet-200 animate-pulse" />
          ) : state.individualLoading ? (
            <LoadingComponent variant="dashboard" role="freelancer" className="bg-violet-200 animate-pulse" />
          ) : (
            renderComponent()
          )}
        </div>
      </div>

      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </motion.div>
  );
};

export default FDashboard;
