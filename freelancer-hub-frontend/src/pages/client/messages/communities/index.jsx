import React from 'react';
import LeftSidebar from './components/LeftSidebar';
import MainContent from './components/MainContent';
import RightSidebar from './components/RightSidebar';
import { useOutletContext } from 'react-router-dom';

const Communities = () => {
  const { userId, role } = useOutletContext();
  const [leftSidebarOpen, setLeftSidebarOpen] = React.useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = React.useState(true);

  return (
    <div className="h-full flex overflow-hidden bg-gray-50">
      <LeftSidebar 
        isOpen={leftSidebarOpen} 
        setIsOpen={setLeftSidebarOpen} 
        userId={userId}
      />
      
      <MainContent 
        toggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
        toggleRightSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
      />
      
      <RightSidebar 
        isOpen={rightSidebarOpen} 
        setIsOpen={setRightSidebarOpen}
      />
    </div>
  );
};

export default Communities; 