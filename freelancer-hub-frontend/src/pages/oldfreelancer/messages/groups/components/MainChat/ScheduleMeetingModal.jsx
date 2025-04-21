import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import Datepicker from 'tailwind-datepicker-react';
import { TimePicker } from 'tailwind-datepicker-react';

const ScheduleMeetingModal = ({ 
  isOpen, 
  onClose, 
  onSchedule,
  groupId
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [description, setDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Combine date and time
    const dateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes()
    );

    const meeting = {
      id: crypto.randomUUID(),
      title,
      dateTime,
      description,
      groupId,
      isPinned: true
    };
    onSchedule(meeting);
    onClose();
  };

  const datePickerOptions = {
    title: 'Select Date',
    autoHide: true,
    todayBtn: true,
    clearBtn: true,
    minDate: new Date(),
    theme: {
      background: 'bg-white',
      todayBtn: 'bg-violet-500 hover:bg-violet-600',
      clearBtn: 'bg-gray-300 hover:bg-gray-400',
      icons: 'text-gray-600',
      text: 'text-gray-800',
      disabledText: 'text-gray-400',
      input: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent',
      inputIcon: 'text-gray-600',
      selected: 'bg-violet-500 text-white'
    }
  };

  const renderTimePicker = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    return (
      <div className="flex space-x-2">
        <select
          value={time.getHours()}
          onChange={(e) => setTime(new Date(
            time.getFullYear(),
            time.getMonth(),
            time.getDate(),
            e.target.value,
            time.getMinutes()
          ))}
          className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        >
          {hours.map(hour => (
            <option key={hour} value={hour}>
              {String(hour).padStart(2, '0')}
            </option>
          ))}
        </select>
        <select
          value={time.getMinutes()}
          onChange={(e) => setTime(new Date(
            time.getFullYear(),
            time.getMonth(),
            time.getDate(),
            time.getHours(),
            e.target.value
          ))}
          className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        >
          {minutes.map(minute => (
            <option key={minute} value={minute}>
              {String(minute).padStart(2, '0')}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-lg w-full max-w-md"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Schedule Meeting</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <Datepicker
                    options={datePickerOptions}
                    onChange={setDate}
                    show={showDatePicker}
                    setShow={setShowDatePicker}
                    classNames="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  {renderTimePicker()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 rounded-lg"
                >
                  Schedule Meeting
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScheduleMeetingModal; 