"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, BookOpen, Clock, Settings, Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const closeSidebar = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="-ml-2 mr-2">
        <Menu className="w-6 h-6" />
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm bg-background border-r shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between px-6 border-b">
          <Link href="/dashboard" onClick={closeSidebar} className="text-lg font-bold text-primary tracking-tight">
            ARUS Dashboard
          </Link>
          <Button variant="ghost" size="icon" onClick={closeSidebar} className="-mr-2">
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          <div className="flex-1 overflow-auto py-4">
            <nav className="space-y-1 px-4">
              <Link 
                href="/" 
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname === '/' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                <Home className="w-5 h-5" />
                Halaman Utama
              </Link>
              <Link 
                href="/dashboard" 
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname === '/dashboard' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                <LayoutDashboard className="w-5 h-5" />
                Overview
              </Link>
              <Link 
                href="/dashboard/exams" 
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/dashboard/exams') ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                <BookOpen className="w-5 h-5" />
                Ujian Saya
              </Link>
              <Link 
                href="/dashboard/schedule" 
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/dashboard/schedule') ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                <Clock className="w-5 h-5" />
                Jadwal Ujian
              </Link>
              <Link 
                href="/dashboard/settings" 
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/dashboard/settings') ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
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
        </div>
      </div>
    </div>
  );
}
