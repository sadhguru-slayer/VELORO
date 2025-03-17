import { useState } from 'react';
import NotificationSettings from './components/NotificationSettings';
import PermissionsSettings from './components/PermissionsSettings';
import AppearanceSettings from './components/AppearanceSettings';

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('notifications');

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
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
        </div>
        <nav className="mt-4">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full px-4 py-3 text-left flex items-center space-x-3 
                ${activeSection === item.id 
                  ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default SettingsPage; 