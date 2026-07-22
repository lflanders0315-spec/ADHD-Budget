import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { AmountInput } from "@/components/AmountInput";
import { CategoryPicker } from "@/components/CategoryPicker";
import { FormInput } from "@/components/FormInput";
import { Confetti } from "@/components/Confetti";
import { useSpendingStore } from "@/stores/spendingStore";
import {
  formatCurrency,
  formatDate,
  formatRelativeDays,
} from "@/utils/formatters";
import {
  colors,
  spacing,
  fontSize,
  borderRadius,
  shadows,
} from "@/constants/theme";
import type { SpendingCategory } from "@/models";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SPENDING_CATEGORIES: SpendingCategory[] = [
  "food",
  "gas",
  "shopping",
  "entertainment",
  "medical",
  "other",
];

const CATEGORY_LABELS: Record<SpendingCategory, string> = {
  food: "Food & Drinks",
  gas: "Gas",
  shopping: "Shopping",
  entertainment: "Entertainment",
  medical: "Medical",
  other: "Other",
};

const CATEGORY_EMOJI: Record<SpendingCategory, string> = {
  food: "🍔",
  gas: "⛽",
  shopping: "🛍️",
  entertainment: "🎬",
  medical: "🏥",
  other: "📦",
};

// Pastel bar colors for each category
const CATEGORY_BAR_COLORS: Record<SpendingCategory, string> = {
  food: "#F0A04B",
  gas: "#8CB8D8",
  shopping: "#E07A6E",
  entertainment: "#5B8C5A",
  medical: "#C4A0E8",
  other: "#A0A0A0",
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ---------------------------------------------------------------------------
// Spending Screen
// ---------------------------------------------------------------------------

export default function SpendingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ openLog?: string }>();

  const entries = useSpendingStore((s) => s.entries);
  const addEntry = useSpendingStore((s) => s.addEntry);
  const deleteEntry = useSpendingStore((s) => s.deleteEntry);

  // ── Month state ────────────────────────────────────────────────────────
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth()); // 0-indexed
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  // ── Modals ──────────────────────────────────────────────────────────────
  const [showLogModal, setShowLogModal] = useState(params.openLog === "true");
  const [showConfetti, setShowConfetti] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // ── Log purchase form ───────────────────────────────────────────────────
  const [logAmount, setLogAmount] = useState(0);
  const [logCategory, setLogCategory] = useState<SpendingCategory>("food");
  const [logNote, setLogNote] = useState("");
  const [saving, setSaving] = useState(false);

  // ── Current month prefix ────────────────────────────────────────────────
  const monthPrefix = useMemo(
    () => `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`,
    [currentYear, currentMonth]
  );

  // ── Filter entries for current month ────────────────────────────────────
  const monthEntries = useMemo(
    () =>
      entries
        .filter((e) => e.date.startsWith(monthPrefix))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [entries, monthPrefix]
  );

  const totalSpent = useMemo(
    () => monthEntries.reduce((sum, e) => sum + e.amount, 0),
    [monthEntries]
  );

  // ── Category breakdown ──────────────────────────────────────────────────
  const categoryBreakdown = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const entry of monthEntries) {
      totals[entry.category] = (totals[entry.category] ?? 0) + entry.amount;
    }
    return Object.entries(totals)
      .map(([category, amount]) => ({
        category: category as SpendingCategory,
        amount,
        percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthEntries, totalSpent]);

  // ── Recent entries ──────────────────────────────────────────────────────
  const recentEntries = useMemo(() => monthEntries.slice(0, 10), [monthEntries]);

  // ── Insights ────────────────────────────────────────────────────────────
  const insights = useMemo(() => {
    if (monthEntries.length === 0) return null;
    const top2 = categoryBreakdown.slice(0, 2);
    return top2.map(({ category, amount, percentage }) => {
      const label = CATEGORY_LABELS[category];
      const emoji = CATEGORY_EMOJI[category];
      // Friendly messages
      const messages: Record<string, string[]> = {
        food: [
          `You spent ${formatCurrency(amount)} on food this month ${emoji}`,
          `Food & drinks are ${percentage}% of your spending this month`,
        ],
        gas: [
          `You spent ${formatCurrency(amount)} on gas this month ${emoji}`,
          `Gas makes up ${percentage}% of your monthly spending`,
        ],
        shopping: [
          `You spent ${formatCurrency(amount)} on shopping this month ${emoji}`,
          `Shopping is ${percentage}% of your spending this month`,
        ],
        entertainment: [
          `You spent ${formatCurrency(amount)} on fun this month ${emoji}`,
          `Entertainment is ${percentage}% of your monthly spending`,
        ],
        medical: [
          `You spent ${formatCurrency(amount)} on medical this month ${emoji}`,
          `Medical expenses are ${percentage}% of your spending`,
        ],
        other: [
          `You spent ${formatCurrency(amount)} on other things this month ${emoji}`,
          `That's ${percentage}% of your spending`,
        ],
      };
      const msgs = messages[category] ?? [
        `You spent ${formatCurrency(amount)} on ${label.toLowerCase()} ${emoji}`,
        `That's ${percentage}% of your monthly spending`,
      ];
      return msgs[0];
    });
  }, [categoryBreakdown, monthEntries.length]);

  // ── Month navigation ────────────────────────────────────────────────────
  const goToPrevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }, [currentMonth]);

  const isCurrentMonth =
    currentMonth === now.getMonth() && currentYear === now.getFullYear();

  // ── Log purchase handlers ───────────────────────────────────────────────
  const openLogModal = useCallback(() => {
    setLogAmount(0);
    setLogCategory("food");
    setLogNote("");
    setShowLogModal(true);
  }, []);

  const handleSaveLog = useCallback(() => {
    if (logAmount <= 0) return;
    setSaving(true);
    addEntry({
      amount: logAmount,
      category: logCategory,
      note: logNote.trim() || undefined,
      date: new Date().toISOString(),
    });
    setSaving(false);
    setShowLogModal(false);
    setShowConfetti(true);
  }, [logAmount, logCategory, logNote, addEntry]);

  const handleDeleteEntry = useCallback(
    (id: string) => {
      deleteEntry(id);
      setDeleteTarget(null);
    },
    [deleteEntry]
  );

  // ── Header right action ─────────────────────────────────────────────────
  const headerRightAction = {
    label: "Log Purchase",
    onPress: openLogModal,
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
    >
      {/* Confetti on successful log */}
      <Confetti
        visible={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      {/* Header */}
      <Header
        title="Spending"
        showBack
        rightAction={headerRightAction}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xl + 64,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ═════════════════════════════════════════════════════════════════
            1. Month Picker + Total
           ═════════════════════════════════════════════════════════════════ */}
        <View className="flex-row items-center justify-between mt-2 mb-2">
          {/* Prev month */}
          <TouchableOpacity
            onPress={goToPrevMonth}
            activeOpacity={0.7}
            className="items-center justify-center rounded-full"
            style={{
              width: 44,
              height: 44,
              backgroundColor: colors.surfaceMuted,
            }}
          >
            <Text
              style={{ fontSize: 20, color: colors.textSecondary }}
            >
              ←
            </Text>
          </TouchableOpacity>

          {/* Month / Year label */}
          <View className="items-center">
            <Text
              className="font-bold"
              style={{ fontSize: fontSize.xl, color: colors.textPrimary }}
            >
              {MONTH_NAMES[currentMonth]} {currentYear}
            </Text>
            {!isCurrentMonth && (
              <TouchableOpacity
                onPress={() => {
                  setCurrentMonth(now.getMonth());
                  setCurrentYear(now.getFullYear());
                }}
                className="mt-1"
              >
                <Text
                  style={{
                    fontSize: fontSize.xs,
                    color: colors.primary,
                    fontWeight: "600",
                  }}
                >
                  Back to this month
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Next month */}
          <TouchableOpacity
            onPress={goToNextMonth}
            activeOpacity={0.7}
            className="items-center justify-center rounded-full"
            style={{
              width: 44,
              height: 44,
              backgroundColor: isCurrentMonth
                ? colors.surfaceMuted
                : colors.surfaceMuted,
              opacity: isCurrentMonth ? 0.4 : 1,
            }}
            disabled={isCurrentMonth}
          >
            <Text
              style={{ fontSize: 20, color: colors.textSecondary }}
            >
              →
            </Text>
          </TouchableOpacity>
        </View>

        {/* ═════════════════════════════════════════════════════════════════
            2. Total Spent This Month
           ═════════════════════════════════════════════════════════════════ */}
        <View className="items-center py-6">
          <Text
            style={{
              fontSize: fontSize.sm,
              color: colors.textSecondary,
              marginBottom: spacing.xs,
            }}
          >
            Total spent this month
          </Text>
          <Text
            className="font-bold"
            style={{
              fontSize: 48,
              color: totalSpent > 0 ? colors.textPrimary : colors.textMuted,
              letterSpacing: -2,
            }}
          >
            {formatCurrency(totalSpent)}
          </Text>
        </View>

        {/* Log Purchase button (always visible, prominent) */}
        <Button
          title="Log Purchase"
          variant="primary"
          size="lg"
          onPress={openLogModal}
          className="mb-6"
        />

        {/* ═════════════════════════════════════════════════════════════════
            3. Category Breakdown
           ═════════════════════════════════════════════════════════════════ */}
        {categoryBreakdown.length > 0 && (
          <View className="mb-6">
            <Text
              className="font-semibold mb-3"
              style={{
                fontSize: fontSize.lg,
                color: colors.textSecondary,
              }}
            >
              Where your money went
            </Text>

            <Card>
              {categoryBreakdown.map(({ category, amount, percentage }) => (
                <View key={category} className="mb-4 last:mb-0">
                  {/* Label row */}
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <Text style={{ fontSize: 18, marginRight: spacing.sm }}>
                        {CATEGORY_EMOJI[category]}
                      </Text>
                      <Text
                        className="font-semibold"
                        style={{
                          fontSize: fontSize.base,
                          color: colors.textPrimary,
                        }}
                      >
                        {CATEGORY_LABELS[category]}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text
                        className="font-bold mr-2"
                        style={{
                          fontSize: fontSize.base,
                          color: colors.textPrimary,
                        }}
                      >
                        {formatCurrency(amount)}
                      </Text>
                      <Text
                        style={{
                          fontSize: fontSize.xs,
                          color: colors.textMuted,
                          minWidth: 36,
                          textAlign: "right",
                        }}
                      >
                        {percentage}%
                      </Text>
                    </View>
                  </View>

                  {/* Progress bar */}
                  <View
                    className="h-3 rounded-full overflow-hidden"
                    style={{ backgroundColor: colors.surfaceMuted }}
                  >
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(percentage, 2)}%`,
                        backgroundColor:
                          CATEGORY_BAR_COLORS[category] ?? colors.accent,
                      }}
                    />
                  </View>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            4. Simple Insights
           ═════════════════════════════════════════════════════════════════ */}
        {insights && insights.length > 0 && (
          <View className="mb-6">
            <Text
              className="font-semibold mb-3"
              style={{
                fontSize: fontSize.lg,
                color: colors.textSecondary,
              }}
            >
              Quick insights
            </Text>

            {insights.map((insight, idx) => (
              <View
                key={idx}
                className="rounded-xl px-5 py-4 mb-3"
                style={{ backgroundColor: colors.accentLight }}
              >
                <Text
                  style={{
                    fontSize: fontSize.sm,
                    color: colors.textPrimary,
                    lineHeight: 22,
                  }}
                >
                  💡 {insight}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Empty state insights */}
        {monthEntries.length === 0 && (
          <View className="mb-6">
            <Text
              className="font-semibold mb-3"
              style={{
                fontSize: fontSize.lg,
                color: colors.textSecondary,
              }}
            >
              Quick insights
            </Text>
            <View
              className="rounded-xl px-5 py-4"
              style={{ backgroundColor: colors.accentLight }}
            >
              <Text
                style={{
                  fontSize: fontSize.sm,
                  color: colors.textPrimary,
                  lineHeight: 22,
                }}
              >
                💡 No purchases logged yet — tap <Text style={{ fontWeight: "700" }}>Log Purchase</Text> to get started!
              </Text>
            </View>
          </View>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            5. Recent Entries
           ═════════════════════════════════════════════════════════════════ */}
        <View className="mb-6">
          <Text
            className="font-semibold mb-3"
            style={{
              fontSize: fontSize.lg,
              color: colors.textSecondary,
            }}
          >
            Recent purchases
          </Text>

          {recentEntries.length === 0 ? (
            <Card>
              <View className="items-center py-4">
                <Text style={{ fontSize: 28, marginBottom: spacing.sm }}>
                  📝
                </Text>
                <Text
                  className="font-semibold text-center"
                  style={{
                    fontSize: fontSize.base,
                    color: colors.textPrimary,
                  }}
                >
                  No purchases logged this month
                </Text>
                <Text
                  className="text-center mt-1"
                  style={{
                    fontSize: fontSize.sm,
                    color: colors.textSecondary,
                  }}
                >
                  Tap Log Purchase to add your first entry
                </Text>
              </View>
            </Card>
          ) : (
            <Card padded={false}>
              {recentEntries.map((entry, idx) => {
                const isLast = idx === recentEntries.length - 1;
                return (
                  <TouchableOpacity
                    key={entry.id}
                    onLongPress={() => setDeleteTarget(entry.id)}
                    activeOpacity={0.7}
                    className="flex-row items-center px-4"
                    style={{
                      minHeight: spacing.touch + 8,
                      borderBottomWidth: isLast ? 0 : 1,
                      borderBottomColor: colors.borderLight,
                    }}
                  >
                    {/* Category emoji */}
                    <Text style={{ fontSize: 22, marginRight: spacing.md }}>
                      {CATEGORY_EMOJI[entry.category as SpendingCategory] ?? "📌"}
                    </Text>

                    {/* Details */}
                    <View className="flex-1">
                      <Text
                        className="font-semibold"
                        style={{
                          fontSize: fontSize.base,
                          color: colors.textPrimary,
                        }}
                      >
                        {formatCurrency(entry.amount)}
                      </Text>
                      <View className="flex-row items-center mt-0.5">
                        <Text
                          style={{
                            fontSize: fontSize.xs,
                            color: colors.textMuted,
                          }}
                        >
                          {formatRelativeDays(entry.date)}
                        </Text>
                        {entry.note ? (
                          <Text
                            numberOfLines={1}
                            style={{
                              fontSize: fontSize.xs,
                              color: colors.textSecondary,
                              marginLeft: spacing.sm,
                              flex: 1,
                            }}
                          >
                            · {entry.note}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    {/* Amount (compact) */}
                    <Text
                      style={{
                        fontSize: fontSize.sm,
                        color: colors.textMuted,
                      }}
                    >
                      {CATEGORY_LABELS[entry.category as SpendingCategory] ?? entry.category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </Card>
          )}
        </View>
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════════════════
          Log Purchase Modal
         ═══════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={showLogModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLogModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/30 justify-end"
          onPress={() => setShowLogModal(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: borderRadius.xl,
              borderTopRightRadius: borderRadius.xl,
              paddingBottom: insets.bottom + 24,
              paddingTop: 24,
              paddingHorizontal: 24,
              ...shadows.lg,
            }}
          >
            {/* Handle */}
            <View className="items-center mb-6">
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.border,
                }}
              />
            </View>

            <Text
              className="text-xl font-bold text-text-primary mb-6 text-center"
            >
              Log a Purchase
            </Text>

            {/* Amount */}
            <Text className="text-sm font-semibold text-text-secondary mb-2 ml-1">
              Amount
            </Text>
            <AmountInput value={logAmount} onChange={setLogAmount} />

            {/* Category */}
            <Text className="text-sm font-semibold text-text-secondary mb-2 ml-1">
              Category
            </Text>
            <CategoryPicker
              categories={SPENDING_CATEGORIES}
              selected={logCategory}
              onSelect={(cat) => setLogCategory(cat as SpendingCategory)}
            />

            {/* Note (optional) */}
            <FormInput
              label="Note (optional)"
              icon="💬"
              value={logNote}
              onChangeText={setLogNote}
              placeholder="e.g. Coffee, groceries..."
            />

            {/* Save */}
            <Button
              title="Save Purchase"
              variant="primary"
              size="lg"
              onPress={handleSaveLog}
              loading={saving}
              disabled={logAmount <= 0}
              className="mt-2"
            />

            {/* Cancel */}
            <TouchableOpacity
              onPress={() => setShowLogModal(false)}
              activeOpacity={0.7}
              className="items-center justify-center mt-3 rounded-xl"
              style={{
                minHeight: 48,
                backgroundColor: colors.surfaceMuted,
              }}
            >
              <Text className="text-base font-semibold text-text-secondary">
                Cancel
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════════
          Delete confirmation modal
         ═══════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={deleteTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <Pressable
          className="flex-1 bg-black/40 items-center justify-center"
          onPress={() => setDeleteTarget(null)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="mx-8 rounded-2xl p-6"
            style={{
              backgroundColor: colors.surface,
              ...shadows.lg,
            }}
          >
            <Text
              className="text-lg font-bold text-text-primary text-center mb-2"
            >
              Delete this entry?
            </Text>
            <Text
              className="text-sm text-text-secondary text-center mb-6"
            >
              This can't be undone.
            </Text>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <TouchableOpacity
                  onPress={() => setDeleteTarget(null)}
                  className="items-center justify-center rounded-xl"
                  style={{
                    minHeight: 48,
                    backgroundColor: colors.surfaceMuted,
                  }}
                >
                  <Text className="font-semibold text-text-secondary">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-1">
                <TouchableOpacity
                  onPress={() => {
                    if (deleteTarget) handleDeleteEntry(deleteTarget);
                  }}
                  className="items-center justify-center rounded-xl"
                  style={{
                    minHeight: 48,
                    backgroundColor: colors.danger,
                  }}
                >
                  <Text className="font-semibold text-white">
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
