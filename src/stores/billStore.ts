import { create } from "zustand";
import { getObject, setObject, StorageKeys } from "@/services/storage";
import { generateId } from "@/utils/uuid";
import type { Bill } from "@/models";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BillState {
  bills: Bill[];

  // CRUD
  addBill: (data: Omit<Bill, "id" | "createdAt" | "updatedAt">) => void;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  deleteBill: (id: string) => void;

  // Actions
  markPaid: (id: string) => void;

  // Queries
  getUpcomingBills: () => Bill[];
  getOverdueBills: () => Bill[];
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useBillStore = create<BillState>((set, get) => ({
  bills: getObject<Bill[]>(StorageKeys.bills) ?? [],

  addBill: (data) => {
    const now = new Date().toISOString();
    const bill: Bill = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    const updated = [...get().bills, bill];
    setObject(StorageKeys.bills, updated);
    set({ bills: updated });
  },

  updateBill: (id, updates) => {
    const updated = get().bills.map((b) =>
      b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b,
    );
    setObject(StorageKeys.bills, updated);
    set({ bills: updated });
  },

  deleteBill: (id) => {
    const updated = get().bills.filter((b) => b.id !== id);
    setObject(StorageKeys.bills, updated);
    set({ bills: updated });
  },

  markPaid: (id) => {
    const now = new Date().toISOString();
    const updated = get().bills.map((b) =>
      b.id === id
        ? { ...b, status: "paid" as const, lastPaidDate: now, updatedAt: now }
        : b,
    );
    setObject(StorageKeys.bills, updated);
    set({ bills: updated });
  },

  getUpcomingBills: () => {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    return get()
      .bills.filter((b) => {
        if (b.status === "paid") return false;
        // Due within this week (today + 7 days)
        if (b.dueDate >= dayOfMonth && b.dueDate <= dayOfMonth + 7) return true;
        // Handle month wrap-around
        if (dayOfMonth + 7 > daysInMonth && b.dueDate <= (dayOfMonth + 7) % daysInMonth) {
          return true;
        }
        return false;
      })
      .sort((a, b) => a.dueDate - b.dueDate);
  },

  getOverdueBills: () => {
    const dayOfMonth = new Date().getDate();
    return get()
      .bills.filter((b) => b.status !== "paid" && b.dueDate < dayOfMonth)
      .sort((a, b) => a.dueDate - b.dueDate);
  },
}));
