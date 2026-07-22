import { create } from "zustand";
import { getObject, setObject, StorageKeys } from "@/services/storage";
import { generateId } from "@/utils/uuid";
import type { SavingsGoal } from "@/models";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SavingsState {
  goals: SavingsGoal[];

  // CRUD
  addGoal: (data: Omit<SavingsGoal, "id" | "createdAt" | "updatedAt">) => void;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;

  // Actions
  addToGoal: (id: string, amount: number) => void;

  // Queries
  getOverallProgress: () => { completed: number; total: number };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useSavingsStore = create<SavingsState>((set, get) => ({
  goals: getObject<SavingsGoal[]>(StorageKeys.savingsGoals) ?? [],

  addGoal: (data) => {
    const now = new Date().toISOString();
    const goal: SavingsGoal = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    const updated = [...get().goals, goal];
    setObject(StorageKeys.savingsGoals, updated);
    set({ goals: updated });
  },

  updateGoal: (id, updates) => {
    const updated = get().goals.map((g) =>
      g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g,
    );
    setObject(StorageKeys.savingsGoals, updated);
    set({ goals: updated });
  },

  deleteGoal: (id) => {
    const updated = get().goals.filter((g) => g.id !== id);
    setObject(StorageKeys.savingsGoals, updated);
    set({ goals: updated });
  },

  addToGoal: (id, amount) => {
    const updated = get().goals.map((g) => {
      if (g.id !== id) return g;
      const newCurrent = g.currentAmount + amount;
      const updatedMilestones = g.milestones.map((m) =>
        !m.reached && newCurrent >= m.amount ? { ...m, reached: true } : m,
      );
      return {
        ...g,
        currentAmount: newCurrent,
        milestones: updatedMilestones,
        updatedAt: new Date().toISOString(),
      };
    });
    setObject(StorageKeys.savingsGoals, updated);
    set({ goals: updated });
  },

  getOverallProgress: () => {
    const goals = get().goals;
    const completed = goals.filter((g) => g.currentAmount >= g.targetAmount).length;
    return { completed, total: goals.length };
  },
}));
