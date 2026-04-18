'use client';

import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

const sizeStyles = {
  sm: 'w-6 h-6',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

export default function Spinner({ size = 'md', message, fullScreen = false }: SpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizeStyles[size]} border-4 border-slate-200 dark:border-gray-700 border-t-teal-600 dark:border-t-teal-400 rounded-full animate-spin`} />
      {message && <p className="text-slate-600 dark:text-slate-400 font-medium">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}
