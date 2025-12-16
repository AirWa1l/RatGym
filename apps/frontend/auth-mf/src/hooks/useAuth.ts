import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const store = useAuthStore();

  useEffect(() => {
    store.initAuth();
  }, []);

  return {
    user: store.user,
    loading: store.loading,
    error: store.error,
    token: store.token,
    login: store.login,
    logout: store.logout,
    clearError: store.clearError,
  };
};
