import { create } from 'zustand';

import type { IntakeAnswers } from './types';

/**
 * In-memory answers for the in-progress chapter flow. Each chapter is
 * its own route (app/(onboarding)/chapter/[id].tsx), so this can't
 * live in a screen's local state — it needs to survive the push
 * between chapters. Nothing durable reads this: like the old
 * single-step intake.tsx, it's write-once to SQLite at finish() via
 * useIntakeFlow, so losing it to an app kill mid-flow is the same
 * pre-existing risk, not a new one.
 */
type IntakeStore = {
  answers: Partial<IntakeAnswers>;
  answerStep: (id: keyof IntakeAnswers, value: unknown) => void;
  reset: () => void;
};

export const useIntakeStore = create<IntakeStore>((set) => ({
  answers: {},
  answerStep: (id, value) => set((s) => ({ answers: { ...s.answers, [id]: value } })),
  reset: () => set({ answers: {} }),
}));
