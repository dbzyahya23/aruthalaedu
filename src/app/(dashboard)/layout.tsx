import Link from "next/link";
import { LayoutDashboard, BookOpen, Clock, Settings, LogOut, Bell, Home } from "lucide-react";

import { createClient } from "@/utils/supabase/server";

import { MobileSidebar } from "@/components/layout/MobileSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const initial = user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || "U";

  return (
    <div className="flex h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/dashboard" className="text-lg font-bold text-primary tracking-tight">
            ARUS Dashboard
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="space-y-1 px-4">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Home className="w-5 h-5" />
              Halaman Utama
            </Link>
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors">
              <LayoutDashboard className="w-5 h-5" />
              Overview
            </Link>
            <Link href="/dashboard/exams" className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <BookOpen className="w-5 h-5" />
              Ujian Saya
            </Link>
            <Link href="/dashboard/schedule" className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Clock className="w-5 h-5" />
              Jadwal Ujian
            </Link>
            <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Settings className="w-5 h-5" />
              Pengaturan
            </Link>
          </nav>
        </div>
        <div className="p-4 border-t">
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-red-500 hover:bg-red-500/10 transition-colors">
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-background border-b flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <MobileSidebar />
            <div className="font-medium text-lg md:hidden">
              ARUS
            </div>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 rounded-full hover:bg-muted transition-colors relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-background"></span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium hidden sm:block">{user?.user_metadata?.full_name || user?.email}</span>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm uppercase">
                {initial}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
