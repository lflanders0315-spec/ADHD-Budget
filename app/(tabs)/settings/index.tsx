import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Header } from "@/components/Header";
import { useAppStore } from "@/stores/appStore";
import { colors, spacing, borderRadius, fontSize } from "@/constants/theme";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A hardware-style toggle using RN's Switch styled with our primary green. */
function SettingsToggle({
  value,
  onValueChange,
  accessibilityLabel,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
  accessibilityLabel: string;
}) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      accessibilityLabel={accessibilityLabel}
      trackColor={{ false: colors.border, true: colors.primaryLight }}
      thumbColor={value ? colors.primary : colors.surface}
      ios_backgroundColor={colors.border}
    />
  );
}

// ---------------------------------------------------------------------------
// Settings Row
// ---------------------------------------------------------------------------

interface SettingsRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  /** When true, renders a Switch instead of value/chevron */
  toggle?: { value: boolean; onValueChange: (v: boolean) => void };
  /** Danger-styled row (red text) */
  danger?: boolean;
  /** Accent-styled row (amber text) */
  warning?: boolean;
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  toggle,
  danger,
  warning,
}: SettingsRowProps) {
  const isDestructive = danger || warning;

  const content = (
    <View
      className="flex-row items-center px-4"
      style={{
        minHeight: spacing.touch,
        backgroundColor: colors.surface,
      }}
    >
      {/* Icon */}
      <Text className="text-xl mr-4" style={{ width: 28, textAlign: "center" }}>
        {icon}
      </Text>

      {/* Label */}
      <Text
        className="flex-1 text-base"
        style={{
          color: isDestructive
            ? danger
              ? colors.danger
              : colors.warning
            : colors.textPrimary,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>

      {/* Value or Toggle */}
      {toggle ? (
        <SettingsToggle
          value={toggle.value}
          onValueChange={toggle.onValueChange}
          accessibilityLabel={label}
        />
      ) : (
        <View className="flex-row items-center">
          {value ? (
            <Text
              className="text-sm mr-2"
              style={{ color: colors.textSecondary }}
              numberOfLines={1}
            >
              {value}
            </Text>
          ) : null}
          {onPress && (
            <Text style={{ color: colors.textMuted, fontSize: fontSize.lg }}>
              ›
            </Text>
          )}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.6}
        accessibilityLabel={label}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

// ---------------------------------------------------------------------------
// Section Header
// ---------------------------------------------------------------------------

function SectionHeader({ title }: { title: string }) {
  return (
    <Text
      className="uppercase px-4 mb-2 mt-6"
      style={{
        fontSize: fontSize.xs,
        color: colors.textMuted,
        letterSpacing: 0.5,
        fontWeight: "600",
      }}
    >
      {title}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Group Container (iOS-style rounded grouped rows)
// ---------------------------------------------------------------------------

function GroupContainer({ children }: { children: React.ReactNode }) {
  return (
    <View
      className="mx-4 overflow-hidden rounded-xl"
      style={{
        backgroundColor: colors.surface,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      {children}
    </View>
  );
}

function GroupSeparator() {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: colors.borderLight,
        marginLeft: 60, // align with text, not icon
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Theme Preview Card
// ---------------------------------------------------------------------------

function ThemePreviewCard({
  mode,
  active,
  onSelect,
}: {
  mode: "light" | "dark";
  active: boolean;
  onSelect: () => void;
}) {
  const isDark = mode === "dark";
  const bg = isDark ? "#1C1C1E" : colors.background;
  const cardBg = isDark ? "#2C2C2E" : colors.surface;
  const textCol = isDark ? "#FFFFFF" : colors.textPrimary;
  const textSec = isDark ? "#AEAEB2" : colors.textSecondary;
  const accentBg = isDark ? "#3D6B3C" : colors.primaryLight;
  const accentTxt = isDark ? "#A8D8A8" : colors.primary;

  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.7}
      className="flex-1"
      accessibilityLabel={`${mode} theme`}
    >
      <View
        className="rounded-xl p-3 border-2"
        style={{
          backgroundColor: bg,
          borderColor: active ? colors.primary : colors.borderLight,
        }}
      >
        {/* Mini preview rows */}
        <View
          className="rounded-lg px-2 py-1.5 mb-2"
          style={{ backgroundColor: cardBg }}
        >
          <View
            style={{
              width: "40%",
              height: 6,
              borderRadius: 3,
              backgroundColor: textCol,
              opacity: 0.8,
            }}
          />
          <View
            style={{
              width: "70%",
              height: 4,
              borderRadius: 2,
              backgroundColor: textSec,
              opacity: 0.5,
              marginTop: 3,
            }}
          />
        </View>
        <View
          className="rounded-lg px-2 py-1.5"
          style={{ backgroundColor: cardBg }}
        >
          <View
            style={{
              width: "60%",
              height: 6,
              borderRadius: 3,
              backgroundColor: textCol,
              opacity: 0.8,
            }}
          />
          <View
            style={{
              width: "30%",
              height: 4,
              borderRadius: 2,
              backgroundColor: accentTxt,
              marginTop: 3,
            }}
          />
        </View>

        <Text
          className="text-center font-semibold mt-2 capitalize text-xs"
          style={{ color: active ? colors.primary : colors.textSecondary }}
        >
          {mode}
          {active ? " ✓" : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Edit Name Modal
// ---------------------------------------------------------------------------

function EditNameModal({
  visible,
  currentName,
  onSave,
  onClose,
}: {
  visible: boolean;
  currentName: string;
  onSave: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(currentName);

  const handleSave = useCallback(() => {
    const trimmed = name.trim();
    if (trimmed.length > 0) {
      onSave(trimmed);
    }
    onClose();
  }, [name, onSave, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/40 justify-center items-center"
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="mx-8 rounded-xl p-6 w-80"
          style={{
            backgroundColor: colors.surface,
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 24,
              },
              default: { elevation: 8 },
            }),
          }}
        >
          <Text
            className="font-bold mb-4 text-center"
            style={{
              fontSize: fontSize.xl,
              color: colors.textPrimary,
            }}
          >
            Your Name
          </Text>
          <Text
            className="text-center mb-4"
            style={{
              fontSize: fontSize.sm,
              color: colors.textSecondary,
            }}
          >
            What should we call you?
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={colors.textMuted}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
            className="rounded-xl px-4 py-3 mb-4 text-base"
            style={{
              backgroundColor: colors.surfaceMuted,
              color: colors.textPrimary,
              minHeight: spacing.touch,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              className="flex-1 items-center justify-center rounded-xl"
              style={{
                minHeight: spacing.touch,
                backgroundColor: colors.surfaceMuted,
              }}
            >
              <Text
                className="font-semibold text-base"
                style={{ color: colors.textSecondary }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.7}
              className="flex-1 items-center justify-center rounded-xl"
              style={{
                minHeight: spacing.touch,
                backgroundColor: colors.primary,
                opacity: name.trim().length > 0 ? 1 : 0.5,
              }}
              disabled={name.trim().length === 0}
            >
              <Text
                className="font-semibold text-base"
                style={{ color: colors.textInverse }}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Settings Screen
// ---------------------------------------------------------------------------

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // ── Store selectors ────────────────────────────────────────────────────
  const displayName = useAppStore((s) => s.displayName);
  const themeMode = useAppStore((s) => s.themeMode);
  const setDisplayName = useAppStore((s) => s.setDisplayName);
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const resetOnboarding = useAppStore((s) => s.resetOnboarding);
  const clearAllData = useAppStore((s) => s.clearAllData);

  // Notification preferences
  const billReminders = useAppStore((s) => s.billReminders);
  const paycheckReminders = useAppStore((s) => s.paycheckReminders);
  const subscriptionAlerts = useAppStore((s) => s.subscriptionAlerts);
  const savingsCelebrations = useAppStore((s) => s.savingsCelebrations);
  const setBillReminders = useAppStore((s) => s.setBillReminders);
  const setPaycheckReminders = useAppStore((s) => s.setPaycheckReminders);
  const setSubscriptionAlerts = useAppStore((s) => s.setSubscriptionAlerts);
  const setSavingsCelebrations = useAppStore((s) => s.setSavingsCelebrations);

  // Accessibility preferences
  const largeText = useAppStore((s) => s.largeText);
  const hapticFeedback = useAppStore((s) => s.hapticFeedback);
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const setLargeText = useAppStore((s) => s.setLargeText);
  const setHapticFeedback = useAppStore((s) => s.setHapticFeedback);
  const setReducedMotion = useAppStore((s) => s.setReducedMotion);

  // ── Local state ────────────────────────────────────────────────────────
  const [nameModalVisible, setNameModalVisible] = useState(false);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleResetOnboarding = useCallback(() => {
    Alert.alert(
      "Reset Onboarding",
      "This will restart the onboarding flow next time you open the app. Your financial data won't be lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetOnboarding();
            router.replace("/");
          },
        },
      ],
    );
  }, [resetOnboarding, router]);

  const handleClearAllData = useCallback(() => {
    Alert.alert(
      "Clear All Data",
      "This will remove all your bills, subscriptions, paychecks, savings goals, and spending history. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Everything",
          style: "destructive",
          onPress: () => {
            clearAllData();
            Alert.alert("Done", "All your data has been cleared.");
          },
        },
      ],
    );
  }, [clearAllData]);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: colors.background,
        paddingTop: insets.top,
      }}
    >
      <Header title="Settings" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: spacing.xl + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ═════════════════════════════════════════════════════════════════
            1. Profile
           ═════════════════════════════════════════════════════════════════ */}
        <View className="items-center mt-4 mb-6">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: colors.primaryLight }}
          >
            <Text style={{ fontSize: 36 }}>
              {displayName ? displayName.charAt(0).toUpperCase() : "👋"}
            </Text>
          </View>
          <Text
            className="font-bold mb-1"
            style={{ fontSize: fontSize.xl, color: colors.textPrimary }}
          >
            Hello, {displayName || "friend"}!
          </Text>
          <TouchableOpacity
            onPress={() => setNameModalVisible(true)}
            activeOpacity={0.7}
            className="py-1"
          >
            <Text
              className="font-semibold"
              style={{ fontSize: fontSize.sm, color: colors.primary }}
            >
              {displayName ? "Change name" : "Set your name"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ═════════════════════════════════════════════════════════════════
            2. Appearance
           ═════════════════════════════════════════════════════════════════ */}
        <SectionHeader title="Appearance" />
        <GroupContainer>
          <SettingsRow
            icon={themeMode === "light" ? "☀️" : "🌙"}
            label="Theme"
            value={themeMode === "light" ? "Light" : "Dark"}
            onPress={() =>
              setThemeMode(themeMode === "light" ? "dark" : "light")
            }
          />
        </GroupContainer>

        {/* Theme preview cards */}
        <View className="flex-row gap-3 mx-4 mt-3">
          <ThemePreviewCard
            mode="light"
            active={themeMode === "light"}
            onSelect={() => setThemeMode("light")}
          />
          <ThemePreviewCard
            mode="dark"
            active={themeMode === "dark"}
            onSelect={() => setThemeMode("dark")}
          />
        </View>

        {/* ═════════════════════════════════════════════════════════════════
            3. Notifications
           ═════════════════════════════════════════════════════════════════ */}
        <SectionHeader title="Notifications" />
        <GroupContainer>
          <SettingsRow
            icon="💳"
            label="Bill reminders"
            toggle={{
              value: billReminders,
              onValueChange: setBillReminders,
            }}
          />
          <GroupSeparator />
          <SettingsRow
            icon="💰"
            label="Paycheck reminders"
            toggle={{
              value: paycheckReminders,
              onValueChange: setPaycheckReminders,
            }}
          />
          <GroupSeparator />
          <SettingsRow
            icon="🔄"
            label="Subscription renewal alerts"
            toggle={{
              value: subscriptionAlerts,
              onValueChange: setSubscriptionAlerts,
            }}
          />
          <GroupSeparator />
          <SettingsRow
            icon="🎉"
            label="Savings milestone celebrations"
            toggle={{
              value: savingsCelebrations,
              onValueChange: setSavingsCelebrations,
            }}
          />
        </GroupContainer>

        <Text
          className="px-4 mt-2 mb-0"
          style={{
            fontSize: fontSize.xs,
            color: colors.textMuted,
            lineHeight: 16,
          }}
        >
          These preferences are saved but notification scheduling will be added in a future update.
        </Text>

        {/* ═════════════════════════════════════════════════════════════════
            4. Data & Privacy
           ═════════════════════════════════════════════════════════════════ */}
        <SectionHeader title="Data & Privacy" />
        <GroupContainer>
          <SettingsRow
            icon="🔄"
            label="Reset Onboarding"
            onPress={handleResetOnboarding}
            warning
          />
          <GroupSeparator />
          <SettingsRow
            icon="🗑️"
            label="Clear All Data"
            onPress={handleClearAllData}
            danger
          />
        </GroupContainer>

        <GroupContainer>
          <View className="mx-0">
            <SettingsRow
              icon="ℹ️"
              label="Budget Buddy ADHD"
            />
            <GroupSeparator />
            <SettingsRow
              icon="📱"
              label="Version"
              value="1.0.0"
            />
          </View>
        </GroupContainer>

        {/* ═════════════════════════════════════════════════════════════════
            5. Accessibility
           ═════════════════════════════════════════════════════════════════ */}
        <SectionHeader title="Accessibility" />
        <GroupContainer>
          <SettingsRow
            icon="🔤"
            label="Large text"
            toggle={{
              value: largeText,
              onValueChange: setLargeText,
            }}
          />
          <GroupSeparator />
          <SettingsRow
            icon="📳"
            label="Haptic feedback"
            toggle={{
              value: hapticFeedback,
              onValueChange: setHapticFeedback,
            }}
          />
          <GroupSeparator />
          <SettingsRow
            icon="🎞️"
            label="Reduced motion"
            toggle={{
              value: reducedMotion,
              onValueChange: setReducedMotion,
            }}
          />
        </GroupContainer>

        <Text
          className="px-4 mt-2 mb-0"
          style={{
            fontSize: fontSize.xs,
            color: colors.textMuted,
            lineHeight: 16,
          }}
        >
          Accessibility preferences will be applied in a future update.
        </Text>

        {/* Bottom spacer for breathing room */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {/* ═════════════════════════════════════════════════════════════════
          Edit Name Modal
         ═════════════════════════════════════════════════════════════════ */}
      <EditNameModal
        visible={nameModalVisible}
        currentName={displayName}
        onSave={setDisplayName}
        onClose={() => setNameModalVisible(false)}
      />
    </View>
  );
}
