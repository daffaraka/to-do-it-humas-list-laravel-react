import React from "react";
import {
  Target,
  Briefcase,
  Filter,
  ChevronDown,
  Search,
  X,
} from "lucide-react";

interface DashboardFilterProps {
  activeTab: "wig" | "program_kerja";
  setActiveTab: (tab: "wig" | "program_kerja") => void;
  filterDepartment: string;
  setFilterDepartment: (deptId: string) => void;
  isDeptDropdownOpen: boolean;
  setIsDeptDropdownOpen: (isOpen: boolean) => void;
  searchKpi: string;
  setSearchKpi: (query: string) => void;
  departments: any[];
}

export function DashboardFilter({
  activeTab,
  setActiveTab,
  filterDepartment,
  setFilterDepartment,
  isDeptDropdownOpen,
  setIsDeptDropdownOpen,
  searchKpi,
  setSearchKpi,
  departments,
}: DashboardFilterProps) {
  return (
    <>
      <div className="flex p-1.5 bg-gray-100 dark:bg-bgSecondary/60 border border-gray-200 dark:border-white/10 rounded-xl mb-8 w-fit shadow-inner mx-auto sm:mx-0">
        <button
          className={`py-2.5 px-6 sm:px-10 text-sm sm:text-base font-bold transition-all duration-300 rounded-lg flex items-center gap-2 ${
            activeTab === "wig"
              ? "bg-white dark:bg-bgPrimary text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10 scale-100"
              : "text-textSecondary hover:text-textPrimary hover:bg-gray-200/60 dark:hover:bg-white/5 scale-95 opacity-80 hover:opacity-100"
          }`}
          onClick={() => setActiveTab("wig")}
        >
          <Target
            size={18}
            className={activeTab === "wig" ? "text-indigo-500" : "opacity-70"}
          />
          WIG (Main Project)
        </button>
        <button
          className={`py-2.5 px-6 sm:px-10 text-sm sm:text-base font-bold transition-all duration-300 rounded-lg flex items-center gap-2 ${
            activeTab === "program_kerja"
              ? "bg-white dark:bg-bgPrimary text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10 scale-100"
              : "text-textSecondary hover:text-textPrimary hover:bg-gray-200/60 dark:hover:bg-white/5 scale-95 opacity-80 hover:opacity-100"
          }`}
          onClick={() => setActiveTab("program_kerja")}
        >
          <Briefcase
            size={18}
            className={
              activeTab === "program_kerja" ? "text-indigo-500" : "opacity-70"
            }
          />
          Program Kerja
        </button>
      </div>

      {activeTab === "wig" && (
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <button
              onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all shadow-sm ${
                filterDepartment !== "all"
                  ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
                  : "bg-white dark:bg-bgSecondary border-gray-200 dark:border-borderBase text-textSecondary hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-bgGlassHover"
              }`}
            >
              <Filter size={16} />
              <span>
                {filterDepartment === "all"
                  ? "Semua Departemen"
                  : departments.find((d) => d.id === filterDepartment)?.name ||
                    "Departemen"}
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform ${isDeptDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDeptDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDeptDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-bgSecondary border border-gray-200 dark:border-borderBase rounded-xl shadow-xl z-50 py-1 max-h-72 overflow-y-auto custom-scrollbar">
                  <button
                    onClick={() => {
                      setFilterDepartment("all");
                      setIsDeptDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      filterDepartment === "all"
                        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium"
                        : "text-textPrimary hover:bg-gray-50 dark:hover:bg-bgGlass"
                    }`}
                  >
                    Semua Departemen
                  </button>
                  {departments.map((dept) => (
                    <button
                      key={dept.id}
                      onClick={() => {
                        setFilterDepartment(dept.id);
                        setIsDeptDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-t border-gray-100 dark:border-white/[0.05] ${
                        filterDepartment === dept.id
                          ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium"
                          : "text-textPrimary hover:bg-gray-50 dark:hover:bg-bgGlass"
                      }`}
                    >
                      {dept.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          {filterDepartment !== "all" && (
            <button
              onClick={() => setFilterDepartment("all")}
              className="text-xs text-textSecondary hover:text-red-500 transition-colors"
            >
              ✕ Reset
            </button>
          )}

          <div className="relative flex-1 max-w-sm ml-auto">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary"
              size={16}
            />
            <input
              type="text"
              placeholder="Cari project, board..."
              value={searchKpi}
              onChange={(e) => setSearchKpi(e.target.value)}
              className="w-full bg-white dark:bg-bgSecondary border border-gray-200 dark:border-borderBase rounded-xl py-2.5 pl-10 pr-4 text-sm text-textPrimary placeholder-textSecondary/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all shadow-sm"
            />
            {searchKpi && (
              <button
                onClick={() => setSearchKpi("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-textPrimary transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
