import api from './api';

export const expensesService = {
  // Get trip expenses
  async getExpenses(tripId) {
    // If offline, return cached data immediately
    if (!navigator.onLine) {
      const { getCachedExpenses } = await import('./db');
      return await getCachedExpenses(tripId);
    }
    
    try {
      const response = await api.get(`/trips/${tripId}/expenses`);
      
      // Handle offline response from interceptor
      if (response.data.offline) {
        const { getCachedExpenses } = await import('./db');
        return await getCachedExpenses(tripId);
      }
      
      const expenses = response.data.expenses;
      
      // Cache the expenses for offline use
      const { cacheExpenses } = await import('./db');
      await cacheExpenses(tripId, expenses);
      
      return expenses;
    } catch (error) {
      // If API fails, try to return cached data
      console.log('Expenses API failed, using cached data:', error.message);
      try {
        const { getCachedExpenses } = await import('./db');
        return await getCachedExpenses(tripId);
      } catch (cacheError) {
        console.error('No cached expenses available:', cacheError);
        return []; // Return empty array instead of throwing
      }
    }
  },

  // Get single expense
  async getExpense(tripId, expenseId) {
    const response = await api.get(`/trips/${tripId}/expenses/${expenseId}`);
    return response.data.expense;
  },

  // Create new expense
  async createExpense(tripId, expenseData) {
    const response = await api.post(`/trips/${tripId}/expenses`, expenseData);
    return response.data.expense;
  },

  // Update expense
  async updateExpense(tripId, expenseId, expenseData) {
    const response = await api.put(`/trips/${tripId}/expenses/${expenseId}`, expenseData);
    return response.data.expense;
  },

  // Delete expense
  async deleteExpense(tripId, expenseId) {
    const response = await api.delete(`/trips/${tripId}/expenses/${expenseId}`);
    return response.data;
  },

  // Get expense summary
  async getExpensesSummary(tripId) {
    const response = await api.get(`/trips/${tripId}/expenses-summary`);
    return response.data;
  }
};
