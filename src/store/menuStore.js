// src/store/menuStore.js
import { create } from 'zustand';
import api from '../api/axios'; // ✅ Import the configured axios instance

// Remove these lines:
// import axios from 'axios';
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// axios.defaults.withCredentials = true;

export const formatPrice = (price) => {
  return `₹${parseFloat(price).toFixed(2)}`;
};

const useMenuStore = create((set, get) => ({
  menuItems: [],
  isLoading: false,
  error: null,
  selectedCategory: 'All',
  searchTerm: '',

  fetchMenuItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/menu'); // ✅ Use api instead of axios
      set({ menuItems: data.data, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch menu items';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  addMenuItem: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/menu', formData, { // ✅ Use api
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      set((state) => ({
        menuItems: [...state.menuItems, data.data],
        isLoading: false,
      }));
      return { success: true, data: data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add menu item';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  updateMenuItem: async (id, formData) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Store: Updating item with ID:', id);
      const { data } = await api.patch(`/menu/${id}`, formData, { // ✅ Use api
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      set((state) => ({
        menuItems: state.menuItems.map((item) =>
          (item._id === id || item.id === id) ? data.data : item
        ),
        isLoading: false,
      }));
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Store: Update failed:', error.response?.data);
      const message = error.response?.data?.message || 'Failed to update menu item';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  deleteMenuItem: async (id) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Store: Deleting item with ID:', id);
      await api.delete(`/menu/${id}`); // ✅ Use api
      set((state) => ({
        menuItems: state.menuItems.filter((item) => 
          item._id !== id && item.id !== id
        ),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      console.error('Store: Delete failed:', error.response?.data);
      const message = error.response?.data?.message || 'Failed to delete menu item';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchTerm: (term) => set({ searchTerm: term }),

  getFilteredItems: () => {
    const { menuItems, selectedCategory, searchTerm } = get();
    return menuItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  },

  clearError: () => set({ error: null }),
}));

export default useMenuStore;