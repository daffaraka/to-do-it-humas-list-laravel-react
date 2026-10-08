import ExcelJS from "exceljs";

export interface TimelineTask {
  id: string;
  title: string;
  request_date: string | null;
  due_date: string | null;
  priority: string;
  column_id: string;
  status_label: string;
  board_title: string;
  duration_days: number | null;
  keterangan: string;
}

export interface TimelineUserGroup {
  user: {
    id: string;
    name: string;
    short_name: string;
    email: string;
    department?: string;
  };
  total_tasks: number;
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

function formatDateIndo(dateStr: string | null): string {
  if (!dateStr) return "-";
  try {
    const parts = dateStr.slice(0, 10).split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    return `${day} ${INDONESIAN_MONTHS[month]} ${year}`;
  } catch {
    return dateStr;
  }
}

function formatEstimasi(days: number | null): string {
  if (days === null || days === undefined) return "-";
  return `${days} Hari`;
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

export async function exportTimelineToExcel(
  userGroups: TimelineUserGroup[],
  fileName = "Timeline_Pekerjaan_Tim.xlsx"
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TimePro Avicenna";
  workbook.created = new Date();

  // Doff Aesthetic Styling Constants
  const fontTitle: Partial<ExcelJS.Font> = {
    name: "Segoe UI",
    size: 14,
    bold: true,
    color: { argb: "FF1E293B" },
  };
  const fontSubtitle: Partial<ExcelJS.Font> = {
    name: "Segoe UI",
    size: 10,
    italic: true,
    color: { argb: "FF64748B" },
  };
  const fontHeader: Partial<ExcelJS.Font> = {
    name: "Segoe UI",
    size: 11,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  const fontData: Partial<ExcelJS.Font> = {
    name: "Segoe UI",
    size: 10,
    color: { argb: "FF1E293B" },
  };

  const fillHeader: ExcelJS.FillPattern = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF334155" }, // Slate Doff
  };
  const fillEven: ExcelJS.FillPattern = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFFFFF" },
  };
  const fillOdd: ExcelJS.FillPattern = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF8FAFC" }, // Muted soft slate
  };

  const borderThin: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: "FFCBD5E1" } },
    left: { style: "thin", color: { argb: "FFCBD5E1" } },
    bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
    right: { style: "thin", color: { argb: "FFCBD5E1" } },
  };

  const usedSheetNames = new Set<string>();

  for (const group of userGroups) {
    const rawName = group.user.name || "Pegawai";
    const sheetName = sanitizeSheetName(rawName, usedSheetNames);

    const worksheet = workbook.addWorksheet(sheetName, {
      views: [{ showGridLines: true }],
    });

    // Row 1: Title
    worksheet.mergeCells("A1:F1");
    const cellA1 = worksheet.getCell("A1");
    cellA1.value = `Timeline pekerjaan (${group.user.name})`;
    cellA1.font = fontTitle;
    cellA1.alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getRow(1).height = 28;

    // Row 2: Subtitle
    worksheet.mergeCells("A2:F2");
    const cellA2 = worksheet.getCell("A2");
    const deptInfo = group.user.department ? ` | Departemen: ${group.user.department}` : "";
    cellA2.value = `Nama Pegawai: ${group.user.name}${deptInfo} | Total Pekerjaan: ${group.total_tasks} Kegiatan`;
    cellA2.font = fontSubtitle;
    cellA2.alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getRow(2).height = 20;

    // Row 3: Space
    worksheet.getRow(3).height = 10;

    // Row 4: Table Header
    const headers = [
      "No.",
      "Nama Kegiatan",
      "Tanggal persiapan",
      "Tanggal Pelaksanaan",
      "Estimasi",
      "Keterangan",
    ];
    worksheet.getRow(4).height = 28;

    headers.forEach((headerText, idx) => {
      const cell = worksheet.getCell(4, idx + 1);
      cell.value = headerText;
      cell.font = fontHeader;
      cell.fill = fillHeader;
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      cell.border = borderThin;
    });

    // Rows 5+: Data rows
    group.tasks.forEach((task, idx) => {
      const rowNum = idx + 5;
      const row = worksheet.getRow(rowNum);
      row.height = 24;

      const fillCurrent = idx % 2 === 1 ? fillOdd : fillEven;

      const rowValues = [
        idx + 1,
        task.title,
        formatDateIndo(task.request_date),
        formatDateIndo(task.due_date),
        formatEstimasi(task.duration_days),
        task.keterangan,
      ];

      rowValues.forEach((val, colIdx) => {
        const cell = worksheet.getCell(rowNum, colIdx + 1);
        cell.value = val;
        cell.font = fontData;
        cell.fill = fillCurrent;
        cell.border = borderThin;
        cell.alignment = {
          horizontal:
            colIdx === 0 || colIdx === 2 || colIdx === 3 || colIdx === 4
              ? "center"
              : "left",
          vertical: "middle",
          wrapText: colIdx === 1 || colIdx === 5,
        };
      });
    });

    // Column widths
    worksheet.columns = [
      { width: 8 },  // No.
      { width: 48 }, // Nama Kegiatan
      { width: 22 }, // Tanggal persiapan
      { width: 22 }, // Tanggal Pelaksanaan
      { width: 16 }, // Estimasi
      { width: 52 }, // Keterangan
    ];

    // Freeze panes below header
    worksheet.views = [{ state: "frozen", ySplit: 4, showGridLines: true }];
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
