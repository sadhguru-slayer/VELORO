// LoadingComponent.jsx
import React from 'react';
import { motion } from 'framer-motion';

const LoadingComponent = ({ variant = 'dashboard',role='freelancer' }) => {
  const isFreelancer = role === 'freelancer';
  
  const baseColor = isFreelancer ? 'violet' : 'teal';
  
  const shimmer = {
    hidden: { x: '-100%' },
    visible: { 
      x: '100%',
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: 'linear'
      }
    }
  };

  const DashboardSkeleton = () => (
    <div className="w-full h-full p-4 space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className={`h-10 w-48 bg-${baseColor}-200 rounded-lg overflow-hidden relative`}>
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r from-transparent via-${baseColor}-100 to-transparent`}
            variants={shimmer}
            initial="hidden"
            animate="visible"
          />
        </div>
        <div className="flex space-x-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-10 w-10 bg-${baseColor}-200 rounded-full overflow-hidden relative`}>
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r from-transparent via-${baseColor}-100 to-transparent`}
                variants={shimmer}
                initial="hidden"
                animate="visible"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={`p-4 bg-${baseColor}-50 rounded-lg space-y-3`}>
            <div className={`h-4 w-3/4 bg-${baseColor}-200 rounded overflow-hidden relative`}>
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r from-transparent via-${baseColor}-100 to-transparent`}
                variants={shimmer}
                initial="hidden"
                animate="visible"
              />
            </div>
            <div className={`h-20 bg-${baseColor}-200 rounded overflow-hidden relative`}>
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r from-transparent via-${baseColor}-100 to-transparent`}
                variants={shimmer}
                initial="hidden"
                animate="visible"
              />
            </div>
            <div className="flex justify-between items-center">
              <div className={`h-4 w-1/4 bg-${baseColor}-200 rounded overflow-hidden relative`}>
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r from-transparent via-${baseColor}-100 to-transparent`}
                  variants={shimmer}
                  initial="hidden"
                  animate="visible"
                />
              </div>
              <div className={`h-4 w-1/4 bg-${baseColor}-200 rounded overflow-hidden relative`}>
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r from-transparent via-${baseColor}-100 to-transparent`}
                  variants={shimmer}
                  initial="hidden"
                  animate="visible"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ChatSkeleton = () => (
    <div className="w-full h-full p-4 space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[70%] p-3 ${i % 2 === 0 ? 'bg-${baseColor}-50' : 'bg-gray-50'} rounded-lg space-y-2`}>
            <div className={`h-4 w-32 bg-${baseColor}-200 rounded overflow-hidden relative`}>
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r from-transparent via-${baseColor}-100 to-transparent`}
                variants={shimmer}
                initial="hidden"
                animate="visible"
              />
            </div>
            <div className={`h-16 w-full bg-${baseColor}-200 rounded overflow-hidden relative`}>
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r from-transparent via-${baseColor}-100 to-transparent`}
                variants={shimmer}
                initial="hidden"
                animate="visible"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen">
      {variant === 'dashboard' ? <DashboardSkeleton /> : <ChatSkeleton />}
    </div>
  );
};

export default LoadingComponent;