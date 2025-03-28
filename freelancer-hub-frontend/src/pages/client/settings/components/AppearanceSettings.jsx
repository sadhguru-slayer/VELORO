import { useState } from 'react';
import ThemePreview from './ThemePreview';
import { motion } from 'framer-motion';

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
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Appearance</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Theme</h3>
              <div className="grid grid-cols-2 gap-4">
                {['light', 'dark'].map(theme => (
                  <motion.button
                    key={theme}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleThemeChange(theme)}
                    className={`p-6 rounded-xl border transition-all duration-200
                      ${settings.theme === theme 
                        ? 'bg-primary-50 border-primary-500 shadow-lg' 
                        : 'bg-white border-gray-200 hover:shadow-md'}`}
                  >
                    <div className="text-center">
                      <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${
                        theme === 'light' ? 'bg-gray-200' : 'bg-gray-800'
                      }`} />
                      <span className="text-sm font-medium text-gray-700">
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Font Size</h3>
              <div className="space-y-4">
                <input
                  type="range"
                  min="12"
                  max="20"
                  value={settings.fontSize}
                  onChange={handleFontSizeChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-sm"
                />
                <div className="text-sm text-gray-500">
                  Current: {settings.fontSize}px
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReset}
              className="w-full px-6 py-3 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
            >
              Reset to Defaults
            </motion.button>
          </div>
        </div>

        <div className="hidden lg:block">
          <ThemePreview settings={settings} />
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings; 