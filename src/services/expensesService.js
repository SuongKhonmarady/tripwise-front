import api from './api';

export const expensesService = {
  // Get trip expenses
  async getExpenses(tripId) {
    const response = await api.get(`/trips/${tripId}/expenses`);
    return response.data.expenses;
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
