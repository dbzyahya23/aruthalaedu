"use client";

import { usePathname } from "next/navigation";
import { Menu, Search, Bell, ChevronRight, ChevronDown } from "lucide-react";
import { useSidebar } from "./DashboardShell";

const PAGE_TITLES: Record<string, string> = {
  "/overview": "Dashboard",
  "/assessment": "Ujian",
  "/library": "Bank Soal",
  "/students": "Data Siswa",
  "/academic": "Akademik",
  "/reports": "Laporan",
  "/settings": "Pengaturan",
  "/ujian": "Ujian",
  "/bank-soal": "Bank Soal",
  "/data-siswa": "Data Siswa",
};

function getPageTitle(pathname: string): string {
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === path || pathname.startsWith(path + "/")) {
      return title;
    }
  }
  const segment = pathname.split("/").filter(Boolean).pop();
  return segment ? segment.replace(/-/g, " ") : "Dashboard";
}

export default function Header() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-white/80 flex items-center gap-4 px-4 sticky top-0 z-10 shadow-[0_10px_30px_rgba(57,111,190,0.05)]">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-1.5 rounded-xl hover:bg-white transition-colors text-gray-500"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        <span className="text-gray-400 tracking-wide">ARUTHALA</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
        <span className="font-medium text-gray-700 capitalize">{pageTitle}</span>
      </div>

      <div className="flex-1 max-w-sm ml-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#edf3ff]/75 border border-[#e3ebfa] rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-[#5485f1]/10 focus:border-[#6c97fa] transition-all placeholder:text-[#9aabc2]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-xl hover:bg-white transition-colors text-gray-500">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_0_2px_rgba(255,255,255,0.9)]" />
        </button>
        <button className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-2xl hover:bg-white transition-colors">
          <div className="w-7 h-7 bg-[#2f66e9] rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-[0_8px_16px_rgba(47,102,233,0.22)]">
            AU
          </div>
          <span className="text-xs font-medium text-gray-700">Admin</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>
      </div>
    </header>
  );
}
