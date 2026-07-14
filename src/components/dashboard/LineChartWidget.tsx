"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const data = [
  { name: "Sen", value: 30 },
  { name: "Sel", value: 45 },
  { name: "Rab", value: 40 },
  { name: "Kam", value: 65 },
  { name: "Jum", value: 55 },
  { name: "Sab", value: 85 },
  { name: "Min", value: 95 },
];

export default function LineChartWidget() {
  return (
    <div className="glass p-6 h-full flex flex-col justify-between">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-slate-700 tracking-[-0.02em]">Tren Harian</h3>
        <span className="text-xs text-slate-400">7 hari terakhir</span>
      </div>
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.18)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#64748b", fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#64748b", fontSize: 12 }} 
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: '1px solid rgba(229,231,235,0.9)', boxShadow: '0 12px 30px rgba(57,111,190,0.10)' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#60a5fa"
              strokeWidth={3}
              dot={{ r: 4, fill: "#60a5fa", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
