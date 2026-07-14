"use client";

import { MoreHorizontal } from "lucide-react";

const students = [
  { name: "Andi Saputra", avatar: "https://ui-avatars.com/api/?name=Andi+Saputra&background=random", progress: 85 },
  { name: "Budi Santoso", avatar: "https://ui-avatars.com/api/?name=Budi+Santoso&background=random", progress: 65 },
  { name: "Citra Lestari", avatar: "https://ui-avatars.com/api/?name=Citra+Lestari&background=random", progress: 45 },
  { name: "Dewi Ayu", avatar: "https://ui-avatars.com/api/?name=Dewi+Ayu&background=random", progress: 90 },
  { name: "Eko Prasetyo", avatar: "https://ui-avatars.com/api/?name=Eko+Prasetyo&background=random", progress: 30 },
];

export default function StudentProgressWidget() {
  return (
    <div className="glass p-6 h-full flex flex-col justify-between">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-700 tracking-[-0.02em]">Kemajuan Siswa</h3>
          <p className="text-xs text-slate-400 mt-0.5">Pemantauan keterlibatan belajar</p>
        </div>
        <div className="h-8 w-8 rounded-full bg-[#eef5ff] border border-[#d8e6fb] flex items-center justify-center text-[#2f66e9] text-xs font-semibold">5</div>
      </div>
      <div className="space-y-6 mt-2">
        {students.map((student, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/50">
              <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1">
              <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-400 rounded-full relative"
                  style={{ width: `${student.progress}%` }}
                >
                   {/* Optional end dot */}
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-sm border border-blue-400"></div>
                </div>
              </div>
            </div>
            
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
