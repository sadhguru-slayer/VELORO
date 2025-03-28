import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LeftSidebar from './components/LeftSidebar';
import MainContent from './components/MainContent';
import RightSidebar from './components/RightSidebar';
import { useOutletContext } from 'react-router-dom';

const Communities = () => {
  const { userId, role } = useOutletContext();
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  return (
    <div className="h-full flex overflow-x-hidden bg-gray-50">
      {/* Left Sidebar */}
      <AnimatePresence>
        {leftSidebarOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-80 border-r border-gray-200 bg-white flex flex-col fixed h-full z-10"
          >
            <LeftSidebar 
              isOpen={leftSidebarOpen} 
              setIsOpen={setLeftSidebarOpen} 
              userId={userId}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        animate={{ 
          marginLeft: leftSidebarOpen ? 320 : 0,
          width: `calc(100% - ${rightSidebarOpen ? 320 : 0}px)`
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-1 flex flex-col overflow-hidden bg-white"
      >
        <MainContent 
          toggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
          toggleRightSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
          leftSidebarOpen={leftSidebarOpen}
          rightSidebarOpen={rightSidebarOpen}
        />
      </motion.div>

      {/* Right Sidebar */}
      <AnimatePresence>
        {rightSidebarOpen && (
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-80 fixed right-0 h-full border-l border-gray-200 bg-white overflow-hidden"
            style={{ maxHeight: '100vh', zIndex: 10 }}
          >
            <RightSidebar 
              isOpen={rightSidebarOpen} 
              setIsOpen={setRightSidebarOpen}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Communities; 