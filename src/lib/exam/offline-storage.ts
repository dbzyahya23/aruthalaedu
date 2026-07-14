"use client";

import { openDB, type IDBPDatabase } from "idb";
import type { LocalAnswer, LocalExamState, SessionStatus } from "@/types";

const DB_NAME = "aruthala-exam";
const DB_VERSION = 1;
const STORE_STATE = "exam_state";
const STORE_ANSWERS = "answers";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(STORE_STATE, { keyPath: "session_id" });
        db.createObjectStore(STORE_ANSWERS, { keyPath: "id" }); // id = session_id:question_id
      },
    });
  }
  return dbPromise;
}

// ─── STATE ────────────────────────────────────────────────────────────────────

export async function saveExamState(state: LocalExamState): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORE_STATE, state);
    // Backup to localStorage
    localStorage.setItem(`exam_state_${state.session_id}`, JSON.stringify(state));
  } catch (e) {
    console.error("[offline] saveExamState failed", e);
  }
}

export async function loadExamState(sessionId: string): Promise<LocalExamState | null> {
  try {
    const db = await getDB();
    const idbState = await db.get(STORE_STATE, sessionId);
    if (idbState) return idbState;
    // Fallback to localStorage
    const lsState = localStorage.getItem(`exam_state_${sessionId}`);
    return lsState ? JSON.parse(lsState) : null;
  } catch {
    const lsState = localStorage.getItem(`exam_state_${sessionId}`);
    return lsState ? JSON.parse(lsState) : null;
  }
}

export async function clearExamState(sessionId: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(STORE_STATE, sessionId);
    localStorage.removeItem(`exam_state_${sessionId}`);
  } catch {}
}

// ─── ANSWERS ─────────────────────────────────────────────────────────────────

export async function saveAnswer(
  sessionId: string,
  questionId: string,
  answer: LocalAnswer["answer"]
): Promise<void> {
  const id = `${sessionId}:${questionId}`;
  const record: LocalAnswer & { id: string; session_id: string } = {
    id,
    session_id: sessionId,
    question_id: questionId,
    answer,
    timestamp: Date.now(),
    synced: false,
  };

  try {
    const db = await getDB();
    await db.put(STORE_ANSWERS, record);
    // Also save to localStorage as fast backup
    const lsKey = `exam_answers_${sessionId}`;
    const existing = getLocalAnswers(sessionId);
    existing[questionId] = { question_id: questionId, answer, timestamp: Date.now(), synced: false };
    localStorage.setItem(lsKey, JSON.stringify(existing));
  } catch (e) {
    // Fallback: at minimum save to localStorage
    const existing = getLocalAnswers(sessionId);
    existing[questionId] = { question_id: questionId, answer, timestamp: Date.now(), synced: false };
    localStorage.setItem(`exam_answers_${sessionId}`, JSON.stringify(existing));
  }
}

export function getLocalAnswers(sessionId: string): Record<string, LocalAnswer> {
  try {
    const raw = localStorage.getItem(`exam_answers_${sessionId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function getAllAnswers(sessionId: string): Promise<LocalAnswer[]> {
  try {
    const db = await getDB();
    const all = await db.getAll(STORE_ANSWERS);
    const filtered = all.filter((r) => r.session_id === sessionId);
    if (filtered.length > 0) return filtered;
    // Fallback
    return Object.values(getLocalAnswers(sessionId));
  } catch {
    return Object.values(getLocalAnswers(sessionId));
  }
}

export async function markAnswerSynced(sessionId: string, questionId: string): Promise<void> {
  const id = `${sessionId}:${questionId}`;
  try {
    const db = await getDB();
    const record = await db.get(STORE_ANSWERS, id);
    if (record) { record.synced = true; await db.put(STORE_ANSWERS, record); }
    const answers = getLocalAnswers(sessionId);
    if (answers[questionId]) { answers[questionId].synced = true; localStorage.setItem(`exam_answers_${sessionId}`, JSON.stringify(answers)); }
  } catch {}
}

export async function clearAllAnswers(sessionId: string): Promise<void> {
  try {
    const db = await getDB();
    const all = await db.getAll(STORE_ANSWERS);
    const toDelete = all.filter((r) => r.session_id === sessionId);
    await Promise.all(toDelete.map((r) => db.delete(STORE_ANSWERS, r.id)));
    localStorage.removeItem(`exam_answers_${sessionId}`);
  } catch {
    localStorage.removeItem(`exam_answers_${sessionId}`);
  }
}
