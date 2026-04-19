import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function Card({ children, className, title, description }: CardProps) {
  return (
    <div className={clsx('card', className)}>
      {(title || description) && (
        <div className="mb-6">
          {title && <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>}
          {description && <p className="text-text-secondary text-sm">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  const icons = {
    success: '✓',
    error: '❌',
    info: 'ℹ️',
  };

  const colors = {
    success: 'border-success',
    error: 'border-danger',
    info: 'border-primary',
  };

  return (
    <div className={clsx('toast', colors[type])}>
      <div className="flex items-center gap-3">
        <span className="text-xl">{icons[type]}</span>
        <span className="flex-1 text-text-primary">{message}</span>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
