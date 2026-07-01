import { useEffect } from 'react';
import { CalendarView } from '@/components/CalendarView';
import { useKanban } from '@/store/kanbanStore';
import { CalendarSkeleton } from '@/components/Skeleton';

export default function GlobalCalendarPage() {
  const { fetchAllCards, isLoading } = useKanban();

  useEffect(() => {
    fetchAllCards();
  }, [fetchAllCards]);

  if (isLoading) {
    return <CalendarSkeleton />;
  }

  return <CalendarView />;
}
