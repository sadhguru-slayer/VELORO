import { useState } from 'react';
import SettingsToggle from '../common/SettingsToggle';
import SettingsSlider from '../common/SettingsSlider';
import ThemePreview from '../common/ThemePreview';

const ChatAppearance = () => {
  const [settings, setSettings] = useState({
    theme: 'light',
    fontSize: 16,
  });

  const handleReset = () => {
    const confirmReset = window.confirm(
      'Are you sure you want to reset to default settings?'
    );
    if (confirmReset) {
      setSettings({
        theme: 'light',
        fontSize: 16,
      });
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Chat Appearance</h1>
      
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Theme</h3>
            <SettingsToggle
              label="Dark Mode"
              value={settings.theme === 'dark'}
              onChange={(checked) =>
                setSettings({ ...settings, theme: checked ? 'dark' : 'light' })
              }
              tooltip="Dark mode reduces eye strain in low-light conditions"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Font Size</h3>
            <SettingsSlider
              value={settings.fontSize}
              min={12}
              max={20}
              onChange={(value) =>
                setSettings({ ...settings, fontSize: value })
              }
              tooltip="Adjust the size of chat messages and UI elements"
            />
          </div>

          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reset to Defaults
          </button>
        </div>

        <ThemePreview settings={settings} />
      </div>
    </div>
  );
};

export default ChatAppearance; 