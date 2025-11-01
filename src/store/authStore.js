// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configure axios to include cookies
axios.defaults.withCredentials = true;

const useAuthStore = create(
  persist(
    (set) => ({
      admin: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Register Admin
      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await axios.post(`${API_URL}/admin/register`, {
            name,
            email,
            password,
          });
          set({
            admin: data.admin,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      // Login Admin
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await axios.post(`${API_URL}/admin/login`, {
            email,
            password,
          });
          set({
            admin: data.admin,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      // Logout Admin
      logout: async () => {
        try {
          // Optional: call logout endpoint if you have one
          // await axios.post(`${API_URL}/admin/logout`);
          set({
            admin: null,
            isAuthenticated: false,
            error: null,
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;