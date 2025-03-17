import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaChartBar, FaFlag, FaBan } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';

const RightSidebar = ({ isOpen, setIsOpen }) => {
  const members = [
    { id: 1, name: 'John Doe', role: 'Admin', avatar: 'https://ui-avatars.com/api/?name=John+Doe' },
    { id: 2, name: 'Jane Smith', role: 'Contributor', avatar: 'https://ui-avatars.com/api/?name=Jane+Smith' },
  ];

  // Dummy data for the chart
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Active Members',
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 300 }}
          animate={{ x: 0 }}
          exit={{ x: 300 }}
          className="w-80 border-l border-gray-200 bg-white flex flex-col"
        >
          {/* Member Directory */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Members</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-3 py-1 text-sm rounded-lg bg-gray-100 focus:bg-white focus:ring-2 focus:ring-teal-500 border-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              {members.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <FaFlag className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <FaBan className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Analytics</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Line data={chartData} options={{ responsive: true }} />
            </div>
          </div>

          {/* Reporting Tools */}
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Moderation</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                <FaFlag />
                <span>Report Issue</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RightSidebar; 