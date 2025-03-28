import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationSettings from './components/NotificationSettings';
import PermissionsSettings from './components/PermissionsSettings';
import AppearanceSettings from './components/AppearanceSettings';

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('notifications');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigationItems = [
    { id: 'notifications', label: 'Notification Settings', icon: '🔔' },
    { id: 'permissions', label: 'Permissions Management', icon: '🔒' },
    { id: 'appearance', label: 'Chat Appearance', icon: '🎨' },
  ];

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
    <div className="h-full flex overflow-x-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-80 bg-white/95 backdrop-blur-sm shadow-lg fixed h-full z-10 border-r border-gray-200/50"
          >
            <div className="p-6 border-b border-gray-200/50">
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            </div>
            <nav className="mt-4 px-3">
              {navigationItems.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 8 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full px-4 py-3 text-left flex items-center space-x-3 rounded-lg transition-all duration-200
                    ${activeSection === item.id 
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-gray-50/50 hover:shadow-sm'}`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        animate={{ 
          marginLeft: sidebarOpen ? 320 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-1 p-8 overflow-y-auto"
      >
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