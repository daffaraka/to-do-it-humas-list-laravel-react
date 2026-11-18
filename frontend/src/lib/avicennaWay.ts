import { format, isValid, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const AVICENNA_CATEGORIES = [
  "Integritas",
  "Profesional",
  "Adaptif",
  "Dedikatif",
  "Sinergi",
] as const;

export const NAME_COLUMN_NAME = "Nama";
export const DATE_COLUMN_NAME = "Tanggal";
export const FAVORITE_COLUMN_NAME =
  "Perilaku Favorit (Beri simbol bintang pada salah satu nama)";
export const AI_COLUMN_NAME = "AI Avicenna Way";

export const DEFAULT_AVICENNA_COLUMNS = [
  NAME_COLUMN_NAME,
  DATE_COLUMN_NAME,
  "Perilaku yang sudah dilakukan (Kemarin)",
  "7 Habits",
  "Irisan Nilai Avicenna Way Lainnya",
  "Fasilitator",
  FAVORITE_COLUMN_NAME,
  AI_COLUMN_NAME,
];

export interface AvicennaWayAnalysis {
  primary_category: string;
  scores: Record<string, number>;
  status: string;
  explanation: string;
  suggestion: string;
}

export interface AvicennaWaySheetResponse {
  id: string;
  category: string;
  columns: string[];
  rows: (string | null | undefined)[][];
}

export interface AvicennaWayRowItem {
  id: string;
  cells: string[];
}

export interface AvicennaWaySheet {
  id: string;
  category: string;
  columns: string[];
  rows: AvicennaWayRowItem[];
}

export interface FavoriteSummary {
  totalPoints: number;
  byName: [string, number][];
}

export interface AvicennaWayDateGroup {
  dateKey: string;
  label: string;
  rows: AvicennaWayRowItem[];
  favoritePoints: number;
  favoriteByName: [string, number][];
}

let fallbackRowSequence = 0;

export function createRowId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  fallbackRowSequence += 1;
  return `avicenna-row-${Date.now()}-${fallbackRowSequence}`;
}

export function getTodayIsoDate(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function getColumnIndex(
  columns: string[],
  columnName: string,
  fallbackIndex: number,
): number {
  const index = columns.indexOf(columnName);
  return index >= 0 ? index : fallbackIndex;
}

export function normalizeDateKey(value: string | null | undefined): string {
  if (!value) return "";
  const candidate = value.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(candidate)) return "";

  const parsed = parseISO(candidate);
  if (!isValid(parsed)) return "";
  return format(parsed, "yyyy-MM-dd") === candidate ? candidate : "";
}

export function formatGroupDateLabel(dateKey: string): string {
  if (!dateKey) return "Belum ada tanggal";
  const parsed = parseISO(dateKey);
  if (!isValid(parsed)) return dateKey;
  return format(parsed, "EEEE, dd MMMM yyyy", { locale: idLocale });
}

export function normalizeRowCells(
  row: (string | null | undefined)[],
  columnCount: number,
): string[] {
  const cells = row.map((cell) => (typeof cell === "string" ? cell : ""));
  while (cells.length < columnCount) {
    cells.push("");
  }
  return cells;
}

export function createRowItem(
  columns: string[],
  defaultName: string,
  defaultDate: string,
): AvicennaWayRowItem {
  const nameIdx = getColumnIndex(columns, NAME_COLUMN_NAME, 0);
  const dateIdx = getColumnIndex(columns, DATE_COLUMN_NAME, 1);

  return {
    id: createRowId(),
    cells: columns.map((_, index) => {
      if (index === nameIdx) return defaultName;
      if (index === dateIdx) return defaultDate;
      return "";
    }),
  };
}

export function sortRowItemsDescending(
  rows: AvicennaWayRowItem[],
  dateColumnIndex: number,
): AvicennaWayRowItem[] {
  return rows
    .map((item, index) => ({
      item,
      index,
      dateKey: normalizeDateKey(item.cells[dateColumnIndex]),
    }))
    .sort((a, b) => {
      if (!a.dateKey && !b.dateKey) return a.index - b.index;
      if (!a.dateKey) return 1;
      if (!b.dateKey) return -1;
      if (a.dateKey !== b.dateKey) return b.dateKey.localeCompare(a.dateKey);
      return a.index - b.index;
    })
    .map((entry) => entry.item);
}

export function normalizeSheetResponse(
  sheet: AvicennaWaySheetResponse,
): AvicennaWaySheet {
  const columns =
    Array.isArray(sheet.columns) && sheet.columns.length > 0
      ? sheet.columns
      : [...DEFAULT_AVICENNA_COLUMNS];
  const dateIndex = getColumnIndex(columns, DATE_COLUMN_NAME, 1);
  const rawRows =
    Array.isArray(sheet.rows) && sheet.rows.length > 0
      ? sheet.rows
      : [columns.map(() => "")];

  const items: AvicennaWayRowItem[] = rawRows.map((row) => ({
    id: createRowId(),
    cells: normalizeRowCells(Array.isArray(row) ? row : [], columns.length),
  }));

  return {
    id: sheet.id,
    category: sheet.category,
    columns,
    rows: sortRowItemsDescending(items, dateIndex),
  };
}

export function blankAvicennaSheet(category: string): AvicennaWaySheet {
  return {
    id: `local-${category}`,
    category,
    columns: [...DEFAULT_AVICENNA_COLUMNS],
    rows: [createRowItem(DEFAULT_AVICENNA_COLUMNS, "", "")],
  };
}

export function summarizeFavorites(
  rows: AvicennaWayRowItem[],
  columns: string[],
): FavoriteSummary {
  const nameIndex = getColumnIndex(columns, NAME_COLUMN_NAME, 0);
  const favoriteIndex = getColumnIndex(columns, FAVORITE_COLUMN_NAME, 6);

  let totalPoints = 0;
  const counts: Record<string, number> = {};

  for (const row of rows) {
    if (row.cells[favoriteIndex] !== "1") continue;
    totalPoints += 1;
    const name = (row.cells[nameIndex] || "").trim();
    if (name) {
      counts[name] = (counts[name] || 0) + 1;
    }
  }

  const byName = Object.entries(counts).sort(
    ([nameA, countA], [nameB, countB]) =>
      countB - countA || nameA.localeCompare(nameB, "id"),
  );

  return { totalPoints, byName };
}

export function groupRowsByDate(
  rows: AvicennaWayRowItem[],
  columns: string[],
  pinnedRowDates: Record<string, string>,
): AvicennaWayDateGroup[] {
  const dateIndex = getColumnIndex(columns, DATE_COLUMN_NAME, 1);
  const buckets = new Map<string, AvicennaWayRowItem[]>();

  for (const row of rows) {
    const rawGroupDate =
      row.id in pinnedRowDates
        ? pinnedRowDates[row.id]
        : row.cells[dateIndex];
    const dateKey = normalizeDateKey(rawGroupDate);
    const list = buckets.get(dateKey);
    if (list) {
      list.push(row);
    } else {
      buckets.set(dateKey, [row]);
    }
  }

  const sortedKeys = Array.from(buckets.keys()).sort((keyA, keyB) => {
    if (!keyA && !keyB) return 0;
    if (!keyA) return 1;
    if (!keyB) return -1;
    return keyB.localeCompare(keyA);
  });

  return sortedKeys.map((dateKey) => {
    const groupRows = buckets.get(dateKey) || [];
    const favorites = summarizeFavorites(groupRows, columns);
    return {
      dateKey,
      label: formatGroupDateLabel(dateKey),
      rows: groupRows,
      favoritePoints: favorites.totalPoints,
      favoriteByName: favorites.byName,
    };
  });
}

export function isBlankRow(cells: string[]): boolean {
  return cells.every((cell) => cell.trim() === "");
}

export function updateCellInSheet(
  sheet: AvicennaWaySheet,
  rowId: string,
  columnIndex: number,
  value: string,
): AvicennaWaySheet {
  return {
    ...sheet,
    rows: sheet.rows.map((row) => {
      if (row.id !== rowId) return row;
      const cells = [...row.cells];
      while (cells.length < sheet.columns.length) cells.push("");
      cells[columnIndex] = value;
      return { ...row, cells };
    }),
  };
}

export function addRowToSheet(
  sheet: AvicennaWaySheet,
  defaultName: string,
  defaultDate: string,
): AvicennaWaySheet {
  const dateIndex = getColumnIndex(sheet.columns, DATE_COLUMN_NAME, 1);
  const newRow = createRowItem(sheet.columns, defaultName, defaultDate);
  const baseRows =
    sheet.rows.length === 1 && isBlankRow(sheet.rows[0].cells)
      ? []
      : sheet.rows;

  return {
    ...sheet,
    rows: sortRowItemsDescending([newRow, ...baseRows], dateIndex),
  };
}

export function removeRowFromSheet(
  sheet: AvicennaWaySheet,
  rowId: string,
): AvicennaWaySheet {
  return {
    ...sheet,
    rows:
      sheet.rows.length > 1
        ? sheet.rows.filter((row) => row.id !== rowId)
        : sheet.rows,
  };
}

export function sortSheetDescending(sheet: AvicennaWaySheet): AvicennaWaySheet {
  const dateIndex = getColumnIndex(sheet.columns, DATE_COLUMN_NAME, 1);
  return {
    ...sheet,
    rows: sortRowItemsDescending(sheet.rows, dateIndex),
  };
}
