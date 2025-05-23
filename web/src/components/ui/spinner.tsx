'use client';

import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export function Spinner({ 
  size = 'md', 
  color = 'currentColor', 
  className = '' 
}: SpinnerProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const sizeClass = sizeMap[size];

  return (
    <div className={`inline-block animate-spin ${sizeClass} ${className}`} role="status">
      <svg 
        className={`${sizeClass}`}
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke={color} 
          strokeWidth="4"
        ></circle>
        <path 
          className="opacity-75" 
          fill={color} 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/25 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" role="alertdialog" aria-busy="true">
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-xl flex flex-col items-center gap-3">
        <Spinner size="lg" className="text-primary" />
        <p className="text-neutral-600 dark:text-neutral-300 font-medium">Loading...</p>
      </div>
    </div>
  );
}
