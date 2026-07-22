// ---------------------------------------------------------------------------
// Budget Buddy ADHD — Core Domain Models
// ---------------------------------------------------------------------------

/** Frequency at which a bill recurs */
export type RecurrenceFrequency = "weekly" | "biweekly" | "monthly" | "yearly" | "once";

/** Status of a bill in the current cycle */
export type BillStatus = "upcoming" | "due" | "overdue" | "paid";

/** Category of a bill */
export type BillCategory =
  | "mortgage"
  | "rent"
  | "phone"
  | "internet"
  | "insurance"
  | "credit_card"
  | "utilities"
  | "medical"
  | "other";

/** Priority level for bills */
export type BillPriority = "low" | "medium" | "high";

/** A recurring bill (rent, utilities, subscriptions, etc.) */
export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: number; // day of month (1-31)
  recurrence: RecurrenceFrequency;
  status: BillStatus;
  category: BillCategory;
  priority: BillPriority;
  autopay: boolean;
  notes?: string;
  lastPaidDate?: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

/** Category of a subscription */
export type SubscriptionCategory =
  | "streaming"
  | "software"
  | "gym"
  | "phone_apps"
  | "shopping"
  | "insurance"
  | "other";

/** A tracked subscription (Netflix, Spotify, etc.) */
export interface Subscription {
  id: string;
  name: string;
  provider: string;
  amount: number;
  monthlyCost: number;
  annualCost: number;
  billingCycle: RecurrenceFrequency;
  nextBillingDate: string; // ISO date string
  category: SubscriptionCategory;
  logo?: string;
  active: boolean;
  cancellationReminder: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Pay frequency */
export type PayFrequency = "weekly" | "biweekly" | "monthly" | "custom";

/** A paycheck / income entry */
export interface Paycheck {
  id: string;
  employer: string;
  source: string;
  grossPay: number;
  netPay: number;
  frequency: PayFrequency;
  customFrequencyDays?: number;
  nextPayDate: string;
  createdAt: string;
  updatedAt: string;
}

/** A milestone within a savings goal */
export interface SavingsMilestone {
  amount: number;
  reached: boolean;
}

/** A savings goal */
export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  milestones: SavingsMilestone[];
  deadline?: string;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

/** Spending category */
export type SpendingCategory =
  | "food"
  | "gas"
  | "shopping"
  | "entertainment"
  | "medical"
  | "other";

/** A spending entry */
export interface SpendingEntry {
  id: string;
  amount: number;
  category: SpendingCategory;
  note?: string;
  date: string; // ISO date string
}

/** The single-screen "Today's Focus" view model */
export interface TodaysFocus {
  /** Top 3 bills/tasks requiring action today */
  urgentItems: Bill[];
  /** Subscriptions renewing this week */
  upcomingSubscriptions: Subscription[];
  /** Paycheck landing this week */
  upcomingPaycheck?: Paycheck;
  /** Savings goal progress snapshot */
  savingsSnapshot: {
    completed: number;
    total: number;
  };
}

/** Onboarding step identifiers */
export type OnboardingStep =
  | "welcome"
  | "name"
  | "bills"
  | "paycheck"
  | "savings"
  | "notifications"
  | "complete";
