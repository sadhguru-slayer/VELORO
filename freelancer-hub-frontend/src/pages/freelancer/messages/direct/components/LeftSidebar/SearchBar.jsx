import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';

const SearchBar = ({ value, onChange, placeholder }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 outline-none text-sm placeholder-gray-400"
      />
    </motion.div>
  );
};

export default SearchBar; 