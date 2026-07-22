// ---------------------------------------------------------------------------
// Budget Buddy ADHD — Core Domain Models
// ---------------------------------------------------------------------------

/** Frequency at which a bill recurs */
export type RecurrenceFrequency = "weekly" | "biweekly" | "monthly" | "yearly" | "once";

/** Status of a bill in the current cycle */
export type BillStatus = "upcoming" | "due" | "overdue" | "paid";

/** A recurring bill (rent, utilities, subscriptions, etc.) */
export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: number; // day of month (1-31)
  recurrence: RecurrenceFrequency;
  status: BillStatus;
  category: string;
  notes?: string;
  lastPaidDate?: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

/** A tracked subscription (Netflix, Spotify, etc.) */
export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: RecurrenceFrequency;
  nextBillingDate: string; // ISO date string
  category: string;
  logo?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/** A paycheck / income entry */
export interface Paycheck {
  id: string;
  source: string;
  amount: number;
  frequency: RecurrenceFrequency;
  nextPayDate: string;
  createdAt: string;
  updatedAt: string;
}

/** A savings goal */
export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
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
