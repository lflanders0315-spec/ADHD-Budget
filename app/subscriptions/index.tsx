import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { EmptyState } from "@/components/EmptyState";
import { formatCurrency } from "@/utils/formatters";
import { colors, spacing, fontSize } from "@/constants/theme";
import type { Subscription } from "@/models";

// ---------------------------------------------------------------------------
// Sort types
// ---------------------------------------------------------------------------

type SortMode = "cost" | "renewal";

const SORT_OPTIONS: { key: SortMode; label: string; icon: string }[] = [
  { key: "cost", label: "Cost", icon: "💰" },
  { key: "renewal", label: "Renewal", icon: "📅" },
];

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function SubscriptionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const totalMonthlyCost = useSubscriptionStore((s) => s.getTotalMonthlyCost());
  const totalAnnualCost = useMemo(
    () =>
      subscriptions
        .filter((s) => s.active)
        .reduce((sum, s) => sum + s.annualCost, 0),
    [subscriptions]
  );

  const [sortMode, setSortMode] = useState<SortMode>("cost");
  const [refreshing, setRefreshing] = useState(false);

  // ── Sorted subscriptions ─────────────────────────────────────────────────
  const sortedSubscriptions = useMemo(() => {
    const sorted = [...subscriptions];
    if (sortMode === "cost") {
      sorted.sort((a, b) => b.monthlyCost - a.monthlyCost);
    } else {
      sorted.sort(
        (a, b) =>
          new Date(a.nextBillingDate).getTime() -
          new Date(b.nextBillingDate).getTime()
      );
    }
    return sorted;
  }, [subscriptions, sortMode]);

  const activeCount = subscriptions.filter((s) => s.active).length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSubscriptionPress = useCallback(
    (sub: Subscription) => {
      router.push(`/subscriptions/${sub.id}`);
    },
    [router]
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  // ── Empty state ──────────────────────────────────────────────────────────
  const isEmpty = subscriptions.length === 0;

  // ── Render item ──────────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: { item: Subscription }) => (
      <SubscriptionCard
        subscription={item}
        onPress={handleSubscriptionPress}
      />
    ),
    [handleSubscriptionPress]
  );

  const keyExtractor = useCallback((item: Subscription) => item.id, []);

  // ── Content ───────────────────────────────────────────────────────────────
  if (isEmpty) {
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
            Subscriptions
          </Text>
        </View>

        <EmptyState
          icon="📺"
          title="No subscriptions tracked"
          message="Tap + to add your first subscription"
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
          Subscriptions
        </Text>
      </View>

      {/* ── Total monthly cost — big & impossible to miss ───────────────── */}
      <View className="mx-6 mt-2 mb-1">
        <View
          className="rounded-2xl p-5"
          style={{ backgroundColor: colors.accentLight }}
        >
          <Text
            className="font-semibold mb-1"
            style={{ fontSize: fontSize.sm, color: colors.accent }}
          >
            Total monthly
          </Text>
          <Text
            className="font-bold"
            style={{
              fontSize: 36,
              color: colors.textPrimary,
              letterSpacing: -0.5,
            }}
          >
            {formatCurrency(totalMonthlyCost)}
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
              {" "}/mo
            </Text>
          </Text>
          <Text
            style={{
              fontSize: fontSize.sm,
              color: colors.textSecondary,
              marginTop: 2,
            }}
          >
            {formatCurrency(totalAnnualCost)}/year • {activeCount} active{" "}
            {activeCount === 1 ? "subscription" : "subscriptions"}
          </Text>
        </View>
      </View>

      {/* Sort controls */}
      <View className="flex-row items-center px-6 py-2">
        <Text
          className="mr-3"
          style={{ fontSize: fontSize.sm, color: colors.textMuted }}
        >
          Sort by
        </Text>
        {SORT_OPTIONS.map((opt) => {
          const isActive = sortMode === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => setSortMode(opt.key)}
              activeOpacity={0.7}
              className="flex-row items-center rounded-full px-4 mr-2"
              style={{
                backgroundColor: isActive
                  ? colors.primary
                  : colors.surfaceMuted,
                minHeight: 40,
                borderWidth: isActive ? 0 : 1.5,
                borderColor: isActive ? "transparent" : colors.borderLight,
              }}
            >
              <Text className="text-sm mr-1.5">{opt.icon}</Text>
              <Text
                className="text-sm font-semibold"
                style={{
                  color: isActive ? colors.textInverse : colors.textSecondary,
                }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Subscription list */}
      <FlatList
        data={sortedSubscriptions}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
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
