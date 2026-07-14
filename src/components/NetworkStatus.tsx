"use client";

import { useState, useEffect } from "react";
import { useExamStore } from "@/store/examStore";
import { WifiOff, Wifi } from "lucide-react";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const syncAnswersToServer = useExamStore((state) => state.syncAnswersToServer);

  useEffect(() => {
    // Initial check
    setIsOnline(navigator.onLine);

    const handleOnline = async () => {
      setIsOnline(true);
      setShowToast(true);
      
      // Auto-sync when back online
      const success = await syncAnswersToServer();
      if (success) {
        console.log("Jawaban berhasil disinkronkan ke server.");
      }
      
      setTimeout(() => setShowToast(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowToast(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Auto-sync periodically every 3 minutes if online
    const interval = setInterval(() => {
      if (navigator.onLine) {
        syncAnswersToServer();
      }
    }, 3 * 60 * 1000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [syncAnswersToServer]);

  if (!showToast && isOnline) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg transition-all duration-300 ${
      isOnline 
        ? "bg-emerald-500 text-white" 
        : "bg-destructive text-destructive-foreground animate-pulse"
    }`}>
      {isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
      <div className="flex flex-col">
        <span className="font-semibold text-sm">
          {isOnline ? "Koneksi Terhubung" : "Koneksi Terputus"}
        </span>
        <span className="text-xs opacity-90">
          {isOnline 
            ? "Jawaban telah disinkronkan." 
            : "Tetap tenang, jawaban Anda disimpan secara offline."}
        </span>
      </div>
    </div>
  );
}
