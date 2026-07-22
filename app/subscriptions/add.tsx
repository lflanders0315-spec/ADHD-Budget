import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { FormInput } from "@/components/FormInput";
import { AmountInput } from "@/components/AmountInput";
import { DatePicker } from "@/components/DatePicker";
import { CategoryPicker } from "@/components/CategoryPicker";
import { Button } from "@/components/Button";
import { subscriptionSchema, type SubscriptionFormData } from "@/utils/validators";
import { formatCurrency } from "@/utils/formatters";
import { colors, spacing } from "@/constants/theme";
import type {
  SubscriptionCategory,
  RecurrenceFrequency,
} from "@/models";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUBSCRIPTION_CATEGORIES: SubscriptionCategory[] = [
  "streaming",
  "software",
  "gym",
  "phone_apps",
  "shopping",
  "insurance",
  "other",
];

const BILLING_CYCLE_OPTIONS: {
  key: RecurrenceFrequency;
  label: string;
}[] = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

// ---------------------------------------------------------------------------
// Per-cycle cost calculation
// ---------------------------------------------------------------------------

function calculateCosts(
  amount: number,
  cycle: RecurrenceFrequency
): { monthlyCost: number; annualCost: number } {
  switch (cycle) {
    case "weekly":
      return {
        monthlyCost: Math.round((amount * 52) / 12 * 100) / 100,
        annualCost: Math.round(amount * 52 * 100) / 100,
      };
    case "monthly":
      return {
        monthlyCost: amount,
        annualCost: Math.round(amount * 12 * 100) / 100,
      };
    case "yearly":
      return {
        monthlyCost: Math.round((amount / 12) * 100) / 100,
        annualCost: amount,
      };
    case "biweekly":
      return {
        monthlyCost: Math.round((amount * 26) / 12 * 100) / 100,
        annualCost: Math.round(amount * 26 * 100) / 100,
      };
    case "once":
      return { monthlyCost: amount, annualCost: amount };
    default:
      return { monthlyCost: amount, annualCost: amount * 12 };
  }
}

function getCyclePriceLabel(
  cycle: RecurrenceFrequency,
  amount: number
): string {
  const freq =
    cycle === "weekly"
      ? "/wk"
      : cycle === "yearly"
        ? "/yr"
        : "/mo";
  return `${formatCurrency(amount)}${freq}`;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function AddSubscriptionScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const existingSub = useSubscriptionStore(
    useCallback(
      (s) => (id ? s.subscriptions.find((sub) => sub.id === id) : undefined),
      [id]
    )
  );
  const addSubscription = useSubscriptionStore((s) => s.addSubscription);
  const updateSubscription = useSubscriptionStore((s) => s.updateSubscription);

  const isEditing = !!existingSub;

  // ── Form state ──────────────────────────────────────────────────────────
  const [name, setName] = useState(existingSub?.name ?? "");
  const [provider, setProvider] = useState(existingSub?.provider ?? "");
  const [amount, setAmount] = useState(existingSub?.amount ?? 0);
  const [nextBillingDate, setNextBillingDate] = useState(
    existingSub?.nextBillingDate?.split("T")[0] ??
      new Date().toISOString().split("T")[0]
  );
  const [billingCycle, setBillingCycle] = useState<RecurrenceFrequency>(
    existingSub?.billingCycle ?? "monthly"
  );
  const [category, setCategory] = useState<string>(
    existingSub?.category ?? "other"
  );
  const [active, setActive] = useState(existingSub?.active ?? true);
  const [cancellationReminder, setCancellationReminder] = useState(
    existingSub?.cancellationReminder ?? false
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // ── Auto-calculated costs ────────────────────────────────────────────────
  const { monthlyCost, annualCost } = useMemo(
    () => calculateCosts(amount, billingCycle),
    [amount, billingCycle]
  );

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    const formData: SubscriptionFormData = {
      name: name.trim(),
      amount,
      billingCycle,
      nextBillingDate,
      category,
    };

    const result = subscriptionSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    setErrors({});

    if (isEditing && existingSub) {
      updateSubscription(existingSub.id, {
        name: result.data.name,
        provider: provider.trim() || name.trim(),
        amount: result.data.amount,
        monthlyCost,
        annualCost,
        billingCycle: result.data.billingCycle,
        nextBillingDate: result.data.nextBillingDate,
        category: result.data.category as SubscriptionCategory,
        active,
        cancellationReminder,
      });
    } else {
      addSubscription({
        name: result.data.name,
        provider: provider.trim() || name.trim(),
        amount: result.data.amount,
        monthlyCost,
        annualCost,
        billingCycle: result.data.billingCycle,
        nextBillingDate: result.data.nextBillingDate,
        category: result.data.category as SubscriptionCategory,
        active,
        cancellationReminder,
      });
    }

    router.back();
  }, [
    name,
    provider,
    amount,
    monthlyCost,
    annualCost,
    billingCycle,
    nextBillingDate,
    category,
    active,
    cancellationReminder,
    isEditing,
    existingSub,
    addSubscription,
    updateSubscription,
    router,
  ]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity
          onPress={handleCancel}
          activeOpacity={0.7}
          className="items-center justify-center rounded-full"
          style={{
            width: 40,
            height: 40,
            backgroundColor: colors.surfaceMuted,
          }}
        >
          <Text className="text-lg" style={{ color: colors.textPrimary }}>
            ✕
          </Text>
        </TouchableOpacity>

        <Text
          className="font-bold text-text-primary flex-1 text-center mx-4"
          style={{ fontSize: 20, letterSpacing: -0.3 }}
        >
          {isEditing ? "Edit Subscription" : "Add Subscription"}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name */}
        <FormInput
          label="Name"
          icon="📝"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Netflix, Spotify, iCloud+"
          error={errors.name}
        />

        {/* Provider */}
        <FormInput
          label="Provider"
          icon="🏢"
          value={provider}
          onChangeText={setProvider}
          placeholder="e.g. Netflix, Apple, Google"
        />

        {/* Amount */}
        <Text className="text-sm font-semibold text-text-secondary mb-2 ml-1">
          Cost
        </Text>
        <AmountInput value={amount} onChange={setAmount} />
        {errors.amount && (
          <Text className="text-sm text-danger mt-0.5 ml-1 -mb-2">
            {errors.amount}
          </Text>
        )}

        {/* Billing cycle chips */}
        <Text className="text-sm font-semibold text-text-secondary mb-3 ml-1">
          Billing cycle
        </Text>
        <View className="flex-row flex-wrap mb-4" style={{ gap: spacing.sm }}>
          {BILLING_CYCLE_OPTIONS.map((opt) => {
            const isActive = billingCycle === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setBillingCycle(opt.key)}
                activeOpacity={0.7}
                className="rounded-full px-4"
                style={{
                  backgroundColor: isActive
                    ? colors.primary
                    : colors.surfaceMuted,
                  minHeight: 44,
                  justifyContent: "center",
                  borderWidth: isActive ? 0 : 1.5,
                  borderColor: isActive ? "transparent" : colors.borderLight,
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{
                    color: isActive
                      ? colors.textInverse
                      : colors.textSecondary,
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Auto-calculated annual cost preview */}
        {amount > 0 && (
          <View
            className="rounded-xl p-4 mb-4"
            style={{ backgroundColor: colors.accentLight }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-lg mr-2">📊</Text>
                <Text
                  className="text-sm font-semibold"
                  style={{ color: colors.textSecondary }}
                >
                  Annual cost
                </Text>
              </View>
              <Text
                className="text-xl font-bold"
                style={{ color: colors.accent }}
              >
                {formatCurrency(annualCost)}
              </Text>
            </View>
            <Text
              className="text-xs mt-1 ml-8"
              style={{ color: colors.textMuted }}
            >
              {getCyclePriceLabel(billingCycle, amount)} ×{" "}
              {billingCycle === "weekly"
                ? "52"
                : billingCycle === "yearly"
                  ? "1"
                  : "12"}{" "}
              = {formatCurrency(annualCost)}/year
            </Text>
          </View>
        )}

        {/* Next billing date */}
        <DatePicker
          label="Next billing date"
          date={nextBillingDate}
          onChange={setNextBillingDate}
        />
        {errors.nextBillingDate && (
          <Text className="text-sm text-danger mt-0.5 ml-1 -mb-2">
            {errors.nextBillingDate}
          </Text>
        )}

        {/* Category */}
        <Text className="text-sm font-semibold text-text-secondary mb-2 ml-1">
          Category
        </Text>
        <CategoryPicker
          categories={SUBSCRIPTION_CATEGORIES}
          selected={category}
          onSelect={setCategory}
        />
        {errors.category && (
          <Text className="text-sm text-danger mt-0.5 ml-1 -mb-2">
            {errors.category}
          </Text>
        )}

        {/* Active toggle */}
        <View
          className="flex-row items-center justify-between bg-surface rounded-xl px-4 mb-4"
          style={{ minHeight: spacing.touch }}
        >
          <View className="flex-row items-center">
            <Text className="text-lg mr-3">{active ? "🟢" : "⏸️"}</Text>
            <View>
              <Text className="text-base font-semibold text-text-primary">
                Active
              </Text>
              <Text className="text-xs text-text-secondary">
                Currently subscribed
              </Text>
            </View>
          </View>
          <Switch
            value={active}
            onValueChange={setActive}
            trackColor={{
              false: colors.borderLight,
              true: colors.primaryLight,
            }}
            thumbColor={active ? colors.primary : colors.textMuted}
            ios_backgroundColor={colors.borderLight}
          />
        </View>

        {/* Cancellation reminder toggle */}
        <View
          className="flex-row items-center justify-between bg-surface rounded-xl px-4 mb-4"
          style={{ minHeight: spacing.touch }}
        >
          <View className="flex-row items-center">
            <Text className="text-lg mr-3">🔔</Text>
            <View>
              <Text className="text-base font-semibold text-text-primary">
                Cancel reminder
              </Text>
              <Text className="text-xs text-text-secondary">
                Gentle nudge before next renewal
              </Text>
            </View>
          </View>
          <Switch
            value={cancellationReminder}
            onValueChange={setCancellationReminder}
            trackColor={{
              false: colors.borderLight,
              true: colors.primaryLight,
            }}
            thumbColor={
              cancellationReminder ? colors.primary : colors.textMuted
            }
            ios_backgroundColor={colors.borderLight}
          />
        </View>

        {/* Save button */}
        <Button
          title={isEditing ? "Save Changes" : "Add Subscription"}
          variant="primary"
          size="lg"
          onPress={handleSave}
          loading={saving}
          className="mt-4"
        />
      </ScrollView>
    </View>
  );
}
