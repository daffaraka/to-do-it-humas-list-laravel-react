"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Card, ColumnId, Department, ActiveDepartmentType, Board } from '../types';
import api from '../lib/api';

export type ViewMode = 'kanban' | 'calendar';

let fetchDepartmentsPromise: Promise<void> | null = null;
let fetchBoardsPromise: Promise<void> | null = null;
let fetchCardsPromises: Record<string, Promise<void> | undefined> = {};
let fetchAllCardsPromise: Promise<void> | null = null;
let fetchMyJobsPromise: Promise<void> | null = null;

interface KanbanState {
  departments: Department[];
  boards: Board[];
  activeBoardId: string | null;
  cards: Card[];
  myJobs: Card[];
  searchQuery: string;
  filterLabel: string | null;
  filterPic: string | null;
  filterPriority: string | null;
  activeDepartment: ActiveDepartmentType;
  viewMode: ViewMode;
  isDarkMode: boolean;
  isLoading: boolean;
  error: string | null;

  fetchDepartments: () => Promise<void>;
  fetchBoards: () => Promise<void>;
  createBoard: (title: string, description?: string, kpiId?: string, startDate?: string, targetDate?: string, departmentId?: string, kategoriProgramId?: string, kondisiAktual?: string, targetAkhirTahun?: string, outputAkhir?: string, prioritas?: string, bobot?: number | string) => Promise<void>;
  updateBoard: (id: string, updates: Partial<Board>) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  setActiveBoardId: (boardId: string | null) => void;
  fetchCards: (boardId: string) => Promise<void>;
  fetchAllCards: () => Promise<void>;
  fetchMyJobs: () => Promise<void>;
  addCard: (title: string, columnId: ColumnId, extraData?: Partial<Card>) => Promise<void>;
  updateCard: (id: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  moveCard: (cardId: string, toColumnId: ColumnId, saveToDb?: boolean) => Promise<void>;
  reorderCards: (activeId: string, overId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilterLabel: (labelId: string | null) => void;
  setFilterPic: (picId: string | null) => void;
  setFilterPriority: (priority: string | null) => void;
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
      filterPic: null,
      filterPriority: null,
      activeDepartment: 'All',
      viewMode: 'kanban',
      isDarkMode: false,
      isLoading: false,
      error: null,

      fetchDepartments: async () => {
        if (fetchDepartmentsPromise) {
          await fetchDepartmentsPromise;
          return;
        }

        fetchDepartmentsPromise = api.get('/departments')
          .then((response) => {
            const departments = response.data;
            const currentActive = get().activeDepartment;
            if (currentActive !== 'all' && !departments.some((d: any) => d.id === currentActive)) {
              set({ departments, activeDepartment: 'all' });
            } else {
              set({ departments });
            }
          })
          .catch((err) => {
            console.error('Failed to fetch departments', err);
          })
          .finally(() => {
            fetchDepartmentsPromise = null;
          });

        await fetchDepartmentsPromise;
      },

      fetchBoards: async () => {
        if (fetchBoardsPromise) {
          await fetchBoardsPromise;
          return;
        }

        set({ isLoading: true, error: null });
        fetchBoardsPromise = api.get('/boards')
          .then((response) => {
            set({ boards: response.data, isLoading: false });
          })
          .catch((err: any) => {
            set({ error: err.message, isLoading: false });
          })
          .finally(() => {
            fetchBoardsPromise = null;
          });

        await fetchBoardsPromise;
      },

      createBoard: async (title, description, kpiId, startDate, targetDate, departmentId, kategoriProgramId, kondisiAktual, targetAkhirTahun, outputAkhir, prioritas, bobot) => {
        try {
          const payload: any = { title };
          if (description) payload.description = description;
          if (kpiId) payload.kpi_id = kpiId;
          if (startDate) payload.startDate = startDate;
          if (targetDate) payload.targetDate = targetDate;
          if (departmentId) payload.departmentId = departmentId;
          if (kategoriProgramId) payload.kategoriProgramId = kategoriProgramId;
          if (kondisiAktual) payload.kondisiAktual = kondisiAktual;
          if (targetAkhirTahun) payload.targetAkhirTahun = targetAkhirTahun;
          if (outputAkhir) payload.outputAkhir = outputAkhir;
          if (prioritas) payload.prioritas = prioritas;
          if (bobot !== undefined && bobot !== "") payload.bobotBoard = bobot;
          const response = await api.post('/boards', payload);
          set((state) => ({ boards: [response.data, ...state.boards] }));
        } catch (err: any) {
          console.error('Failed to create board', err);
        }
      },

      deleteBoard: async (id) => {
        try {
          await api.delete(`/boards/${id}`);
          set((state) => ({ boards: state.boards.filter(b => b.id !== id) }));
        } catch (err) {
          console.error('Failed to delete board', err);
          throw err;
        }
      },

      updateBoard: async (id, updates) => {
        try {
          const response = await api.patch(`/boards/${id}`, updates);
          set((state) => ({
            boards: state.boards.map(b => b.id === id ? { ...b, ...response.data } : b)
          }));
        } catch (err) {
          console.error('Failed to update board', err);
          throw err;
        }
      },

      setActiveBoardId: (boardId) => {
        set({ activeBoardId: boardId });
        if (boardId) {
          get().fetchCards(boardId);
        }
      },

      fetchCards: async (boardId: string) => {
        const existingPromise = fetchCardsPromises[boardId];
        if (existingPromise) {
          await existingPromise;
          return;
        }

        set({ isLoading: true, error: null });
        fetchCardsPromises[boardId] = api.get(`/tasks?boardId=${boardId}`)
          .then((response) => {
            set({ cards: response.data, isLoading: false });
          })
          .catch((err: any) => {
            set({ error: err.message, isLoading: false });
          })
          .finally(() => {
            delete fetchCardsPromises[boardId];
          });
          
        await fetchCardsPromises[boardId];
      },

      fetchAllCards: async () => {
        if (fetchAllCardsPromise) {
          await fetchAllCardsPromise;
          return;
        }

        set({ isLoading: true, error: null });
        fetchAllCardsPromise = api.get(`/tasks`)
          .then((response) => {
            set({ cards: response.data, isLoading: false });
          })
          .catch((err: any) => {
            set({ error: err.message, isLoading: false });
          })
          .finally(() => {
            fetchAllCardsPromise = null;
          });
          
        await fetchAllCardsPromise;
      },

      fetchMyJobs: async () => {
        if (fetchMyJobsPromise) {
          await fetchMyJobsPromise;
          return;
        }

        set({ isLoading: true, error: null });
        fetchMyJobsPromise = api.get('/tasks/my-jobs')
          .then((response) => {
            set({ myJobs: response.data, isLoading: false });
          })
          .catch((err: any) => {
            set({ error: err.message, isLoading: false });
          })
          .finally(() => {
            fetchMyJobsPromise = null;
          });
          
        await fetchMyJobsPromise;
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

      moveCard: async (cardId, toColumnId, saveToDb = true) => {
        const previousCards = get().cards;
        const card = previousCards.find((c) => c.id === cardId);
        if (!card) return;
        
        if (card.columnId === toColumnId && !saveToDb) return;

        const targetCards = previousCards.filter((c) => c.columnId === toColumnId && c.departmentId === card.departmentId && c.id !== cardId);
        const newPosition = targetCards.length;

        set((state) => ({
          cards: state.cards.map((c) => {
            if (c.id === cardId) {
              const now = new Date().toISOString();
              return { 
                ...c, 
                columnId: toColumnId, 
                position: newPosition, 
                updatedAt: now,
                ...(toColumnId === 'new' && { new_date: now }),
                ...(toColumnId === 'progress' && { proses_date: now }),
                ...(toColumnId === 'done' && { end_date: now }),
              };
            }
            return c;
          }),
        }));

        if (saveToDb) {
          try {
            await api.patch(`/tasks/${cardId}`, { columnId: toColumnId, position: newPosition });
          } catch (err: any) {
            console.error('Failed to move card', err);
            set({ cards: previousCards });
          }
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
        const changedCards: string[] = [];
        
        reordered.forEach((card, idx) => {
          updatedPositions.set(card.id, idx);
          if (card.position !== idx) {
            changedCards.push(card.id);
          }
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
          // Update all cards that changed position to prevent overlapping positions in DB
          if (changedCards.length > 0) {
            await Promise.all(
              changedCards.map((id) => 
                api.patch(`/tasks/${id}`, { position: updatedPositions.get(id), columnId: columnId })
              )
            );
          }
        } catch (err: any) {
          console.error('Failed to reorder cards', err);
          set({ cards: previousCards });
        }
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterLabel: (labelId) => set({ filterLabel: labelId }),
      setFilterPic: (picId) => set({ filterPic: picId }),
      setFilterPriority: (priority) => set({ filterPriority: priority }),
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
        const { cards, searchQuery, filterLabel, filterPic, filterPriority } = get();
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
            if (filterPic) {
              const cardPicId = card.pic && typeof card.pic === 'object' ? (card.pic as any).id : typeof card.pic === 'string' ? card.pic : (card as any).picId || (card as any).pic_id;
              if (cardPicId !== filterPic) {
                return false;
              }
            }
            if (filterPriority) {
              if (card.priority !== filterPriority) {
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
