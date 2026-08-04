import { useEffect } from 'react';
import { CalendarView } from '@/components/CalendarView';
import { useKanban } from '@/store/kanbanStore';
import { CalendarSkeleton } from '@/components/Skeleton';

export default function GlobalCalendarPage() {
  const { isLoading } = useKanban();

  useEffect(() => {
    // Data fetching is now handled inside CalendarView.tsx
  }, []);

  if (isLoading) {
    return <CalendarSkeleton />;
  }

  return <CalendarView />;
}
