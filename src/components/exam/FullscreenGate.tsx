"use client";

import { useEffect, useState } from "react";
import { Maximize, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FullscreenGate({ examId, children }: { examId: string; children: React.ReactNode }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Send violation to backend
  const logViolation = async () => {
    try {
      await fetch(`/api/exams/${examId}/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_type: "fullscreen_exit", details: {} }),
      });
    } catch (e) {
      console.error("Failed to log violation", e);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = document.fullscreenElement !== null;
      setIsFullscreen(isCurrentlyFullscreen);
      
      // If they were already in fullscreen and exited it
      if (!isCurrentlyFullscreen && hasStarted) {
        logViolation();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    
    // Check initial state
    setIsFullscreen(document.fullscreenElement !== null);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [hasStarted, examId]);

  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setHasStarted(true);
    } catch (err) {
      console.error("Error attempting to enable fullscreen:", err);
      alert("Browser Anda tidak mendukung atau memblokir layar penuh.");
    }
  };

  // If we are in fullscreen, show the actual exam (children)
  if (isFullscreen && hasStarted) {
    return <>{children}</>;
  }

  // Otherwise, show the gate overlay
  return (
    <div className="fixed inset-0 z-[999] bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="bg-card p-8 md:p-12 rounded-2xl shadow-2xl max-w-lg text-center border-2 border-primary/20">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          {hasStarted ? (
            <AlertOctagon className="w-10 h-10 text-destructive animate-pulse" />
          ) : (
            <Maximize className="w-10 h-10 text-primary" />
          )}
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          {hasStarted ? "PELANGGARAN: Layar Penuh Tertutup" : "Persiapan Ujian"}
        </h2>
        
        <p className="text-muted-foreground mb-8 text-lg">
          {hasStarted 
            ? "Anda telah keluar dari mode layar penuh. Aktivitas ini dicatat sebagai pelanggaran. Silakan kembali ke layar penuh untuk melanjutkan ujian."
            : "Ujian ini memerlukan mode layar penuh. Pastikan Anda tidak membuka aplikasi lain selama ujian berlangsung."}
        </p>

        <Button size="lg" className="w-full text-lg py-6" onClick={enterFullscreen}>
          <Maximize className="w-5 h-5 mr-2" />
          {hasStarted ? "Kembali ke Layar Penuh" : "Mulai & Masuk Layar Penuh"}
        </Button>
      </div>
    </div>
  );
}
