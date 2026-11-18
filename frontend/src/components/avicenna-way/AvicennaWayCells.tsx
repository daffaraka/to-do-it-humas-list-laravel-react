import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  normalizeDateKey,
  type AvicennaWayAnalysis,
} from "@/lib/avicennaWay";

export function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${Math.max(ref.current.scrollHeight, 72)}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={2}
      className="min-h-[72px] w-full resize-y overflow-hidden rounded-lg border border-transparent bg-transparent px-2 py-2 text-sm leading-relaxed text-textPrimary outline-none transition focus:border-indigo-400 focus:bg-bgSecondary"
    />
  );
}

export function AvicennaWayDateCell({
  value,
  onChange,
  onFocusStart,
  onFocusEnd,
}: {
  value: string;
  onChange: (nextValue: string) => void;
  onFocusStart: () => void;
  onFocusEnd: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (!isFocusedRef.current) {
      setDraft(value);
    }
  }, [value]);

  const handleChange = (nextValue: string) => {
    setDraft(nextValue);
    if (nextValue === "") {
      onChange("");
      return;
    }

    const normalized = normalizeDateKey(nextValue);
    if (normalized && Number(normalized.slice(0, 4)) >= 1900) {
      onChange(normalized);
    }
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    const normalized = normalizeDateKey(draft);
    const committed = normalized && Number(normalized.slice(0, 4)) >= 1900 ? normalized : "";
    if (committed !== value) {
      onChange(committed);
    }
    setDraft(committed);
    onFocusEnd();
  };

  return (
    <input
      type="date"
      value={draft}
      onFocus={() => {
        isFocusedRef.current = true;
        onFocusStart();
      }}
      onChange={(event) => handleChange(event.target.value)}
      onBlur={handleBlur}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
      }}
      className="w-full rounded-lg border border-transparent bg-transparent px-2 py-3 text-sm text-textPrimary outline-none transition focus:border-indigo-400 focus:bg-bgSecondary"
    />
  );
}

export function AvicennaWayAiCell({
  value,
  onAnalyze,
  onClear,
}: {
  value?: string;
  onAnalyze: () => void;
  onClear: () => void;
}) {
  let analysis: AvicennaWayAnalysis | null = null;
  try {
    analysis = value ? (JSON.parse(value) as AvicennaWayAnalysis) : null;
  } catch {
    analysis = null;
  }

  return (
    <div className="min-w-[260px] space-y-2 p-1">
      <button
        type="button"
        onClick={onAnalyze}
        className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
      >
        {analysis ? "Analisis ulang" : "Analisis dengan AI"}
      </button>
      {analysis && (
        <div className="relative rounded-lg border border-indigo-200 bg-indigo-50 p-2 pr-8 text-xs text-slate-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-slate-200">
          <button
            type="button"
            onClick={onClear}
            title="Tutup hasil analisis"
            aria-label="Tutup hasil analisis"
            className="absolute right-1.5 top-1.5 rounded-md p-1 text-slate-500 transition hover:bg-indigo-100 hover:text-slate-800 dark:hover:bg-indigo-500/20 dark:hover:text-white"
          >
            <X size={14} />
          </button>
          <div className="font-bold">
            {analysis.primary_category} · {analysis.status}
          </div>
          <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5">
            {Object.entries(analysis.scores || {}).map(([key, score]) => (
              <span key={key}>
                {key}: {score}%
              </span>
            ))}
          </div>
          <p className="mt-2">{analysis.explanation}</p>
          {analysis.suggestion && (
            <p className="mt-1 text-indigo-700 dark:text-indigo-300">
              Saran: {analysis.suggestion}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
