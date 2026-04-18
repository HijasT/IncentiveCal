'use client';

import React, { ReactNode } from 'react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl ${sizeStyles[size]} w-full`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-2xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-slate-200 dark:border-gray-700 p-6 flex gap-3 justify-end">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
