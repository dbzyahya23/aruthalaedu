"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const data = [
  { name: "", value: 30 },
  { name: "", value: 45 },
  { name: "", value: 40 },
  { name: "", value: 65 },
  { name: "", value: 55 },
  { name: "", value: 85 },
  { name: "", value: 95 },
  { name: "", value: 70 },
  { name: "", value: 80 },
];

export default function BarChartWidget() {
  return (
    <div className="glass p-6 h-full flex flex-col justify-between">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-slate-700 tracking-[-0.02em]">Distribusi Nilai</h3>
        <span className="text-xs text-slate-400">Semester ini</span>
      </div>
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={12}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.18)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#64748b", fontSize: 12 }} 
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip 
              cursor={{fill: 'rgba(255,255,255,0.3)'}}
              contentStyle={{ borderRadius: '12px', border: '1px solid rgba(229,231,235,0.9)', boxShadow: '0 12px 30px rgba(57,111,190,0.10)' }}
            />
            <Bar dataKey="value" radius={[6, 6, 6, 6]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#60a5fa" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-between px-8 mt-2">
           {data.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
           ))}
        </div>
      </div>
    </div>
  );
}
