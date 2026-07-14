import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

// Custom storage for Zustand using IndexedDB (idb-keyval)
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export type Question = {
  id: string;
  content: string;
  type: 'multiple_choice' | 'essay';
  options: string[] | null;
};

export type Exam = {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
};

export type ExamState = {
  exam: Exam | null;
  questions: Question[];
  answers: Record<string, string>; // questionId -> answer
  currentIndex: number;
  isSubmitting: boolean;
  strikes: number; // Anti-cheat tab switch strikes
  
  // Actions
  setExamData: (exam: Exam, questions: Question[]) => void;
  setAnswer: (questionId: string, answer: string) => void;
  setCurrentIndex: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  clearExam: () => void;
  syncAnswersToServer: () => Promise<boolean>;
  addStrike: () => number; // Returns current strikes
};

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      exam: null,
      questions: [],
      answers: {},
      currentIndex: 0,
      isSubmitting: false,
      strikes: 0,

      setExamData: (exam, questions) => set({ exam, questions, strikes: 0 }),
      
      setAnswer: (questionId, answer) => {
        set((state) => ({
          answers: { ...state.answers, [questionId]: answer }
        }));
      },
        
      setCurrentIndex: (index) => 
        set((state) => ({
          currentIndex: Math.max(0, Math.min(index, state.questions.length - 1))
        })),
        
      nextQuestion: () => 
        set((state) => ({
          currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1)
        })),
        
      prevQuestion: () => 
        set((state) => ({
          currentIndex: Math.max(state.currentIndex - 1, 0)
        })),
        
      clearExam: () => set({ exam: null, questions: [], answers: {}, currentIndex: 0, strikes: 0 }),
      
      addStrike: () => {
        const currentStrikes = get().strikes + 1;
        set({ strikes: currentStrikes });
        return currentStrikes;
      },
      
      syncAnswersToServer: async () => {
        const { exam, answers } = get();
        if (!exam || Object.keys(answers).length === 0) return false;
        
        try {
          const res = await fetch(`/api/exams/${exam.id}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers })
          });
          return res.ok;
        } catch {
          return false;
        }
      }
    }),
    {
      name: 'arus-exam-storage',
      storage: createJSONStorage(() => idbStorage),
      // Optional: Only persist answers, exam, and questions, but skip currentIndex if preferred
      // For now, persisting everything is fine to restore exact state on refresh.
    }
  )
);
