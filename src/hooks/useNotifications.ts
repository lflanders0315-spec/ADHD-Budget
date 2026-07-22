import { useEffect, useRef } from "react";
import { useBillStore } from "@/stores/billStore";
import { usePaycheckStore } from "@/stores/paycheckStore";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { useSavingsStore } from "@/stores/savingsStore";
import {
  rescheduleAllReminders,
  scheduleSavingsMilestone,
} from "@/services/notifications";
import type { SavingsGoal } from "@/models";

// ---------------------------------------------------------------------------
// useNotificationSync
// ---------------------------------------------------------------------------

/**
 * Watches all data stores and reschedules notifications whenever
 * bills, paychecks, or subscriptions change.
 */
export function useNotificationSync(): void {
  const bills = useBillStore((s) => s.bills);
  const paychecks = usePaycheckStore((s) => s.paychecks);
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);

  // Debounce rescheduling to avoid flooding on rapid changes
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any pending reschedule
    if (timerRef.current) clearTimeout(timerRef.current);

    // Debounce by 500ms — enough to batch rapid store updates
    timerRef.current = setTimeout(() => {
      rescheduleAllReminders();
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [bills, paychecks, subscriptions]);
}

// ---------------------------------------------------------------------------
// useSavingsNotifications
// ---------------------------------------------------------------------------

/**
 * Watches savings goals and fires celebration notifications when
 * a milestone is newly reached. Compares previous goals snapshot
 * to current to detect transitions.
 */
export function useSavingsNotifications(): void {
  const goals = useSavingsStore((s) => s.goals);

  // Keep a ref of the previous goals to detect milestone transitions
  const prevGoalsRef = useRef<SavingsGoal[]>(goals);

  useEffect(() => {
    const prevGoals = prevGoalsRef.current;
    const currentGoals = goals;

    for (const goal of currentGoals) {
      const prevGoal = prevGoals.find((g) => g.id === goal.id);
      if (!prevGoal) continue;

      // Check each milestone for a transition: was false, now true
      for (const milestone of goal.milestones) {
        const prevMilestone = prevGoal.milestones.find(
          (m) => m.amount === milestone.amount,
        );
        if (!prevMilestone) continue;

        if (!prevMilestone.reached && milestone.reached) {
          // Newly reached milestone — celebrate!
          const percent = Math.round(
            (milestone.amount / goal.targetAmount) * 100,
          );
          scheduleSavingsMilestone(goal, percent);
        }
      }
    }

    // Update the ref for next comparison
    prevGoalsRef.current = currentGoals;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goals]);
}
