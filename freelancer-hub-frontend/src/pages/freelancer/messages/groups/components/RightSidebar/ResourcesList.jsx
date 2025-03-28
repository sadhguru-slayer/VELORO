import React from 'react';
import { FaGoogle, FaFigma, FaFile } from 'react-icons/fa';

const ResourcesList = ({ resources = [] }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'google':
        return <FaGoogle className="w-5 h-5 text-red-500" />;
      case 'figma':
        return <FaFigma className="w-5 h-5 text-purple-500" />;
      default:
        return <FaFile className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold mb-3">Shared Resources</h3>
      <div className="space-y-2">
        {resources.map(resource => (
          <div
            key={resource.id}
            className="p-3 bg-gray-50 rounded-lg flex items-center space-x-3"
          >
            {getIcon(resource.type)}
            <span className="text-sm text-gray-700 flex-1 truncate">
              {resource.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourcesList; 