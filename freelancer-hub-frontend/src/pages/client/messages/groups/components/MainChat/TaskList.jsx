import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTimes } from 'react-icons/fa';

const TaskList = ({ groupId, onCreateTask, onUpdateTask, onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  const handleAddTask = () => {
    if (newTask.trim()) {
      const task = {
        id: crypto.randomUUID(),
        text: newTask,
        completed: false,
        assignedTo: null,
        dueDate: null
      };
      setTasks([...tasks, task]);
      onCreateTask(task);
      setNewTask('');
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Task Management</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <FaTimes className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center p-2 bg-white rounded-lg shadow-sm">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onUpdateTask(task.id, { completed: !task.completed })}
              className="mr-3"
            />
            <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {task.text}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add new task..."
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          onClick={handleAddTask}
          className="ml-2 p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
        >
          <FaPlus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TaskList; 