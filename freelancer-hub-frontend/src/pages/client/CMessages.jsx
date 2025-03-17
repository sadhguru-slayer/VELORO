import React from 'react';
import { Outlet } from 'react-router-dom';
import CHeader from '../../components/client/CHeader';
import CSider from '../../components/client/CSider';
import { useMediaQuery } from 'react-responsive';

const CMessages = ({ userId, role }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });


  return (
    <div className="flex h-screen bg-gray-100">
      <CSider 
        userId={userId} 
        role={role} 
        collapsed={true}
      />
      
      <div className={`
        flex-1 flex flex-col overflow-hidden
        ${isMobile ? 'ml-0 pb-16' : 'ml-14'}
      `}>
        <CHeader userId={userId} />
        
        <div className="flex-1 overflow-auto bg-gray-50">
          <Outlet context={{ userId, role }} />
        </div>
      </div>
    </div>
  );
};

export default CMessages; 