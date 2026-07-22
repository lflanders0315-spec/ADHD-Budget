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

export const payFrequencySchema = z.enum([
  "weekly",
  "biweekly",
  "monthly",
  "custom",
]);

export const paycheckSchema = z
  .object({
    employer: z.string().min(1, "Employer is required").max(100),
    netPay: z.number().positive("Net pay must be positive"),
    grossPay: z.number().min(0).optional(),
    frequency: payFrequencySchema,
    customFrequencyDays: z
      .number()
      .int()
      .positive("Days must be positive")
      .max(365, "Must be 365 or fewer")
      .optional(),
    nextPayDate: z.string().min(1, "Next pay date is required"),
  })
  .refine(
    (data) => {
      if (data.frequency === "custom") {
        return (
          data.customFrequencyDays !== undefined &&
          data.customFrequencyDays > 0
        );
      }
      return true;
    },
    {
      message: "Custom frequency requires a number of days",
      path: ["customFrequencyDays"],
    }
  );

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
