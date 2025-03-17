import { RiNotification3Line, RiLockLine, RiPaintLine } from 'react-icons/ri';

const SettingsSidebar = ({ activeSection, onSectionChange }) => {
  const navItems = [
    {
      id: 'notifications',
      label: 'Notification Settings',
      icon: RiNotification3Line,
    },
    {
      id: 'permissions',
      label: 'Permissions Management',
      icon: RiLockLine,
    },
    {
      id: 'appearance',
      label: 'Chat Appearance',
      icon: RiPaintLine,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4">
      <h2 className="text-xl font-semibold mb-6">Settings</h2>
      <nav>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 ${
              activeSection === item.id
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-50'
            }`}
          >
            <item.icon className="text-xl" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default SettingsSidebar; 