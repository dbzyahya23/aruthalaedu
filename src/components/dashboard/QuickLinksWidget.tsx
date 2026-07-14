"use client";

import { BookOpen, ClipboardList, FlaskConical, Trophy, Leaf, Users } from "lucide-react";

const links = [
  { icon: BookOpen, progress: 60 },
  { icon: ClipboardList, progress: 30 },
  { icon: FlaskConical, progress: 40 },
  { icon: Trophy, progress: 20 },
  { icon: Leaf, progress: 75 },
  { icon: Users, progress: 45 },
];

export default function QuickLinksWidget() {
  return (
    <div className="flex justify-between items-center h-full gap-4">
      {links.map((link, i) => {
        const Icon = link.icon;
        return (
          <div key={i} className="glass p-4 flex-1 flex flex-col items-center justify-center gap-4 hover:-translate-y-1 transition-transform cursor-pointer h-full">
            <div className="text-blue-500">
              <Icon size={28} />
            </div>
            <div className="w-10 h-1 bg-slate-200/50 rounded-full overflow-hidden">
               <div className="h-full bg-blue-400 rounded-full" style={{ width: `${link.progress}%` }}></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
