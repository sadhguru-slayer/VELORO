import React from 'react';
import { Outlet } from 'react-router-dom';

import { useMediaQuery } from 'react-responsive';
import FSider from '../../components/freelancer/FSider';
import FHeader from '../../components/freelancer/FHeader';

const FMessages = ({ userId, role }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });


  return (
    <div className="flex h-screen bg-gray-100">
      <FSider 
        userId={userId} 
        role={role} 
        collapsed={true}
      />
      
      <div className={`
        flex-1 flex flex-col overflow-hidden
        ${isMobile ? 'ml-0' : 'ml-14'}
      `}>
        <FHeader userId={userId} />
        
        <div className="flex-1 overflow-auto bg-gray-50">
          <Outlet context={{ userId, role,isMobile }} />
        </div>
      </div>
    </div>
  );
};

export default FMessages; 