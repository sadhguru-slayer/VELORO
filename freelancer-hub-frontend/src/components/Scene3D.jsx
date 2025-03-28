import React, { useRef, useEffect } from 'react';
import { motion, useTransform } from 'framer-motion';

const Scene3D = ({ mouseX, mouseY }) => {
  const sceneRef = useRef(null);
  
  // Transform values based on mouse position
  const rotateX = useTransform(mouseY, [0, 1], [5, -5]);
  const rotateY = useTransform(mouseX, [0, 1], [-5, 5]);
  
  // Create particles for the 3D effect
  const particles = Array.from({ length: 30 }, (_, i) => {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const z = Math.random() * 100 - 50;
    const size = Math.random() * 10 + 2;
    const opacity = Math.random() * 0.5 + 0.1;
    
    return { x, y, z, size, opacity, key: i };
  });

  return (
    <motion.div 
      ref={sceneRef}
      className="w-full h-full perspective-1000"
      style={{ 
        transformStyle: "preserve-3d",
        rotateX,
        rotateY
      }}
    >
      {particles.map(particle => (
        <motion.div
          key={particle.key}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            backgroundColor: 
              particle.key % 3 === 0 ? 'rgba(124, 58, 237, 0.6)' : 
              particle.key % 3 === 1 ? 'rgba(14, 165, 233, 0.6)' : 
              'rgba(20, 184, 166, 0.6)',
            transformStyle: "preserve-3d",
            translateZ: particle.z,
            filter: "blur(1px)",
            boxShadow: `0 0 ${particle.size * 2}px rgba(124, 58, 237, 0.3)`,
            animation: `float-${particle.key} ${3 + particle.key % 5}s ease-in-out infinite alternate`
          }}
          animate={{
            y: [0, particle.key % 2 ? 10 : -10, 0],
            x: [0, particle.key % 2 ? -5 : 5, 0],
          }}
          transition={{
            duration: 4 + particle.key % 3,
            repeat: Infinity,
            repeatType: "mirror"
          }}
        />
      ))}
    </motion.div>
  );
};

export default Scene3D;