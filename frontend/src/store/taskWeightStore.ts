import { create } from 'zustand';
import api from '../lib/api';

export interface TaskWeight {
  id: string;
  level: 'low' | 'medium' | 'high';
  weight: number;
  created_at: string;
  updated_at: string;
}

interface TaskWeightState {
  weights: TaskWeight[];
  isLoading: boolean;
  error: string | null;
  fetchWeights: () => Promise<void>;
  updateWeight: (id: string, weight: number) => Promise<void>;
}

export const useTaskWeightStore = create<TaskWeightState>((set, get) => ({
  weights: [],
  isLoading: false,
  error: null,

  fetchWeights: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/task-weights');
      set({ weights: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, isLoading: false });
    }
  },

  updateWeight: async (id: string, weight: number) => {
    try {
      const response = await api.put(`/task-weights/${id}`, { weight });
      set((state) => ({
        weights: state.weights.map((w) => (w.id === id ? response.data : w))
      }));
    } catch (err: any) {
      console.error('Failed to update weight', err);
      throw err;
    }
  }
}));
