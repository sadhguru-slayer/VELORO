const ThemePreview = ({ settings }) => {
  return (
    <div className={`border rounded-lg overflow-hidden ${
      settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className={`p-4 border-b ${
        settings.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h3 className={`font-medium ${
          settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Theme Preview
        </h3>
      </div>
      
      <div className="p-4">
        <div className={`space-y-4 ${
          settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}
        style={{ fontSize: `${settings.fontSize}px` }}
        >
          <p>This is how your messages will look.</p>
          <p className="bg-blue-100 text-blue-800 p-2 rounded">
            This is a highlighted message
          </p>
          <p>
            You can see the font size and theme changes here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThemePreview; 