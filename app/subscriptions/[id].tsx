import { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { formatCurrency, formatDateFull } from "@/utils/formatters";
import { colors, spacing } from "@/constants/theme";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CATEGORY_ICONS: Record<string, string> = {
  streaming: "🎬",
  software: "💻",
  gym: "🏋️",
  phone_apps: "📲",
  shopping: "🛍️",
  insurance: "🛡️",
  other: "📦",
};

const CYCLE_LABELS: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Biweekly",
  monthly: "Monthly",
  yearly: "Yearly",
  once: "One time",
};

const PROVIDER_LOGOS: Record<string, string> = {
  netflix: "🔴",
  spotify: "🟢",
  "amazon prime": "📦",
  "planet fitness": "🏋️",
  "icloud+": "☁️",
};

function formatCategory(cat: string): string {
  return cat
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getProviderIcon(provider: string, logo?: string): string {
  if (logo) return logo;
  const key = provider.toLowerCase();
  return PROVIDER_LOGOS[key] ?? "💳";
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const subscription = useSubscriptionStore((s) =>
    s.subscriptions.find((sub) => sub.id === id)
  );
  const updateSubscription = useSubscriptionStore((s) => s.updateSubscription);
  const deleteSubscription = useSubscriptionStore((s) => s.deleteSubscription);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleToggleActive = useCallback(() => {
    if (!subscription) return;
    updateSubscription(subscription.id, { active: !subscription.active });
  }, [subscription, updateSubscription]);

  const handleToggleReminder = useCallback(() => {
    if (!subscription) return;
    updateSubscription(subscription.id, {
      cancellationReminder: !subscription.cancellationReminder,
    });
  }, [subscription, updateSubscription]);

  const handleEdit = useCallback(() => {
    if (!subscription) return;
    router.push(`/subscriptions/add?id=${subscription.id}`);
  }, [subscription, router]);

  const handleDelete = useCallback(() => {
    if (!subscription) return;
    Alert.alert(
      "Delete Subscription",
      `Are you sure you want to delete "${subscription.name}"? This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteSubscription(subscription.id);
            router.back();
          },
        },
      ]
    );
  }, [subscription, deleteSubscription, router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // ── Not found ────────────────────────────────────────────────────────────
  if (!subscription) {
    return (
      <View
        className="flex-1 bg-background items-center justify-center"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-4xl mb-4">🔍</Text>
        <Text className="text-xl font-bold text-text-primary">
          Subscription not found
        </Text>
        <Text className="text-base text-text-secondary mt-2">
          This subscription may have been deleted.
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

  const categoryIcon =
    CATEGORY_ICONS[subscription.category] ?? "📦";
  const providerIcon = getProviderIcon(subscription.provider, subscription.logo);
  const cycleLabel =
    CYCLE_LABELS[subscription.billingCycle] ?? subscription.billingCycle;

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
          Subscription
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
            <Text style={{ fontSize: 36 }}>{providerIcon}</Text>
          </View>

          <Text className="text-2xl font-bold text-text-primary text-center mb-1">
            {subscription.name}
          </Text>

          <Text
            className="text-sm mb-3"
            style={{ color: colors.textSecondary }}
          >
            {subscription.provider}
          </Text>

          <Text className="text-3xl font-bold text-primary mb-3">
            {formatCurrency(subscription.monthlyCost)}
            <Text className="text-base font-normal text-text-secondary">
              /mo
            </Text>
          </Text>

          {/* Active / Inactive pill */}
          <View
            className="rounded-full px-4 py-1.5"
            style={{
              backgroundColor: subscription.active
                ? colors.primaryLight
                : colors.surfaceMuted,
            }}
          >
            <Text
              className="text-sm font-semibold"
              style={{
                color: subscription.active
                  ? colors.primaryDark
                  : colors.textMuted,
              }}
            >
              {subscription.active ? "Active" : "Paused"}
            </Text>
          </View>
        </Card>

        {/* ── Yearly cost — prominent ──────────────────────────────────── */}
        <Card className="mb-4" padded>
          <View className="items-center">
            <Text
              className="text-xs font-semibold uppercase tracking-wide mb-2"
              style={{ color: colors.textMuted }}
            >
              Yearly cost
            </Text>
            <Text
              className="font-bold"
              style={{
                fontSize: 28,
                color: colors.accent,
                letterSpacing: -0.3,
              }}
            >
              {formatCurrency(subscription.annualCost)}
            </Text>
            <Text
              className="text-sm mt-1"
              style={{ color: colors.textSecondary }}
            >
              That's{" "}
              {formatCurrency(subscription.annualCost / 12)}/mo × 12 months
            </Text>
          </View>
        </Card>

        {/* Details grid */}
        <View className="flex-row mb-4" style={{ gap: spacing.md }}>
          <Card className="flex-1">
            <Text className="text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wide">
              Category
            </Text>
            <View className="flex-row items-center">
              <Text className="text-lg mr-2">{categoryIcon}</Text>
              <Text className="text-base font-semibold text-text-primary">
                {formatCategory(subscription.category)}
              </Text>
            </View>
          </Card>

          <Card className="flex-1">
            <Text className="text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wide">
              Billing
            </Text>
            <Text className="text-base font-semibold text-text-primary">
              {cycleLabel}
            </Text>
          </Card>
        </View>

        {/* Next billing date */}
        <Card className="mb-4">
          <Text className="text-xs font-semibold text-text-secondary mb-3 uppercase tracking-wide">
            Next Billing Date
          </Text>
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">📅</Text>
            <Text className="text-xl font-bold text-text-primary">
              {formatDateFull(subscription.nextBillingDate)}
            </Text>
          </View>
        </Card>

        {/* Toggles */}
        <Card className="mb-4" padded={false}>
          {/* Active toggle */}
          <View
            className="flex-row items-center justify-between px-4"
            style={{ minHeight: spacing.touch }}
          >
            <View className="flex-row items-center flex-1">
              <Text className="text-lg mr-3">
                {subscription.active ? "🟢" : "⏸️"}
              </Text>
              <View>
                <Text className="text-base font-semibold text-text-primary">
                  Active
                </Text>
                <Text className="text-xs text-text-secondary">
                  {subscription.active
                    ? "You're currently subscribed"
                    : "Subscription is paused"}
                </Text>
              </View>
            </View>
            <Switch
              value={subscription.active}
              onValueChange={handleToggleActive}
              trackColor={{
                false: colors.borderLight,
                true: colors.primaryLight,
              }}
              thumbColor={
                subscription.active ? colors.primary : colors.textMuted
              }
              ios_backgroundColor={colors.borderLight}
            />
          </View>

          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: colors.borderLight,
              marginHorizontal: spacing.md,
            }}
          />

          {/* Cancellation reminder toggle */}
          <View
            className="flex-row items-center justify-between px-4"
            style={{ minHeight: spacing.touch }}
          >
            <View className="flex-row items-center flex-1">
              <Text className="text-lg mr-3">🔔</Text>
              <View>
                <Text className="text-base font-semibold text-text-primary">
                  Cancel reminder
                </Text>
                <Text className="text-xs text-text-secondary">
                  {subscription.cancellationReminder
                    ? "We'll nudge you before renewal"
                    : "No reminders for this one"}
                </Text>
              </View>
            </View>
            <Switch
              value={subscription.cancellationReminder}
              onValueChange={handleToggleReminder}
              trackColor={{
                false: colors.borderLight,
                true: colors.primaryLight,
              }}
              thumbColor={
                subscription.cancellationReminder
                  ? colors.primary
                  : colors.textMuted
              }
              ios_backgroundColor={colors.borderLight}
            />
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
          title="Delete Subscription"
          variant="ghost"
          size="md"
          onPress={handleDelete}
          className="self-center"
        />
      </View>
    </View>
  );
}
