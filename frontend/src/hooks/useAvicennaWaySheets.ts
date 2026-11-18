import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  addRowToSheet,
  AI_COLUMN_NAME,
  AVICENNA_CATEGORIES,
  blankAvicennaSheet,
  DATE_COLUMN_NAME,
  getColumnIndex,
  getTodayIsoDate,
  groupRowsByDate,
  normalizeSheetResponse,
  removeRowFromSheet,
  sortRowItemsDescending,
  sortSheetDescending,
  summarizeFavorites,
  updateCellInSheet,
  type AvicennaWayAnalysis,
  type AvicennaWaySheet,
  type AvicennaWaySheetResponse,
} from "@/lib/avicennaWay";

export type SaveState = "idle" | "saving" | "saved" | "error";

function extractErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } })
      .response;
    if (typeof response?.data?.message === "string") {
      return response.data.message;
    }
  }
  return "Analisis AI gagal diproses.";
}

function useAvicennaWayPersistence() {
  const [sheets, setSheets] = useState<Record<string, AvicennaWaySheet>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const timers = saveTimers.current;
    api
      .get<AvicennaWaySheetResponse[]>("/avicenna-way")
      .then(({ data }) => {
        const next: Record<string, AvicennaWaySheet> = {};
        AVICENNA_CATEGORIES.forEach((category) => {
          const found = data.find((item) => item.category === category);
          next[category] = found
            ? normalizeSheetResponse(found)
            : blankAvicennaSheet(category);
        });
        setSheets(next);
      })
      .catch(() => setSaveState("error"))
      .finally(() => setIsLoading(false));

    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  const saveSheet = useCallback((sheetToSave: AvicennaWaySheet) => {
    const dateIndex = getColumnIndex(sheetToSave.columns, DATE_COLUMN_NAME, 1);
    const sortedRows = sortRowItemsDescending(sheetToSave.rows, dateIndex);
    setSaveState("saving");
    api
      .put(`/avicenna-way/${encodeURIComponent(sheetToSave.category)}`, {
        columns: sheetToSave.columns,
        rows: sortedRows.map((row) => row.cells),
      })
      .then(() => setSaveState("saved"))
      .catch(() => setSaveState("error"));
  }, []);

  const updateSheet = useCallback(
    (
      category: string,
      updater: (sheet: AvicennaWaySheet) => AvicennaWaySheet,
    ) => {
      setSheets((current) => {
        const nextSheet = updater(
          current[category] || blankAvicennaSheet(category),
        );
        if (saveTimers.current[category]) {
          clearTimeout(saveTimers.current[category]);
        }
        saveTimers.current[category] = setTimeout(
          () => saveSheet(nextSheet),
          650,
        );
        return { ...current, [category]: nextSheet };
      });
    },
    [saveSheet],
  );

  return { sheets, setSheets, isLoading, saveState, setSaveState, updateSheet };
}

export function useAvicennaWaySheets() {
  const { sheets, setSheets, isLoading, saveState, setSaveState, updateSheet } =
    useAvicennaWayPersistence();
  const [activeCategory, setActiveCategory] = useState<string>(
    AVICENNA_CATEGORIES[0],
  );
  const [pinnedRowDates, setPinnedRowDates] = useState<Record<string, string>>(
    {},
  );
  const currentUser = useAuthStore((state) => state.user);
  const sheet = sheets[activeCategory] || blankAvicennaSheet(activeCategory);

  const dateGroups = useMemo(
    () => groupRowsByDate(sheet.rows, sheet.columns, pinnedRowDates),
    [sheet.rows, sheet.columns, pinnedRowDates],
  );

  const favoriteSummary = useMemo(
    () => summarizeFavorites(sheet.rows, sheet.columns),
    [sheet.rows, sheet.columns],
  );

  const unpinRowDate = (rowId: string) => {
    setPinnedRowDates((current) => {
      if (!(rowId in current)) return current;
      const next = { ...current };
      delete next[rowId];
      return next;
    });
  };

  const setCell = (rowId: string, columnIndex: number, value: string) => {
    updateSheet(activeCategory, (current) =>
      updateCellInSheet(current, rowId, columnIndex, value),
    );
  };

  const handleDateFocusStart = (rowId: string, currentDate: string) => {
    setPinnedRowDates((current) => ({ ...current, [rowId]: currentDate }));
  };

  const handleDateFocusEnd = (rowId: string) => {
    unpinRowDate(rowId);
    setSheets((current) => {
      const target = current[activeCategory];
      return target
        ? { ...current, [activeCategory]: sortSheetDescending(target) }
        : current;
    });
  };

  const addRow = (defaultDate = getTodayIsoDate()) => {
    updateSheet(activeCategory, (current) =>
      addRowToSheet(current, currentUser?.name || "", defaultDate),
    );
  };

  const deleteRow = (rowId: string) => {
    unpinRowDate(rowId);
    updateSheet(activeCategory, (current) => removeRowFromSheet(current, rowId));
  };

  const clearAnalysis = (rowId: string) => {
    const aiColumnIndex = getColumnIndex(sheet.columns, AI_COLUMN_NAME, 7);
    setCell(rowId, aiColumnIndex, "");
  };

  const analyzeRow = async (rowId: string) => {
    const targetRow = sheet.rows.find((row) => row.id === rowId);
    if (!targetRow) return;

    setSaveState("saving");
    try {
      const { data } = await api.post<AvicennaWayAnalysis>(
        `/avicenna-way/${encodeURIComponent(activeCategory)}/analyze`,
        { row: targetRow.cells, active_category: activeCategory },
      );
      const aiColumnIndex = getColumnIndex(sheet.columns, AI_COLUMN_NAME, 7);
      setCell(rowId, aiColumnIndex, JSON.stringify(data));
      setSaveState("saved");
    } catch (error: unknown) {
      setSaveState("error");
      window.alert(extractErrorMessage(error));
    }
  };

  return {
    activeCategory,
    setActiveCategory,
    isLoading,
    saveState,
    sheet,
    dateGroups,
    favoriteSummary,
    setCell,
    handleDateFocusStart,
    handleDateFocusEnd,
    addRow,
    deleteRow,
    clearAnalysis,
    analyzeRow,
  };
}
