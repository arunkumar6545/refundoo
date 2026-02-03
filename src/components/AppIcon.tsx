import { motion } from 'framer-motion';

interface AppIconProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export function AppIcon({ size = 40, className = '', animated = false }: AppIconProps) {
  const icon = (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 128 128" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`iconGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1F2937" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>
      </defs>
      
      {/* Background Circle */}
      <circle cx="64" cy="64" r="60" fill={`url(#iconGradient-${size})`} className="dark:fill-gray-100"/>
      
      {/* Outer circular arrow (refund flow - top half) */}
      <motion.path 
        d="M 30 64 Q 30 30 64 30 Q 98 30 98 64" 
        stroke="#F9FAFB" 
        strokeWidth="6" 
        fill="none" 
        strokeLinecap="round"
        strokeLinejoin="round"
        className="dark:stroke-gray-900"
        animate={animated ? {
          pathLength: [0, 1],
          opacity: [0.5, 1]
        } : {}}
        transition={animated ? {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        } : {}}
      />
      
      {/* Return arrow pointing left */}
      <path 
        d="M 30 64 L 20 64 M 25 59 L 30 64 L 25 69" 
        stroke="#F9FAFB" 
        strokeWidth="6" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="dark:stroke-gray-900"
      />
      
      {/* Inner circular path (money flow back) */}
      <motion.path 
        d="M 64 40 Q 88 40 88 64 Q 88 88 64 88 Q 40 88 40 64 Q 40 50 50 45" 
        stroke="#F9FAFB" 
        strokeWidth="4" 
        fill="none" 
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="2 3"
        opacity="0.6"
        className="dark:stroke-gray-900"
        animate={animated ? {
          pathLength: [0, 1],
        } : {}}
        transition={animated ? {
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        } : {}}
      />
      
      {/* Small circles representing items being returned */}
      <motion.circle 
        cx="50" 
        cy="50" 
        r="4" 
        fill="#F9FAFB"
        className="dark:fill-gray-900"
        animate={animated ? {
          scale: [1, 1.3, 1],
          opacity: [0.6, 1, 0.6]
        } : {}}
        transition={animated ? {
          duration: 2,
          repeat: Infinity,
          delay: 0
        } : {}}
      />
      <motion.circle 
        cx="78" 
        cy="50" 
        r="4" 
        fill="#F9FAFB"
        className="dark:fill-gray-900"
        animate={animated ? {
          scale: [1, 1.3, 1],
          opacity: [0.6, 1, 0.6]
        } : {}}
        transition={animated ? {
          duration: 2,
          repeat: Infinity,
          delay: 0.3
        } : {}}
      />
      <motion.circle 
        cx="78" 
        cy="78" 
        r="4" 
        fill="#F9FAFB"
        className="dark:fill-gray-900"
        animate={animated ? {
          scale: [1, 1.3, 1],
          opacity: [0.6, 1, 0.6]
        } : {}}
        transition={animated ? {
          duration: 2,
          repeat: Infinity,
          delay: 0.6
        } : {}}
      />
    </svg>
  );

  if (animated) {
    return (
      <motion.div
        whileHover={{ rotate: 360, scale: 1.1 }}
        transition={{ duration: 0.6 }}
      >
        {icon}
      </motion.div>
    );
  }

  return icon;
}
