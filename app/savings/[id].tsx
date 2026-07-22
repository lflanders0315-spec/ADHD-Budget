import { useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSavingsStore } from "@/stores/savingsStore";
import { ProgressRing } from "@/components/ProgressRing";
import { Confetti } from "@/components/Confetti";
import { Button } from "@/components/Button";
import { formatCurrency, formatDate, formatRelativeDays } from "@/utils/formatters";
import { colors, spacing } from "@/constants/theme";
import type { SavingsMilestone } from "@/models";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function countdownLabel(days: number): { text: string; color: string } {
  if (days < 0) return { text: `${Math.abs(days)} days past`, color: colors.statusOverdue };
  if (days === 0) return { text: "Due today!", color: colors.statusDue };
  if (days <= 7) return { text: `${days} days left`, color: colors.statusDue };
  if (days <= 30) return { text: `${days} days left`, color: colors.accent };
  return { text: `${days} days left`, color: colors.statusUpcoming };
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function SavingsDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const goal = useSavingsStore((s) => s.goals.find((g) => g.id === id));
  const addToGoal = useSavingsStore((s) => s.addToGoal);
  const updateGoal = useSavingsStore((s) => s.updateGoal);
  const deleteGoal = useSavingsStore((s) => s.deleteGoal);

  const [showConfetti, setShowConfetti] = useState(false);
  const [addMoneyVisible, setAddMoneyVisible] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [addError, setAddError] = useState("");

  // Track which milestones were reached by the last add operation
  const newlyReachedRef = useRef(false);

  // ── Computed ────────────────────────────────────────────────────────────
  const progress = goal && goal.targetAmount > 0
    ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
    : 0;

  const goalColor = goal?.color ?? colors.primary;

  const deadlineDays = goal?.deadline ? daysUntil(goal.deadline) : null;
  const deadlineInfo = deadlineDays !== null ? countdownLabel(deadlineDays) : null;

  const nextMilestone = useMemo(() => {
    if (!goal) return null;
    return goal.milestones
      .filter((m) => !m.reached)
      .sort((a, b) => a.amount - b.amount)[0] ?? null;
  }, [goal]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleEdit = useCallback(() => {
    if (!goal) return;
    router.push(`/savings/add?id=${goal.id}`);
  }, [goal, router]);

  const handleDelete = useCallback(() => {
    if (!goal) return;
    Alert.alert(
      "Delete Goal",
      `Are you sure you want to delete "${goal.name}"? This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteGoal(goal.id);
            router.back();
          },
        },
      ]
    );
  }, [goal, deleteGoal, router]);

  const openAddMoney = useCallback(() => {
    setAddAmount("");
    setAddError("");
    setAddMoneyVisible(true);
  }, []);

  const handleAddMoney = useCallback(() => {
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) {
      setAddError("Enter a positive amount");
      return;
    }
    if (!goal) return;

    // Check if any milestones will be newly reached
    const willReachMilestone = goal.milestones.some(
      (m) => !m.reached && goal.currentAmount + amount >= m.amount
    );
    newlyReachedRef.current = willReachMilestone;

    addToGoal(goal.id, amount);
    setAddMoneyVisible(false);

    if (willReachMilestone) {
      setShowConfetti(true);
    }
  }, [addAmount, goal, addToGoal]);

  const handleConfettiComplete = useCallback(() => {
    setShowConfetti(false);
  }, []);

  // ── Not found ───────────────────────────────────────────────────────────
  if (!goal) {
    return (
      <View
        className="flex-1 bg-background items-center justify-center"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-4xl mb-4">🔍</Text>
        <Text className="text-xl font-bold text-text-primary">Goal not found</Text>
        <Text className="text-base text-text-secondary mt-2 text-center px-8">
          This savings goal may have been deleted.
        </Text>
        <TouchableOpacity
          onPress={handleBack}
          className="mt-6 bg-primary rounded-xl items-center justify-center px-6"
          style={{ minHeight: 48 }}
        >
          <Text className="text-base font-bold text-text-inverse">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isComplete = goal.currentAmount >= goal.targetAmount;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Confetti overlay */}
      <Confetti
        visible={showConfetti}
        onComplete={handleConfettiComplete}
      />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          className="items-center justify-center rounded-full"
          style={{
            width: 40,
            height: 40,
            backgroundColor: colors.surfaceMuted,
          }}
        >
          <Text className="text-lg" style={{ color: colors.textPrimary }}>
            ←
          </Text>
        </TouchableOpacity>

        <Text
          className="font-bold text-text-primary flex-1 text-center mx-4"
          style={{ fontSize: 20, letterSpacing: -0.3 }}
          numberOfLines={1}
        >
          {goal.name}
        </Text>

        <TouchableOpacity
          onPress={handleEdit}
          activeOpacity={0.7}
          className="items-center justify-center rounded-full px-4"
          style={{
            minHeight: 40,
            backgroundColor: colors.primaryLight,
          }}
        >
          <Text
            className="font-semibold text-sm"
            style={{ color: colors.primaryDark }}
          >
            Edit
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <View
          className="bg-surface rounded-2xl items-center py-8 px-6 mb-4"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <ProgressRing
            progress={progress}
            size={120}
            strokeWidth={10}
            color={goalColor}
          />

          <Text className="text-3xl font-bold text-text-primary mt-5">
            {formatCurrency(goal.currentAmount)}
            <Text className="text-lg text-text-muted font-normal">
              {" "}/{" "}{formatCurrency(goal.targetAmount)}
            </Text>
          </Text>

          {isComplete && (
            <View
              className="mt-3 rounded-full px-4 py-1.5"
              style={{ backgroundColor: colors.primaryLight }}
            >
              <Text
                className="text-sm font-bold"
                style={{ color: colors.primaryDark }}
              >
                🎉 Goal Complete!
              </Text>
            </View>
          )}

          {/* Full-width progress bar */}
          <View
            className="w-full h-3 rounded-full bg-surface-muted overflow-hidden mt-4"
            style={{ borderRadius: 6 }}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                backgroundColor: goalColor,
                borderRadius: 6,
              }}
            />
          </View>
        </View>

        {/* Deadline card */}
        {goal.deadline && (
          <View
            className="bg-surface rounded-2xl p-4 mb-4 flex-row items-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text className="text-2xl mr-3">📅</Text>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-0.5">
                Deadline
              </Text>
              <Text className="text-base font-semibold text-text-primary">
                {formatDate(goal.deadline)}
              </Text>
            </View>
            {deadlineInfo && (
              <View
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: deadlineInfo.color + "20" }}
              >
                <Text
                  className="text-sm font-bold"
                  style={{ color: deadlineInfo.color }}
                >
                  {deadlineInfo.text}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Milestones card */}
        <View
          className="bg-surface rounded-2xl p-4 mb-4"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
            Milestones
          </Text>

          {goal.milestones.map((milestone, index) => {
            const reached = milestone.reached;
            const isNext =
              !reached &&
              goal.milestones
                .filter((m) => !m.reached)
                .sort((a, b) => a.amount - b.amount)[0]?.amount ===
                milestone.amount;

            return (
              <View key={index} className="flex-row items-center mb-3 last:mb-0">
                {/* Checkmark / circle */}
                <View
                  className="items-center justify-center rounded-full mr-3"
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: reached
                      ? goalColor
                      : isNext
                        ? goalColor + "20"
                        : colors.surfaceMuted,
                    borderWidth: reached ? 0 : 2,
                    borderColor: reached ? "transparent" : isNext ? goalColor : colors.border,
                  }}
                >
                  {reached ? (
                    <Text className="text-white text-sm font-bold">✓</Text>
                  ) : (
                    <View
                      className="rounded-full"
                      style={{
                        width: 8,
                        height: 8,
                        backgroundColor: isNext ? goalColor : colors.textMuted,
                      }}
                    />
                  )}
                </View>

                <View className="flex-1">
                  <Text
                    className="text-base font-semibold"
                    style={{
                      color: reached ? goalColor : colors.textPrimary,
                    }}
                  >
                    {formatCurrency(milestone.amount)}
                  </Text>
                  <Text className="text-xs text-text-muted">
                    {reached
                      ? "Reached! 🎉"
                      : isNext
                        ? "Next milestone"
                        : `${Math.round((milestone.amount / goal.targetAmount) * 100)}% of goal`}
                  </Text>
                </View>

                {reached && (
                  <Text className="text-lg">⭐</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Edit / Delete actions */}
        <TouchableOpacity
          onPress={handleDelete}
          activeOpacity={0.7}
          className="items-center justify-center rounded-xl mb-4 self-center px-8"
          style={{ minHeight: 44 }}
        >
          <Text className="text-sm font-semibold text-danger">Delete Goal</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom action bar */}
      <View
        className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-3"
        style={{
          backgroundColor: colors.background,
          paddingBottom: Math.max(insets.bottom + 8, 24),
        }}
      >
        {isComplete ? (
          <View
            className="rounded-xl items-center justify-center mb-3"
            style={{
              minHeight: spacing.touch,
              backgroundColor: colors.primaryLight,
            }}
          >
            <Text
              className="text-base font-bold"
              style={{ color: colors.primaryDark }}
            >
              🎉 Goal Complete! Amazing work!
            </Text>
          </View>
        ) : (
          <Button
            title="Add Money"
            variant="primary"
            size="lg"
            onPress={openAddMoney}
            className="mb-3"
          />
        )}
      </View>

      {/* ── Add Money Modal ─────────────────────────────────────────────── */}
      <Modal
        visible={addMoneyVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddMoneyVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-center items-center px-8"
          onPress={() => setAddMoneyVisible(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-surface rounded-2xl w-full p-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Text className="text-xl font-bold text-text-primary text-center mb-2">
              Add Money
            </Text>
            <Text className="text-sm text-text-secondary text-center mb-6">
              How much do you want to add to "{goal.name}"?
            </Text>

            {/* Next milestone hint */}
            {nextMilestone && (
              <View
                className="rounded-xl px-4 py-3 mb-4"
                style={{ backgroundColor: colors.accentLight }}
              >
                <Text className="text-sm text-text-secondary text-center">
                  Next milestone:{" "}
                  <Text className="font-bold" style={{ color: colors.accent }}>
                    {formatCurrency(nextMilestone.amount)}
                  </Text>
                </Text>
                <Text className="text-xs text-text-muted text-center mt-0.5">
                  {formatCurrency(
                    Math.max(0, nextMilestone.amount - goal.currentAmount)
                  )}{" "}
                  to go!
                </Text>
              </View>
            )}

            {/* Amount input */}
            <View
              className="flex-row items-center bg-surface-muted rounded-xl px-4 mb-4"
              style={{ minHeight: 60 }}
            >
              <Text className="text-2xl font-bold text-text-primary mr-2">$</Text>
              <TextInput
                className="flex-1 text-2xl font-bold text-text-primary"
                value={addAmount}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9.]/g, "");
                  const parts = cleaned.split(".");
                  if (parts.length > 2) return;
                  if (parts[1] && parts[1].length > 2) return;
                  setAddAmount(cleaned);
                  if (addError) setAddError("");
                }}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
            </View>

            {addError ? (
              <Text className="text-sm text-danger mb-3 ml-1">{addError}</Text>
            ) : null}

            {/* Quick amount chips */}
            <View className="flex-row flex-wrap mb-6" style={{ gap: 8 }}>
              {[25, 50, 100, 250, 500].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  onPress={() => {
                    setAddAmount(amt.toString());
                    if (addError) setAddError("");
                  }}
                  activeOpacity={0.7}
                  className="rounded-full px-4 items-center justify-center"
                  style={{
                    minHeight: 40,
                    backgroundColor:
                      addAmount === amt.toString()
                        ? goalColor
                        : colors.surfaceMuted,
                    borderWidth: addAmount === amt.toString() ? 0 : 1,
                    borderColor: colors.borderLight,
                  }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{
                      color:
                        addAmount === amt.toString()
                          ? colors.textInverse
                          : colors.textSecondary,
                    }}
                  >
                    ${amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setAddMoneyVisible(false)}
                activeOpacity={0.7}
                className="flex-1 rounded-xl items-center justify-center"
                style={{
                  minHeight: 48,
                  backgroundColor: colors.surfaceMuted,
                }}
              >
                <Text className="text-base font-semibold text-text-secondary">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddMoney}
                activeOpacity={0.7}
                className="flex-1 rounded-xl items-center justify-center"
                style={{
                  minHeight: 48,
                  backgroundColor: goalColor,
                  opacity: addAmount && parseFloat(addAmount) > 0 ? 1 : 0.5,
                }}
                disabled={!addAmount || parseFloat(addAmount) <= 0}
              >
                <Text className="text-base font-bold text-white">Add</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
