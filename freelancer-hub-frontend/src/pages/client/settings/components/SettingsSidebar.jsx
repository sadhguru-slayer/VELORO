import { RiNotification3Line, RiLockLine, RiPaintBrushLine } from 'react-icons/ri';

const SettingsSidebar = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    {
      id: 'notifications',
      label: 'Notification Settings',
      icon: <RiNotification3Line />,
    },
    {
      id: 'permissions',
      label: 'Permissions Management',
      icon: <RiLockLine />,
    },
    {
      id: 'appearance',
      label: 'Chat Appearance',
      icon: <RiPaintBrushLine />,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4">
      <h2 className="text-xl font-semibold mb-6">Settings</h2>
      <nav>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 ${
              activeSection === item.id
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-50'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default SettingsSidebar; 