import { Component, type ErrorInfo, type ReactNode } from 'react';
import { CalendarView } from '@/components/CalendarView';

class CalendarErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Calendar failed to render', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex-1 p-8 text-textPrimary">
          <h1 className="text-xl font-bold">Kalender tidak dapat dimuat</h1>
          <p className="mt-2 text-sm text-textSecondary">{this.state.error.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function GlobalCalendarPage() {
  return <CalendarErrorBoundary><CalendarView /></CalendarErrorBoundary>;
}
