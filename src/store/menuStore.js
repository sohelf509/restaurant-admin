// src/store/menuStore.js
import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

axios.defaults.withCredentials = true;

// Helper function to format price in INR
export const formatPrice = (price) => {
  return `₹${parseFloat(price).toFixed(2)}`;
};

const useMenuStore = create((set, get) => ({
  menuItems: [],
  isLoading: false,
  error: null,
  selectedCategory: 'All',
  searchTerm: '',

  // Fetch all menu items
  fetchMenuItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.get(`${API_URL}/menu`);
      set({ menuItems: data.data, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch menu items';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  // Add new menu item
  addMenuItem: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.post(`${API_URL}/menu`, formData, {
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

  // Update menu item
  updateMenuItem: async (id, formData) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Store: Updating item with ID:', id);
      // ✅ Changed from PUT to PATCH
      const { data } = await axios.patch(`${API_URL}/menu/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      set((state) => ({
        menuItems: state.menuItems.map((item) =>
          // ✅ Handle both _id and id
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

  // Delete menu item
  deleteMenuItem: async (id) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Store: Deleting item with ID:', id);
      await axios.delete(`${API_URL}/menu/${id}`);
      set((state) => ({
        menuItems: state.menuItems.filter((item) => 
          // ✅ Handle both _id and id
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

  // Set selected category
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  // Set search term
  setSearchTerm: (term) => set({ searchTerm: term }),

  // Get filtered menu items
  getFilteredItems: () => {
    const { menuItems, selectedCategory, searchTerm } = get();
    return menuItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useMenuStore;