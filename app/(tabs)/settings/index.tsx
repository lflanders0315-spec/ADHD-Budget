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
import { useTheme } from "@/hooks/useTheme";
import { spacing } from "@/constants/theme";
import type { ThemeColors } from "@/constants/theme";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function SettingsToggle({
  value,
  onValueChange,
  accessibilityLabel,
  colors,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
  accessibilityLabel: string;
  colors: ThemeColors;
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
  toggle?: { value: boolean; onValueChange: (v: boolean) => void };
  danger?: boolean;
  warning?: boolean;
  colors: ThemeColors;
  fs: ReturnType<typeof useTheme>["fontSize"];
}

function SettingsRow({
  icon, label, value, onPress, toggle, danger, warning, colors, fs,
}: SettingsRowProps) {
  const isDestructive = danger || warning;

  const content = (
    <View
      style={{
        flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
        minHeight: spacing.touch, backgroundColor: colors.surface,
      }}
    >
      <Text style={{ fontSize: 20, marginRight: 16, width: 28, textAlign: "center" }}>{icon}</Text>
      <Text
        style={{ flex: 1, fontSize: fs.base, color: isDestructive ? (danger ? colors.danger : colors.warning) : colors.textPrimary }}
        numberOfLines={1}
      >
        {label}
      </Text>
      {toggle ? (
        <SettingsToggle value={toggle.value} onValueChange={toggle.onValueChange} accessibilityLabel={label} colors={colors} />
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {value ? <Text style={{ fontSize: fs.sm, marginRight: 8, color: colors.textSecondary }} numberOfLines={1}>{value}</Text> : null}
          {onPress && <Text style={{ color: colors.textMuted, fontSize: fs.lg }}>›</Text>}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.6} accessibilityLabel={label}>{content}</TouchableOpacity>;
  }
  return content;
}

// ---------------------------------------------------------------------------
// Section Header
// ---------------------------------------------------------------------------

function SectionHeader({ title, colors, fs }: { title: string; colors: ThemeColors; fs: ReturnType<typeof useTheme>["fontSize"] }) {
  return (
    <Text
      style={{
        textTransform: "uppercase", paddingHorizontal: 16, marginBottom: 8, marginTop: 24,
        fontSize: fs.xs, color: colors.textMuted, letterSpacing: 0.5, fontWeight: "600",
      }}
    >
      {title}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Group Container
// ---------------------------------------------------------------------------

function GroupContainer({ children, colors }: { children: React.ReactNode; colors: ThemeColors }) {
  return (
    <View
      style={{
        marginHorizontal: 16, overflow: "hidden", borderRadius: 12, backgroundColor: colors.surface,
        shadowColor: colors.shadowColor, shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
      }}
    >
      {children}
    </View>
  );
}

function GroupSeparator({ colors }: { colors: ThemeColors }) {
  return <View style={{ height: 1, backgroundColor: colors.borderLight, marginLeft: 60 }} />;
}

// ---------------------------------------------------------------------------
// Theme Preview Card
// ---------------------------------------------------------------------------

function ThemePreviewCard({
  mode, active, onSelect, colors,
}: {
  mode: "light" | "dark"; active: boolean; onSelect: () => void; colors: ThemeColors;
}) {
  const isDark = mode === "dark";
  const bg = isDark ? "#1C1C1E" : "#FAF9F7";
  const cardBg = isDark ? "#2C2C2E" : "#FFFFFF";
  const textCol = isDark ? "#FFFFFF" : "#2C2C2C";
  const textSec = isDark ? "#AEAEB2" : "#6B6B6B";
  const accentTxt = isDark ? "#A8D8A8" : "#5B8C5A";

  return (
    <TouchableOpacity onPress={onSelect} activeOpacity={0.7} style={{ flex: 1 }} accessibilityLabel={`${mode} theme`}>
      <View style={{ borderRadius: 12, padding: 12, borderWidth: 2, backgroundColor: bg, borderColor: active ? colors.primary : colors.borderLight }}>
        <View style={{ borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, marginBottom: 8, backgroundColor: cardBg }}>
          <View style={{ width: "40%", height: 6, borderRadius: 3, backgroundColor: textCol, opacity: 0.8 }} />
          <View style={{ width: "70%", height: 4, borderRadius: 2, backgroundColor: textSec, opacity: 0.5, marginTop: 3 }} />
        </View>
        <View style={{ borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, backgroundColor: cardBg }}>
          <View style={{ width: "60%", height: 6, borderRadius: 3, backgroundColor: textCol, opacity: 0.8 }} />
          <View style={{ width: "30%", height: 4, borderRadius: 2, backgroundColor: accentTxt, marginTop: 3 }} />
        </View>
        <Text style={{ textAlign: "center", fontWeight: "600", marginTop: 8, textTransform: "capitalize", fontSize: 12, color: active ? colors.primary : colors.textSecondary }}>
          {mode}{active ? " ✓" : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Edit Name Modal
// ---------------------------------------------------------------------------

function EditNameModal({
  visible, currentName, onSave, onClose, colors, fs,
}: {
  visible: boolean; currentName: string; onSave: (name: string) => void; onClose: () => void;
  colors: ThemeColors; fs: ReturnType<typeof useTheme>["fontSize"];
}) {
  const [name, setName] = useState(currentName);

  const handleSave = useCallback(() => {
    const trimmed = name.trim();
    if (trimmed.length > 0) onSave(trimmed);
    onClose();
  }, [name, onSave, onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }} onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            marginHorizontal: 32, borderRadius: 12, padding: 24, width: 320, backgroundColor: colors.surface,
            ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24 }, default: { elevation: 8 } }),
          }}
        >
          <Text style={{ fontWeight: "700", marginBottom: 16, textAlign: "center", fontSize: fs.xl, color: colors.textPrimary }}>Your Name</Text>
          <Text style={{ textAlign: "center", marginBottom: 16, fontSize: fs.sm, color: colors.textSecondary }}>What should we call you?</Text>
          <TextInput
            value={name} onChangeText={setName} placeholder="Enter your name" placeholderTextColor={colors.textMuted}
            autoFocus returnKeyType="done" onSubmitEditing={handleSave}
            style={{
              borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, fontSize: fs.base,
              backgroundColor: colors.surfaceMuted, color: colors.textPrimary, minHeight: spacing.touch,
              borderWidth: 1, borderColor: colors.border,
            }}
          />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}
              style={{ flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 12, minHeight: spacing.touch, backgroundColor: colors.surfaceMuted }}>
              <Text style={{ fontWeight: "600", fontSize: fs.base, color: colors.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} activeOpacity={0.7} disabled={name.trim().length === 0}
              style={{ flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 12, minHeight: spacing.touch, backgroundColor: colors.primary, opacity: name.trim().length > 0 ? 1 : 0.5 }}>
              <Text style={{ fontWeight: "600", fontSize: fs.base, color: colors.textInverse }}>Save</Text>
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
  const { colors, fontSize: fs } = useTheme();

  // ── Store selectors ────────────────────────────────────────────────────
  const displayName = useAppStore((s) => s.displayName);
  const themeMode = useAppStore((s) => s.themeMode);
  const setDisplayName = useAppStore((s) => s.setDisplayName);
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const resetOnboarding = useAppStore((s) => s.resetOnboarding);
  const clearAllData = useAppStore((s) => s.clearAllData);

  const billReminders = useAppStore((s) => s.billReminders);
  const paycheckReminders = useAppStore((s) => s.paycheckReminders);
  const subscriptionAlerts = useAppStore((s) => s.subscriptionAlerts);
  const savingsCelebrations = useAppStore((s) => s.savingsCelebrations);
  const setBillReminders = useAppStore((s) => s.setBillReminders);
  const setPaycheckReminders = useAppStore((s) => s.setPaycheckReminders);
  const setSubscriptionAlerts = useAppStore((s) => s.setSubscriptionAlerts);
  const setSavingsCelebrations = useAppStore((s) => s.setSavingsCelebrations);

  const largeText = useAppStore((s) => s.largeText);
  const hapticFeedback = useAppStore((s) => s.hapticFeedback);
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const setLargeText = useAppStore((s) => s.setLargeText);
  const setHapticFeedback = useAppStore((s) => s.setHapticFeedback);
  const setReducedMotion = useAppStore((s) => s.setReducedMotion);

  const [nameModalVisible, setNameModalVisible] = useState(false);

  const handleResetOnboarding = useCallback(() => {
    Alert.alert("Reset Onboarding", "This will restart the onboarding flow next time you open the app. Your financial data won't be lost.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: () => { resetOnboarding(); router.replace("/"); } },
    ]);
  }, [resetOnboarding, router]);

  const handleClearAllData = useCallback(() => {
    Alert.alert("Clear All Data", "This will remove all your bills, subscriptions, paychecks, savings goals, and spending history. This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear Everything", style: "destructive", onPress: () => { clearAllData(); Alert.alert("Done", "All your data has been cleared."); } },
    ]);
  }, [clearAllData]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <Header title="Settings" />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: spacing.xl + 80 }} showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <View style={{ alignItems: "center", marginTop: 16, marginBottom: 24 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 12, backgroundColor: colors.primaryLight }}>
            <Text style={{ fontSize: 36 }}>{displayName ? displayName.charAt(0).toUpperCase() : "👋"}</Text>
          </View>
          <Text style={{ fontWeight: "700", marginBottom: 4, fontSize: fs.xl, color: colors.textPrimary }}>Hello, {displayName || "friend"}!</Text>
          <TouchableOpacity onPress={() => setNameModalVisible(true)} activeOpacity={0.7} style={{ paddingVertical: 4 }}>
            <Text style={{ fontWeight: "600", fontSize: fs.sm, color: colors.primary }}>{displayName ? "Change name" : "Set your name"}</Text>
          </TouchableOpacity>
        </View>

        {/* Appearance */}
        <SectionHeader title="Appearance" colors={colors} fs={fs} />
        <GroupContainer colors={colors}>
          <SettingsRow icon={themeMode === "light" ? "☀️" : "🌙"} label="Theme"
            value={themeMode === "light" ? "Light" : "Dark"}
            onPress={() => setThemeMode(themeMode === "light" ? "dark" : "light")}
            colors={colors} fs={fs}
          />
        </GroupContainer>
        <View style={{ flexDirection: "row", gap: 12, marginHorizontal: 16, marginTop: 12 }}>
          <ThemePreviewCard mode="light" active={themeMode === "light"} onSelect={() => setThemeMode("light")} colors={colors} />
          <ThemePreviewCard mode="dark" active={themeMode === "dark"} onSelect={() => setThemeMode("dark")} colors={colors} />
        </View>

        {/* Notifications */}
        <SectionHeader title="Notifications" colors={colors} fs={fs} />
        <GroupContainer colors={colors}>
          <SettingsRow icon="💳" label="Bill reminders" toggle={{ value: billReminders, onValueChange: setBillReminders }} colors={colors} fs={fs} />
          <GroupSeparator colors={colors} />
          <SettingsRow icon="💰" label="Paycheck reminders" toggle={{ value: paycheckReminders, onValueChange: setPaycheckReminders }} colors={colors} fs={fs} />
          <GroupSeparator colors={colors} />
          <SettingsRow icon="🔄" label="Subscription renewal alerts" toggle={{ value: subscriptionAlerts, onValueChange: setSubscriptionAlerts }} colors={colors} fs={fs} />
          <GroupSeparator colors={colors} />
          <SettingsRow icon="🎉" label="Savings milestone celebrations" toggle={{ value: savingsCelebrations, onValueChange: setSavingsCelebrations }} colors={colors} fs={fs} />
        </GroupContainer>

        {/* Data & Privacy */}
        <SectionHeader title="Data & Privacy" colors={colors} fs={fs} />
        <GroupContainer colors={colors}>
          <SettingsRow icon="🔄" label="Reset Onboarding" onPress={handleResetOnboarding} warning colors={colors} fs={fs} />
          <GroupSeparator colors={colors} />
          <SettingsRow icon="🗑️" label="Clear All Data" onPress={handleClearAllData} danger colors={colors} fs={fs} />
        </GroupContainer>

        {/* About */}
        <View style={{ marginTop: 16 }}>
          <GroupContainer colors={colors}>
            <SettingsRow icon="ℹ️" label="Budget Buddy ADHD" colors={colors} fs={fs} />
            <GroupSeparator colors={colors} />
            <SettingsRow icon="📱" label="Version" value="1.0.0" colors={colors} fs={fs} />
          </GroupContainer>
        </View>

        {/* Accessibility */}
        <SectionHeader title="Accessibility" colors={colors} fs={fs} />
        <GroupContainer colors={colors}>
          <SettingsRow icon="🔤" label="Large text" toggle={{ value: largeText, onValueChange: setLargeText }} colors={colors} fs={fs} />
          <GroupSeparator colors={colors} />
          <SettingsRow icon="📳" label="Haptic feedback" toggle={{ value: hapticFeedback, onValueChange: setHapticFeedback }} colors={colors} fs={fs} />
          <GroupSeparator colors={colors} />
          <SettingsRow icon="🎞️" label="Reduced motion" toggle={{ value: reducedMotion, onValueChange: setReducedMotion }} colors={colors} fs={fs} />
        </GroupContainer>

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <EditNameModal visible={nameModalVisible} currentName={displayName} onSave={setDisplayName} onClose={() => setNameModalVisible(false)} colors={colors} fs={fs} />
    </View>
  );
}
