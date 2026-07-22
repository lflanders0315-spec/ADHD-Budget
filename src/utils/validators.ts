import { z } from "zod";

// ---------------------------------------------------------------------------
// Bill
// ---------------------------------------------------------------------------

export const recurrenceFrequencySchema = z.enum([
  "weekly",
  "biweekly",
  "monthly",
  "yearly",
  "once",
]);

export const billStatusSchema = z.enum([
  "upcoming",
  "due",
  "overdue",
  "paid",
]);

export const billSchema = z.object({
  name: z.string().min(1, "Bill name is required").max(100),
  amount: z.number().positive("Amount must be positive"),
  dueDate: z.number().min(1).max(31),
  recurrence: recurrenceFrequencySchema,
  category: z.string().min(1).max(50),
  notes: z.string().max(500).optional(),
});

export type BillFormData = z.infer<typeof billSchema>;

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

export const subscriptionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  amount: z.number().positive("Amount must be positive"),
  billingCycle: recurrenceFrequencySchema,
  nextBillingDate: z.string().min(1, "Date is required"),
  category: z.string().min(1).max(50),
});

export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

// ---------------------------------------------------------------------------
// Paycheck
// ---------------------------------------------------------------------------

export const paycheckSchema = z.object({
  source: z.string().min(1, "Source is required").max(100),
  amount: z.number().positive("Amount must be positive"),
  frequency: recurrenceFrequencySchema,
  nextPayDate: z.string().min(1, "Date is required"),
});

export type PaycheckFormData = z.infer<typeof paycheckSchema>;

// ---------------------------------------------------------------------------
// Savings Goal
// ---------------------------------------------------------------------------

export const savingsGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required").max(100),
  targetAmount: z.number().positive("Target must be positive"),
  currentAmount: z.number().min(0, "Cannot be negative"),
  deadline: z.string().optional(),
});

export type SavingsGoalFormData = z.infer<typeof savingsGoalSchema>;

// ---------------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------------

export const onboardingNameSchema = z.object({
  displayName: z
    .string()
    .min(1, "What should we call you?")
    .max(50, "Keep it short!"),
});

export type OnboardingNameFormData = z.infer<typeof onboardingNameSchema>;
