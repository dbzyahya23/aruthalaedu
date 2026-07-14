"use client";

import { ChevronDown } from "lucide-react";

export default function ActivitySummaryWidget() {
  return (
    <div className="glass p-6 h-full flex flex-col justify-between relative overflow-hidden">
      <div className="flex justify-between items-center z-10 relative">
        <h3 className="font-semibold text-slate-700 tracking-[-0.02em]">Ringkasan Aktivitas</h3>
        <div className="flex items-center gap-1 text-xs text-[#2f66e9] bg-[#eef5ff] px-2.5 py-1 rounded-full border border-[#d8e6fb]">
          Minggu Ini
          <ChevronDown size={14} />
        </div>
      </div>
      
      {/* Wave decorative background */}
      <div className="absolute bottom-0 left-0 right-0 h-2/3 opacity-30 pointer-events-none">
        <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full text-blue-300 fill-current">
          <path d="M0 50 L0 30 Q 25 10 50 30 T 100 20 L 100 50 Z" />
          <path d="M0 50 L0 40 Q 25 20 50 40 T 100 30 L 100 50 Z" className="text-blue-400 fill-current opacity-60" />
        </svg>
      </div>
      
      <div className="relative z-10 mt-auto flex items-end">
        {/* Placeholder content for summary over wave */}
      </div>
    </div>
  );
}
