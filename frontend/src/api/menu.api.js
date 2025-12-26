import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Tự động gắn token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const menuApi = {
  // --- CATEGORIES ---
  getCategories: () => axiosClient.get('/admin/menu/categories'),
  createCategory: (data) => axiosClient.post('/admin/menu/categories', data),
  updateCategory: (id, data) => axiosClient.put(`/admin/menu/categories/${id}`, data),
  toggleCategoryStatus: (id) => axiosClient.patch(`/admin/menu/categories/${id}/status`),

  // --- ITEMS ---
  getItems: (params) => axiosClient.get('/admin/menu/items', { params }),
  createItem: (data) => axiosClient.post('/admin/menu/items', data),
  updateItem: (id, data) => axiosClient.put(`/admin/menu/items/${id}`, data),
  deleteItem: (id) => axiosClient.delete(`/admin/menu/items/${id}`),

  // --- MODIFIERS (Nhóm topping/size) ---
  getModifierGroups: () => axiosClient.get('/admin/menu/modifier-groups'),
  createModifierGroup: (data) => axiosClient.post('/admin/menu/modifier-groups', data),
  addOptionToGroup: (groupId, data) => axiosClient.post(`/admin/menu/modifier-groups/${groupId}/options`),
};