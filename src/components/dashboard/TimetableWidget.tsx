"use client";

import { BookOpen, FlaskConical, Calculator, Globe, Palette } from "lucide-react";

export default function TimetableWidget() {
  return (
    <div className="glass p-6 h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-700 tracking-[-0.02em]">Jadwal Kelas</h3>
          <p className="text-xs text-slate-400 mt-0.5">Agenda pembelajaran harian</p>
        </div>
        <div className="text-xs text-[#2f66e9] bg-[#eef5ff] border border-[#d8e6fb] rounded-full px-2.5 py-1">Hari ini</div>
      </div>
      {/* Header icons */}
      <div className="flex justify-around items-center border-b border-white/40 pb-4 mb-4">
        <div className="text-blue-500 border-b-2 border-blue-500 pb-2 px-4"><BookOpen size={20} /></div>
        <div className="text-slate-400 pb-2"><FlaskConical size={20} /></div>
        <div className="text-slate-400 pb-2"><Calculator size={20} /></div>
        <div className="text-slate-400 pb-2"><Globe size={20} /></div>
        <div className="text-slate-400 pb-2"><Palette size={20} /></div>
      </div>
      
      {/* Schedule Grid */}
      <div className="flex-1 relative">
        <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr] gap-4 text-xs font-medium text-slate-600 h-full">
          {/* Time column */}
          <div className="flex flex-col gap-6 pt-2">
            <div>08:00</div>
            <div>09:00</div>
            <div>10:00</div>
            <div>11:00</div>
            <div>12:00</div>
            <div>13:00</div>
          </div>
          
          {/* Subjects col 1 */}
          <div className="relative">
            <div className="absolute top-0 w-full h-[40px] bg-[#eef5ff] border border-[#d8e6fb] rounded-xl flex items-center justify-center text-[#2f66e9]">Bahasa Indonesia</div>
            <div className="absolute top-[170px] w-full h-[30px] bg-[#eef5ff] border border-[#d8e6fb] rounded-xl flex items-center justify-center text-[#2f66e9]">PJOK</div>
            <div className="absolute top-[215px] w-full h-[30px] bg-slate-100/90 border border-slate-200 rounded-xl flex items-center justify-center text-slate-700">Prakarya</div>
          </div>
          
          {/* Subjects col 2 */}
          <div className="relative">
            <div className="absolute top-0 w-full h-[30px] bg-[#eef5ff] border border-[#d8e6fb] rounded-xl flex items-center justify-center text-[#2f66e9]">Matematika</div>
            <div className="absolute top-[45px] w-full h-[30px] bg-[#eef5ff] border border-[#d8e6fb] rounded-xl flex items-center justify-center text-[#2f66e9]">Matematika</div>
            <div className="absolute top-[85px] w-full h-[30px] bg-blue-50/90 border border-blue-100 rounded-xl flex items-center justify-center text-blue-700">IPA</div>
            <div className="absolute top-[130px] w-full h-[30px] bg-blue-50/90 border border-blue-100 rounded-xl flex items-center justify-center text-blue-700">Bahasa Inggris</div>
          </div>

          {/* Subjects col 3 */}
          <div className="relative">
            <div className="absolute top-0 w-full h-[30px] bg-blue-50/90 border border-blue-100 rounded-xl flex items-center justify-center text-blue-700">IPA</div>
            <div className="absolute top-[170px] w-full h-[30px] bg-purple-50/90 border border-purple-100 rounded-xl flex items-center justify-center text-purple-700">TIK</div>
          </div>
          
          {/* Subjects col 4 */}
          <div className="relative">
             <div className="absolute top-[45px] w-full h-[40px] bg-indigo-50/90 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-700">Bahasa Inggris</div>
             <div className="absolute top-[170px] w-full h-[30px] bg-teal-50/90 border border-teal-100 rounded-xl flex items-center justify-center text-teal-700">IPS</div>
          </div>

          {/* Subjects col 5 */}
          <div className="relative">
            <div className="absolute top-[45px] w-full h-[30px] bg-purple-50/90 border border-purple-100 rounded-xl flex items-center justify-center text-purple-700">Seni Budaya</div>
          </div>
        </div>
      </div>
    </div>
  );
}
