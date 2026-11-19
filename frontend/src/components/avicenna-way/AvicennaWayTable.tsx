import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import {
  AI_COLUMN_NAME,
  DATE_COLUMN_NAME,
  FAVORITE_COLUMN_NAME,
  getColumnIndex,
  type AvicennaWayDateGroup,
  type AvicennaWayRowItem,
  type AvicennaWaySheet,
} from "@/lib/avicennaWay";
import {
  AutoResizeTextarea,
  AvicennaWayAiCell,
  AvicennaWayDateCell,
} from "@/components/avicenna-way/AvicennaWayCells";

interface TableHandlers {
  onSetCell: (rowId: string, columnIndex: number, value: string) => void;
  onDateFocusStart: (rowId: string, currentDate: string) => void;
  onDateFocusEnd: (rowId: string) => void;
  onAddRow: (defaultDate?: string) => void;
  onAddTodayFromBottom: () => void;
  onDeleteRow: (rowId: string) => void;
  onAnalyzeRow: (rowId: string) => void;
  onClearAnalysis: (rowId: string) => void;
}

function AvicennaWayRow({
  row,
  displayNumber,
  columns,
  canDelete,
  handlers,
}: {
  row: AvicennaWayRowItem;
  displayNumber: number;
  columns: string[];
  canDelete: boolean;
  handlers: TableHandlers;
}) {
  const dateColumnIndex = getColumnIndex(columns, DATE_COLUMN_NAME, 1);
  const favoriteColumnIndex = getColumnIndex(columns, FAVORITE_COLUMN_NAME, 6);
  const aiColumnIndex = getColumnIndex(columns, AI_COLUMN_NAME, 7);

  return (
    <tr className="group hover:bg-bgGlass/40">
      <td className="border-b border-r border-borderBase px-3 py-2 text-center align-top text-xs font-semibold text-textSecondary">
        {displayNumber}
      </td>
      {columns.map((_, columnIndex) => (
        <td
          key={columnIndex}
          className="min-w-[190px] border-b border-r border-borderBase p-2 align-top"
        >
          {columnIndex === dateColumnIndex ? (
            <AvicennaWayDateCell
              value={row.cells[columnIndex] || ""}
              onChange={(next) => handlers.onSetCell(row.id, columnIndex, next)}
              onFocusStart={() =>
                handlers.onDateFocusStart(row.id, row.cells[columnIndex] || "")
              }
              onFocusEnd={() => handlers.onDateFocusEnd(row.id)}
            />
          ) : columnIndex === favoriteColumnIndex ? (
            <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-3 text-sm text-textSecondary hover:bg-bgGlass">
              <input
                type="checkbox"
                checked={row.cells[columnIndex] === "1"}
                onChange={(event) =>
                  handlers.onSetCell(
                    row.id,
                    columnIndex,
                    event.target.checked ? "1" : "",
                  )
                }
                className="h-4 w-4 accent-indigo-600"
              />
              <span>
                {row.cells[columnIndex] === "1" ? "1 poin" : "Pilih favorit"}
              </span>
            </label>
          ) : columnIndex === aiColumnIndex ? (
            <AvicennaWayAiCell
              value={row.cells[columnIndex]}
              onAnalyze={() => handlers.onAnalyzeRow(row.id)}
              onClear={() => handlers.onClearAnalysis(row.id)}
            />
          ) : (
            <AutoResizeTextarea
              value={row.cells[columnIndex] || ""}
              onChange={(value) => handlers.onSetCell(row.id, columnIndex, value)}
              placeholder="Klik untuk mengisi..."
            />
          )}
        </td>
      ))}
      <td className="border-b border-borderBase px-2 py-2 align-top">
        {canDelete && (
          <button
            type="button"
            onClick={() => handlers.onDeleteRow(row.id)}
            title="Hapus baris"
            className="rounded-lg p-2 text-textSecondary opacity-100 transition hover:bg-red-500/10 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <Trash2 size={16} />
          </button>
        )}
      </td>
    </tr>
  );
}

function AvicennaWayDateGroupRows({
  group,
  columns,
  totalRowCount,
  isCollapsed,
  onToggleCollapse,
  handlers,
}: {
  group: AvicennaWayDateGroup;
  columns: string[];
  totalRowCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  handlers: TableHandlers;
}) {
  return (
    <tbody>
      <tr className="bg-indigo-500/[0.06] dark:bg-indigo-500/10">
        <td
          colSpan={columns.length + 2}
          className="border-b border-borderBase px-4 py-2.5"
        >
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="flex flex-wrap items-center gap-2 text-left text-sm font-bold text-textPrimary transition hover:text-indigo-500"
            >
              {isCollapsed ? (
                <ChevronRight size={16} className="text-indigo-500" />
              ) : (
                <ChevronDown size={16} className="text-indigo-500" />
              )}
              <span>{group.label}</span>
              <span className="rounded-full border border-borderBase bg-bgSecondary px-2 py-0.5 text-xs font-semibold text-textSecondary">
                {group.rows.length} entri
              </span>
              {group.favoritePoints > 0 && (
                <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300">
                  {group.favoritePoints} Favorit
                </span>
              )}
            </button>
            {group.dateKey ? (
              <button
                type="button"
                onClick={() => handlers.onAddRow(group.dateKey)}
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-800 bg-black px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800 dark:border-neutral-700"
              >
                <Plus size={13} /> Tambah di tanggal ini
              </button>
            ) : (
              <span className="text-xs font-normal text-textSecondary">
                Isi kolom Tanggal agar baris masuk ke grup tanggal
              </span>
            )}
          </div>
        </td>
      </tr>
      {!isCollapsed &&
        group.rows.map((row, rowIndex) => (
          <AvicennaWayRow
            key={row.id}
            row={row}
            displayNumber={rowIndex + 1}
            columns={columns}
            canDelete={totalRowCount > 1}
            handlers={handlers}
          />
        ))}
    </tbody>
  );
}

export function AvicennaWayTable({
  sheet,
  groups,
  isLoading,
  isGroupCollapsed,
  onToggleGroup,
  handlers,
}: {
  sheet: AvicennaWaySheet;
  groups: AvicennaWayDateGroup[];
  isLoading: boolean;
  isGroupCollapsed: (dateKey: string) => boolean;
  onToggleGroup: (dateKey: string) => void;
  handlers: TableHandlers;
}) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full border-separate border-spacing-0 border border-borderBase text-sm">
          <thead>
            <tr className="bg-bgGlass text-left text-xs font-bold uppercase tracking-wide text-textSecondary">
              <th className="w-14 border-b border-r border-borderBase px-3 py-3 text-center">
                No
              </th>
              {sheet.columns.map((column, index) => (
                <th
                  key={`${column}-${index}`}
                  className="border-b border-r border-borderBase px-3 py-3 align-middle leading-relaxed"
                >
                  {column}
                </th>
              ))}
              <th className="w-14 border-b border-borderBase px-3 py-3" />
            </tr>
          </thead>
          {isLoading ? (
            <tbody>
              <tr>
                <td
                  colSpan={sheet.columns.length + 2}
                  className="p-10 text-center text-textSecondary"
                >
                  Memuat sheet...
                </td>
              </tr>
            </tbody>
          ) : (
            groups.map((group) => (
              <AvicennaWayDateGroupRows
                key={group.dateKey || "__undated__"}
                group={group}
                columns={sheet.columns}
                totalRowCount={sheet.rows.length}
                isCollapsed={isGroupCollapsed(group.dateKey)}
                onToggleCollapse={() => onToggleGroup(group.dateKey)}
                handlers={handlers}
              />
            ))
          )}
        </table>
      </div>
      <div className="border-t border-borderBase px-4 py-3">
        <button
          type="button"
          onClick={handlers.onAddTodayFromBottom}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-indigo-500 transition hover:bg-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={16} /> Tambah baris (Hari ini)
        </button>
      </div>
    </>
  );
}
