import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import axios from 'axios';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  accessToken: string | null;
  
  register: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyToken: (idToken: string) => Promise<void>;
  clearError: () => void;
  initAuth: () => void;
}

const API_URL = process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:3001';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  accessToken: null,

  register: async (email: string, password: string, displayName: string) => {
    set({ loading: true, error: null });
    try {
      // Register with Firebase Client SDK
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(userCredential.user, { displayName });

      // Get Firebase token
      const idToken = await userCredential.user.getIdToken();

      // Verify with backend and get JWT
      const response = await axios.post(`${API_URL}/auth/verify`, { idToken });
      
      set({ 
        user: userCredential.user, 
        accessToken: response.data.data.accessToken,
        loading: false 
      });

      // Store token in localStorage
      localStorage.setItem('accessToken', response.data.data.accessToken);
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      // Login with Firebase Client SDK
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get Firebase token
      const idToken = await userCredential.user.getIdToken();

      // Verify with backend and get JWT
      const response = await axios.post(`${API_URL}/auth/verify`, { idToken });
      
      set({ 
        user: userCredential.user, 
        accessToken: response.data.data.accessToken,
        loading: false 
      });

      // Store token in localStorage
      localStorage.setItem('accessToken', response.data.data.accessToken);
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await signOut(auth);
      localStorage.removeItem('accessToken');
      set({ user: null, accessToken: null, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  verifyToken: async (idToken: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/verify`, { idToken });
      set({ 
        accessToken: response.data.data.accessToken,
        loading: false 
      });
      localStorage.setItem('accessToken', response.data.data.accessToken);
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  initAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        const idToken = await user.getIdToken();
        try {
          const response = await axios.post(`${API_URL}/auth/verify`, { idToken });
          set({ 
            user, 
            accessToken: response.data.data.accessToken,
            loading: false 
          });
          localStorage.setItem('accessToken', response.data.data.accessToken);
        } catch (error) {
          set({ user: null, accessToken: null, loading: false });
          localStorage.removeItem('accessToken');
        }
      } else {
        // User is signed out
        set({ user: null, accessToken: null, loading: false });
        localStorage.removeItem('accessToken');
      }
    });

    return unsubscribe;
  },
}));
