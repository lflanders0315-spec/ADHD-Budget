import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSavingsStore } from "@/stores/savingsStore";
import { FormInput } from "@/components/FormInput";
import { AmountInput } from "@/components/AmountInput";
import { DatePicker } from "@/components/DatePicker";
import { Button } from "@/components/Button";
import { savingsGoalSchema, type SavingsGoalFormData } from "@/utils/validators";
import { formatCurrency } from "@/utils/formatters";
import { colors, spacing } from "@/constants/theme";

// ---------------------------------------------------------------------------
// Color picker options
// ---------------------------------------------------------------------------

const COLOR_OPTIONS = [
  { name: "Green", value: colors.primary },
  { name: "Amber", value: colors.accent },
  { name: "Mint", value: colors.statusPaid },
  { name: "Gold", value: colors.statusDue },
  { name: "Coral", value: colors.statusOverdue },
  { name: "Blue", value: colors.statusUpcoming },
];

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function AddSavingsGoalScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const existingGoal = useSavingsStore(
    useCallback((s) => (id ? s.goals.find((g) => g.id === id) : undefined), [id])
  );
  const addGoal = useSavingsStore((s) => s.addGoal);
  const updateGoal = useSavingsStore((s) => s.updateGoal);

  const isEditing = !!existingGoal;

  // ── Form state ──────────────────────────────────────────────────────────
  const [name, setName] = useState(existingGoal?.name ?? "");
  const [targetAmount, setTargetAmount] = useState(
    existingGoal?.targetAmount ?? 0
  );
  const [currentAmount, setCurrentAmount] = useState(
    existingGoal?.currentAmount ?? 0
  );
  const [deadline, setDeadline] = useState(
    existingGoal?.deadline ?? ""
  );
  const [color, setColor] = useState(
    existingGoal?.color ?? colors.primary
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // ── Derived ─────────────────────────────────────────────────────────────
  const milestonePreview = useMemo(() => {
    if (targetAmount <= 0) return [];
    return [
      { amount: targetAmount * 0.25, label: "25%", reached: false },
      { amount: targetAmount * 0.50, label: "50%", reached: false },
      { amount: targetAmount * 0.75, label: "75%", reached: false },
      { amount: targetAmount, label: "100%", reached: false },
    ];
  }, [targetAmount]);

  const previewProgress =
    targetAmount > 0 ? Math.round((currentAmount / targetAmount) * 100) : 0;

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    const formData: SavingsGoalFormData = {
      name: name.trim(),
      targetAmount,
      currentAmount,
      deadline: deadline || undefined,
    };

    const result = savingsGoalSchema.safeParse(formData);

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

    // Build milestones
    const milestones = targetAmount > 0
      ? [
          { amount: targetAmount * 0.25, reached: currentAmount >= targetAmount * 0.25 },
          { amount: targetAmount * 0.50, reached: currentAmount >= targetAmount * 0.50 },
          { amount: targetAmount * 0.75, reached: currentAmount >= targetAmount * 0.75 },
          { amount: targetAmount, reached: currentAmount >= targetAmount },
        ]
      : [];

    if (isEditing && existingGoal) {
      updateGoal(existingGoal.id, {
        name: result.data.name,
        targetAmount: result.data.targetAmount,
        currentAmount: result.data.currentAmount,
        deadline: result.data.deadline,
        color,
        milestones,
      });
    } else {
      addGoal({
        name: result.data.name,
        targetAmount: result.data.targetAmount,
        currentAmount: result.data.currentAmount,
        deadline: result.data.deadline,
        color,
        milestones,
      });
    }

    router.back();
  }, [
    name,
    targetAmount,
    currentAmount,
    deadline,
    color,
    isEditing,
    existingGoal,
    addGoal,
    updateGoal,
    router,
  ]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  // ── Render ──────────────────────────────────────────────────────────────
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
          {isEditing ? "Edit Goal" : "New Goal"}
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
        {/* Goal name */}
        <FormInput
          label="What are you saving for?"
          icon="🎯"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (errors.name) setErrors((e) => ({ ...e, name: "" }));
          }}
          placeholder="e.g. Emergency Fund, Vacation, New Laptop"
          error={errors.name}
        />

        {/* Target amount */}
        <Text className="text-sm font-semibold text-text-secondary mb-2 ml-1">
          How much do you need?
        </Text>
        <AmountInput value={targetAmount} onChange={setTargetAmount} />
        {errors.targetAmount && (
          <Text className="text-sm text-danger mt-0.5 ml-1 -mb-2">
            {errors.targetAmount}
          </Text>
        )}

        {/* Current amount */}
        <Text className="text-sm font-semibold text-text-secondary mb-2 ml-1 mt-2">
          Already saved (optional)
        </Text>
        <AmountInput value={currentAmount} onChange={setCurrentAmount} />
        {errors.currentAmount && (
          <Text className="text-sm text-danger mt-0.5 ml-1 -mb-2">
            {errors.currentAmount}
          </Text>
        )}

        {/* Deadline */}
        <DatePicker
          label="Deadline (optional)"
          date={deadline}
          onChange={setDeadline}
        />

        {/* Color picker */}
        <Text className="text-sm font-semibold text-text-secondary mb-3 ml-1">
          Pick a color
        </Text>
        <View className="flex-row mb-6" style={{ gap: 14 }}>
          {COLOR_OPTIONS.map((opt) => {
            const selected = color === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setColor(opt.value)}
                activeOpacity={0.7}
                className="items-center justify-center rounded-full"
                style={{
                  width: 44,
                  height: 44,
                  backgroundColor: opt.value,
                  borderWidth: selected ? 3 : 0,
                  borderColor: colors.textPrimary,
                  shadowColor: selected ? opt.value : "transparent",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: selected ? 3 : 0,
                }}
              >
                {selected && (
                  <Text className="text-white text-base font-bold">✓</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Milestones preview */}
        {targetAmount > 0 && (
          <View
            className="bg-surface rounded-2xl p-4 mb-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
              Milestones
            </Text>

            {/* Preview bar */}
            <View
              className="h-3 rounded-full bg-surface-muted overflow-hidden mb-4"
              style={{ borderRadius: 6 }}
            >
              <View
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, previewProgress)}%`,
                  backgroundColor: color,
                  borderRadius: 6,
                }}
              />
            </View>

            <View className="flex-row justify-between">
              {milestonePreview.map((ms, i) => (
                <View key={i} className="items-center">
                  <View
                    className="w-3 h-3 rounded-full mb-1"
                    style={{
                      backgroundColor: ms.reached ? color : colors.border,
                    }}
                  />
                  <Text className="text-xs text-text-muted">{ms.label}</Text>
                  <Text className="text-xs font-semibold text-text-secondary">
                    {formatCurrency(ms.amount)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Save button */}
        <Button
          title={isEditing ? "Save Changes" : "Create Goal"}
          variant="primary"
          size="lg"
          onPress={handleSave}
          loading={saving}
          className="mt-2"
        />
      </ScrollView>
    </View>
  );
}
