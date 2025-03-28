import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationSettings from './components/NotificationSettings';
import PermissionsSettings from './components/PermissionsSettings';
import AppearanceSettings from './components/AppearanceSettings';
import SettingsSidebar from './components/SettingsSidebar';
import { RiMenuLine } from 'react-icons/ri';

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('notifications');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeSection) {
      case 'notifications':
        return <NotificationSettings />;
      case 'permissions':
        
        return <PermissionsSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      default:
        return <NotificationSettings />;
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left Sidebar */}
      <SettingsSidebar 
        sidebarOpen={sidebarOpen} 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <motion.div
        animate={{ 
          marginLeft: sidebarOpen ? 320 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-1 p-8 overflow-y-auto"
      >
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-24 left-4 p-2 bg-teal-500 rounded-lg shadow-lg z-20"
          >
            <RiMenuLine className="w-5 h-5 text-white" />
          </button>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-200/50"
        >
          {renderContent()}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SettingsPage; 