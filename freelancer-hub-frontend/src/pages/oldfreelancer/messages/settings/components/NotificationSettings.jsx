import { useState } from 'react';
import { motion } from 'framer-motion';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    desktopNotifications: true,
    messagePreviews: true,
    soundEnabled: true,
    dmNotifications: true,
    groupNotifications: true,
    communityNotifications: true,
  });

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-bold mb-8 text-gray-900">Notification Settings</h2>
      
      <div className="space-y-6">
        {Object.entries(settings).map(([key, value]) => (
          <motion.div 
            key={key}
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between p-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50"
          >
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
              
                {key.split(/(?=[A-Z])/)
                    .join(' ')
                    .replace(/\b\w/g, char => char.toUpperCase())}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {`Enable or disable ${key.split(/(?=[A-Z])/).join(' ').toLowerCase()}`}
              </p>
            </div>
            <button
              onClick={() => handleToggle(key)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200
                ${value ? 'bg-violet-500' : 'bg-gray-200'}`}
            >
              <motion.span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-md`}
                initial={false}
                animate={{
                  x: value ? '1.5rem' : '0.25rem',
                  scale: 1
                }}
                whileHover={{
                  scale: value ? 0.9 : 1.1
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NotificationSettings; 