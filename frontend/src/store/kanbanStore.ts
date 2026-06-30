"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Card, ColumnId, Department, ActiveDepartmentType, Board } from '../types';
import api from '../lib/api';

export type ViewMode = 'kanban' | 'calendar';

interface KanbanState {
  departments: Department[];
  boards: Board[];
  activeBoardId: string | null;
  cards: Card[];
  myJobs: Card[];
  searchQuery: string;
  filterLabel: string | null;
  activeDepartment: ActiveDepartmentType;
  viewMode: ViewMode;
  isDarkMode: boolean;
  isLoading: boolean;
  error: string | null;

  fetchDepartments: () => Promise<void>;
  fetchBoards: () => Promise<void>;
  createBoard: (title: string, description?: string, kpiId?: string) => Promise<void>;
  setActiveBoardId: (boardId: string | null) => void;
  fetchCards: (boardId: string) => Promise<void>;
  fetchAllCards: () => Promise<void>;
  fetchMyJobs: () => Promise<void>;
  addCard: (title: string, columnId: ColumnId, extraData?: Partial<Card>) => Promise<void>;
  updateCard: (id: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  moveCard: (cardId: string, toColumnId: ColumnId) => Promise<void>;
  reorderCards: (activeId: string, overId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilterLabel: (labelId: string | null) => void;
  setActiveDepartment: (department: ActiveDepartmentType) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleDarkMode: () => void;
  getFilteredCards: (columnId: ColumnId) => Card[];
}

export const useKanban = create<KanbanState>()(
  persist(
    (set, get) => ({
      departments: [],
      boards: [],
      activeBoardId: null,
      cards: [],
      myJobs: [],
      searchQuery: '',
      filterLabel: null,
      activeDepartment: 'all',
      viewMode: 'kanban',
      isDarkMode: true,
      isLoading: false,
      error: null,

      fetchDepartments: async () => {
        try {
          const response = await api.get('/departments');
          set({ departments: response.data });
        } catch (err) {
          console.error('Failed to fetch departments', err);
        }
      },

      fetchBoards: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get('/boards');
          set({ boards: response.data, isLoading: false });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        }
      },

      createBoard: async (title, description, kpiId) => {
        try {
          const response = await api.post('/boards', { title, description, kpiId });
          set((state) => ({ boards: [response.data, ...state.boards] }));
        } catch (err: any) {
          console.error('Failed to create board', err);
        }
      },

      setActiveBoardId: (boardId) => {
        set({ activeBoardId: boardId });
        if (boardId) {
          get().fetchCards(boardId);
        }
      },

      fetchCards: async (boardId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get(`/tasks?boardId=${boardId}`);
          set({ cards: response.data, isLoading: false });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        }
      },

      fetchAllCards: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get(`/tasks`);
          set({ cards: response.data, isLoading: false });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        }
      },

      fetchMyJobs: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get('/tasks/my-jobs');
          set({ myJobs: response.data, isLoading: false });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        }
      },

      addCard: async (title, columnId, extraData) => {
        try {
          const activeBoardId = get().activeBoardId;
          if (!activeBoardId) return;

          const targetDepartmentId = extraData?.departmentId || (get().activeDepartment === 'all' ? get().departments[0]?.id : get().activeDepartment);
          const response = await api.post('/tasks', {
            title,
            columnId,
            boardId: activeBoardId,
            departmentId: targetDepartmentId,
            ...extraData,
          });
          set((state) => ({ cards: [...state.cards, response.data] }));
        } catch (err: any) {
          console.error('Failed to add card', err);
        }
      },

      updateCard: async (id, updates) => {
        // Optimistic UI update
        const previousCards = get().cards;
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id ? { ...card, ...updates, updatedAt: new Date().toISOString() } as Card : card
          ),
        }));

        try {
          await api.patch(`/tasks/${id}`, updates);
        } catch (err: any) {
          console.error('Failed to update card', err);
          // Revert on failure
          set({ cards: previousCards });
        }
      },

      deleteCard: async (id) => {
        const previousCards = get().cards;
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id),
        }));

        try {
          await api.delete(`/tasks/${id}`);
        } catch (err: any) {
          console.error('Failed to delete card', err);
          set({ cards: previousCards });
        }
      },

      moveCard: async (cardId, toColumnId) => {
        const previousCards = get().cards;
        const card = previousCards.find((c) => c.id === cardId);
        if (!card || card.columnId === toColumnId) return;

        const targetCards = previousCards.filter((c) => c.columnId === toColumnId && c.departmentId === card.departmentId);
        const newPosition = targetCards.length;

        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === cardId
              ? { ...c, columnId: toColumnId, position: newPosition, updatedAt: new Date().toISOString() }
              : c
          ),
        }));

        try {
          await api.patch(`/tasks/${cardId}`, { columnId: toColumnId, position: newPosition });
        } catch (err: any) {
          console.error('Failed to move card', err);
          set({ cards: previousCards });
        }
      },

      reorderCards: async (activeId, overId) => {
        const previousCards = get().cards;
        const activeCard = previousCards.find((c) => c.id === activeId);
        const overCard = previousCards.find((c) => c.id === overId);
        if (!activeCard || !overCard) return;

        const columnId = overCard.columnId;
        const columnCards = previousCards
          .filter((c) => c.columnId === columnId && c.departmentId === activeCard.departmentId)
          .sort((a, b) => a.position - b.position);

        const activeIdx = columnCards.findIndex((c) => c.id === activeId);
        const overIdx = columnCards.findIndex((c) => c.id === overId);

        if (activeIdx === -1 || overIdx === -1) return;

        const reordered = [...columnCards];
        const [moved] = reordered.splice(activeIdx, 1);
        reordered.splice(overIdx, 0, moved);

        const updatedPositions = new Map<string, number>();
        reordered.forEach((card, idx) => {
          updatedPositions.set(card.id, idx);
        });

        set((state) => ({
          cards: state.cards.map((card) => {
            if (updatedPositions.has(card.id)) {
              return { ...card, position: updatedPositions.get(card.id)! };
            }
            return card;
          }),
        }));

        try {
          await api.patch(`/tasks/${activeId}`, { position: updatedPositions.get(activeId) });
        } catch (err: any) {
          console.error('Failed to reorder cards', err);
          set({ cards: previousCards });
        }
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterLabel: (labelId) => set({ filterLabel: labelId }),
      setActiveDepartment: (department) => set({ activeDepartment: department }),
      setViewMode: (mode) => set({ viewMode: mode }),
      toggleDarkMode: () => {
        const nextMode = !get().isDarkMode;
        set({ isDarkMode: nextMode });
        if (nextMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      getFilteredCards: (columnId) => {
        const { cards, searchQuery, filterLabel, activeDepartment } = get();
        return cards
          .filter((card) => {
            if (card.columnId !== columnId) return false;
            
            if (searchQuery) {
              const q = searchQuery.toLowerCase();
              if (
                !card.title.toLowerCase().includes(q) &&
                !card.description.toLowerCase().includes(q)
              ) {
                return false;
              }
            }
            if (filterLabel) {
              if (!card.labels.some((l) => l.id === filterLabel)) {
                return false;
              }
            }
            return true;
          })
          .sort((a, b) => a.position - b.position);
      },
    }),
    {
      name: 'kanban-ui-settings',
      partialize: (state) => ({ 
        isDarkMode: state.isDarkMode,
        viewMode: state.viewMode,
        activeDepartment: state.activeDepartment,
        activeBoardId: state.activeBoardId
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.isDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      }
    }
  )
);
