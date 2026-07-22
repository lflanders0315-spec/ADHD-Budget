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
import { useBillStore } from "@/stores/billStore";
import { BillCard } from "@/components/BillCard";
import { Confetti } from "@/components/Confetti";
import { EmptyState } from "@/components/EmptyState";
import { formatCurrency } from "@/utils/formatters";
import { useTheme } from "@/hooks/useTheme";
import { spacing } from "@/constants/theme";
import type { Bill } from "@/models";

// ---------------------------------------------------------------------------
// Filter type
// ---------------------------------------------------------------------------

type BillFilter = "all" | "upcoming" | "paid" | "overdue";

const FILTERS: { key: BillFilter; label: string; icon: string }[] = [
  { key: "all", label: "All", icon: "📋" },
  { key: "upcoming", label: "Upcoming", icon: "📅" },
  { key: "paid", label: "Paid", icon: "✅" },
  { key: "overdue", label: "Overdue", icon: "⚠️" },
];

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function BillsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, fontSize } = useTheme();

  const bills = useBillStore((s) => s.bills);
  const markPaid = useBillStore((s) => s.markPaid);

  const [activeFilter, setActiveFilter] = useState<BillFilter>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // ── Filtered + sorted bills ───────────────────────────────────────────
  const filteredBills = useMemo(() => {
    const today = new Date().getDate();
    let result: Bill[];

    switch (activeFilter) {
      case "all":
        result = [...bills];
        break;
      case "upcoming":
        result = bills.filter((b) => b.status === "upcoming" || b.status === "due");
        break;
      case "paid":
        result = bills.filter((b) => b.status === "paid");
        break;
      case "overdue":
        result = bills.filter((b) => b.status === "overdue" || (b.status !== "paid" && b.dueDate < today));
        break;
    }

    const statusOrder: Record<string, number> = {
      overdue: 0,
      due: 1,
      upcoming: 2,
      paid: 3,
    };
    result.sort((a, b) => {
      const sa = statusOrder[a.status] ?? 4;
      const sb = statusOrder[b.status] ?? 4;
      if (sa !== sb) return sa - sb;
      return a.dueDate - b.dueDate;
    });

    return result;
  }, [bills, activeFilter]);

  // ── Total upcoming amount (unpaid bills) ──────────────────────────────
  const upcomingTotal = useMemo(
    () =>
      bills
        .filter((b) => b.status !== "paid")
        .reduce((sum, b) => sum + b.amount, 0),
    [bills]
  );

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleMarkPaid = useCallback(
    (bill: Bill) => {
      markPaid(bill.id);
      setShowConfetti(true);
    },
    [markPaid]
  );

  const handleBillPress = useCallback(
    (bill: Bill) => {
      router.push(`/bills/${bill.id}`);
    },
    [router]
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  // ── Empty state ───────────────────────────────────────────────────────
  const emptyState = useMemo(() => {
    if (bills.length === 0) {
      return {
        icon: "💳",
        title: "No bills yet",
        message: "Tap + to add your first bill 🏠",
      };
    }
    switch (activeFilter) {
      case "upcoming":
        return {
          icon: "🌟",
          title: "All caught up!",
          message: "No upcoming bills to worry about right now.",
        };
      case "paid":
        return {
          icon: "📭",
          title: "Nothing paid yet this cycle",
          message: "Your paid bills will show up here once you mark them done.",
        };
      case "overdue":
        return {
          icon: "🎉",
          title: "No overdue bills — great job!",
          message: "Everything's on track. Keep it up!",
        };
      default:
        return null;
    }
  }, [bills.length, activeFilter]);

  // ── Render item ───────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: { item: Bill }) => (
      <BillCard
        bill={item}
        onPress={handleBillPress}
        onMarkPaid={handleMarkPaid}
      />
    ),
    [handleBillPress, handleMarkPaid]
  );

  const keyExtractor = useCallback((item: Bill) => item.id, []);

  // ── Content ───────────────────────────────────────────────────────────
  if (emptyState && filteredBills.length === 0) {
    return (
      <View
        style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm }}>
          <Text
            style={{ fontWeight: "700", color: colors.textPrimary, fontSize: 30, letterSpacing: -0.5 }}
          >
            Bills
          </Text>
          {bills.length > 0 && (
            <Text style={{ fontSize: fontSize.base, color: colors.textSecondary, marginTop: spacing.xs }}>
              {formatCurrency(upcomingTotal)} upcoming
            </Text>
          )}
        </View>

        {/* Filter chips */}
        <FilterChips
          active={activeFilter}
          onChange={setActiveFilter}
          colors={colors}
          textInverse={colors.textInverse}
        />

        {/* Empty */}
        <EmptyState
          icon={emptyState.icon}
          title={emptyState.title}
          message={emptyState.message}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      {/* Confetti overlay */}
      <Confetti
        visible={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      {/* Header */}
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm }}>
        <Text
          style={{ fontWeight: "700", color: colors.textPrimary, fontSize: 30, letterSpacing: -0.5 }}
        >
          Bills
        </Text>
        {bills.length > 0 && (
          <Text style={{ fontSize: fontSize.base, color: colors.textSecondary, marginTop: spacing.xs }}>
            {formatCurrency(upcomingTotal)} upcoming
          </Text>
        )}
      </View>

      {/* Filter chips */}
      <FilterChips
        active={activeFilter}
        onChange={setActiveFilter}
        colors={colors}
        textInverse={colors.textInverse}
      />

      {/* Bill list */}
      <FlatList
        data={filteredBills}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: 120,
          paddingTop: spacing.xs,
        }}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="Bills list"
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

// ---------------------------------------------------------------------------
// FilterChips — horizontal scrollable chips
// ---------------------------------------------------------------------------

function FilterChips({
  active,
  onChange,
  colors,
  textInverse,
}: {
  active: BillFilter;
  onChange: (f: BillFilter) => void;
  colors: ReturnType<typeof useTheme>["colors"];
  textInverse: string;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
        paddingVertical: spacing.xs,
      }}
      style={{ marginBottom: spacing.sm }}
    >
      {FILTERS.map((filter) => {
        const isActive = filter.key === active;
        return (
          <TouchableOpacity
            key={filter.key}
            onPress={() => onChange(filter.key)}
            activeOpacity={0.7}
            accessibilityLabel={`Filter: ${filter.label}`}
            accessibilityRole="button"
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 9999,
              paddingHorizontal: 18,
              backgroundColor: isActive ? colors.primary : colors.surfaceMuted,
              minHeight: 44,
              borderWidth: isActive ? 0 : 1.5,
              borderColor: isActive ? "transparent" : colors.borderLight,
            }}
          >
            <Text style={{ fontSize: 14, marginRight: 6 }}>{filter.icon}</Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: isActive ? textInverse : colors.textSecondary,
              }}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
