import { useEffect } from 'react';
import { CalendarView } from '@/components/CalendarView';
import { useKanban } from '@/store/kanbanStore';

export default function GlobalCalendarPage() {
  const { fetchAllCards, isLoading } = useKanban();

  useEffect(() => {
    fetchAllCards();
  }, [fetchAllCards]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-textSecondary">Memuat kalender...</div>
      </div>
    );
  }

  return <CalendarView />;
}
