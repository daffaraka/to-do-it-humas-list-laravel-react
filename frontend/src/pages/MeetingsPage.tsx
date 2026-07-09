import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Calendar, FileText, File, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Meeting {
  id: number;
  meeting_name: string;
  meeting_description: string;
  meeting_notes: string;
  meeting_document: string;
  meeting_date_start: string;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await api.get('/meetings');
        setMeetings(response.data);
      } catch (error) {
        console.error('Failed to fetch meetings', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-bgGlass rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-bgGlass h-40 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-bgPrimary">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-textPrimary">Daftar Meeting</h1>
      </div>

      {meetings.length === 0 ? (
        <div className="text-center text-textSecondary py-10 bg-bgSecondary/30 rounded-xl border border-borderBase">
          Belum ada data meeting.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-bgSecondary rounded-xl p-5 border border-borderBase hover:border-brand-500/50 transition-all hover:shadow-lg hover:shadow-brand-500/5 group"
            >
              <h3 className="text-lg font-bold text-textPrimary mb-2 group-hover:text-brand-500 transition-colors">
                {meeting.meeting_name}
              </h3>
              
              {meeting.meeting_date_start && (
                <div className="flex items-center gap-2 text-sm text-textSecondary mb-3">
                  <Calendar size={16} className="text-brand-500" />
                  <span>
                    {format(new Date(meeting.meeting_date_start), 'EEEE, dd MMMM yyyy HH:mm', { locale: id })}
                  </span>
                </div>
              )}

              {meeting.meeting_description && (
                <p className="text-sm text-textSecondary mb-4 line-clamp-2">
                  {meeting.meeting_description}
                </p>
              )}

              <div className="pt-4 border-t border-borderBase/50 flex flex-wrap gap-2">
                {meeting.meeting_document && (
                  <a
                    href={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${meeting.meeting_document}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-500 bg-brand-500/10 hover:bg-brand-500/20 rounded-lg transition-colors"
                  >
                    <File size={14} /> Dokumen
                  </a>
                )}
                {meeting.meeting_notes && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-500 bg-purple-500/10 rounded-lg">
                    <FileText size={14} /> Ada Catatan
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
