'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}

const alertStyles = {
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
};

const alertIcons = {
  info: '📋',
  success: '✅',
  warning: '⚠️',
  error: '❌',
};

export default function Alert({ type, title, children, onClose }: AlertProps) {
  return (
    <div className={`border rounded-lg p-4 flex gap-3 ${alertStyles[type]}`}>
      <span className="text-xl flex-shrink-0">{alertIcons[type]}</span>
      <div className="flex-1">
        {title && <p className="font-bold mb-1">{title}</p>}
        <p className="text-sm">{children}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition"
          aria-label="Close alert"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}
