import React from 'react';
import { format } from 'date-fns';
import { FaCalendarAlt } from 'react-icons/fa';

const MeetingInfo = ({ meeting }) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <h3 className="text-sm font-semibold mb-3 flex items-center space-x-2">
        <FaCalendarAlt className="w-4 h-4 text-teal-500" />
        <span>Upcoming Meeting</span>
      </h3>
      <div className="space-y-2">
        <div className="p-3 bg-teal-50 rounded-lg">
          <h4 className="font-medium text-gray-800">{meeting.title}</h4>
          <p className="text-sm text-gray-600 mt-1">
            {format(new Date(meeting.dateTime), 'MMM d, yyyy h:mm a')}
          </p>
          <p className="text-sm text-gray-600 mt-2">{meeting.description}</p>
        </div>
      </div>
    </div>
  );
};

export default MeetingInfo; 