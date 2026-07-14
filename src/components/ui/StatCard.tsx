"use client";

import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendType?: "up" | "down" | "neutral";
  color?: "blue" | "green" | "amber" | "purple" | "red";
}

const colorMap = {
  blue: { bg: "bg-blue-50", icon: "text-blue-600" },
  green: { bg: "bg-green-50", icon: "text-green-600" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600" },
  red: { bg: "bg-red-50", icon: "text-red-600" },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendType = "neutral",
  color = "blue",
}: StatCardProps) {
  const c = colorMap[color];

  return (
    <div className="card card-padding relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">{value}</p>
          {trend && (
            <div className="flex items-center gap-1.5 mt-2">
              {trendType === "up" && <TrendingUp className="w-3.5 h-3.5 text-green-500" />}
              {trendType === "down" && <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
              <span
                className={`text-xs font-medium ${
                  trendType === "up"
                    ? "text-green-600"
                    : trendType === "down"
                      ? "text-red-600"
                      : "text-gray-400"
                }`}
              >
                {trend}
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${c.bg} rounded-2xl flex items-center justify-center ${c.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
