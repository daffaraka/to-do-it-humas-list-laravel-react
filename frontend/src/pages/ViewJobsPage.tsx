import { useEffect, useState } from 'react';
import { useKanban } from '@/store/kanbanStore';
import { Calendar, CheckSquare, Search, ChevronDown, ChevronUp } from 'lucide-react';

export default function ViewJobsPage() {
  const { cards, fetchAllCards, isLoading } = useKanban();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPics, setExpandedPics] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchAllCards();
  }, [fetchAllCards]);

  const filteredCards = cards.filter((card: any) => {
    const titleMatch = card.title.toLowerCase().includes(searchQuery.toLowerCase());
    const picName = typeof card.pic === 'object' && card.pic !== null ? (card.pic as any).name : (typeof card.pic === 'string' ? card.pic : "");
    const picMatch = picName.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || picMatch;
  });

  // Group cards by PIC Name
  const groupedCards = filteredCards.reduce((acc: Record<string, any[]>, card: any) => {
    const picObj = typeof card.pic === 'object' && card.pic !== null ? (card.pic as any) : null;
    const picName = picObj ? picObj.name : (typeof card.pic === 'string' ? card.pic : 'Belum Ditugaskan');
    
    if (!acc[picName]) {
      acc[picName] = [];
    }
    acc[picName].push(card);
    return acc;
  }, {} as Record<string, typeof cards>);

  const toggleExpand = (picName: string) => {
    setExpandedPics(prev => ({
      ...prev,
      [picName]: !prev[picName]
    }));
  };

  // Professional soft Tailwind colors for avatars
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
      'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
      'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
      'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
      'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-bold',
    medium: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 font-bold',
    high: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 font-bold',
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Semua Pekerjaan (View Jobs)</h1>
          <p className="text-sm text-textSecondary mt-1">Pantau ringkasan dan detail pekerjaan berdasarkan PIC.</p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
          <input
            type="text"
            placeholder="Cari pekerjaan atau nama PIC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-bgSecondary border border-gray-200 dark:border-borderBase rounded-xl pl-9 pr-4 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-textSecondary">Memuat pekerjaan...</div>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-bgSecondary/50 rounded-2xl border border-borderBase border-dashed">
          <div className="text-textSecondary mb-2">Belum ada pekerjaan yang ditemukan</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {Object.entries(groupedCards).map(([picName, picCards]: [string, any[]]) => {
            const nameParts = picName.trim().split(/\s+/);
            const picInitials = nameParts.length >= 2 
              ? (nameParts[0][0] + nameParts[1][0]).toUpperCase() 
              : picName.substring(0, 2).toUpperCase();
            
            const picObj = typeof picCards[0].pic === 'object' && picCards[0].pic !== null ? (picCards[0].pic as any) : null;
            const roleName = picObj?.role?.name;
            const departmentName = picObj?.department?.name;

            // Calculate stats
            const totalJobs = picCards.length;
            const todoCount = picCards.filter(c => c.columnId === 'new').length;
            const progressCount = picCards.filter((c: any) => c.columnId === 'progress').length;
            const doneCount = picCards.filter((c: any) => c.columnId === 'done').length;

            const isExpanded = expandedPics[picName] || false;

            return (
              <div key={picName} className="bg-bgSecondary border border-borderBase p-5 rounded-3xl shadow-sm flex flex-col h-max transition-all duration-300 hover:shadow-md">
                {/* Person Header (Clickable to toggle) */}
                <div 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                  onClick={() => toggleExpand(picName)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 shrink-0 rounded-2xl ${getAvatarColor(picName)} flex items-center justify-center text-lg font-bold transform group-hover:scale-105 transition-transform duration-300`}>
                      {picInitials}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-textPrimary group-hover:text-indigo-600 transition-colors">{picName}</h2>
                      {(roleName || departmentName) && (
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 mb-3">
                          {departmentName && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-500/20">
                              {departmentName}
                            </span>
                          )}
                          {roleName && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-500/20">
                              {roleName}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-500/20">
                          Total: {totalJobs}
                        </span>
                        <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-500/20">
                          To Do: {todoCount}
                        </span>
                        <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-500/20">
                          Progress: {progressCount}
                        </span>
                        <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/20">
                          Done: {doneCount}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2 bg-bgGlass rounded-lg text-textSecondary group-hover:text-textPrimary transition-colors sm:self-center self-end">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {/* Person's Tasks (Expanded View) */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-borderBase flex-1 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    {picCards.map((card: any) => {
                      const checklist = card.checklist || [];
                      const completedChecklist = checklist.filter((item: any) => item.completed).length;
                      const pColor = priorityColors[card.priority as keyof typeof priorityColors] || priorityColors.low;
                      
                      // Status Label Colors
                      const statusColors: Record<string, string> = {
                        'new': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                        'progress': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
                        'done': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      };
                      const sColor = statusColors[card.columnId] || statusColors['new'];
                      const statusText = card.columnId === 'new' ? 'To Do' : (card.columnId === 'progress' ? 'Progress' : 'Done');

                      return (
                        <div key={card.id} className="bg-bgGlass border border-borderBase p-4 rounded-xl hover:border-indigo-500/30 transition-colors shadow-sm">
                          <div className="flex justify-between items-start gap-3 mb-2">
                            <h3 className="text-sm font-semibold text-textPrimary leading-snug line-clamp-2">
                              {card.title}
                            </h3>
                            <div className="flex gap-2 shrink-0">
                              <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm ${pColor}`}>
                                {card.priority}
                              </span>
                              <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${sColor}`}>
                                {statusText}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            {checklist.length > 0 && (
                              <div className="text-[11px] font-semibold text-textSecondary bg-bgSecondary border border-borderBase px-2 py-1 rounded-md">
                                {completedChecklist}/{checklist.length} Selesai
                              </div>
                            )}
                            {card.requestDate && (
                              <div className="text-[11px] font-semibold text-textSecondary bg-bgSecondary border border-borderBase px-2 py-1 rounded-md" title="Target Tanggal">
                                <span className="text-textPrimary mr-1">Tgt:</span>
                                {new Date(card.requestDate).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </div>
                            )}
                            {card.dueDate && (
                              <div className="text-[11px] font-semibold text-textSecondary bg-bgSecondary border border-borderBase px-2 py-1 rounded-md" title="Tanggal Selesai">
                                <span className="text-textPrimary mr-1">Bts:</span>
                                {new Date(card.dueDate).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
