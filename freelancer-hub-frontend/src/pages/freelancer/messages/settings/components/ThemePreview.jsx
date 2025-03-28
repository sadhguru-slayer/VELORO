const ThemePreview = ({ settings }) => {
  return (
    <div className={`rounded-2xl overflow-hidden shadow-lg ${
      settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className={`p-6 border-b ${
        settings.theme === 'dark' ? 'border-gray-700' : 'border-gray-200/50'
      }`}>
        <h3 className={`text-xl font-semibold ${
          settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Theme Preview
        </h3>
      </div>
      
      <div className="p-6">
        <div className={`space-y-4 ${
          settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}
        style={{ fontSize: `${settings.fontSize}px` }}
        >
          <p>This is how your messages will look.</p>
          <div className={`p-4 rounded-xl ${
            settings.theme === 'dark' ? 'bg-gray-700' : 'bg-primary-50'
          }`}>
            <p className={settings.theme === 'dark' ? 'text-primary-200' : 'text-primary-600'}>
              This is a highlighted message
            </p>
          </div>
          <p>
            You can see the font size and theme changes here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThemePreview; 