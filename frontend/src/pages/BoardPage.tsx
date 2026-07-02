import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { KanbanBoard } from '@/components/KanbanBoard';
import { useKanban } from '@/store/kanbanStore';
import { KanbanSkeleton } from '@/components/Skeleton';

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const { fetchCards, isLoading, setActiveBoardId, activeBoardId, boards, fetchBoards } = useKanban();

  useEffect(() => {
    if (id) {
      setActiveBoardId(id);
      fetchCards(id);
      
      // Menggunakan useKanban.getState() untuk mengecek tanpa menjadikannya dependency
      const currentBoards = useKanban.getState().boards;
      if (currentBoards.length === 0) {
        fetchBoards();
      }
    }
    
    return () => {
      setActiveBoardId(null);
    };
  }, [id, setActiveBoardId, fetchCards, fetchBoards]);

  if (isLoading || activeBoardId !== id) {
    return <KanbanSkeleton />;
  }

  return <KanbanBoard />;
}
