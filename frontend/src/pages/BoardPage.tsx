import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { KanbanBoard } from '@/components/KanbanBoard';
import { useKanban } from '@/store/kanbanStore';

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const { fetchCards, isLoading, setActiveBoardId, activeBoardId } = useKanban();

  useEffect(() => {
    if (id) {
      setActiveBoardId(id);
      fetchCards(id);
    }
    
    return () => {
      setActiveBoardId(null);
    };
  }, [id, setActiveBoardId, fetchCards]);

  if (isLoading || activeBoardId !== id) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-textSecondary">Memuat tugas...</div>
      </div>
    );
  }

  return <KanbanBoard />;
}
