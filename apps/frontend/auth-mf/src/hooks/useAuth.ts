import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const store = useAuthStore();

  useEffect(() => {
    const unsubscribe = store.initAuth();
    return () => unsubscribe();
  }, []);

  return {
    user: store.user,
    loading: store.loading,
    error: store.error,
    accessToken: store.accessToken,
    register: store.register,
    login: store.login,
    logout: store.logout,
    clearError: store.clearError,
  };
};
