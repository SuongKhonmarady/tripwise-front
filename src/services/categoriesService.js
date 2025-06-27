import api from './api';

export const categoriesService = {
  // Get all categories
  async getCategories() {
    const response = await api.get('/categories');
    return response.data.categories;
  },

  // Get single category
  async getCategory(categoryId) {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data.category;
  },

  // Create new category
  async createCategory(categoryData) {
    const response = await api.post('/categories', categoryData);
    return response.data.category;
  },

  // Update category
  async updateCategory(categoryId, categoryData) {
    const response = await api.put(`/categories/${categoryId}`, categoryData);
    return response.data.category;
  },

  // Delete category
  async deleteCategory(categoryId) {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  }
};
