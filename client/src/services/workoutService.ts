import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

export const workoutService = {
  generatePlan: async (payload: {
    age: number;
    weight: number;
    height: number;
    gender: string;
    goal: string;
    activity_level: string;
    experience: string;
  }) => {
    try {
      const response = await axios.post(`${API_URL}/workout/generate`, payload, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. The AI server might be busy.');
      }
      if (!error.response) {
        throw new Error('Failed to connect to AI server. Ensure it is running.');
      }
      throw new Error(error.response?.data?.detail || 'Failed to generate workout plan');
    }
  },
};
