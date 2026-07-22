import { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Header } from "@/components/Header";
import { BillCard } from "@/components/BillCard";
import { PaycheckCard } from "@/components/PaycheckCard";
import { ProgressRing } from "@/components/ProgressRing";
import { TodayFocusItem } from "@/components/TodayFocusItem";
import { Card } from "@/components/Card";
import { useBillStore } from "@/stores/billStore";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { usePaycheckStore } from "@/stores/paycheckStore";
import { useSavingsStore } from "@/stores/savingsStore";
import { useSpendingStore } from "@/stores/spendingStore";
import { useAppStore } from "@/stores/appStore";
import { formatCurrency, formatDate } from "@/utils/formatters";
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
} from "@/constants/theme";
import type { Bill, Subscription, PayFrequency } from "@/models";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FocusItem {
  id: string;
  type: "bill" | "savings" | "subscription";
  title: string;
  subtitle: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function monthlyIncome(paycheck: { netPay: number; frequency: PayFrequency }): number {
  switch (paycheck.frequency) {
    case "weekly":
      return (paycheck.netPay * 52) / 12;
    case "biweekly":
      return (paycheck.netPay * 26) / 12;
    case "monthly":
      return paycheck.netPay;
    case "custom":
      return paycheck.netPay; // conservative: treat as monthly
    default:
      return paycheck.netPay;
  }
}

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // ── Store selectors ──────────────────────────────────────────────────────
  const displayName = useAppStore((s) => s.displayName);
  const bills = useBillStore((s) => s.bills);
  const upcomingBills = useBillStore((s) => s.getUpcomingBills());
  const overdueBills = useBillStore((s) => s.getOverdueBills());
  const markPaid = useBillStore((s) => s.markPaid);
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const totalSubCost = useSubscriptionStore((s) => s.getTotalMonthlyCost());
  const renewingSoon = useSubscriptionStore((s) => s.getRenewingSoon());
  const paychecks = usePaycheckStore((s) => s.paychecks);
  const nextPaycheck = usePaycheckStore((s) => s.getNextPaycheck());
  const goals = useSavingsStore((s) => s.goals);
  const overallProgress = useSavingsStore((s) => s.getOverallProgress());
  const entries = useSpendingStore((s) => s.entries);
  const getCategoryTotal = useSpendingStore((s) => s.getCategoryTotal);

  // ── Today's Focus check-off state ────────────────────────────────────────
  const [completedFocusItems, setCompletedFocusItems] = useState<Set<string>>(
    new Set(),
  );

  const toggleFocusItem = useCallback((id: string) => {
    setCompletedFocusItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // ── Available money ──────────────────────────────────────────────────────
  const availableMoney = useMemo(() => {
    const totalMonthlyIncome = paychecks.reduce(
      (sum, p) => sum + monthlyIncome(p),
      0,
    );
    // Only count non-paid bills for monthly obligations
    const upcomingMonthlyBills = bills
      .filter((b) => b.status !== "paid" && b.recurrence !== "once")
      .reduce((sum, b) => sum + b.amount, 0);
    return totalMonthlyIncome - upcomingMonthlyBills - totalSubCost;
  }, [paychecks, bills, totalSubCost]);

  // ── Today's Focus items ──────────────────────────────────────────────────
  const todayFocusItems = useMemo((): FocusItem[] => {
    const items: FocusItem[] = [];
    const today = new Date();
    const dayOfMonth = today.getDate();

    // 1. Overdue bills (highest priority)
    for (const bill of overdueBills) {
      items.push({
        id: `overdue-${bill.id}`,
        type: "bill" as const,
        title: `Pay ${bill.name}`,
        subtitle: `${formatCurrency(bill.amount)} — was due ${bill.dueDate}${getOrdinalSuffix(bill.dueDate)}`,
      });
    }

    // 2. Bills due today or within 2 days
    for (const bill of bills) {
      if (bill.status === "paid") continue;
      if (bill.status === "overdue") continue; // already captured above
      const daysUntil = bill.dueDate - dayOfMonth;
      // Handle wrap-around (bill due early next month, we're late this month)
      const adjustedDays =
        daysUntil < -15 ? daysUntil + new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() : daysUntil;
      if (adjustedDays >= 0 && adjustedDays <= 2) {
        items.push({
          id: `due-${bill.id}`,
          type: "bill" as const,
          title: `Pay ${bill.name}`,
          subtitle:
            adjustedDays === 0
              ? `${formatCurrency(bill.amount)} — due today`
              : `${formatCurrency(bill.amount)} — due in ${adjustedDays} day${adjustedDays > 1 ? "s" : ""}`,
        });
      }
    }

    // 3. Savings goals with approaching deadlines (within 30 days)
    for (const goal of goals) {
      if (goal.currentAmount >= goal.targetAmount) continue; // already completed
      if (!goal.deadline) continue;
      const deadline = new Date(goal.deadline);
      const daysUntil = Math.ceil(
        (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysUntil <= 30 && daysUntil >= 0) {
        items.push({
          id: `goal-${goal.id}`,
          type: "savings" as const,
          title: `Save for ${goal.name}`,
          subtitle: `${formatCurrency(goal.targetAmount - goal.currentAmount)} to go — due in ${daysUntil} days`,
        });
      }
    }

    // 4. Subscriptions renewing soon (from store query)
    for (const sub of renewingSoon) {
      items.push({
        id: `sub-${sub.id}`,
        type: "subscription" as const,
        title: `${sub.name} renews`,
        subtitle: `${formatCurrency(sub.monthlyCost)} — ${formatDate(sub.nextBillingDate)}`,
      });
    }

    // Return max 3
    return items.slice(0, 3);
  }, [bills, overdueBills, goals, renewingSoon]);

  // ── Spending snapshot ─────────────────────────────────────────────────────
  const spendingSnapshot = useMemo(() => {
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const thisMonthEntries = entries.filter((e) => e.date.startsWith(monthPrefix));
    const totalSpent = thisMonthEntries.reduce((sum, e) => sum + e.amount, 0);

    // Aggregate by category
    const categoryTotals: Record<string, number> = {};
    for (const entry of thisMonthEntries) {
      categoryTotals[entry.category] =
        (categoryTotals[entry.category] ?? 0) + entry.amount;
    }

    // Top categories sorted
    const topCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return { totalSpent, topCategories };
  }, [entries]);

  const getCategoryEmoji = (category: string): string => {
    const map: Record<string, string> = {
      food: "🍔",
      gas: "⛽",
      shopping: "🛍️",
      entertainment: "🎬",
      medical: "🏥",
      other: "📌",
    };
    return map[category] ?? "📌";
  };

  const getCategoryLabel = (category: string): string => {
    const map: Record<string, string> = {
      food: "Food & Drinks",
      gas: "Gas",
      shopping: "Shopping",
      entertainment: "Entertainment",
      medical: "Medical",
      other: "Other",
    };
    return map[category] ?? category;
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
    >
      <Header title="Today" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xl + 64, // extra room for tab bar
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ═════════════════════════════════════════════════════════════════
            1. Greeting + Available Money
           ═════════════════════════════════════════════════════════════════ */}
        <View className="mt-2 mb-6">
          <Text
            className="font-bold mb-1"
            style={{
              fontSize: fontSize["2xl"],
              color: colors.textPrimary,
            }}
          >
            Hello{displayName ? `, ${displayName}` : "!"} 👋
          </Text>
          <Text
            className="mb-3"
            style={{
              fontSize: fontSize.sm,
              color: colors.textSecondary,
            }}
          >
            Available this month
          </Text>
          <Text
            className="font-bold"
            style={{
              fontSize: 36,
              color: availableMoney >= 0 ? colors.primary : colors.statusOverdue,
              letterSpacing: -1,
            }}
          >
            {formatCurrency(availableMoney)}
          </Text>
          <Text
            style={{
              fontSize: fontSize.xs,
              color: colors.textMuted,
              marginTop: spacing.xs,
            }}
          >
            After bills & subscriptions
          </Text>
        </View>

        {/* ═════════════════════════════════════════════════════════════════
            2. Today's Money Focus
           ═════════════════════════════════════════════════════════════════ */}
        <SectionHeading>Today's Focus</SectionHeading>
        <Card className="mb-6" padded={false}>
          {todayFocusItems.length === 0 ? (
            <View className="items-center justify-center py-6 px-4">
              <Text style={{ fontSize: 32 }}>🎉</Text>
              <Text
                className="font-semibold mt-2 text-center"
                style={{
                  fontSize: fontSize.base,
                  color: colors.textPrimary,
                }}
              >
                Nothing urgent today!
              </Text>
              <Text
                className="text-center mt-1"
                style={{
                  fontSize: fontSize.sm,
                  color: colors.textSecondary,
                }}
              >
                You're all caught up — enjoy your day.
              </Text>
            </View>
          ) : (
            todayFocusItems.map((item) => (
              <TodayFocusItem
                key={item.id}
                type={item.type}
                title={item.title}
                subtitle={item.subtitle}
                completed={completedFocusItems.has(item.id)}
                onToggle={() => toggleFocusItem(item.id)}
              />
            ))
          )}
        </Card>

        {/* ═════════════════════════════════════════════════════════════════
            3. Bills Due Soon
           ═════════════════════════════════════════════════════════════════ */}
        <SectionHeading>Bills Due Soon</SectionHeading>
        {upcomingBills.length === 0 ? (
          <View className="items-center py-5 mb-6">
            <Text style={{ fontSize: 28, marginBottom: spacing.sm }}>🌟</Text>
            <Text
              className="font-semibold text-center"
              style={{ fontSize: fontSize.base, color: colors.textPrimary }}
            >
              All bills are paid — great job!
            </Text>
          </View>
        ) : (
          <View className="mb-4">
            {upcomingBills.slice(0, 3).map((bill) => (
              <BillCard
                key={bill.id}
                bill={bill}
                onMarkPaid={(b) => markPaid(b.id)}
              />
            ))}
            {upcomingBills.length > 3 && (
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/bills")}
                className="items-center py-2"
                style={{ minHeight: 44 }}
              >
                <Text
                  className="font-semibold"
                  style={{
                    fontSize: fontSize.sm,
                    color: colors.primary,
                  }}
                >
                  View all {upcomingBills.length} bills →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            4. Spending Snapshot
           ═════════════════════════════════════════════════════════════════ */}
        <SectionHeading>This Month's Spending</SectionHeading>
        <Card className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text
              className="font-semibold"
              style={{ fontSize: fontSize.base, color: colors.textPrimary }}
            >
              Total spent
            </Text>
            <Text
              className="font-bold"
              style={{ fontSize: fontSize.xl, color: colors.textPrimary }}
            >
              {formatCurrency(spendingSnapshot.totalSpent)}
            </Text>
          </View>

          {spendingSnapshot.topCategories.length === 0 ? (
            <Text
              style={{ fontSize: fontSize.sm, color: colors.textSecondary }}
            >
              No spending recorded this month yet.
            </Text>
          ) : (
            <View>
              {spendingSnapshot.topCategories.map(([category, amount]) => {
                const pct =
                  spendingSnapshot.totalSpent > 0
                    ? Math.round((amount / spendingSnapshot.totalSpent) * 100)
                    : 0;
                return (
                  <View key={category} className="mb-3 last:mb-0">
                    <View className="flex-row items-center justify-between mb-1">
                      <View className="flex-row items-center">
                        <Text style={{ fontSize: 16, marginRight: spacing.sm }}>
                          {getCategoryEmoji(category)}
                        </Text>
                        <Text
                          style={{
                            fontSize: fontSize.sm,
                            color: colors.textSecondary,
                          }}
                        >
                          {getCategoryLabel(category)}
                        </Text>
                      </View>
                      <Text
                        className="font-semibold"
                        style={{
                          fontSize: fontSize.sm,
                          color: colors.textPrimary,
                        }}
                      >
                        {formatCurrency(amount)}
                      </Text>
                    </View>
                    {/* Mini progress bar */}
                    <View
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: colors.surfaceMuted }}
                    >
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(pct, 2)}%`,
                          backgroundColor: colors.accent,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        {/* ═════════════════════════════════════════════════════════════════
            5. Savings at a Glance
           ═════════════════════════════════════════════════════════════════ */}
        <SectionHeading>Savings Goals</SectionHeading>
        {goals.length === 0 ? (
          <View className="items-center py-5 mb-6">
            <Text style={{ fontSize: 28, marginBottom: spacing.sm }}>🐷</Text>
            <Text
              className="font-semibold text-center"
              style={{ fontSize: fontSize.base, color: colors.textPrimary }}
            >
              No savings goals yet
            </Text>
            <Text
              className="text-center mt-1"
              style={{ fontSize: fontSize.sm, color: colors.textSecondary }}
            >
              Set a goal and we'll help you get there!
            </Text>
          </View>
        ) : (
          <View className="mb-4">
            {/* Overall progress */}
            <Card className="mb-4">
              <View className="flex-row items-center">
                <View className="mr-4">
                  <ProgressRing
                    progress={
                      overallProgress.total > 0
                        ? (overallProgress.completed / overallProgress.total) * 100
                        : 0
                    }
                    size={64}
                    strokeWidth={6}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="font-semibold"
                    style={{ fontSize: fontSize.base, color: colors.textPrimary }}
                  >
                    {overallProgress.completed} of {overallProgress.total}{" "}
                    {overallProgress.total === 1 ? "goal" : "goals"} on track
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize.sm,
                      color: colors.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    {overallProgress.completed === overallProgress.total
                      ? "All goals completed! 🎉"
                      : "Keep going — you've got this!"}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Individual goal summaries */}
            {goals.slice(0, 2).map((goal) => {
              const progress =
                goal.targetAmount > 0
                  ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
                  : 0;
              return (
                <Card key={goal.id} className="mb-3">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center flex-1">
                      {goal.icon && (
                        <Text style={{ fontSize: 18, marginRight: spacing.sm }}>
                          {goal.icon}
                        </Text>
                      )}
                      <Text
                        className="font-semibold flex-1"
                        style={{ fontSize: fontSize.base, color: colors.textPrimary }}
                        numberOfLines={1}
                      >
                        {goal.name}
                      </Text>
                    </View>
                    <Text
                      className="font-bold ml-2"
                      style={{ fontSize: fontSize.base, color: colors.textPrimary }}
                    >
                      {formatCurrency(goal.currentAmount)}
                      <Text style={{ fontSize: fontSize.xs, color: colors.textMuted }}>
                        {" "}/{" "}{formatCurrency(goal.targetAmount)}
                      </Text>
                    </Text>
                  </View>
                  {/* Progress bar */}
                  <View
                    className="h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: colors.surfaceMuted }}
                  >
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(progress, 0)}%`,
                        backgroundColor: goal.color ?? colors.primary,
                      }}
                    />
                  </View>
                  <Text
                    className="mt-1"
                    style={{
                      fontSize: fontSize.xs,
                      color: goal.color ?? colors.primary,
                      fontWeight: "600",
                    }}
                  >
                    {progress}%
                  </Text>
                </Card>
              );
            })}

            {goals.length > 2 && (
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/savings")}
                className="items-center py-2"
                style={{ minHeight: 44 }}
              >
                <Text
                  className="font-semibold"
                  style={{
                    fontSize: fontSize.sm,
                    color: colors.primary,
                  }}
                >
                  View all {goals.length} goals →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            6. Bottom Summary Cards (2-column grid)
           ═════════════════════════════════════════════════════════════════ */}
        <View className="flex-row gap-3 mb-6">
          {/* Next Paycheck */}
          <View className="flex-1">
            <Card>
              <Text
                style={{
                  fontSize: fontSize.xs,
                  color: colors.textMuted,
                  marginBottom: spacing.xs,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Next Paycheck
              </Text>
              {nextPaycheck ? (
                <View>
                  <Text
                    className="font-bold mb-1"
                    style={{
                      fontSize: fontSize.xl,
                      color: colors.primary,
                    }}
                  >
                    {formatCurrency(nextPaycheck.netPay)}
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize.sm,
                      color: colors.textSecondary,
                    }}
                  >
                    {formatDate(nextPaycheck.nextPayDate)}
                  </Text>
                </View>
              ) : (
                <Text
                  style={{
                    fontSize: fontSize.sm,
                    color: colors.textSecondary,
                  }}
                >
                  No paychecks yet
                </Text>
              )}
            </Card>
          </View>

          {/* Monthly Subscriptions */}
          <View className="flex-1">
            <TouchableOpacity
              onPress={() => router.push("/subscriptions")}
              activeOpacity={0.7}
            >
              <Card>
                <Text
                  style={{
                    fontSize: fontSize.xs,
                    color: colors.textMuted,
                    marginBottom: spacing.xs,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Monthly Subs
                </Text>
                <Text
                  className="font-bold mb-1"
                  style={{
                    fontSize: fontSize.xl,
                    color: colors.accent,
                  }}
                >
                  {formatCurrency(totalSubCost)}
                </Text>
                <Text
                  style={{
                    fontSize: fontSize.sm,
                    color: colors.textSecondary,
                  }}
                >
                  {subscriptions.filter((s) => s.active).length} active
                </Text>
              </Card>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Section Heading
// ---------------------------------------------------------------------------

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Text
      className="font-semibold mb-3"
      style={{
        fontSize: fontSize.lg,
        color: colors.textSecondary,
      }}
    >
      {children}
    </Text>
  );
}
