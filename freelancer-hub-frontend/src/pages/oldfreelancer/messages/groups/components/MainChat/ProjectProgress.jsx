import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const ProjectProgress = ({ groupId, onClose }) => {
  const progress = 65; // TODO: Calculate actual progress

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Project Progress</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <FaTimes className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="flex items-center justify-center">
        <div style={{ width: 100, height: 100 }}>
          <CircularProgressbar
            value={progress}
            text={`${progress}%`}
            styles={{
              path: { stroke: `#14b8a6` },
              text: { fill: '#14b8a6', fontSize: '24px' }
            }}
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between">
          <span>Completed Tasks</span>
          <span>12/20</span>
        </div>
        <div className="flex justify-between">
          <span>Active Members</span>
          <span>5/8</span>
        </div>
        <div className="flex justify-between">
          <span>Days Remaining</span>
          <span>15</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectProgress; 