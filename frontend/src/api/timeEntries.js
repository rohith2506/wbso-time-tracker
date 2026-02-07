import apiClient from './client';

export const timeEntriesAPI = {
  getEntries: async (year) => {
    const params = year ? { year } : {};
    const response = await apiClient.get('/time-entries/', { params });
    return response.data;
  },

  createEntry: async (entryData) => {
    const response = await apiClient.post('/time-entries/', entryData);
    return response.data;
  },

  updateEntry: async (entryId, entryData) => {
    const response = await apiClient.put(`/time-entries/${entryId}`, entryData);
    return response.data;
  },

  deleteEntry: async (entryId) => {
    const response = await apiClient.delete(`/time-entries/${entryId}`);
    return response.data;
  },

  getStats: async (year) => {
    const params = year ? { year } : {};
    const response = await apiClient.get('/time-entries/stats', { params });
    return response.data;
  }
};
