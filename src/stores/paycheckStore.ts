import { create } from "zustand";
import { getObject, setObject, StorageKeys } from "@/services/storage";
import { generateId } from "@/utils/uuid";
import type { Paycheck, PayFrequency } from "@/models";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PaycheckState {
  paychecks: Paycheck[];

  // CRUD
  addPaycheck: (data: Omit<Paycheck, "id" | "createdAt" | "updatedAt">) => void;
  updatePaycheck: (id: string, updates: Partial<Paycheck>) => void;
  deletePaycheck: (id: string) => void;

  // Queries
  getNextPaycheck: () => Paycheck | undefined;

  // Utility
  estimateNextPayDate: (frequency: PayFrequency, lastDate: string, customDays?: number) => string;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const usePaycheckStore = create<PaycheckState>((set, get) => ({
  paychecks: getObject<Paycheck[]>(StorageKeys.paychecks) ?? [],

  addPaycheck: (data) => {
    const now = new Date().toISOString();
    const paycheck: Paycheck = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    const updated = [...get().paychecks, paycheck];
    setObject(StorageKeys.paychecks, updated);
    set({ paychecks: updated });
  },

  updatePaycheck: (id, updates) => {
    const updated = get().paychecks.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p,
    );
    setObject(StorageKeys.paychecks, updated);
    set({ paychecks: updated });
  },

  deletePaycheck: (id) => {
    const updated = get().paychecks.filter((p) => p.id !== id);
    setObject(StorageKeys.paychecks, updated);
    set({ paychecks: updated });
  },

  getNextPaycheck: () => {
    const now = new Date();
    return get()
      .paychecks.filter((p) => new Date(p.nextPayDate) >= now)
      .sort((a, b) => new Date(a.nextPayDate).getTime() - new Date(b.nextPayDate).getTime())[0];
  },

  estimateNextPayDate: (frequency, lastDate, customDays) => {
    const last = new Date(lastDate);
    switch (frequency) {
      case "weekly":
        last.setDate(last.getDate() + 7);
        break;
      case "biweekly":
        last.setDate(last.getDate() + 14);
        break;
      case "monthly":
        last.setMonth(last.getMonth() + 1);
        break;
      case "custom":
        if (customDays && customDays > 0) {
          last.setDate(last.getDate() + customDays);
        }
        break;
    }
    return last.toISOString();
  },
}));
