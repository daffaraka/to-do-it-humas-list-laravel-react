"use client";

import { create } from 'zustand';
import api from '../lib/api';
import type { Notification } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/notifications');
      const data = response.data as Notification[];
      const unreadCount = data.filter(n => !n.read).length;
      set({ notifications: data, unreadCount, isLoading: false });
    } catch (err) {
      console.error('Failed to fetch notifications', err);
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      if (id === 'all') {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0
        }));
      } else {
        set((state) => {
          const updated = state.notifications.map(n => n.id === id ? { ...n, read: true } : n);
          return {
            notifications: updated,
            unreadCount: updated.filter(n => !n.read).length
          };
        });
      }
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  }
}));
