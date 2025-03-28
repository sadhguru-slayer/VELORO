import { RiNotification3Line, RiLockLine, RiPaintLine } from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';
const SettingsSidebar = ({ sidebarOpen, activeSection, onSectionChange }) => {
  // const navItems = [
  //   {
  //     id: 'notifications',
  //     label: 'Notification Settings',
  //     icon: RiNotification3Line,
  //   },
  //   {
  //     id: 'permissions',
  //     label: 'Permissions Management',
  //     icon: RiLockLine,
  //   },
  //   {
  //     id: 'appearance',
  //     label: 'Chat Appearance',
  //     icon: RiPaintLine,
  //   },
  // ];

  const navItems = [
    { id: 'notifications', label: 'Notification Settings', icon: '🔔' },
    { id: 'permissions', label: 'Permissions Management', icon: '🔒' },
    { id: 'appearance', label: 'Chat Appearance', icon: '🎨' },
  ];

  return (
    <AnimatePresence>
    {sidebarOpen && (
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        exit={{ x: -320 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-80 bg-white shadow-md fixed h-[calc(100vh-64px)] z-10"
      >
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
        </div>
        <nav className="mt-4">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              onClick={() => onSectionChange(item.id)}
              className={`w-full px-4 py-3 text-left flex items-center space-x-3 
                ${activeSection === item.id 
                  ? 'bg-teal-100 text-teal-600 border-r-4 border-teal-600' 
                  : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </motion.button>
          ))}
        </nav>
      </motion.div>
    )}
  </AnimatePresence>
  );
};

export default SettingsSidebar; 