"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Selesai", value: 85, color: "#3b82f6" }, // Blue
  { name: "Proses", value: 15, color: "#e2e8f0" }  // Light grey
];

export default function DonutChartWidget() {
  return (
    <div className="glass p-6 h-full flex items-center justify-between">
      <div className="w-[120px] h-[120px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={55}
              stroke="none"
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex flex-col gap-4 w-1/2">
        <div className="mb-1">
          <h3 className="font-semibold text-slate-700 tracking-[-0.02em]">Progress</h3>
          <p className="text-xs text-slate-400 mt-0.5">Status aktivitas</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <div className="w-8 h-1.5 bg-slate-200 rounded-full"></div>
          <span className="font-semibold ml-auto text-slate-700">85%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-300"></div>
          <div className="w-8 h-1.5 bg-slate-200 rounded-full"></div>
          <span className="font-semibold ml-auto text-slate-700">70%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-200"></div>
          <div className="w-8 h-1.5 bg-slate-200 rounded-full"></div>
          <span className="font-semibold ml-auto text-slate-700">40%</span>
        </div>
      </div>
    </div>
  );
}
