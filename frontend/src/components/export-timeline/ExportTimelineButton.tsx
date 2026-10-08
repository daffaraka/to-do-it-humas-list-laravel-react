import { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { ExportTimelineModal } from "./ExportTimelineModal";

interface ExportTimelineButtonProps {
  className?: string;
  variant?: "primary" | "minimal";
}

export function ExportTimelineButton({
  className = "",
  variant = "primary",
}: ExportTimelineButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const baseStyles =
    "inline-flex items-center gap-2 rounded-xl text-xs font-semibold transition-all active:scale-95";

  const variants = {
    primary:
      "px-3.5 py-2 bg-emerald-600/90 hover:bg-emerald-600 text-white shadow-sm border border-emerald-500/30",
    minimal:
      "p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg",
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        title="Export Timeline Excel (.xlsx)"
      >
        <FileSpreadsheet size={16} />
        {variant === "primary" && <span>Export Timeline</span>}
      </button>

      <ExportTimelineModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
