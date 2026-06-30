"use client";

import { create } from 'zustand';
import api from '../lib/api';
import type { Kpi } from '../types';

interface KpiState {
  kpis: Kpi[];
  isLoading: boolean;
  error: string | null;

  fetchKpis: () => Promise<void>;
  createKpi: (data: { title: string; description?: string; targetDate: string; departmentId?: string }) => Promise<void>;
  updateKpi: (id: string, data: { title: string; description?: string; targetDate: string }) => Promise<void>;
  deleteKpi: (id: string) => Promise<void>;
}

export const useKpiStore = create<KpiState>((set) => ({
  kpis: [],
  isLoading: false,
  error: null,

  fetchKpis: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/kpis');
      set({ kpis: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createKpi: async (data) => {
    try {
      const response = await api.post('/kpis', data);
      set((state) => ({ kpis: [response.data, ...state.kpis] }));
    } catch (err: any) {
      console.error('Failed to create KPI', err);
      throw err;
    }
  },

  updateKpi: async (id, data) => {
    try {
      const response = await api.put(`/kpis/${id}`, data);
      set((state) => ({
        kpis: state.kpis.map((kpi) => (kpi.id === id ? response.data : kpi)),
      }));
    } catch (err: any) {
      console.error('Failed to update KPI', err);
      throw err;
    }
  },

  deleteKpi: async (id) => {
    try {
      await api.delete(`/kpis/${id}`);
      set((state) => ({
        kpis: state.kpis.filter((kpi) => kpi.id !== id),
      }));
    } catch (err: any) {
      console.error('Failed to delete KPI', err);
      throw err;
    }
  }
}));
