import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast, { ToastProps } from '../components/ui/toast';

interface ToastContextType {
  showToast: (props: Omit<ToastProps, 'onClose'>) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([]);
  let nextId = 0;

  const showToast = useCallback((props: Omit<ToastProps, 'onClose'>) => {
    const id = nextId++;
    setToasts(prev => [...prev, { ...props, id, onClose: () => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }}]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}; 