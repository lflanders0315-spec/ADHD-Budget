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
import { useBillStore } from "@/stores/billStore";
import { FormInput } from "@/components/FormInput";
import { AmountInput } from "@/components/AmountInput";
import { DatePicker } from "@/components/DatePicker";
import { CategoryPicker } from "@/components/CategoryPicker";
import { Button } from "@/components/Button";
import { billSchema, type BillFormData } from "@/utils/validators";
import { colors, spacing } from "@/constants/theme";
import type { BillCategory, BillPriority, RecurrenceFrequency } from "@/models";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BILL_CATEGORIES: BillCategory[] = [
  "mortgage",
  "rent",
  "phone",
  "internet",
  "insurance",
  "credit_card",
  "utilities",
  "medical",
  "other",
];

const RECURRENCE_OPTIONS: { key: RecurrenceFrequency; label: string }[] = [
  { key: "weekly", label: "Weekly" },
  { key: "biweekly", label: "Biweekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
  { key: "once", label: "Once" },
];

const PRIORITY_OPTIONS: { key: BillPriority; label: string; color: string }[] = [
  { key: "low", label: "Low", color: colors.statusUpcoming },
  { key: "medium", label: "Medium", color: colors.statusDue },
  { key: "high", label: "High", color: colors.statusOverdue },
];

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function AddBillScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const existingBill = useBillStore(
    useCallback((s) => (id ? s.bills.find((b) => b.id === id) : undefined), [id])
  );
  const addBill = useBillStore((s) => s.addBill);
  const updateBill = useBillStore((s) => s.updateBill);

  const isEditing = !!existingBill;

  // ── Form state ────────────────────────────────────────────────────────
  const [name, setName] = useState(existingBill?.name ?? "");
  const [amount, setAmount] = useState(existingBill?.amount ?? 0);
  const [dueDate, setDueDate] = useState(() => {
    if (existingBill) {
      const d = new Date();
      d.setDate(existingBill.dueDate);
      return d.toISOString().split("T")[0];
    }
    return new Date().toISOString().split("T")[0];
  });
  const [category, setCategory] = useState<string>(existingBill?.category ?? "other");
  const [recurrence, setRecurrence] = useState<RecurrenceFrequency>(
    existingBill?.recurrence ?? "monthly"
  );
  const [priority, setPriority] = useState<BillPriority>(
    existingBill?.priority ?? "medium"
  );
  const [autopay, setAutopay] = useState(existingBill?.autopay ?? false);
  const [notes, setNotes] = useState(existingBill?.notes ?? "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // ── Determine bill status from due date ───────────────────────────────
  const deriveStatus = useCallback((dueDateDay: number): "upcoming" | "due" | "overdue" => {
    const today = new Date().getDate();
    if (dueDateDay === today) return "due";
    if (dueDateDay < today) return "overdue";
    return "upcoming";
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    const dueDateDay = new Date(dueDate).getDate();

    const formData: BillFormData = {
      name: name.trim(),
      amount,
      dueDate: dueDateDay,
      recurrence,
      category,
      notes: notes.trim() || undefined,
    };

    const result = billSchema.safeParse(formData);

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

    const status = deriveStatus(dueDateDay);

    if (isEditing && existingBill) {
      updateBill(existingBill.id, {
        name: result.data.name,
        amount: result.data.amount,
        dueDate: result.data.dueDate,
        recurrence: result.data.recurrence,
        category: result.data.category as BillCategory,
        priority,
        autopay,
        notes: result.data.notes,
        status,
      });
    } else {
      addBill({
        name: result.data.name,
        amount: result.data.amount,
        dueDate: result.data.dueDate,
        recurrence: result.data.recurrence,
        category: result.data.category as BillCategory,
        priority,
        autopay,
        notes: result.data.notes,
        status,
      });
    }

    router.back();
  }, [
    name,
    amount,
    dueDate,
    recurrence,
    category,
    priority,
    autopay,
    notes,
    isEditing,
    existingBill,
    addBill,
    updateBill,
    deriveStatus,
    router,
  ]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

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
          {isEditing ? "Edit Bill" : "Add Bill"}
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
        {/* Bill name */}
        <FormInput
          label="Bill Name"
          icon="📝"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Rent, Electric, Phone"
          error={errors.name}
        />

        {/* Amount */}
        <Text className="text-sm font-semibold text-text-secondary mb-2 ml-1">
          Amount
        </Text>
        <AmountInput value={amount} onChange={setAmount} />
        {errors.amount && (
          <Text className="text-sm text-danger mt-0.5 ml-1 -mb-2">
            {errors.amount}
          </Text>
        )}

        {/* Due date */}
        <DatePicker label="Due Date" date={dueDate} onChange={setDueDate} />
        {errors.dueDate && (
          <Text className="text-sm text-danger mt-0.5 ml-1 -mb-2">
            {errors.dueDate}
          </Text>
        )}

        {/* Category */}
        <Text className="text-sm font-semibold text-text-secondary mb-2 ml-1">
          Category
        </Text>
        <CategoryPicker
          categories={BILL_CATEGORIES}
          selected={category}
          onSelect={setCategory}
        />
        {errors.category && (
          <Text className="text-sm text-danger mt-0.5 ml-1 -mb-2">
            {errors.category}
          </Text>
        )}

        {/* Recurrence */}
        <Text className="text-sm font-semibold text-text-secondary mb-3 ml-1">
          How often?
        </Text>
        <View className="flex-row flex-wrap mb-4" style={{ gap: spacing.sm }}>
          {RECURRENCE_OPTIONS.map((opt) => {
            const isActive = recurrence === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setRecurrence(opt.key)}
                activeOpacity={0.7}
                className="rounded-full px-4"
                style={{
                  backgroundColor: isActive ? colors.primary : colors.surfaceMuted,
                  minHeight: 44,
                  justifyContent: "center",
                  borderWidth: isActive ? 0 : 1.5,
                  borderColor: isActive ? "transparent" : colors.borderLight,
                }}
              >
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

        {/* Priority */}
        <Text className="text-sm font-semibold text-text-secondary mb-3 ml-1">
          Priority
        </Text>
        <View className="flex-row mb-4" style={{ gap: spacing.sm }}>
          {PRIORITY_OPTIONS.map((opt) => {
            const isActive = priority === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setPriority(opt.key)}
                activeOpacity={0.7}
                className="flex-row items-center rounded-full px-4"
                style={{
                  backgroundColor: isActive ? opt.color : colors.surfaceMuted,
                  minHeight: 44,
                  justifyContent: "center",
                  borderWidth: isActive ? 0 : 1.5,
                  borderColor: isActive ? "transparent" : colors.borderLight,
                }}
              >
                <View
                  className="w-2.5 h-2.5 rounded-full mr-2"
                  style={{
                    backgroundColor: isActive ? "white" : opt.color,
                  }}
                />
                <Text
                  className="text-sm font-semibold capitalize"
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

        {/* Autopay toggle */}
        <View className="flex-row items-center justify-between bg-surface rounded-xl px-4 mb-4"
          style={{ minHeight: spacing.touch }}
        >
          <View className="flex-row items-center">
            <Text className="text-lg mr-3">🔄</Text>
            <View>
              <Text className="text-base font-semibold text-text-primary">
                Autopay
              </Text>
              <Text className="text-xs text-text-secondary">
                Automatically paid each cycle
              </Text>
            </View>
          </View>
          <Switch
            value={autopay}
            onValueChange={setAutopay}
            trackColor={{
              false: colors.borderLight,
              true: colors.primaryLight,
            }}
            thumbColor={autopay ? colors.primary : colors.textMuted}
            ios_backgroundColor={colors.borderLight}
          />
        </View>

        {/* Notes */}
        <FormInput
          label="Notes (optional)"
          icon="💬"
          value={notes}
          onChangeText={setNotes}
          placeholder="Anything to remember about this bill..."
          multiline
          numberOfLines={3}
        />

        {/* Save button */}
        <Button
          title={isEditing ? "Save Changes" : "Add Bill"}
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
