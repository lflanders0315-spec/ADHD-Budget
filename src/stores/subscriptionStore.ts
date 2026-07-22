import { create } from "zustand";
import { getObject, setObject, StorageKeys } from "@/services/storage";
import { generateId } from "@/utils/uuid";
import type { Subscription } from "@/models";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SubscriptionState {
  subscriptions: Subscription[];

  // CRUD
  addSubscription: (data: Omit<Subscription, "id" | "createdAt" | "updatedAt">) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;

  // Queries
  getTotalMonthlyCost: () => number;
  getRenewingSoon: () => Subscription[];
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptions: getObject<Subscription[]>(StorageKeys.subscriptions) ?? [],

  addSubscription: (data) => {
    const now = new Date().toISOString();
    const sub: Subscription = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    const updated = [...get().subscriptions, sub];
    setObject(StorageKeys.subscriptions, updated);
    set({ subscriptions: updated });
  },

  updateSubscription: (id, updates) => {
    const updated = get().subscriptions.map((s) =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s,
    );
    setObject(StorageKeys.subscriptions, updated);
    set({ subscriptions: updated });
  },

  deleteSubscription: (id) => {
    const updated = get().subscriptions.filter((s) => s.id !== id);
    setObject(StorageKeys.subscriptions, updated);
    set({ subscriptions: updated });
  },

  getTotalMonthlyCost: () =>
    get()
      .subscriptions.filter((s) => s.active)
      .reduce((sum, s) => sum + s.monthlyCost, 0),

  getRenewingSoon: () => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);

    return get()
      .subscriptions.filter((s) => {
        if (!s.active) return false;
        const nextDate = new Date(s.nextBillingDate);
        return nextDate >= now && nextDate <= sevenDaysFromNow;
      })
      .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());
  },
}));
