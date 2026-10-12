import { Check } from "lucide-react";
import type { TimelineUserGroup } from "@/lib/timelineExcelExporter";

interface UserSelectionItemProps {
  group: TimelineUserGroup;
  isChecked: boolean;
  onToggle: (userId: string) => void;
}

export function UserSelectionItem({
  group,
  isChecked,
  onToggle,
}: UserSelectionItemProps) {
  return (
    <div
      onClick={() => onToggle(group.user.id)}
      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
        isChecked
          ? "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20"
          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
            isChecked
              ? "bg-emerald-600 border-emerald-600 text-white"
              : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
          }`}
        >
          {isChecked && <Check size={14} />}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {group.user.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {group.user.department ? `Dept: ${group.user.department}` : `Tab Sheet: ${group.user.name}`}
          </p>
        </div>
      </div>
      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
        {(group.totalTasks ?? group.total_tasks ?? group.tasks?.length ?? 0)} Pekerjaan
      </span>
    </div>
  );
}
