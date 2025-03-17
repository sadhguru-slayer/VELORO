import { useState } from 'react';
import ThemePreview from './ThemePreview';

const AppearanceSettings = () => {
  const [settings, setSettings] = useState({
    theme: 'light',
    fontSize: 16,
  });

  const handleThemeChange = (theme) => {
    setSettings(prev => ({ ...prev, theme }));
  };

  const handleFontSizeChange = (e) => {
    setSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) }));
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset to default settings?')) {
      setSettings({ theme: 'light', fontSize: 16 });
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex space-x-8">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-6">Appearance Settings</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Theme</h3>
              <div className="flex space-x-4">
                {['light', 'dark'].map(theme => (
                  <button
                    key={theme}
                    onClick={() => handleThemeChange(theme)}
                    className={`px-4 py-2 rounded-md 
                      ${settings.theme === theme 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-800'}`}
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Font Size</h3>
              <input
                type="range"
                min="12"
                max="20"
                value={settings.fontSize}
                onChange={handleFontSizeChange}
                className="w-full"
              />
              <div className="text-sm text-gray-500 mt-1">
                {settings.fontSize}px
              </div>
            </div>

            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
            >
              Reset to Defaults
            </button>
          </div>
        </div>

        <div className="flex-1">
          <ThemePreview settings={settings} />
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings; 