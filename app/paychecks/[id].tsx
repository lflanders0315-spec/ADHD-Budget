import { useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePaycheckStore } from "@/stores/paycheckStore";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import {
  formatCurrency,
  formatDateFull,
  formatRelativeDays,
} from "@/utils/formatters";
import { colors, spacing } from "@/constants/theme";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Biweekly",
  monthly: "Monthly",
  custom: "Custom",
};

function getPayFrequencyLabel(
  frequency: string,
  customDays?: number
): string {
  const base = FREQUENCY_LABELS[frequency] ?? frequency;
  if (frequency === "custom" && customDays) {
    return `${base} (every ${customDays} days)`;
  }
  return base;
}

function getDaysUntil(dateString: string): number {
  const now = new Date();
  const target = new Date(dateString);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function toMonthlyAmount(
  netPay: number,
  frequency: string,
  customDays?: number
): number {
  switch (frequency) {
    case "weekly":
      return Math.round((netPay * 52) / 12 * 100) / 100;
    case "biweekly":
      return Math.round((netPay * 26) / 12 * 100) / 100;
    case "monthly":
      return netPay;
    case "custom": {
      const days = customDays ?? 30;
      return Math.round((netPay * 365) / days / 12 * 100) / 100;
    }
    default:
      return netPay;
  }
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function PaycheckDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const paycheck = usePaycheckStore((s) =>
    s.paychecks.find((p) => p.id === id)
  );
  const deletePaycheck = usePaycheckStore((s) => s.deletePaycheck);

  // ── Computed values ──────────────────────────────────────────────────
  const daysUntil = useMemo(
    () => (paycheck ? getDaysUntil(paycheck.nextPayDate) : 0),
    [paycheck]
  );

  const daysLabel = useMemo(
    () => (paycheck ? formatRelativeDays(paycheck.nextPayDate) : ""),
    [paycheck]
  );

  const monthlyEstimate = useMemo(
    () =>
      paycheck
        ? toMonthlyAmount(
            paycheck.netPay,
            paycheck.frequency,
            paycheck.customFrequencyDays
          )
        : 0,
    [paycheck]
  );

  const frequencyLabel = useMemo(
    () =>
      paycheck
        ? getPayFrequencyLabel(paycheck.frequency, paycheck.customFrequencyDays)
        : "",
    [paycheck]
  );

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleEdit = useCallback(() => {
    if (!paycheck) return;
    router.push(`/paychecks/add?id=${paycheck.id}`);
  }, [paycheck, router]);

  const handleDelete = useCallback(() => {
    if (!paycheck) return;
    const name = paycheck.employer || paycheck.source;
    Alert.alert(
      "Delete Paycheck",
      `Are you sure you want to delete "${name}"? This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deletePaycheck(paycheck.id);
            router.back();
          },
        },
      ]
    );
  }, [paycheck, deletePaycheck, router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // ── Not found ────────────────────────────────────────────────────────
  if (!paycheck) {
    return (
      <View
        className="flex-1 bg-background items-center justify-center"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-4xl mb-4">🔍</Text>
        <Text className="text-xl font-bold text-text-primary">
          Paycheck not found
        </Text>
        <Text className="text-base text-text-secondary mt-2">
          This paycheck may have been deleted.
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

  const showGross = paycheck.grossPay !== paycheck.netPay;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
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
          Paycheck Details
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
        <Card className="items-center py-8 px-6 mb-4">
          <View
            className="items-center justify-center rounded-2xl mb-4"
            style={{
              width: 72,
              height: 72,
              backgroundColor: colors.surfaceMuted,
            }}
          >
            <Text style={{ fontSize: 36 }}>💰</Text>
          </View>

          <Text className="text-2xl font-bold text-text-primary text-center mb-1">
            {paycheck.employer || paycheck.source}
          </Text>

          <Text className="text-3xl font-bold text-primary mb-1">
            {formatCurrency(paycheck.netPay)}
          </Text>

          <Text className="text-sm text-text-secondary">
            Net pay (take-home)
          </Text>

          {showGross && (
            <Text className="text-sm text-text-muted mt-1">
              Gross: {formatCurrency(paycheck.grossPay)}
            </Text>
          )}
        </Card>

        {/* Next payday card with countdown */}
        <Card className="mb-4">
          <Text className="text-xs font-semibold text-text-secondary mb-3 uppercase tracking-wide">
            Next Payday
          </Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Text className="text-2xl mr-3">📅</Text>
              <View>
                <Text className="text-xl font-bold text-text-primary">
                  {formatDateFull(paycheck.nextPayDate)}
                </Text>
              </View>
            </View>

            {/* Countdown pill */}
            <View
              className="rounded-full px-4 py-2"
              style={{
                backgroundColor:
                  daysUntil <= 3 ? colors.accentLight : colors.primaryLight,
              }}
            >
              <Text
                className="text-sm font-bold"
                style={{
                  color: daysUntil <= 3 ? colors.accent : colors.primary,
                }}
              >
                {daysLabel}
              </Text>
            </View>
          </View>
        </Card>

        {/* Details grid */}
        <View className="flex-row mb-4" style={{ gap: spacing.md }}>
          {/* Frequency */}
          <Card className="flex-1">
            <Text className="text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wide">
              Frequency
            </Text>
            <Text className="text-base font-semibold text-text-primary">
              {frequencyLabel}
            </Text>
          </Card>

          {/* Monthly estimate */}
          <Card className="flex-1">
            <Text className="text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wide">
              Monthly
            </Text>
            <Text className="text-base font-semibold text-primary">
              {formatCurrency(monthlyEstimate)}
            </Text>
          </Card>
        </View>

        {/* Net vs Gross breakdown */}
        <Card className="mb-4">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wide">
                Net Pay (take-home)
              </Text>
              <Text className="text-xl font-bold text-primary">
                {formatCurrency(paycheck.netPay)}
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wide">
                Gross Pay
              </Text>
              <Text className="text-lg font-semibold text-text-primary">
                {formatCurrency(paycheck.grossPay)}
              </Text>
              {showGross && (
                <Text className="text-xs text-text-muted mt-0.5">
                  {formatCurrency(paycheck.grossPay - paycheck.netPay)}{" "}
                  in deductions
                </Text>
              )}
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Bottom action bar */}
      <View
        className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-3"
        style={{
          backgroundColor: colors.background,
          paddingBottom: Math.max(insets.bottom + 8, 24),
        }}
      >
        <Button
          title="Edit Paycheck"
          variant="primary"
          size="lg"
          onPress={handleEdit}
          className="mb-3"
        />

        <Button
          title="Delete Paycheck"
          variant="ghost"
          size="md"
          onPress={handleDelete}
          className="self-center"
        />
      </View>
    </View>
  );
}
