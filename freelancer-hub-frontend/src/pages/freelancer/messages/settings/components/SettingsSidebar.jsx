import { RiNotification3Line, RiLockLine, RiPaintBrushLine, RiMenuLine } from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';

const SettingsSidebar = ({ sidebarOpen, activeSection, onSectionChange, onToggleSidebar }) => {
  const navItems = [
    { 
      id: 'notifications', 
      label: 'Notification Settings', 
      icon: <RiNotification3Line className="w-5 h-5" />
    },
    { 
      id: 'permissions', 
      label: 'Permissions Management', 
      icon: <RiLockLine className="w-5 h-5" />
    },
    { 
      id: 'appearance', 
      label: 'Chat Appearance', 
      icon: <RiPaintBrushLine className="w-5 h-5" />
    },
  ];

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.div
          initial={{ x: -320 }}
          animate={{ x: 0 }}
          exit={{ x: -320 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-80 bg-white/95 backdrop-blur-sm shadow-lg fixed h-[calc(100vh-64px)] z-10 border-r border-gray-200/50"
        >
          <div className="p-6 border-b border-gray-200/50 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            {isMobile && (
            <button
              onClick={onToggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <RiMenuLine className="w-5 h-5 text-gray-500" />
            </button>
      )}
          </div>
          <nav className="mt-4 px-3">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ x: 8 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSectionChange(item.id)}
                className={`w-full px-4 py-3 text-left flex items-center space-x-3 rounded-lg transition-all duration-200 mb-2
                  ${activeSection === item.id 
                    ? 'bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-violet-50 hover:shadow-sm'}`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            ))}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsSidebar; 