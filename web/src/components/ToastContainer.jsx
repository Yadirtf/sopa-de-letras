import React from 'react';
import { useAuth } from '../context/AuthContext';

export function ToastContainer() {
  const { toasts } = useAuth();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            className={`toast ${isSuccess ? 'toast--success' : ''} ${isError ? 'toast--error' : ''}`}
            role="status"
          >
            <span style={{ fontSize: '18px' }}>
              {isSuccess ? '✨' : isError ? '⚠️' : 'ℹ️'}
            </span>
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
