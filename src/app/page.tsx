import { redirect } from "next/navigation";
import ProfileWidget from "@/components/dashboard/ProfileWidget";
import DonutChartWidget from "@/components/dashboard/DonutChartWidget";
import LineChartWidget from "@/components/dashboard/LineChartWidget";
import BarChartWidget from "@/components/dashboard/BarChartWidget";
import StudentProgressWidget from "@/components/dashboard/StudentProgressWidget";
import TimetableWidget from "@/components/dashboard/TimetableWidget";
import ActivitySummaryWidget from "@/components/dashboard/ActivitySummaryWidget";
import QuickLinksWidget from "@/components/dashboard/QuickLinksWidget";

export default function HomePage() {
  redirect("/login");
  return (
    <div className="flex flex-col gap-6 pb-12 h-[calc(100vh-140px)]">
      
      {/* ROW 1: Profile, Donut, Line, Bar */}
      <div className="grid grid-cols-12 gap-6 h-[220px]">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <ProfileWidget />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <DonutChartWidget />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
          <LineChartWidget />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-2">
          <BarChartWidget />
        </div>
      </div>

      {/* ROW 2: Student Progress, Timetable */}
      <div className="grid grid-cols-12 gap-6 h-[340px]">
        <div className="col-span-12 lg:col-span-4">
          <StudentProgressWidget />
        </div>
        <div className="col-span-12 lg:col-span-8">
          <TimetableWidget />
        </div>
      </div>

      {/* ROW 3: Activity Summary, Quick Links */}
      <div className="grid grid-cols-12 gap-6 h-[120px]">
        <div className="col-span-12 lg:col-span-4">
          <ActivitySummaryWidget />
        </div>
        <div className="col-span-12 lg:col-span-8">
          <QuickLinksWidget />
        </div>
      </div>

    </div>
  );
}