import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePaycheckStore } from "@/stores/paycheckStore";
import { PaycheckCard } from "@/components/PaycheckCard";
import { EmptyState } from "@/components/EmptyState";
import { formatCurrency, formatRelativeDays, formatDate } from "@/utils/formatters";
import { colors, spacing } from "@/constants/theme";
import type { Paycheck } from "@/models";

// ---------------------------------------------------------------------------
// Monthly income calculator
// ---------------------------------------------------------------------------

function toMonthlyAmount(paycheck: Paycheck): number {
  switch (paycheck.frequency) {
    case "weekly":
      return Math.round((paycheck.netPay * 52) / 12 * 100) / 100;
    case "biweekly":
      return Math.round((paycheck.netPay * 26) / 12 * 100) / 100;
    case "monthly":
      return paycheck.netPay;
    case "custom": {
      const days = paycheck.customFrequencyDays ?? 30;
      return Math.round((paycheck.netPay * 365) / days / 12 * 100) / 100;
    }
    default:
      return paycheck.netPay;
  }
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function PaychecksScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const paychecks = usePaycheckStore((s) => s.paychecks);
  const getNextPaycheck = usePaycheckStore((s) => s.getNextPaycheck);

  const [refreshing, setRefreshing] = useState(false);

  // ── Monthly income total ──────────────────────────────────────────────
  const monthlyIncome = useMemo(
    () => paychecks.reduce((sum, p) => sum + toMonthlyAmount(p), 0),
    [paychecks]
  );

  // ── Next paycheck ──────────────────────────────────────────────────────
  const nextPaycheck = useMemo(() => getNextPaycheck(), [getNextPaycheck]);

  const nextDaysUntil = useMemo(() => {
    if (!nextPaycheck) return null;
    const now = new Date();
    const target = new Date(nextPaycheck.nextPayDate);
    return Math.ceil(
      (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
  }, [nextPaycheck]);

  const nextDaysLabel = useMemo(
    () =>
      nextPaycheck
        ? formatRelativeDays(nextPaycheck.nextPayDate)
        : null,
    [nextPaycheck]
  );

  // ── Handlers ──────────────────────────────────────────────────────────
  const handlePaycheckPress = useCallback(
    (paycheck: Paycheck) => {
      router.push(`/paychecks/${paycheck.id}`);
    },
    [router]
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  // ── Render item ───────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: { item: Paycheck }) => (
      <PaycheckCard paycheck={item} onPress={handlePaycheckPress} />
    ),
    [handlePaycheckPress]
  );

  const keyExtractor = useCallback((item: Paycheck) => item.id, []);

  // ── List header — next payday card + income total ─────────────────────
  const ListHeader = useMemo(() => {
    return (
      <View className="mb-3">
        {/* Monthly income total — prominent */}
        <View
          className="rounded-xl p-5 mb-4"
          style={{ backgroundColor: colors.primaryLight }}
        >
          <Text className="text-sm font-semibold text-primary mb-1 uppercase tracking-wide">
            Monthly Income
          </Text>
          <Text
            className="font-bold"
            style={{
              fontSize: 34,
              color: colors.primaryDark,
              letterSpacing: -0.5,
            }}
          >
            {formatCurrency(monthlyIncome)}
          </Text>
        </View>

        {/* Next payday card */}
        {nextPaycheck && (
          <TouchableOpacity
            onPress={() => handlePaycheckPress(nextPaycheck)}
            activeOpacity={0.85}
            className="rounded-xl p-5 mb-2"
            style={{
              backgroundColor:
                nextDaysUntil !== null && nextDaysUntil <= 3
                  ? colors.accentLight
                  : colors.surface,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
              borderLeftWidth: 4,
              borderLeftColor:
                nextDaysUntil !== null && nextDaysUntil <= 3
                  ? colors.accent
                  : colors.primary,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-1">
                  Next Payday
                </Text>
                <Text className="text-lg font-bold text-text-primary">
                  {formatDate(nextPaycheck.nextPayDate)}
                  {" — "}
                  {formatCurrency(nextPaycheck.netPay)}
                </Text>
                <Text className="text-sm text-text-secondary mt-0.5">
                  {nextPaycheck.employer || nextPaycheck.source}
                </Text>
              </View>

              {/* Countdown pill */}
              <View
                className="items-center justify-center rounded-full px-4"
                style={{
                  backgroundColor:
                    nextDaysUntil !== null && nextDaysUntil <= 3
                      ? colors.accent
                      : colors.primary,
                  minHeight: 48,
                  minWidth: 76,
                }}
              >
                <Text className="text-sm font-bold text-text-inverse">
                  {nextDaysLabel}
                </Text>
                {nextDaysUntil !== null && nextDaysUntil <= 3 && (
                  <Text className="text-xs text-text-inverse opacity-80 mt-0.5">
                    soon!
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [
    monthlyIncome,
    nextPaycheck,
    nextDaysUntil,
    nextDaysLabel,
    handlePaycheckPress,
  ]);

  // ── Empty state ───────────────────────────────────────────────────────
  if (paychecks.length === 0) {
    return (
      <View
        className="flex-1 bg-background"
        style={{ paddingTop: insets.top }}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <Text
            className="font-bold text-text-primary"
            style={{ fontSize: 30, letterSpacing: -0.5 }}
          >
            Paychecks
          </Text>
        </View>

        <EmptyState
          icon="💰"
          title="No paychecks yet"
          message="Tap + to add your first paycheck and start planning ahead 💰"
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
          Paychecks
        </Text>
      </View>

      {/* Paycheck list */}
      <FlatList
        data={paychecks}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: 120,
          paddingTop: spacing.xs,
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
