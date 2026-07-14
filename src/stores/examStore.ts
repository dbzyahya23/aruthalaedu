import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LocalAnswer, SessionStatus } from "@/types";

interface ExamState {
  sessionId: string | null;
  examId: string | null;
  token: string | null;
  examTitle: string;
  totalQuestions: number;
  currentIndex: number;
  status: SessionStatus;
  timeRemaining: number;
  answers: Record<string, LocalAnswer["answer"]>;
  isLocked: boolean;
  lockReason: string;
  isOffline: boolean;
  lastSyncAt: number | null;
  violationCounts: Record<string, number>;

  // Actions
  initExam: (data: {
    sessionId: string;
    examId: string;
    token: string;
    examTitle: string;
    totalQuestions: number;
    durationSeconds: number;
  }) => void;
  setAnswer: (questionId: string, answer: LocalAnswer["answer"]) => void;
  setCurrentIndex: (index: number) => void;
  tickTimer: () => void;
  setTimeRemaining: (seconds: number) => void;
  lock: (reason: string) => void;
  unlock: () => void;
  setOffline: (offline: boolean) => void;
  setLastSync: () => void;
  addViolation: (type: string, count: number) => void;
  submitExam: () => void;
  reset: () => void;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set) => ({
      sessionId: null,
      examId: null,
      token: null,
      examTitle: "",
      totalQuestions: 0,
      currentIndex: 0,
      status: "not_started",
      timeRemaining: 0,
      answers: {},
      isLocked: false,
      lockReason: "",
      isOffline: false,
      lastSyncAt: null,
      violationCounts: {},

      initExam: (data) =>
        set({
          sessionId: data.sessionId,
          examId: data.examId,
          token: data.token,
          examTitle: data.examTitle,
          totalQuestions: data.totalQuestions,
          timeRemaining: data.durationSeconds,
          status: "in_progress",
          answers: {},
          currentIndex: 0,
          isLocked: false,
          violationCounts: {},
        }),

      setAnswer: (questionId, answer) =>
        set((s) => ({ answers: { ...s.answers, [questionId]: answer } })),

      setCurrentIndex: (index) => set({ currentIndex: index }),

      tickTimer: () =>
        set((s) => ({
          timeRemaining: Math.max(0, s.timeRemaining - 1),
          status: s.timeRemaining <= 1 ? "submitted" : s.status,
        })),

      setTimeRemaining: (seconds) => set({ timeRemaining: seconds }),

      lock: (reason) => set({ isLocked: true, lockReason: reason }),
      unlock: () => set({ isLocked: false, lockReason: "" }),

      setOffline: (offline) => set({ isOffline: offline }),
      setLastSync: () => set({ lastSyncAt: Date.now() }),

      addViolation: (type, count) =>
        set((s) => ({
          violationCounts: { ...s.violationCounts, [type]: count },
        })),

      submitExam: () => set({ status: "submitted" }),
      reset: () =>
        set({
          sessionId: null, examId: null, token: null, examTitle: "",
          totalQuestions: 0, currentIndex: 0, status: "not_started",
          timeRemaining: 0, answers: {}, isLocked: false, lockReason: "",
          isOffline: false, lastSyncAt: null, violationCounts: {},
        }),
    }),
    {
      name: "aruthala-exam",
      // Only persist these keys to localStorage
      partialize: (s) => ({
        sessionId: s.sessionId,
        examId: s.examId,
        token: s.token,
        answers: s.answers,
        timeRemaining: s.timeRemaining,
        currentIndex: s.currentIndex,
        status: s.status,
      }),
    }
  )
);
