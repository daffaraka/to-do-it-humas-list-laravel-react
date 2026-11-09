import { useMemo } from "react";
import { addDays, format, getDate, getDay, parseISO, startOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarDays, CheckCircle2, Clock3, ListChecks, Repeat2 } from "lucide-react";
import type { Card, ColumnId } from "@/types";
import { useKanban } from "@/store/kanbanStore";
import { useAuthStore } from "@/store/authStore";
import { getRecurrenceEnd } from "@/lib/recurrence";

const statuses: { id: ColumnId; label: string; icon: typeof ListChecks; classes: string }[] = [
  { id: "new", label: "New", icon: ListChecks, classes: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300" },
  { id: "progress", label: "Progress", icon: Clock3, classes: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300" },
  { id: "done", label: "Selesai", icon: CheckCircle2, classes: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" },
];

const parseTaskDate = (value?: string | null) => {
  if (!value) return null;
  const normalized = value.includes(" ") && !value.includes("T") ? value.replace(" ", "T") : value;
  return startOfDay(normalized.includes("T") ? parseISO(normalized) : new Date(`${normalized}T00:00:00`));
};

const occurrenceDates = (card: Card) => {
  const start = parseTaskDate(card.requestDate);
  if (!start) return [];
  const end = getRecurrenceEnd(start, parseTaskDate(card.dueDate), card.recurrence!);
  const dates: Date[] = [];
  let cursor = start;

  while (cursor <= end) {
    if (
      card.recurrence === "daily" ||
      (card.recurrence === "weekly" && getDay(cursor) === getDay(start)) ||
      (card.recurrence === "monthly" && getDate(cursor) === getDate(start))
    ) {
      dates.push(cursor);
    }
    cursor = addDays(cursor, 1);
  }

  return dates.length ? dates : [start];
};

export function RecurringTasksBoard({ cards }: { cards: Card[] }) {
  const { updateCard } = useKanban();
  const user = useAuthStore((state) => state.user);

  const recurringCards = useMemo(
    () => cards.filter((card) => Boolean(card.recurrence)),
    [cards],
  );

  const getStatus = (card: Card, date: Date): ColumnId => {
    const key = format(date, "yyyy-MM-dd");
    return card.recurrenceStatuses?.[key] || card.columnId || "new";
  };

  const canUpdate = (card: Card) => {
    const picId = typeof card.pic === "object" && card.pic !== null ? (card.pic as any).id : card.pic;
    return user?.role?.name?.toLowerCase() === "admin" || picId === user?.id || card.collaborators?.some((item) => item.id === user?.id);
  };

  const setOccurrenceStatus = (card: Card, date: Date, status: ColumnId) => {
    if (!canUpdate(card)) return;
    const key = format(date, "yyyy-MM-dd");
    updateCard(card.id, {
      recurrenceStatuses: { ...(card.recurrenceStatuses || {}), [key]: status },
    });
  };

  if (recurringCards.length === 0) {
    return (
      <div className="relative z-10 flex flex-1 items-center justify-center rounded-2xl border border-dashed border-borderBase bg-bgSecondary/50 p-10 text-center text-textSecondary">
        Belum ada pekerjaan dengan pola pengulangan di board ini.
      </div>
    );
  }

  return (
    <div className="relative z-10 grid flex-1 grid-cols-1 gap-5 overflow-y-auto pb-4 xl:grid-cols-2 custom-scrollbar">
      {recurringCards.map((card) => {
        const dates = occurrenceDates(card);
        const completed = dates.filter((date) => getStatus(card, date) === "done").length;
        const picName = typeof card.pic === "object" && card.pic !== null ? (card.pic as any).name : "Tanpa PIC";
        return (
          <article key={card.id} className="overflow-hidden rounded-2xl border border-violet-500/20 bg-bgSecondary shadow-sm">
            <div className="border-b border-borderBase bg-gradient-to-r from-violet-500/10 to-indigo-500/5 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-violet-500">
                    <Repeat2 size={15} />
                    {card.recurrence === "daily" ? "Harian" : card.recurrence === "weekly" ? "Mingguan" : "Bulanan"}
                    <span className="text-textSecondary">• {dates.length} kemunculan</span>
                  </div>
                  <h3 className="text-lg font-bold text-textPrimary">{card.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-textSecondary">{card.description}</p>
                </div>
                <div className="shrink-0 rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-textSecondary">Selesai</div>
                  <div className="text-xl font-black text-violet-500">{completed}/{dates.length}</div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-textSecondary">
                <span className="inline-flex items-center gap-1 rounded-lg border border-borderBase bg-bgPrimary/60 px-2 py-1"><CalendarDays size={13} /> {format(dates[0], "dd MMM yyyy", { locale: id })}</span>
                <span className="rounded-lg border border-borderBase bg-bgPrimary/60 px-2 py-1">PIC: {picName}</span>
                <span className="rounded-lg border border-borderBase bg-bgPrimary/60 px-2 py-1 uppercase">Bobot: {card.priority}</span>
              </div>
            </div>

            <div className="max-h-[420px] space-y-2 overflow-y-auto p-4 custom-scrollbar">
              {dates.map((date) => {
                const status = getStatus(card, date);
                return (
                  <div key={`${card.id}-${format(date, "yyyy-MM-dd")}`} className="flex flex-col gap-3 rounded-xl border border-borderBase bg-bgPrimary/50 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-500">{format(date, "dd")}</div>
                      <div>
                        <div className="text-sm font-semibold text-textPrimary">{format(date, "EEEE", { locale: id })}</div>
                        <div className="text-xs text-textSecondary">{format(date, "dd MMMM yyyy", { locale: id })}</div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      {statuses.map(({ id: statusId, label, icon: Icon, classes }) => (
                        <button
                          key={statusId}
                          type="button"
                          disabled={!canUpdate(card)}
                          onClick={() => setOccurrenceStatus(card, date, statusId)}
                          className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition ${status === statusId ? classes : "border-borderBase bg-bgSecondary text-textSecondary hover:border-violet-400"} disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          <Icon size={13} />
                          <span className="hidden sm:inline">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        );
      })}
    </div>
  );
}
