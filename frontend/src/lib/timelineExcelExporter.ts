import ExcelJS from "exceljs";

export interface TimelineTask {
  id: string;
  title: string;
  request_date?: string | null;
  requestDate?: string | null;
  due_date?: string | null;
  dueDate?: string | null;
  priority?: string;
  column_id?: string;
  columnId?: string;
  status_hari_ini?: string;
  statusHariIni?: string;
  status_label?: string;
  statusLabel?: string;
  board_title?: string;
  boardTitle?: string;
  is_wig?: boolean;
  isWig?: boolean;
  project_type?: string;
  projectType?: string;
  duration_days?: number | null;
  durationDays?: number | null;
  keterangan?: string;
  program?: string;
}

export interface TimelineUserGroup {
  user: {
    id: string;
    name: string;
    short_name?: string;
    shortName?: string;
    email?: string;
    department?: string;
  };
  total_tasks?: number;
  totalTasks?: number;
  tasks: TimelineTask[];
}

const INDONESIAN_MONTHS = [
  "",
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function formatDateIndo(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "-";
  try {
    if (dateStr instanceof Date) {
      const day = dateStr.getDate();
      const month = INDONESIAN_MONTHS[dateStr.getMonth() + 1];
      const year = dateStr.getFullYear();
      return `${day} ${month} ${year}`;
    }
    const cleanStr = String(dateStr).trim();
    if (cleanStr.includes("-")) {
      const parts = cleanStr.slice(0, 10).split("-");
      if (parts.length >= 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year) && INDONESIAN_MONTHS[month]) {
          return `${day} ${INDONESIAN_MONTHS[month]} ${year}`;
        }
      }
    }
    const d = new Date(cleanStr);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const month = INDONESIAN_MONTHS[d.getMonth() + 1];
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    }
    return cleanStr;
  } catch {
    return String(dateStr);
  }
}

function formatEstimasi(days: number | string | null | undefined): string {
  if (days === null || days === undefined || days === "") return "-";
  const num = Number(days);
  if (isNaN(num)) return "-";
  return `${Math.abs(num)} Hari`;
}

function parseDateOnly(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  const clean = String(value).slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return isNaN(date.getTime()) ? null : date;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

interface TaskDateRange {
  start: Date;
  end: Date;
}

function resolveTaskDateRange(task: TimelineTask): TaskDateRange | null {
  const start = parseDateOnly(task.requestDate ?? task.request_date);
  let end = parseDateOnly(task.dueDate ?? task.due_date);
  const duration = Number(task.durationDays ?? task.duration_days);

  if (!end && start && Number.isFinite(duration) && duration > 0) {
    end = addDays(start, Math.max(0, Math.ceil(duration) - 1));
  }

  if (!start && end) return { start: end, end };
  if (!start) return null;
  if (!end || end < start) end = start;
  return { start, end };
}

function getTodayDateIndo(): string {
  const today = new Date();
  const day = today.getDate();
  const month = INDONESIAN_MONTHS[today.getMonth() + 1];
  const year = today.getFullYear();
  return `${day} ${month} ${year}`;
}

function resolveStatusHariIni(task: TimelineTask): string {
  const val = (
    task.statusHariIni ||
    task.status_hari_ini ||
    task.statusLabel ||
    task.status_label ||
    task.columnId ||
    task.column_id ||
    ""
  ).toLowerCase().trim();

  if (val === "done" || val === "selesai") return "Done";
  if (val === "progress" || val === "dalam proses") return "Progress";
  return "New";
}

function sanitizeSheetName(name: string, usedNames: Set<string>): string {
  let clean = name.replace(/[\:\\\/\?\*\[\]]/g, "").trim();
  if (!clean) clean = "Sheet";
  clean = clean.slice(0, 31);

  let finalName = clean;
  let counter = 1;
  while (usedNames.has(finalName.toLowerCase())) {
    const suffix = ` (${counter})`;
    finalName = `${clean.slice(0, 31 - suffix.length)}${suffix}`;
    counter++;
  }
  usedNames.add(finalName.toLowerCase());
  return finalName;
}

interface ExportStyles {
  fontTitle: Partial<ExcelJS.Font>;
  fontSubtitle: Partial<ExcelJS.Font>;
  fontHeader: Partial<ExcelJS.Font>;
  fontData: Partial<ExcelJS.Font>;
  fillHeader: ExcelJS.FillPattern;
  fillEven: ExcelJS.FillPattern;
  fillOdd: ExcelJS.FillPattern;
  borderThin: Partial<ExcelJS.Borders>;
}

function getExportStyles(): ExportStyles {
  return {
    fontTitle: { name: "Segoe UI", size: 14, bold: true, color: { argb: "FF1E293B" } },
    fontSubtitle: { name: "Segoe UI", size: 10, italic: true, color: { argb: "FF64748B" } },
    fontHeader: { name: "Segoe UI", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
    fontData: { name: "Segoe UI", size: 10, color: { argb: "FF1E293B" } },
    fillHeader: { type: "pattern", pattern: "solid", fgColor: { argb: "FF334155" } }, // Slate Doff
    fillEven: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } },
    fillOdd: { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } }, // Muted soft slate
    borderThin: {
      top: { style: "thin", color: { argb: "FFCBD5E1" } },
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
      right: { style: "thin", color: { argb: "FFCBD5E1" } },
    },
  };
}

interface StatusStyle {
  fill: ExcelJS.FillPattern;
  font: Partial<ExcelJS.Font>;
}

function getStatusStyle(status: string): StatusStyle {
  switch (status) {
    case "Done":
      return {
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCFCE7" } }, // Soft sage matte pastel
        font: { name: "Segoe UI", size: 10, bold: true, color: { argb: "FF166534" } }, // Sage dark
      };
    case "Progress":
      return {
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF3C7" } }, // Warm amber pastel
        font: { name: "Segoe UI", size: 10, bold: true, color: { argb: "FF92400E" } }, // Amber dark
      };
    case "New":
    default:
      return {
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF3B82F6" } }, // Strong blue
        font: { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFFFFFFF" } }, // White bold
      };
  }
}

interface PriorityStyle {
  fill: ExcelJS.FillPattern;
  font: Partial<ExcelJS.Font>;
}

function getPriorityStyle(priority?: string | null): PriorityStyle {
  const p = (priority || "").toLowerCase().trim();
  switch (p) {
    case "high":
    case "tinggi":
      return {
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE2E2" } }, // Soft Rose Pastel
        font: { name: "Segoe UI", size: 10, bold: true, color: { argb: "FF991B1B" } }, // Deep Rose Dark
      };
    case "medium":
    case "sedang":
      return {
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E7FF" } }, // Soft Muted Indigo Pastel
        font: { name: "Segoe UI", size: 10, bold: true, color: { argb: "FF3730A3" } }, // Deep Indigo Dark
      };
    case "low":
    case "rendah":
      return {
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } }, // Soft Slate Pastel
        font: { name: "Segoe UI", size: 10, bold: true, color: { argb: "FF475569" } }, // Charcoal Slate Dark
      };
    default:
      return {
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } },
        font: { name: "Segoe UI", size: 10, color: { argb: "FF64748B" } },
      };
  }
}

function formatPriority(priority?: string | null): string {
  if (!priority) return "Low";
  const p = priority.toLowerCase().trim();
  if (p === "high") return "High";
  if (p === "medium") return "Medium";
  if (p === "low") return "Low";
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function resolveProgram(task: TimelineTask): string {
  if (task.program && task.program.trim()) {
    return task.program;
  }
  if (task.keterangan && task.keterangan.trim()) {
    return task.keterangan;
  }
  const boardTitle = task.boardTitle ?? task.board_title ?? "";
  if (!boardTitle) return "-";
  const isWig = Boolean(task.isWig ?? task.is_wig);
  const projectType =
    task.projectType ?? task.project_type ?? (isWig ? "WIG" : "Program Kerja");
  return `${projectType}: ${boardTitle}`;
}

interface ProgramGroup {
  program: string;
  startIndex: number;
  endIndex: number;
}

function groupTasksByProgram(tasks: TimelineTask[]): TimelineTask[] {
  return [...tasks].sort((a, b) => {
    const progA = resolveProgram(a);
    const progB = resolveProgram(b);

    if (progA === "-" && progB !== "-") return 1;
    if (progA !== "-" && progB === "-") return -1;

    const isWigA = Boolean(a.isWig ?? a.is_wig);
    const isWigB = Boolean(b.isWig ?? b.is_wig);
    if (isWigA !== isWigB) {
      return isWigA ? -1 : 1;
    }

    const progCmp = progA.localeCompare(progB);
    if (progCmp !== 0) return progCmp;

    const reqA = a.requestDate ?? a.request_date ?? "9999-12-31";
    const reqB = b.requestDate ?? b.request_date ?? "9999-12-31";
    const reqCmp = reqA.localeCompare(reqB);
    if (reqCmp !== 0) return reqCmp;

    const dueA = a.dueDate ?? a.due_date ?? "9999-12-31";
    const dueB = b.dueDate ?? b.due_date ?? "9999-12-31";
    return dueA.localeCompare(dueB);
  });
}

function findProgramGroups(tasks: TimelineTask[]): ProgramGroup[] {
  const groups: ProgramGroup[] = [];
  let currentProgram: string | null = null;
  let currentStart = 0;

  tasks.forEach((task, index) => {
    const prog = resolveProgram(task);
    if (prog !== currentProgram) {
      if (currentProgram !== null) {
        groups.push({
          program: currentProgram,
          startIndex: currentStart,
          endIndex: index - 1,
        });
      }
      currentProgram = prog;
      currentStart = index;
    }
  });

  if (currentProgram !== null) {
    groups.push({
      program: currentProgram,
      startIndex: currentStart,
      endIndex: tasks.length - 1,
    });
  }

  return groups;
}

function calculateTaskRowHeight(title: string, isSingleRow: boolean, program: string): number {
  const titleLines = Math.max(1, Math.ceil((title || "").length / 38));
  if (isSingleRow) {
    const progLines = Math.max(1, Math.ceil((program || "").length / 38));
    const maxLines = Math.max(titleLines, progLines);
    if (maxLines <= 1) return 28;
    return Math.min(120, 20 + maxLines * 15);
  }
  if (titleLines <= 1) return 28;
  return Math.min(120, 20 + titleLines * 15);
}

function applyProgramMerges(
  worksheet: ExcelJS.Worksheet,
  groups: ProgramGroup[],
  styles: ExportStyles
) {
  groups.forEach((group) => {
    const startRow = group.startIndex + 5;
    const endRow = group.endIndex + 5;

    for (let r = startRow; r <= endRow; r++) {
      const cell = worksheet.getCell(r, 2);
      cell.fill = styles.fillEven;
      cell.border = styles.borderThin;
    }

    if (endRow > startRow) {
      worksheet.mergeCells(startRow, 2, endRow, 2);
    }

    const mergedCell = worksheet.getCell(startRow, 2);
    mergedCell.value = group.program;
    mergedCell.font = styles.fontData;
    mergedCell.alignment = {
      horizontal: "left",
      vertical: "middle",
      wrapText: true,
    };
  });
}

function renderSheetHeader(
  worksheet: ExcelJS.Worksheet,
  group: TimelineUserGroup,
  styles: ExportStyles
) {
  // Row 1: Title
  worksheet.mergeCells("A1:H1");
  const cellA1 = worksheet.getCell("A1");
  cellA1.value = `Timeline pekerjaan (${group.user.name})`;
  cellA1.font = styles.fontTitle;
  cellA1.alignment = { horizontal: "left", vertical: "middle" };
  worksheet.getRow(1).height = 32;

  // Row 2: Subtitle
  worksheet.mergeCells("A2:H2");
  const cellA2 = worksheet.getCell("A2");
  const deptInfo = group.user.department ? ` | Departemen: ${group.user.department}` : "";
  const totalCount = group.totalTasks ?? group.total_tasks ?? group.tasks?.length ?? 0;
  cellA2.value = `Nama Pegawai: ${group.user.name}${deptInfo} | Total Pekerjaan: ${totalCount} Kegiatan | Diekspor: ${getTodayDateIndo()}`;
  cellA2.font = styles.fontSubtitle;
  cellA2.alignment = { horizontal: "left", vertical: "middle" };
  worksheet.getRow(2).height = 24;

  // Row 3: Space
  worksheet.getRow(3).height = 10;

  // Row 4: Table Header with dynamic "Status (per [Tanggal])" column
  const statusHeader = `Status (per ${getTodayDateIndo()})`;
  const headers = [
    "No.",
    "Program",
    "Nama Kegiatan",
    "Prioritas",
    "Tanggal persiapan",
    "Tanggal selesai",
    "Estimasi",
    statusHeader,
  ];
  worksheet.getRow(4).height = 36;

  headers.forEach((headerText, idx) => {
    const cell = worksheet.getCell(4, idx + 1);
    cell.value = headerText;
    cell.font = styles.fontHeader;
    cell.fill = styles.fillHeader;
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = styles.borderThin;
  });
}

function renderTaskRow(
  worksheet: ExcelJS.Worksheet,
  rowNum: number,
  task: TimelineTask,
  idx: number,
  styles: ExportStyles,
  isSingleRow: boolean,
  programText: string
) {
  const row = worksheet.getRow(rowNum);
  const statusHariIni = resolveStatusHariIni(task);
  const statusStyle = getStatusStyle(statusHariIni);
  const priorityStyle = getPriorityStyle(task.priority);
  const formattedPriority = formatPriority(task.priority);

  row.height = calculateTaskRowHeight(task.title, isSingleRow, programText);

  const fillCurrent = idx % 2 === 1 ? styles.fillOdd : styles.fillEven;
  const reqDate = task.requestDate ?? task.request_date ?? null;
  const dueDate = task.dueDate ?? task.due_date ?? null;
  const durationDays = task.durationDays ?? task.duration_days ?? null;

  const rowValues = [
    idx + 1,
    programText,
    task.title,
    formattedPriority,
    formatDateIndo(reqDate),
    formatDateIndo(dueDate),
    formatEstimasi(durationDays),
    statusHariIni,
  ];

  rowValues.forEach((val, colIdx) => {
    const cell = worksheet.getCell(rowNum, colIdx + 1);
    cell.value = val;
    cell.border = styles.borderThin;

    if (colIdx === 3) {
      cell.fill = priorityStyle.fill;
      cell.font = priorityStyle.font;
    } else if (colIdx === 7) {
      cell.fill = statusStyle.fill;
      cell.font = statusStyle.font;
    } else {
      cell.fill = fillCurrent;
      cell.font = styles.fontData;
    }

    cell.alignment = {
      horizontal:
        colIdx === 0 || colIdx === 3 || colIdx === 4 || colIdx === 5 || colIdx === 6 || colIdx === 7
          ? "center"
          : "left",
      vertical: "middle",
      wrapText: colIdx === 1 || colIdx === 2,
    };
  });
}

function renderUserSheet(
  worksheet: ExcelJS.Worksheet,
  group: TimelineUserGroup,
  styles: ExportStyles
) {
  renderSheetHeader(worksheet, group, styles);

  const sortedTasks = groupTasksByProgram(group.tasks);
  const programGroups = findProgramGroups(sortedTasks);

  const singleRowMap = new Map<number, boolean>();
  programGroups.forEach((pg) => {
    const isSingle = pg.startIndex === pg.endIndex;
    for (let i = pg.startIndex; i <= pg.endIndex; i++) {
      singleRowMap.set(i, isSingle);
    }
  });

  sortedTasks.forEach((task, idx) => {
    const progText = resolveProgram(task);
    const isSingle = singleRowMap.get(idx) ?? true;
    renderTaskRow(worksheet, idx + 5, task, idx, styles, isSingle, progText);
  });

  // Column widths
  worksheet.columns = [
    { width: 8 },  // No.
    { width: 48 }, // Program
    { width: 48 }, // Nama Kegiatan
    { width: 16 }, // Prioritas
    { width: 22 }, // Tanggal persiapan
    { width: 22 }, // Tanggal selesai
    { width: 14 }, // Estimasi
    { width: 26 }, // Status (per [Tanggal])
  ];

  applyProgramMerges(worksheet, programGroups, styles);

  worksheet.views = [{ state: "frozen", ySplit: 4, showGridLines: true }];
}

function renderGanttSheet(
  worksheet: ExcelJS.Worksheet,
  group: TimelineUserGroup,
  styles: ExportStyles
) {
  const tasks = groupTasksByProgram(group.tasks);
  const ranges = tasks.map((task) => resolveTaskDateRange(task));
  const datedRanges = ranges.filter((range): range is TaskDateRange => Boolean(range));

  if (datedRanges.length === 0) {
    worksheet.getCell("A1").value = `Gantt Timeline - ${group.user.name}`;
    worksheet.getCell("A1").font = styles.fontTitle;
    worksheet.getCell("A3").value = "Tidak ada pekerjaan dengan tanggal persiapan atau tanggal selesai.";
    worksheet.getCell("A3").font = styles.fontSubtitle;
    return;
  }

  const timelineStart = new Date(Math.min(...datedRanges.map((range) => range.start.getTime())));
  const timelineEnd = new Date(Math.max(...datedRanges.map((range) => range.end.getTime())));
  const dates: Date[] = [];
  for (let date = timelineStart; date <= timelineEnd; date = addDays(date, 1)) {
    dates.push(date);
  }

  const firstTimelineColumn = 8;
  const lastColumn = firstTimelineColumn + dates.length - 1;
  worksheet.mergeCells(1, 1, 1, lastColumn);
  worksheet.getCell("A1").value = `Gantt Timeline (${group.user.name})`;
  worksheet.getCell("A1").font = styles.fontTitle;
  worksheet.getCell("A1").alignment = { horizontal: "left", vertical: "middle" };
  worksheet.getRow(1).height = 32;

  worksheet.mergeCells(2, 1, 2, lastColumn);
  const deptInfo = group.user.department ? ` | Departemen: ${group.user.department}` : "";
  worksheet.getCell("A2").value = `Nama Pegawai: ${group.user.name}${deptInfo} | Blok warna menunjukkan durasi pekerjaan`;
  worksheet.getCell("A2").font = styles.fontSubtitle;
  worksheet.getCell("A2").alignment = { horizontal: "left", vertical: "middle" };
  worksheet.getRow(2).height = 24;

  const headers = ["No.", "Program", "Nama Kegiatan", "Prioritas", "Tanggal persiapan", "Tanggal selesai", "Status"];
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(4, index + 1);
    cell.value = header;
    cell.font = styles.fontHeader;
    cell.fill = styles.fillHeader;
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = styles.borderThin;
  });

  dates.forEach((date, index) => {
    const cell = worksheet.getCell(4, firstTimelineColumn + index);
    cell.value = date;
    cell.numFmt = "dd mmm";
    cell.font = styles.fontHeader;
    cell.fill = styles.fillHeader;
    cell.alignment = { horizontal: "center", vertical: "middle", textRotation: 90 };
    cell.border = styles.borderThin;
  });
  worksheet.getRow(4).height = 72;

  tasks.forEach((task, index) => {
    const rowNumber = index + 5;
    const row = worksheet.getRow(rowNumber);
    const status = resolveStatusHariIni(task);
    const statusStyle = getStatusStyle(status);
    const priorityStyle = getPriorityStyle(task.priority);
    const range = ranges[index];
    const values = [
      index + 1,
      resolveProgram(task),
      task.title,
      formatPriority(task.priority),
      range ? formatDateIndo(range.start) : "-",
      range ? formatDateIndo(range.end) : "-",
      status,
    ];

    values.forEach((value, columnIndex) => {
      const cell = worksheet.getCell(rowNumber, columnIndex + 1);
      cell.value = value;
      cell.border = styles.borderThin;
      cell.fill = columnIndex === 3 ? priorityStyle.fill : columnIndex === 6 ? statusStyle.fill : index % 2 ? styles.fillOdd : styles.fillEven;
      cell.font = columnIndex === 3 ? priorityStyle.font : columnIndex === 6 ? statusStyle.font : styles.fontData;
      cell.alignment = {
        horizontal: columnIndex === 0 || columnIndex >= 3 ? "center" : "left",
        vertical: "middle",
        wrapText: columnIndex === 1 || columnIndex === 2,
      };
    });

    dates.forEach((date, dateIndex) => {
      const cell = worksheet.getCell(rowNumber, firstTimelineColumn + dateIndex);
      const active = Boolean(range && date >= range.start && date <= range.end);
      cell.value = active ? "" : null;
      cell.border = styles.borderThin;
      cell.fill = active ? statusStyle.fill : index % 2 ? styles.fillOdd : styles.fillEven;
    });
    row.height = calculateTaskRowHeight(task.title, true, resolveProgram(task));
  });

  worksheet.columns = [
    { width: 8 },
    { width: 34 },
    { width: 42 },
    { width: 14 },
    { width: 20 },
    { width: 20 },
    { width: 16 },
    ...dates.map(() => ({ width: 5 })),
  ];
  applyProgramMerges(worksheet, findProgramGroups(tasks), styles);
  worksheet.views = [{ state: "frozen", xSplit: firstTimelineColumn - 1, ySplit: 4, showGridLines: true }];
  worksheet.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4 + tasks.length, column: lastColumn } };
}

export async function exportTimelineToExcel(
  userGroups: TimelineUserGroup[],
  fileName = "Timeline_Pekerjaan_Tim.xlsx"
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TimePro Avicenna";
  workbook.created = new Date();

  const styles = getExportStyles();
  const usedSheetNames = new Set<string>();

  for (const group of userGroups) {
    const rawName = group.user.name || "Pegawai";
    const sheetName = sanitizeSheetName(rawName, usedSheetNames);
    const worksheet = workbook.addWorksheet(sheetName, {
      views: [{ showGridLines: true }],
    });
    renderUserSheet(worksheet, group, styles);

    const ganttSheetName = sanitizeSheetName(`Gantt - ${rawName}`, usedSheetNames);
    const ganttWorksheet = workbook.addWorksheet(ganttSheetName, {
      views: [{ showGridLines: true }],
    });
    renderGanttSheet(ganttWorksheet, group, styles);
  }

  // Generate buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}
