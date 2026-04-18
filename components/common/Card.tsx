'use client';

import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: string;
  footer?: ReactNode;
}

export default function Card({ children, className = '', title, icon, footer }: CardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 ${className}`}>
      {title && (
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-200 dark:border-gray-700">
          {icon && <span className="text-2xl">{icon}</span>}
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
      )}
      <div>{children}</div>
      {footer && <div className="mt-4 pt-4 border-t border-slate-200 dark:border-gray-700">{footer}</div>}
    </div>
  );
}
