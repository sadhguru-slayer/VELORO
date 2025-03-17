const SettingsToggle = ({ label, value, onChange, tooltip }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex flex-col">
        <label className="font-medium">{label}</label>
        {tooltip && (
          <span className="text-sm text-gray-500">{tooltip}</span>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
          value ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

export default SettingsToggle; 