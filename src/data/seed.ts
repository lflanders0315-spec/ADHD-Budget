import { getBoolean, setBoolean, StorageKeys } from "@/services/storage";
import { useBillStore } from "@/stores/billStore";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { usePaycheckStore } from "@/stores/paycheckStore";
import { useSavingsStore } from "@/stores/savingsStore";
import { useSpendingStore } from "@/stores/spendingStore";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Check whether seed data has already been loaded */
export function hasSeededData(): boolean {
  return getBoolean(StorageKeys.seededData);
}

function markSeeded(): void {
  setBoolean(StorageKeys.seededData, true);
}

function isoDate(dayOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString();
}

function dayOfYearOffset(day: number): string {
  // Return an ISO date on the given day of the current month
  const d = new Date();
  d.setDate(day);
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

export function seedData(): void {
  if (hasSeededData()) return;

  // ── Bills ────────────────────────────────────────────────────────────────
  const billStore = useBillStore.getState();

  const bills = [
    {
      name: "Rent",
      amount: 1200,
      dueDate: 1,
      recurrence: "monthly" as const,
      status: "paid" as const,
      category: "rent" as const,
      priority: "high" as const,
      autopay: true,
      notes: "Auto-deducted from checking",
      lastPaidDate: dayOfYearOffset(1),
    },
    {
      name: "Electric",
      amount: 84.50,
      dueDate: 15,
      recurrence: "monthly" as const,
      status: "upcoming" as const,
      category: "utilities" as const,
      priority: "medium" as const,
      autopay: false,
      notes: "Varies by season — budget $60–$120",
    },
    {
      name: "Phone",
      amount: 59.99,
      dueDate: 10,
      recurrence: "monthly" as const,
      status: "upcoming" as const,
      category: "phone" as const,
      priority: "low" as const,
      autopay: true,
    },
    {
      name: "Internet",
      amount: 74.99,
      dueDate: 20,
      recurrence: "monthly" as const,
      status: "upcoming" as const,
      category: "internet" as const,
      priority: "low" as const,
      autopay: true,
    },
    {
      name: "Car Insurance",
      amount: 118.00,
      dueDate: 5,
      recurrence: "monthly" as const,
      status: "due" as const,
      category: "insurance" as const,
      priority: "medium" as const,
      autopay: true,
    },
    {
      name: "Credit Card",
      amount: 245.00,
      dueDate: 25,
      recurrence: "monthly" as const,
      status: "upcoming" as const,
      category: "credit_card" as const,
      priority: "high" as const,
      autopay: false,
      notes: "Minimum: $35 — pay full balance if possible",
    },
  ];

  bills.forEach((b) => billStore.addBill(b));

  // ── Subscriptions ────────────────────────────────────────────────────────
  const subStore = useSubscriptionStore.getState();

  const subscriptions = [
    {
      name: "Netflix",
      provider: "Netflix",
      amount: 15.49,
      monthlyCost: 15.49,
      annualCost: 185.88,
      billingCycle: "monthly" as const,
      nextBillingDate: isoDate(5),
      category: "streaming" as const,
      active: true,
      cancellationReminder: false,
    },
    {
      name: "Spotify",
      provider: "Spotify",
      amount: 11.99,
      monthlyCost: 11.99,
      annualCost: 143.88,
      billingCycle: "monthly" as const,
      nextBillingDate: isoDate(12),
      category: "streaming" as const,
      active: true,
      cancellationReminder: false,
    },
    {
      name: "Amazon Prime",
      provider: "Amazon",
      amount: 14.99,
      monthlyCost: 14.99,
      annualCost: 139.00,
      billingCycle: "monthly" as const,
      nextBillingDate: isoDate(3),
      category: "shopping" as const,
      active: true,
      cancellationReminder: true,
    },
    {
      name: "Planet Fitness",
      provider: "Planet Fitness",
      amount: 29.99,
      monthlyCost: 29.99,
      annualCost: 359.88,
      billingCycle: "monthly" as const,
      nextBillingDate: isoDate(18),
      category: "gym" as const,
      active: true,
      cancellationReminder: false,
    },
    {
      name: "iCloud+",
      provider: "Apple",
      amount: 2.99,
      monthlyCost: 2.99,
      annualCost: 35.88,
      billingCycle: "monthly" as const,
      nextBillingDate: isoDate(8),
      category: "software" as const,
      active: true,
      cancellationReminder: false,
    },
  ];

  subscriptions.forEach((s) => subStore.addSubscription(s));

  // ── Paychecks ────────────────────────────────────────────────────────────
  const payStore = usePaycheckStore.getState();

  const paychecks = [
    {
      employer: "Acme Corp",
      source: "Primary Job",
      grossPay: 2500,
      netPay: 1975,
      frequency: "biweekly" as const,
      nextPayDate: isoDate(10),
    },
    {
      employer: "Freelance",
      source: "Side Hustle",
      grossPay: 500,
      netPay: 425,
      frequency: "monthly" as const,
      nextPayDate: isoDate(28),
    },
  ];

  paychecks.forEach((p) => payStore.addPaycheck(p));

  // ── Savings Goals ────────────────────────────────────────────────────────
  const savingsStore = useSavingsStore.getState();

  const goals = [
    {
      name: "Emergency Fund",
      targetAmount: 1000,
      currentAmount: 450,
      milestones: [
        { amount: 250, reached: true },
        { amount: 500, reached: false },
        { amount: 750, reached: false },
        { amount: 1000, reached: false },
      ],
      color: "#10B981",
      icon: "shield",
      deadline: isoDate(90),
    },
    {
      name: "Vacation",
      targetAmount: 2000,
      currentAmount: 800,
      milestones: [
        { amount: 500, reached: true },
        { amount: 1000, reached: false },
        { amount: 1500, reached: false },
        { amount: 2000, reached: false },
      ],
      color: "#3B82F6",
      icon: "airplane",
      deadline: isoDate(180),
    },
    {
      name: "New Laptop",
      targetAmount: 1500,
      currentAmount: 300,
      milestones: [
        { amount: 375, reached: false },
        { amount: 750, reached: false },
        { amount: 1125, reached: false },
        { amount: 1500, reached: false },
      ],
      color: "#8B5CF6",
      icon: "laptop",
      deadline: isoDate(120),
    },
  ];

  goals.forEach((g) => savingsStore.addGoal(g));

  // ── Spending Entries ─────────────────────────────────────────────────────
  const spendingStore = useSpendingStore.getState();

  const now = new Date();

  function daysAgo(n: number): string {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d.toISOString();
  }

  const entries = [
    { amount: 4.50, category: "food" as const, note: "Coffee", date: daysAgo(0) },
    { amount: 42.00, category: "gas" as const, note: "Fill-up", date: daysAgo(1) },
    { amount: 12.99, category: "food" as const, note: "Lunch takeout", date: daysAgo(2) },
    { amount: 28.00, category: "entertainment" as const, note: "Movie tickets", date: daysAgo(3) },
    { amount: 65.00, category: "shopping" as const, note: "Amazon — headphones", date: daysAgo(4) },
    { amount: 8.75, category: "food" as const, note: "Breakfast sandwich", date: daysAgo(5) },
    { amount: 15.00, category: "medical" as const, note: "Co-pay", date: daysAgo(6) },
    { amount: 35.00, category: "gas" as const, note: "Fill-up", date: daysAgo(8) },
    { amount: 22.50, category: "food" as const, note: "Pizza delivery", date: daysAgo(9) },
    { amount: 19.99, category: "entertainment" as const, note: "Streaming rental", date: daysAgo(10) },
    { amount: 55.00, category: "shopping" as const, note: "Target — household", date: daysAgo(11) },
    { amount: 6.25, category: "food" as const, note: "Coffee & pastry", date: daysAgo(12) },
    { amount: 40.00, category: "gas" as const, note: "Fill-up", date: daysAgo(13) },
    { amount: 18.00, category: "other" as const, note: "Post office — shipping", date: daysAgo(14) },
    { amount: 11.49, category: "food" as const, note: "Fast food", date: daysAgo(15) },
  ];

  entries.forEach((e) => spendingStore.addEntry(e));

  // ── Mark seeded ──────────────────────────────────────────────────────────
  markSeeded();
}
