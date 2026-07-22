import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePaycheckStore } from "@/stores/paycheckStore";
import { FormInput } from "@/components/FormInput";
import { AmountInput } from "@/components/AmountInput";
import { DatePicker } from "@/components/DatePicker";
import { Button } from "@/components/Button";
import { paycheckSchema, type PaycheckFormData } from "@/utils/validators";
import { colors, spacing } from "@/constants/theme";
import type { PayFrequency } from "@/models";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FREQUENCY_OPTIONS: { key: PayFrequency; label: string }[] = [
  { key: "weekly", label: "Weekly" },
  { key: "biweekly", label: "Biweekly" },
  { key: "monthly", label: "Monthly" },
  { key: "custom", label: "Custom" },
];

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function AddPaycheckScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const existingPaycheck = usePaycheckStore(
    useCallback(
      (s) => (id ? s.paychecks.find((p) => p.id === id) : undefined),
      [id]
    )
  );
  const addPaycheck = usePaycheckStore((s) => s.addPaycheck);
  const updatePaycheck = usePaycheckStore((s) => s.updatePaycheck);
  const estimateNextPayDate = usePaycheckStore((s) => s.estimateNextPayDate);

  const isEditing = !!existingPaycheck;

  // ── Form state ────────────────────────────────────────────────────────
  const [employer, setEmployer] = useState(existingPaycheck?.employer ?? "");
  const [netPay, setNetPay] = useState(existingPaycheck?.netPay ?? 0);
  const [grossPay, setGrossPay] = useState(existingPaycheck?.grossPay ?? 0);
  const [frequency, setFrequency] = useState<PayFrequency>(
    existingPaycheck?.frequency ?? "biweekly"
  );
  const [customFrequencyDays, setCustomFrequencyDays] = useState(
    existingPaycheck?.customFrequencyDays?.toString() ?? ""
  );
  const [nextPayDate, setNextPayDate] = useState(() => {
    return (
      existingPaycheck?.nextPayDate?.split("T")[0] ??
      new Date().toISOString().split("T")[0]
    );
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // ── Auto-estimate next pay date when frequency changes ────────────────
  const handleFrequencyChange = useCallback(
    (newFreq: PayFrequency) => {
      setFrequency(newFreq);

      // Only auto-estimate if we have a base date (use today as reference)
      const baseDate = nextPayDate || new Date().toISOString().split("T")[0];
      const customDays =
        newFreq === "custom"
          ? parseInt(customFrequencyDays, 10) || undefined
          : undefined;

      const estimated = estimateNextPayDate(newFreq, baseDate, customDays);
      setNextPayDate(estimated.split("T")[0]);
    },
    [nextPayDate, customFrequencyDays, estimateNextPayDate]
  );

  // ── Save ──────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    const customDays =
      frequency === "custom"
        ? parseInt(customFrequencyDays, 10) || undefined
        : undefined;

    const formData: PaycheckFormData = {
      employer: employer.trim(),
      netPay,
      grossPay: grossPay > 0 ? grossPay : undefined,
      frequency,
      customFrequencyDays: customDays,
      nextPayDate,
    };

    const result = paycheckSchema.safeParse(formData);

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

    if (isEditing && existingPaycheck) {
      updatePaycheck(existingPaycheck.id, {
        employer: result.data.employer,
        source: result.data.employer,
        grossPay: result.data.grossPay ?? result.data.netPay,
        netPay: result.data.netPay,
        frequency: result.data.frequency,
        customFrequencyDays: result.data.customFrequencyDays,
        nextPayDate: result.data.nextPayDate,
      });
    } else {
      addPaycheck({
        employer: result.data.employer,
        source: result.data.employer,
        grossPay: result.data.grossPay ?? result.data.netPay,
        netPay: result.data.netPay,
        frequency: result.data.frequency,
        customFrequencyDays: result.data.customFrequencyDays,
        nextPayDate: result.data.nextPayDate,
      });
    }

    router.back();
  }, [
    employer,
    netPay,
    grossPay,
    frequency,
    customFrequencyDays,
    nextPayDate,
    isEditing,
    existingPaycheck,
    addPaycheck,
    updatePaycheck,
    router,
  ]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  // ── Monthly estimate preview ──────────────────────────────────────────
  const monthlyEstimate = useMemo(() => {
    if (netPay <= 0) return null;
    switch (frequency) {
      case "weekly":
        return Math.round((netPay * 52) / 12 * 100) / 100;
      case "biweekly":
        return Math.round((netPay * 26) / 12 * 100) / 100;
      case "monthly":
        return netPay;
      case "custom": {
        const days = parseInt(customFrequencyDays, 10);
        if (!days || days <= 0) return null;
        return Math.round((netPay * 365) / days / 12 * 100) / 100;
      }
      default:
        return null;
    }
  }, [netPay, frequency, customFrequencyDays]);

  // ── Render ────────────────────────────────────────────────────────────
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
          {isEditing ? "Edit Paycheck" : "Add Paycheck"}
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
        {/* Employer / source name */}
        <FormInput
          label="Employer or Source"
          icon="🏢"
          value={employer}
          onChangeText={setEmployer}
          placeholder="e.g. Acme Corp, Freelance, Side Hustle"
          error={errors.employer}
        />

        {/* Net pay */}
        <Text className="text-sm font-semibold text-text-secondary mb-2 ml-1">
          Net Pay (take-home)
        </Text>
        <AmountInput value={netPay} onChange={setNetPay} />
        {errors.netPay && (
          <Text className="text-sm text-danger mt-0.5 ml-1 -mb-2">
            {errors.netPay}
          </Text>
        )}

        {/* Gross pay */}
        <Text className="text-sm font-semibold text-text-secondary mb-2 ml-1">
          Gross Pay (optional)
        </Text>
        <AmountInput value={grossPay} onChange={setGrossPay} />

        {/* Frequency chips */}
        <Text className="text-sm font-semibold text-text-secondary mb-3 ml-1">
          How often?
        </Text>
        <View className="flex-row flex-wrap mb-2" style={{ gap: spacing.sm }}>
          {FREQUENCY_OPTIONS.map((opt) => {
            const isActive = frequency === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => handleFrequencyChange(opt.key)}
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

        {/* Custom frequency days */}
        {frequency === "custom" && (
          <FormInput
            label="Pay every (days)"
            icon="🔄"
            value={customFrequencyDays}
            onChangeText={(text) => {
              // Only allow digits
              const cleaned = text.replace(/[^0-9]/g, "");
              setCustomFrequencyDays(cleaned);
            }}
            placeholder="e.g. 10"
            keyboardType="number-pad"
            error={errors.customFrequencyDays}
          />
        )}

        {/* Next pay date */}
        <DatePicker
          label="Next Pay Date"
          date={nextPayDate}
          onChange={setNextPayDate}
        />
        {errors.nextPayDate && (
          <Text className="text-sm text-danger mt-0.5 ml-1 -mb-2">
            {errors.nextPayDate}
          </Text>
        )}

        {/* Monthly estimate preview */}
        {monthlyEstimate !== null && (
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
                  Monthly estimate
                </Text>
              </View>
              <Text
                className="text-xl font-bold"
                style={{ color: colors.accent }}
              >
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                }).format(monthlyEstimate)}
              </Text>
            </View>
          </View>
        )}

        {/* Save button */}
        <Button
          title={isEditing ? "Save Changes" : "Add Paycheck"}
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
