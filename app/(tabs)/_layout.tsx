import { useState, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  Alert,
} from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FAB } from "@/components/FAB";
import { useTheme } from "@/hooks/useTheme";

// ---------------------------------------------------------------------------
// Quick-add menu items
// ---------------------------------------------------------------------------

interface QuickAddItem {
  label: string;
  icon: string;
  action: string;
}

const QUICK_ADD_ITEMS: QuickAddItem[] = [
  { label: "Add Bill", icon: "💳", action: "bill" },
  { label: "Add Subscription", icon: "🔄", action: "subscription" },
  { label: "Log Paycheck", icon: "💰", action: "paycheck" },
  { label: "New Savings Goal", icon: "🎯", action: "savings" },
  { label: "Log Spending", icon: "📝", action: "spending" },
];

// ---------------------------------------------------------------------------
// Quick-add Modal
// ---------------------------------------------------------------------------

function QuickAddModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { colors, borderRadius } = useTheme();

  const handleAction = useCallback(
    (item: QuickAddItem) => {
      onClose();
      Alert.alert(
        item.label,
        "This will open the full form soon. 🚧",
        [{ text: "Got it" }]
      );
    },
    [onClose]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "flex-end" }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: borderRadius.xl,
            borderTopRightRadius: borderRadius.xl,
            paddingBottom: insets.bottom + 16,
            paddingTop: 24,
            paddingHorizontal: 24,
            shadowColor: colors.shadowColor,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {/* Handle */}
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.border,
              }}
            />
          </View>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: colors.textPrimary,
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            What would you like to add?
          </Text>

          {QUICK_ADD_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.action}
              onPress={() => handleAction(item)}
              activeOpacity={0.7}
              accessibilityLabel={item.label}
              accessibilityRole="button"
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderRadius: borderRadius.sm,
                marginBottom: 8,
                minHeight: 48,
                backgroundColor: colors.surfaceMuted,
              }}
            >
              <Text style={{ fontSize: 24, marginRight: 16 }}>{item.icon}</Text>
              <Text style={{ fontSize: 16, fontWeight: "600", color: colors.textPrimary }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Cancel */}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityLabel="Cancel"
            accessibilityRole="button"
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginTop: 16,
              borderRadius: borderRadius.sm,
              minHeight: 48,
              backgroundColor: colors.surfaceMuted,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.textSecondary }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Tab icon component
// ---------------------------------------------------------------------------

function TabIcon({
  icon,
  focused,
}: {
  icon: string;
  focused: boolean;
}) {
  return (
    <View
      style={{ alignItems: "center", justifyContent: "center", minWidth: 48 }}
      accessibilityLabel={icon}
    >
      <Text
        style={{ fontSize: 24, opacity: focused ? 1 : 0.6 }}
      >
        {icon}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Tabs Layout
// ---------------------------------------------------------------------------

export default function TabsLayout() {
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const { colors, borderRadius } = useTheme();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.borderLight,
            borderTopLeftRadius: borderRadius.xl,
            borderTopRightRadius: borderRadius.xl,
            height: 64,
            paddingBottom: 6,
            paddingTop: 6,
            shadowColor: colors.shadowColor,
            shadowOffset: { width: 0, height: -1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
          },
          tabBarItemStyle: {
            minHeight: 48,
            paddingVertical: 2,
          },
        }}
      >
        <Tabs.Screen
          name="dashboard/index"
          options={{
            title: "Home",
            tabBarLabel: ({ focused }: { focused: boolean }) =>
              focused ? "Home" : "",
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="🏠" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="bills/index"
          options={{
            title: "Bills",
            tabBarLabel: ({ focused }: { focused: boolean }) =>
              focused ? "Bills" : "",
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="💳" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="paychecks/index"
          options={{
            title: "Pay",
            tabBarLabel: ({ focused }: { focused: boolean }) =>
              focused ? "Pay" : "",
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="💰" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="savings/index"
          options={{
            title: "Goals",
            tabBarLabel: ({ focused }: { focused: boolean }) =>
              focused ? "Goals" : "",
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="🎯" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings/index"
          options={{
            title: "Settings",
            tabBarLabel: ({ focused }: { focused: boolean }) =>
              focused ? "Settings" : "",
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="⚙️" focused={focused} />
            ),
          }}
        />
      </Tabs>

      {/* Floating Action Button — positioned above tab bar */}
      <FAB
        onPress={() => setFabMenuOpen(true)}
        style={{ bottom: 80 }}
      />

      {/* Quick-add bottom sheet */}
      <QuickAddModal
        visible={fabMenuOpen}
        onClose={() => setFabMenuOpen(false)}
      />
    </>
  );
}
