import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBillStore } from "@/stores/billStore";
import { Confetti } from "@/components/Confetti";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { formatCurrency } from "@/utils/formatters";
import { colors, spacing } from "@/constants/theme";
import type { Bill } from "@/models";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CATEGORY_ICONS: Record<string, string> = {
  mortgage: "🏠",
  rent: "🏠",
  phone: "📱",
  internet: "🌐",
  insurance: "🛡️",
  credit_card: "💳",
  utilities: "⚡",
  medical: "🏥",
  other: "📋",
};

const RECURRENCE_LABELS: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Biweekly",
  monthly: "Monthly",
  yearly: "Yearly",
  once: "One time",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: colors.statusOverdue,
  medium: colors.statusDue,
  low: colors.statusUpcoming,
};

function formatCategory(category: string): string {
  return category
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatOrdinal(day: number): string {
  if (day >= 11 && day <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function BillDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const bill = useBillStore((s) => s.bills.find((b) => b.id === id));
  const markPaid = useBillStore((s) => s.markPaid);
  const deleteBill = useBillStore((s) => s.deleteBill);

  const [showConfetti, setShowConfetti] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleMarkPaid = useCallback(() => {
    if (!bill) return;
    markPaid(bill.id);
    setShowConfetti(true);
  }, [bill, markPaid]);

  const handleEdit = useCallback(() => {
    if (!bill) return;
    router.push(`/bills/add?id=${bill.id}`);
  }, [bill, router]);

  const handleDelete = useCallback(() => {
    if (!bill) return;
    Alert.alert(
      "Delete Bill",
      `Are you sure you want to delete "${bill.name}"? This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteBill(bill.id);
            router.back();
          },
        },
      ]
    );
  }, [bill, deleteBill, router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // ── Not found ─────────────────────────────────────────────────────────
  if (!bill) {
    return (
      <View
        className="flex-1 bg-background items-center justify-center"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-4xl mb-4">🔍</Text>
        <Text className="text-xl font-bold text-text-primary">Bill not found</Text>
        <Text className="text-base text-text-secondary mt-2">
          This bill may have been deleted.
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

  const categoryIcon = CATEGORY_ICONS[bill.category] ?? "📋";
  const isPaid = bill.status === "paid";
  const recurrenceLabel = RECURRENCE_LABELS[bill.recurrence] ?? bill.recurrence;
  const priorityColor = PRIORITY_COLORS[bill.priority] ?? colors.textSecondary;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Confetti overlay */}
      <Confetti
        visible={showConfetti}
        onComplete={() => {
          setShowConfetti(false);
          // Navigate back after celebration
          setTimeout(() => {
            router.back();
          }, 400);
        }}
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
          Bill Details
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
        {/* Bill hero card */}
        <Card className="items-center py-8 px-6 mb-4">
          <View
            className="items-center justify-center rounded-2xl mb-4"
            style={{
              width: 72,
              height: 72,
              backgroundColor: colors.surfaceMuted,
            }}
          >
            <Text style={{ fontSize: 36 }}>{categoryIcon}</Text>
          </View>

          <Text className="text-2xl font-bold text-text-primary text-center mb-1">
            {bill.name}
          </Text>

          <Text className="text-3xl font-bold text-primary mb-3">
            {formatCurrency(bill.amount)}
          </Text>

          <StatusBadge status={bill.status} />
        </Card>

        {/* Due date card */}
        <Card className="mb-4">
          <Text className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
            Due Date
          </Text>
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">📅</Text>
            <View>
              <Text className="text-xl font-bold text-text-primary">
                {formatOrdinal(bill.dueDate)} of each month
              </Text>
              {bill.lastPaidDate && (
                <Text className="text-sm text-text-secondary mt-0.5">
                  Last paid: {new Date(bill.lastPaidDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </Text>
              )}
            </View>
          </View>
        </Card>

        {/* Details grid */}
        <View className="flex-row mb-4" style={{ gap: spacing.md }}>
          {/* Recurrence */}
          <Card className="flex-1">
            <Text className="text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wide">
              Recurrence
            </Text>
            <Text className="text-base font-semibold text-text-primary">
              {recurrenceLabel}
            </Text>
          </Card>

          {/* Priority */}
          <Card className="flex-1">
            <Text className="text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wide">
              Priority
            </Text>
            <View className="flex-row items-center">
              <View
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: priorityColor }}
              />
              <Text className="text-base font-semibold text-text-primary capitalize">
                {bill.priority}
              </Text>
            </View>
          </Card>
        </View>

        {/* Category & Autopay */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wide">
                Category
              </Text>
              <Text className="text-base font-semibold text-text-primary">
                {formatCategory(bill.category)}
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wide">
                Autopay
              </Text>
              <View
                className="rounded-full px-3 py-1"
                style={{
                  backgroundColor: bill.autopay
                    ? colors.primaryLight
                    : colors.surfaceMuted,
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{
                    color: bill.autopay ? colors.primaryDark : colors.textMuted,
                  }}
                >
                  {bill.autopay ? "ON" : "OFF"}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Notes */}
        {bill.notes ? (
          <Card className="mb-4">
            <Text className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
              Notes
            </Text>
            <Text className="text-base text-text-primary leading-relaxed">
              {bill.notes}
            </Text>
          </Card>
        ) : null}
      </ScrollView>

      {/* Bottom action bar */}
      <View
        className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-3"
        style={{
          backgroundColor: colors.background,
          paddingBottom: Math.max(insets.bottom + 8, 24),
        }}
      >
        {!isPaid && (
          <Button
            title="Mark as Paid ✓"
            variant="primary"
            size="lg"
            onPress={handleMarkPaid}
            className="mb-3"
          />
        )}

        <Button
          title="Delete Bill"
          variant="ghost"
          size="md"
          onPress={handleDelete}
          className="self-center"
        />
      </View>
    </View>
  );
}
