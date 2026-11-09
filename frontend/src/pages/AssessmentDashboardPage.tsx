import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Info,
  Loader2,
  Search,
  Sparkles,
  UserRound,
  XCircle,
} from "lucide-react";
import { cachedGet } from "@/lib/api";

type AssessmentUser = {
  id: string;
  name: string;
  email?: string;
  role?: { name?: string };
  department?: { id?: string; name?: string };
};

type AssessmentBoard = {
  id: string;
  title: string;
  bobotBoard?: number | string | null;
  departmentId?: string | null;
  department_id?: string | null;
  kpiId?: string | null;
  kpi_id?: string | null;
  department?: { id?: string; name?: string } | null;
  tasks?: AssessmentTask[];
};

type AssessmentTask = {
  id: string;
  title: string;
  picId?: string | null;
  priority?: string | null;
  columnId?: string | null;
  recurrenceCount?: number;
  recurrenceStatuses?: Record<string, "new" | "progress" | "done"> | null;
  collaborators?: { id: string; name: string; department?: { id?: string; name?: string } | null }[];
};

type AssessmentRow = AssessmentUser & {
  totalJobs: number;
  newJobs: number;
  progressJobs: number;
  doneJobs: number;
  allocatedPoints: number;
  achievedPoints: number;
  achievement: number;
  wigAllocatedPoints: number;
  wigAchievedPoints: number;
  programAllocatedPoints: number;
  programAchievedPoints: number;
  combinedAllocatedPoints: number;
  combinedAchievedPoints: number;
  wigAchievement: number;
  combinedAchievement: number;
};

type DepartmentAssessmentRow = {
  id: string;
  name: string;
  people: number;
  totalJobs: number;
  newJobs: number;
  progressJobs: number;
  doneJobs: number;
  allocatedPoints: number;
  achievedPoints: number;
  achievement: number;
  wigAllocatedPoints: number;
  wigAchievedPoints: number;
  programAllocatedPoints: number;
  programAchievedPoints: number;
  combinedAllocatedPoints: number;
  combinedAchievedPoints: number;
  wigAchievement: number;
  combinedAchievement: number;
};

const priorityWeights: Record<string, number> = {
  low: 1,
  medium: 3,
  high: 5,
};

const formatPoints = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const avatarColors = [
  "from-indigo-500 to-violet-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-fuchsia-500 to-purple-600",
];

const avatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

function StatPill({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className={`rounded-2xl border px-3 py-2.5 ${tone}`}>
      <div className="flex items-center gap-2 text-[11px] font-semibold opacity-80">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-xl font-bold text-textPrimary">{value}</div>
    </div>
  );
}

export default function AssessmentDashboardPage() {
  const [users, setUsers] = useState<AssessmentUser[]>([]);
  const [boards, setBoards] = useState<AssessmentBoard[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"points" | "achievement" | "jobs">("points");
  const [activeTab, setActiveTab] = useState<"individual" | "department">("individual");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    Promise.all([cachedGet<any[]>("/users"), cachedGet<any[]>("/boards")])
      .then(([usersResponse, boardsResponse]) => {
        if (!active) return;
        const loadedUsers = Array.isArray(usersResponse.data) ? usersResponse.data : [];
        const loadedBoards = Array.isArray(boardsResponse.data) ? boardsResponse.data : [];
        const collaboratorUsers = loadedBoards.flatMap((board: AssessmentBoard) =>
          (board.tasks || []).flatMap((task) => task.collaborators || []),
        );
        const allUsers = new Map<string, AssessmentUser>();
        [...loadedUsers, ...collaboratorUsers].forEach((user: AssessmentUser) => {
          if (user?.id) allUsers.set(user.id, user);
        });
        setUsers(Array.from(allUsers.values()));
        setBoards(loadedBoards);
      })
      .catch(() => {
        if (active) setError("Data penilaian belum dapat dimuat.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo<AssessmentRow[]>(() => {
    const calculations = new Map<string, Omit<AssessmentRow, keyof AssessmentUser>>();

    users.forEach((user) => {
      calculations.set(user.id, {
        totalJobs: 0,
        newJobs: 0,
        progressJobs: 0,
        doneJobs: 0,
        allocatedPoints: 0,
        achievedPoints: 0,
        achievement: 0,
        wigAllocatedPoints: 0,
        wigAchievedPoints: 0,
        programAllocatedPoints: 0,
        programAchievedPoints: 0,
        combinedAllocatedPoints: 0,
        combinedAchievedPoints: 0,
        wigAchievement: 0,
        combinedAchievement: 0,
      });
    });

    boards.forEach((board) => {
      const tasks = board.tasks || [];
      const boardWeight = Number(board.bobotBoard || 0);
      const totalPriorityWeight = tasks.reduce(
        (sum, task) => sum + (priorityWeights[task.priority?.toLowerCase() || "low"] || 1) * Math.max(1, Number(task.recurrenceCount || 1)),
        0,
      );

      tasks.forEach((task) => {
        const participantIds = Array.from(new Set([
          task.picId,
          ...(task.collaborators || []).map((collaborator) => collaborator.id),
        ].filter(Boolean) as string[]));
        if (participantIds.length === 0) return;

        const status = task.columnId || "new";
        const priorityWeight = priorityWeights[task.priority?.toLowerCase() || "low"] || 1;
        const occurrenceCount = Math.max(1, Number(task.recurrenceCount || 1));
        const occurrenceStatusValues = Object.values(task.recurrenceStatuses || {});
        const missingOccurrences = Math.max(0, occurrenceCount - occurrenceStatusValues.length);
        const doneOccurrences = occurrenceStatusValues.filter((value) => value === "done").length + (status === "done" ? missingOccurrences : 0);
        const progressOccurrences = occurrenceStatusValues.filter((value) => value === "progress").length + (status === "progress" ? missingOccurrences : 0);
        const newOccurrences = Math.max(0, occurrenceCount - doneOccurrences - progressOccurrences);
        // Jika bobot program belum diisi, pekerjaan tetap memiliki bobot
        // berdasarkan prioritasnya (Low=1, Medium=3, High=5).
        const taskPoints = totalPriorityWeight > 0
          ? boardWeight > 0
            ? (priorityWeight * occurrenceCount / totalPriorityWeight) * boardWeight
            : priorityWeight * occurrenceCount
          : 0;

        // Setiap peserta menerima bobot penuh yang sama; bobot tidak dibagi.
        const participantTaskPoints = taskPoints;
        participantIds.forEach((participantId) => {
          if (!calculations.has(participantId)) {
            calculations.set(participantId, {
              totalJobs: 0, newJobs: 0, progressJobs: 0, doneJobs: 0,
              allocatedPoints: 0, achievedPoints: 0, achievement: 0,
              wigAllocatedPoints: 0, wigAchievedPoints: 0,
              programAllocatedPoints: 0, programAchievedPoints: 0,
              combinedAllocatedPoints: 0, combinedAchievedPoints: 0,
              wigAchievement: 0, combinedAchievement: 0,
            });
          }
          const row = calculations.get(participantId)!;
          row.totalJobs += occurrenceCount;
          row.allocatedPoints += participantTaskPoints;
          row.doneJobs += doneOccurrences;
          row.progressJobs += progressOccurrences;
          row.newJobs += newOccurrences;
          row.achievedPoints += participantTaskPoints * (doneOccurrences / occurrenceCount);
          if (board.kpi_id || board.kpiId) {
            row.wigAllocatedPoints += participantTaskPoints;
            row.wigAchievedPoints += participantTaskPoints * (doneOccurrences / occurrenceCount);
          } else {
            row.programAllocatedPoints += participantTaskPoints;
            row.programAchievedPoints += participantTaskPoints * (doneOccurrences / occurrenceCount);
          }
        });
      });
    });

    return users
      .map((user) => {
        const calculated = calculations.get(user.id)!;
        return {
          ...user,
          ...calculated,
          achievement:
            calculated.allocatedPoints > 0
              ? Math.min(100, (calculated.achievedPoints / calculated.allocatedPoints) * 100)
              : 0,
          combinedAllocatedPoints: calculated.allocatedPoints,
          combinedAchievedPoints: calculated.achievedPoints,
          wigAchievement: calculated.wigAllocatedPoints > 0
            ? Math.min(100, (calculated.wigAchievedPoints / calculated.wigAllocatedPoints) * 100)
            : 0,
          combinedAchievement: calculated.allocatedPoints > 0
            ? Math.min(100, (calculated.achievedPoints / calculated.allocatedPoints) * 100)
            : 0,
        };
      })
      .sort((a, b) => {
        if (sortBy === "achievement") return b.achievement - a.achievement;
        if (sortBy === "jobs") return b.totalJobs - a.totalJobs;
        return b.achievedPoints - a.achievedPoints;
      });
  }, [boards, sortBy, users]);

  const departments = useMemo(
    () => Array.from(new Set(users.map((user) => user.department?.name).filter(Boolean))) as string[],
    [users],
  );

  const filteredRows = rows.filter((row) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      row.name.toLowerCase().includes(query) || (row.email || "").toLowerCase().includes(query);
    const rowDepartmentName = row.department?.name || "Tanpa departemen";
    const matchesDepartment = departmentFilter === "all" || rowDepartmentName === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const totals = rows.reduce(
    (summary, row) => ({
      jobs: summary.jobs + row.totalJobs,
      done: summary.done + row.doneJobs,
      achieved: summary.achieved + row.achievedPoints,
    }),
    { jobs: 0, done: 0, achieved: 0 },
  );

  const departmentRows = useMemo<DepartmentAssessmentRow[]>(() => {
    const userDepartments = new Map(users.map((user) => [user.id, user.department]));
    const calculations = new Map<string, Omit<DepartmentAssessmentRow, "id" | "name" | "achievement" | "people" | "wigAchievement" | "combinedAchievement"> & { peopleIds: Set<string> }>();
    const names = new Map<string, string>();

    boards.forEach((board) => {
      const tasks = board.tasks || [];
      const isWigBoard = Boolean(board.kpi_id || board.kpiId);
      const boardWeight = Number(board.bobotBoard || 0);
      const totalPriorityWeight = tasks.reduce(
        (sum, task) => sum + (priorityWeights[task.priority?.toLowerCase() || "low"] || 1) * Math.max(1, Number(task.recurrenceCount || 1)),
        0,
      );

      tasks.forEach((task) => {
        const participantIds = Array.from(new Set([
          task.picId,
          ...(task.collaborators || []).map((collaborator) => collaborator.id),
        ].filter(Boolean) as string[]));
        if (participantIds.length === 0) return;

        const priorityWeight = priorityWeights[task.priority?.toLowerCase() || "low"] || 1;
        const occurrenceCount = Math.max(1, Number(task.recurrenceCount || 1));
        const occurrenceStatusValues = Object.values(task.recurrenceStatuses || {});
        const missingOccurrences = Math.max(0, occurrenceCount - occurrenceStatusValues.length);
        const doneOccurrences = occurrenceStatusValues.filter((value) => value === "done").length + (task.columnId === "done" ? missingOccurrences : 0);
        const progressOccurrences = occurrenceStatusValues.filter((value) => value === "progress").length + (task.columnId === "progress" ? missingOccurrences : 0);
        const newOccurrences = Math.max(0, occurrenceCount - doneOccurrences - progressOccurrences);
        const taskPoints = totalPriorityWeight > 0
          ? boardWeight > 0
            ? (priorityWeight * occurrenceCount / totalPriorityWeight) * boardWeight
            : priorityWeight * occurrenceCount
          : 0;

        // Setiap peserta menerima bobot penuh yang sama; bobot tidak dibagi.
        const participantTaskPoints = taskPoints;
        participantIds.forEach((participantId) => {
          const taskDepartment = userDepartments.get(participantId);
          // PIC dan collaborator masing-masing dihitung pada departemennya.
          const departmentId = taskDepartment?.id || board.departmentId || board.department_id || "unassigned";
          const departmentName = taskDepartment?.name || board.department?.name || "Tanpa departemen";
          const current = calculations.get(departmentId) || {
            peopleIds: new Set<string>(), totalJobs: 0, newJobs: 0, progressJobs: 0, doneJobs: 0,
            allocatedPoints: 0, achievedPoints: 0, wigAllocatedPoints: 0, wigAchievedPoints: 0,
            programAllocatedPoints: 0, programAchievedPoints: 0,
            combinedAllocatedPoints: 0, combinedAchievedPoints: 0,
          };
          current.peopleIds.add(participantId);
          current.totalJobs += occurrenceCount;
          current.newJobs += newOccurrences;
          current.progressJobs += progressOccurrences;
          current.doneJobs += doneOccurrences;
          if (isWigBoard) {
            current.wigAllocatedPoints += participantTaskPoints;
            current.wigAchievedPoints += participantTaskPoints * (doneOccurrences / occurrenceCount);
          } else {
            current.allocatedPoints += participantTaskPoints;
            current.achievedPoints += participantTaskPoints * (doneOccurrences / occurrenceCount);
            current.programAllocatedPoints += participantTaskPoints;
            current.programAchievedPoints += participantTaskPoints * (doneOccurrences / occurrenceCount);
          }
          calculations.set(departmentId, current);
          names.set(departmentId, departmentName);
        });
      });
    });

    return Array.from(calculations.entries()).map(([id, calculated]) => ({
      id,
      name: names.get(id) || "Tanpa departemen",
      people: calculated.peopleIds.size,
      totalJobs: calculated.totalJobs,
      newJobs: calculated.newJobs,
      progressJobs: calculated.progressJobs,
      doneJobs: calculated.doneJobs,
      allocatedPoints: calculated.wigAllocatedPoints + calculated.allocatedPoints,
      achievedPoints: calculated.wigAchievedPoints + calculated.achievedPoints,
      achievement: calculated.wigAllocatedPoints + calculated.allocatedPoints > 0
        ? Math.min(100, ((calculated.wigAchievedPoints + calculated.achievedPoints) / (calculated.wigAllocatedPoints + calculated.allocatedPoints)) * 100)
        : 0,
      wigAllocatedPoints: calculated.wigAllocatedPoints,
      wigAchievedPoints: calculated.wigAchievedPoints,
      programAllocatedPoints: calculated.programAllocatedPoints,
      programAchievedPoints: calculated.programAchievedPoints,
      combinedAllocatedPoints: calculated.wigAllocatedPoints + calculated.allocatedPoints,
      combinedAchievedPoints: calculated.wigAchievedPoints + calculated.achievedPoints,
      wigAchievement: calculated.wigAllocatedPoints > 0
        ? Math.min(100, (calculated.wigAchievedPoints / calculated.wigAllocatedPoints) * 100)
        : 0,
      combinedAchievement: calculated.wigAllocatedPoints + calculated.allocatedPoints > 0
        ? Math.min(100, ((calculated.wigAchievedPoints + calculated.achievedPoints) / (calculated.wigAllocatedPoints + calculated.allocatedPoints)) * 100)
        : 0,
    })).sort((a, b) => b.combinedAchievedPoints - a.combinedAchievedPoints);
  }, [boards, users]);

  const filteredDepartmentRows = departmentRows.filter((row) =>
    row.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const departmentTotals = departmentRows.reduce(
    (summary, row) => ({
      departments: summary.departments + 1,
      jobs: summary.jobs + row.totalJobs,
      done: summary.done + row.doneJobs,
      achieved: summary.achieved + row.achievedPoints,
    }),
    { departments: 0, jobs: 0, done: 0, achieved: 0 },
  );

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-xl shadow-indigo-900/10">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-indigo-100">
              <Sparkles size={18} />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Performance Center</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Penilaian</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100">
              Pantau kontribusi dan ketercapaian KPI pegawai serta departemen berdasarkan status pekerjaan dan bobot program kerja.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="text-xs text-indigo-100">Pegawai</div>
              <div className="mt-1 text-2xl font-bold">{rows.length}</div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="text-xs text-indigo-100">Pekerjaan</div>
              <div className="mt-1 text-2xl font-bold">{totals.jobs}</div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="text-xs text-indigo-100">Bobot Diraih</div>
              <div className="mt-1 text-2xl font-bold">{formatPoints(totals.achieved)}</div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="text-xs text-indigo-100">Departemen</div>
              <div className="mt-1 text-2xl font-bold">{departmentTotals.departments}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex w-full max-w-xl rounded-2xl border border-borderBase bg-bgSecondary p-1.5 shadow-sm">
        {([
          ["department", "Penilaian Departemen", "Ringkasan performa per departemen"],
          ["individual", "Penilaian Individual", "Performa setiap pegawai"],
        ] as const).map(([value, label, description]) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveTab(value)}
            className={`flex-1 rounded-xl px-4 py-3 text-left transition ${activeTab === value ? "bg-indigo-600 text-white shadow-md" : "text-textSecondary hover:bg-bgGlass hover:text-textPrimary"}`}
          >
            <div className="text-sm font-bold">{label}</div>
            <div className={`mt-0.5 text-[11px] ${activeTab === value ? "text-indigo-100" : "text-textSecondary"}`}>{description}</div>
          </button>
        ))}
      </div>

      {activeTab === "individual" ? (
        <>

      <section className="rounded-2xl border border-borderBase bg-bgSecondary/70 p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari nama pegawai..."
              className="w-full rounded-xl border border-borderBase bg-bgPrimary py-2.5 pl-9 pr-4 text-sm text-textPrimary outline-none transition focus:border-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative">
              <span className="sr-only">Departemen</span>
              <select
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-borderBase bg-bgPrimary py-2.5 pl-3 pr-9 text-sm text-textPrimary outline-none focus:border-indigo-500 sm:w-52"
              >
                <option value="all">Semua Departemen</option>
                {departments.map((department) => <option key={department} value={department}>{department}</option>)}
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary" />
            </label>
            <label className="relative">
              <span className="sr-only">Urutkan</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
                className="w-full appearance-none rounded-xl border border-borderBase bg-bgPrimary py-2.5 pl-3 pr-9 text-sm text-textPrimary outline-none focus:border-indigo-500 sm:w-52"
              >
                <option value="points">Bobot diraih tertinggi</option>
                <option value="achievement">Ketercapaian tertinggi</option>
                <option value="jobs">Jumlah pekerjaan terbanyak</option>
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary" />
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.04] p-4 text-sm text-textSecondary">
        <div className="flex items-start gap-3">
          <Info size={18} className="mt-0.5 shrink-0 text-indigo-500" />
          <p className="leading-6">
            <span className="font-semibold text-textPrimary">Rumus KPI:</span> Low = 1, Medium = 3, High = 5. Poin pekerjaan dihitung proporsional terhadap Bobot Board, lalu hanya pekerjaan berstatus Selesai yang masuk ke Bobot Diraih. Ketercapaian = Bobot Diraih ÷ Total Bobot Pekerjaan × 100%.
          </p>
        </div>
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-textSecondary"><Loader2 size={20} className="mr-2 animate-spin" /> Memuat penilaian...</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-500">{error}</div>
      ) : filteredRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-borderBase bg-bgSecondary/50 py-20 text-center text-textSecondary">Tidak ada pegawai yang sesuai filter.</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {filteredRows.map((row, index) => {
            const color = avatarColor(row.name);
            return (
              <article key={row.id} className="group overflow-hidden rounded-3xl border border-borderBase bg-bgSecondary p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400/40 hover:shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className={`relative shrink-0 rounded-2xl bg-gradient-to-br ${color} p-1 shadow-lg`}>
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-white/80 bg-bgSecondary text-lg font-bold text-textPrimary">
                        <span className={`bg-gradient-to-br ${color} bg-clip-text text-transparent`}>{getInitials(row.name)}</span>
                      </div>
                      {index === 0 && sortBy === "points" && row.achievedPoints > 0 && <div className="absolute -right-2 -top-2 rounded-full border-2 border-bgSecondary bg-amber-400 p-1 text-amber-950"><Award size={13} /></div>}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold text-textPrimary">{row.name}</h2>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-textSecondary">
                        <span className="inline-flex items-center gap-1"><UserRound size={12} /> {row.role?.name || "Pegawai"}</span>
                        <span className="h-1 w-1 rounded-full bg-textSecondary/50" />
                        <span>{row.department?.name || "Tanpa departemen"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="flex items-baseline justify-end gap-2 text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      <span>Bobot Diraih</span>
                      <span className="text-indigo-500">{formatPoints(row.achievedPoints)}</span>
                      <span>| KPI Diraih {row.combinedAchievement.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <StatPill icon={<BriefcaseBusiness size={13} />} label="Jumlah Pekerjaan" value={row.totalJobs} tone="border-slate-500/20 bg-slate-500/5 text-slate-500" />
                  <StatPill icon={<XCircle size={13} />} label="Pekerjaan Baru" value={row.newJobs} tone="border-blue-500/20 bg-blue-500/5 text-blue-500" />
                  <StatPill icon={<Clock3 size={13} />} label="Pekerjaan Proses" value={row.progressJobs} tone="border-amber-500/20 bg-amber-500/5 text-amber-500" />
                  <StatPill icon={<CheckCircle2 size={13} />} label="Pekerjaan Selesai" value={row.doneJobs} tone="border-emerald-500/20 bg-emerald-500/5 text-emerald-500" />
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4">
                    <div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold text-textSecondary">Progres Bobot WIG</span><span className="font-bold text-cyan-600 dark:text-cyan-400">{row.wigAchievement.toFixed(1)}%</span></div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-borderBase/60"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all" style={{ width: `${row.wigAchievement}%` }} /></div>
                    <div className="mt-2 flex justify-between text-[11px] text-textSecondary"><span>{formatPoints(row.wigAchievedPoints)} poin tercapai</span><span>{formatPoints(row.wigAllocatedPoints)} poin dialokasikan</span></div>
                  </div>
                  <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.04] p-4">
                    <div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold text-textSecondary">Gabungan WIG + Program Kerja</span><span className="font-bold text-indigo-600 dark:text-indigo-400">{row.combinedAchievement.toFixed(1)}%</span></div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-borderBase/60"><div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all`} style={{ width: `${row.combinedAchievement}%` }} /></div>
                    <div className="mt-2 flex justify-between text-[11px] text-textSecondary"><span>{formatPoints(row.combinedAchievedPoints)} poin tercapai</span><span>{formatPoints(row.combinedAllocatedPoints)} poin dialokasikan</span></div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
        </>
      ) : (
        <>
          <section className="rounded-2xl border border-borderBase bg-bgSecondary/70 p-4 shadow-sm">
            <div className="relative w-full lg:max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Cari departemen..." className="w-full rounded-xl border border-borderBase bg-bgPrimary py-2.5 pl-9 pr-4 text-sm text-textPrimary outline-none transition focus:border-cyan-500" />
            </div>
          </section>

          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-textSecondary"><Loader2 size={20} className="mr-2 animate-spin" /> Memuat penilaian departemen...</div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-500">{error}</div>
          ) : filteredDepartmentRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-borderBase bg-bgSecondary/50 py-20 text-center text-textSecondary">Belum ada data penilaian departemen.</div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {filteredDepartmentRows.map((row, index) => {
                const color = avatarColors[index % avatarColors.length];
                return (
                  <article key={row.id} onClick={() => { setActiveTab("individual"); setDepartmentFilter(row.name); setSearchQuery(""); }} className="cursor-pointer overflow-hidden rounded-3xl border border-borderBase bg-bgSecondary p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400/40 hover:shadow-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-lg font-bold text-white shadow-lg`}>{getInitials(row.name)}</div>
                        <div className="min-w-0"><h2 className="truncate text-lg font-bold text-textPrimary">{row.name}</h2><div className="mt-1 text-xs text-textSecondary">{row.people} pegawai terlibat · Klik untuk melihat penilaian individual</div></div>
                      </div>
                      <div className="shrink-0 text-right"><div className="flex items-baseline justify-end gap-2 text-lg font-bold text-cyan-600 dark:text-cyan-400"><span>Bobot Diraih</span><span className="text-cyan-500">{formatPoints(row.combinedAchievedPoints)}</span><span>| KPI Diraih {row.combinedAchievement.toFixed(1)}%</span></div></div>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <StatPill icon={<BriefcaseBusiness size={13} />} label="Jumlah Pekerjaan" value={row.totalJobs} tone="border-slate-500/20 bg-slate-500/5 text-slate-500" />
                      <StatPill icon={<XCircle size={13} />} label="Pekerjaan Baru" value={row.newJobs} tone="border-blue-500/20 bg-blue-500/5 text-blue-500" />
                      <StatPill icon={<Clock3 size={13} />} label="Pekerjaan Proses" value={row.progressJobs} tone="border-amber-500/20 bg-amber-500/5 text-amber-500" />
                      <StatPill icon={<CheckCircle2 size={13} />} label="Pekerjaan Selesai" value={row.doneJobs} tone="border-emerald-500/20 bg-emerald-500/5 text-emerald-500" />
                    </div>
                    <div className="mt-5 space-y-3">
                      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4">
                        <div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold text-textSecondary">Progres Bobot WIG</span><span className="font-bold text-cyan-600 dark:text-cyan-400">{row.wigAchievement.toFixed(1)}%</span></div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-borderBase/60"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all" style={{ width: `${row.wigAchievement}%` }} /></div>
                        <div className="mt-2 flex justify-between text-[11px] text-textSecondary"><span>{formatPoints(row.wigAchievedPoints)} poin tercapai</span><span>{formatPoints(row.wigAllocatedPoints)} poin dialokasikan</span></div>
                      </div>
                      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.04] p-4">
                        <div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold text-textSecondary">Gabungan WIG + Program Kerja</span><span className="font-bold text-indigo-600 dark:text-indigo-400">{row.combinedAchievement.toFixed(1)}%</span></div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-borderBase/60"><div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all`} style={{ width: `${row.combinedAchievement}%` }} /></div>
                        <div className="mt-2 flex justify-between text-[11px] text-textSecondary"><span>{formatPoints(row.combinedAchievedPoints)} poin tercapai</span><span>{formatPoints(row.combinedAllocatedPoints)} poin dialokasikan</span></div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
