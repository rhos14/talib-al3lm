import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  const showSuccess = (title: string, message?: string) => {
    context.addToast({ title, message, type: 'success' });
  };

  const showError = (title: string, message?: string) => {
    context.addToast({ title, message, type: 'error' });
  };

  const showWarning = (title: string, message?: string) => {
    context.addToast({ title, message, type: 'warning' });
  };

  const showInfo = (title: string, message?: string) => {
    context.addToast({ title, message, type: 'info' });
  };

  return {
    ...context,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
