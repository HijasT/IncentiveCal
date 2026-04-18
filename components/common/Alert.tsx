'use client';

import React, { ReactNode } from 'react';

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  type?: AlertType;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

const alertStyles = {
  info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
  success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
  warning: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
  error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
};

const icons = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
};

export default function Alert({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
}: AlertProps) {
  return (
    <div className={`border rounded-lg p-4 flex gap-3 ${alertStyles[type]} ${className}`}>
      <span className="text-xl flex-shrink-0">{icons[type]}</span>
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <div className="text-sm">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-xl opacity-60 hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      )}
    </div>
  );
}
