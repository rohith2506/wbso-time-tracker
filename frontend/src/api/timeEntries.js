import apiClient from './client';

export const timeEntriesAPI = {
  getEntries: async () => {
    const response = await apiClient.get('/time-entries/');
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

  getStats: async () => {
    const response = await apiClient.get('/time-entries/stats');
    return response.data;
  }
};
