import { useState } from 'react';

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
      <h2 className="text-2xl font-bold mb-6">Notification Settings</h2>
      
      <div className="space-y-6">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {key.split(/(?=[A-Z])/).join(' ')}
              </h3>
              <p className="text-sm text-gray-500">
                {`Enable or disable ${key.split(/(?=[A-Z])/).join(' ').toLowerCase()}`}
              </p>
            </div>
            <button
              onClick={() => handleToggle(key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full
                ${value ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition
                  ${value ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationSettings; 