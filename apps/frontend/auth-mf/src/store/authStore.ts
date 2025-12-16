import { create } from 'zustand';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  createdAt: Date;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  token: string | null;
  
  login: (username: string, password?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  initAuth: () => void;
}

const API_URL = process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:3001';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  token: null,

  login: async (username: string, password?: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { 
        username,
        password 
      });
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        set({ 
          user, 
          token,
          loading: false 
        });

        // Guardar en localStorage
        localStorage.setItem('ratgym_user', JSON.stringify(user));
        localStorage.setItem('ratgym_token', token);
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('ratgym_user');
    localStorage.removeItem('ratgym_token');
    set({ user: null, token: null, loading: false });
  },

  clearError: () => set({ error: null }),

  initAuth: () => {
    // Cargar usuario de localStorage
    const savedUser = localStorage.getItem('ratgym_user');
    const savedToken = localStorage.getItem('ratgym_token');
    
    if (savedUser && savedToken) {
      try {
        set({ 
          user: JSON.parse(savedUser),
          token: savedToken,
          loading: false 
        });
      } catch (error) {
        // Si hay error parseando, limpiar
        localStorage.removeItem('ratgym_user');
        localStorage.removeItem('ratgym_token');
        set({ user: null, token: null, loading: false });
      }
    }
  },
}));
