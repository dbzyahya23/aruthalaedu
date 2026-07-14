"use client";

import { useEffect, useState } from "react";
import { useExamStore } from "@/store/examStore";
import { useRouter } from "next/navigation";

export function SecurityEnforcer({ examId }: { examId: string }) {
  const router = useRouter();
  const { addStrike, strikes, exam, answers, clearExam } = useExamStore();
  const [warning, setWarning] = useState<string | null>(null);

  // Send violation to backend
  const logViolation = async (eventType: string, details: any = {}) => {
    try {
      await fetch(`/api/exams/${examId}/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_type: eventType, details }),
      });
    } catch (e) {
      console.error("Failed to log violation", e);
    }
  };

  // Force submit exam if strikes exceed 3
  const forceSubmit = async () => {
    try {
      await fetch(`/api/exams/${examId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      clearExam();
      alert("Ujian Anda telah dihentikan secara paksa karena terdeteksi melakukan kecurangan berulang kali.");
      router.push("/dashboard");
    } catch (e) {
      console.error("Force submit failed", e);
    }
  };

  useEffect(() => {
    // 1. Block Context Menu (Right Click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setWarning("Klik kanan dinonaktifkan selama ujian!");
      logViolation("context_menu_blocked");
      setTimeout(() => setWarning(null), 3000);
    };

    // 2. Block Copy, Cut, Paste
    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      setWarning("Tindakan menyalin/menempel (copy-paste) dilarang!");
      logViolation("clipboard_blocked", { action: e.type });
      setTimeout(() => setWarning(null), 3000);
    };

    // 3. Block Developer Tools (F12, Ctrl+Shift+I, etc)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12
      if (e.key === "F12") {
        e.preventDefault();
        logViolation("dev_tools_blocked", { key: "F12" });
        return;
      }
      
      // Prevent Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+U
      if (e.ctrlKey && (e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j")) || (e.ctrlKey && (e.key === "U" || e.key === "u"))) {
        e.preventDefault();
        logViolation("dev_tools_blocked", { key: e.key });
        return;
      }

      // Prevent Ctrl+C / Ctrl+V
      if (e.ctrlKey && (e.key === "C" || e.key === "c" || e.key === "V" || e.key === "v")) {
        e.preventDefault();
        setWarning("Shortcut copy-paste dinonaktifkan!");
        setTimeout(() => setWarning(null), 3000);
        return;
      }
    };

    // 4. Tab Visibility (Blur / Hidden)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched tabs or minimized browser
        const currentStrikes = addStrike();
        logViolation("tab_switch", { strikes: currentStrikes });
        
        if (currentStrikes >= 3) {
          forceSubmit();
        } else {
          alert(`PERINGATAN KECURANGAN!\nAnda terdeteksi berpindah tab atau aplikasi. Ini adalah peringatan ke-${currentStrikes} dari 3.\nJika mencapai 3 kali, ujian akan dihentikan otomatis.`);
        }
      }
    };

    // Attach listeners
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("cut", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      // Detach listeners
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("cut", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [examId, answers]);

  if (!warning) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white px-6 py-3 rounded-lg shadow-2xl font-bold animate-bounce border-2 border-red-800">
      ⚠️ {warning}
    </div>
  );
}
