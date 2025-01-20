import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return createPortal(
    <div
      className={cn(
        'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm animate-in fade-in slide-in-from-top-2',
        type === 'success' && 'bg-green-100 text-green-800 border border-green-200',
        type === 'error' && 'bg-red-100 text-red-800 border border-red-200',
        type === 'info' && 'bg-blue-100 text-blue-800 border border-blue-200'
      )}
    >
      {message}
    </div>,
    document.body
  );
};

export default Toast; 