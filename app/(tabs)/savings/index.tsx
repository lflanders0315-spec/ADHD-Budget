import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSavingsStore } from "@/stores/savingsStore";
import { SavingsGoalCard } from "@/components/SavingsGoalCard";
import { ProgressRing } from "@/components/ProgressRing";
import { EmptyState } from "@/components/EmptyState";
import { formatCurrency } from "@/utils/formatters";
import { colors, spacing } from "@/constants/theme";
import type { SavingsGoal } from "@/models";

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function SavingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const goals = useSavingsStore((s) => s.goals);
  const [refreshing, setRefreshing] = useState(false);

  // ── Computed stats ─────────────────────────────────────────────────────
  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => {
      const pA = a.targetAmount > 0 ? a.currentAmount / a.targetAmount : 0;
      const pB = b.targetAmount > 0 ? b.currentAmount / b.targetAmount : 0;
      return pB - pA;
    });
  }, [goals]);

  const totalSaved = useMemo(
    () => goals.reduce((sum, g) => sum + g.currentAmount, 0),
    [goals]
  );

  const totalTarget = useMemo(
    () => goals.reduce((sum, g) => sum + g.targetAmount, 0),
    [goals]
  );

  const overallPercent = totalTarget > 0
    ? Math.round((totalSaved / totalTarget) * 100)
    : 0;

  const { completed } = useSavingsStore((s) => s.getOverallProgress());

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleGoalPress = useCallback(
    (goal: SavingsGoal) => {
      router.push(`/savings/${goal.id}`);
    },
    [router]
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  // ── Render item ─────────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: { item: SavingsGoal }) => (
      <SavingsGoalCard goal={item} onPress={handleGoalPress} />
    ),
    [handleGoalPress]
  );

  const keyExtractor = useCallback((item: SavingsGoal) => item.id, []);

  // ── Empty state ─────────────────────────────────────────────────────────
  if (goals.length === 0) {
    return (
      <View
        className="flex-1 bg-background"
        style={{ paddingTop: insets.top }}
      >
        <View className="px-6 pt-4 pb-2">
          <Text
            className="font-bold text-text-primary"
            style={{ fontSize: 30, letterSpacing: -0.5 }}
          >
            Savings Goals
          </Text>
        </View>

        <EmptyState
          icon="🌟"
          title="Start saving for something you want!"
          message="Tap + to create your first goal"
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <Text
          className="font-bold text-text-primary"
          style={{ fontSize: 30, letterSpacing: -0.5 }}
        >
          Savings Goals
        </Text>
      </View>

      {/* Overall progress card */}
      <View
        className="mx-4 mb-4 bg-surface rounded-2xl p-5 flex-row items-center"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <ProgressRing
          progress={overallPercent}
          size={88}
          strokeWidth={8}
          color={colors.accent}
          label={`${completed} of ${goals.length} done`}
        />

        <View className="flex-1 ml-5">
          <Text className="text-sm text-text-secondary font-medium mb-1">
            Total saved
          </Text>
          <Text className="text-2xl font-bold text-text-primary mb-2">
            {formatCurrency(totalSaved)}
          </Text>

          <Text className="text-xs text-text-muted">
            of {formatCurrency(totalTarget)} goal
          </Text>

          {/* Mini progress bar */}
          <View
            className="h-2 rounded-full bg-surface-muted overflow-hidden mt-2"
            style={{ borderRadius: 4 }}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, overallPercent)}%`,
                backgroundColor: colors.accent,
                borderRadius: 4,
              }}
            />
          </View>
        </View>
      </View>

      {/* Section label */}
      <View className="px-6 mb-2">
        <Text className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
          Your goals
        </Text>
      </View>

      {/* Goal list */}
      <FlatList
        data={sortedGoals}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
      />
    </View>
  );
}
