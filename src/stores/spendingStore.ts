import { create } from "zustand";
import { getObject, setObject, StorageKeys } from "@/services/storage";
import { generateId } from "@/utils/uuid";
import type { SpendingEntry, SpendingCategory } from "@/models";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SpendingState {
  entries: SpendingEntry[];

  // CRUD
  addEntry: (data: Omit<SpendingEntry, "id">) => void;
  deleteEntry: (id: string) => void;

  // Queries
  getCategoryTotal: (category: SpendingCategory, month?: string) => number;
  getRecentEntries: (limit?: number) => SpendingEntry[];
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useSpendingStore = create<SpendingState>((set, get) => ({
  entries: getObject<SpendingEntry[]>(StorageKeys.spendingEntries) ?? [],

  addEntry: (data) => {
    const entry: SpendingEntry = { ...data, id: generateId() };
    const updated = [...get().entries, entry];
    setObject(StorageKeys.spendingEntries, updated);
    set({ entries: updated });
  },

  deleteEntry: (id) => {
    const updated = get().entries.filter((e) => e.id !== id);
    setObject(StorageKeys.spendingEntries, updated);
    set({ entries: updated });
  },

  getCategoryTotal: (category, month) => {
    return get()
      .entries.filter((e) => {
        if (e.category !== category) return false;
        if (month) {
          // month in format "YYYY-MM"
          return e.date.startsWith(month);
        }
        return true;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  },

  getRecentEntries: (limit = 10) =>
    [...get().entries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit),
}));
