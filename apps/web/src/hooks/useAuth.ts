import React from 'react';
import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const { user, token, setUser, logout, loadFromStorage } = useAuthStore();
  
  React.useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return { user, token, setUser, logout, isAuthenticated: !!token };
}
