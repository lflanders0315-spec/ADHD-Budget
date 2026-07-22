import { useState, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Tabs, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, borderRadius, shadows } from "@/constants/theme";
import { FAB } from "@/components/FAB";

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
  const router = useRouter();

  const handleAction = useCallback(
  (item: QuickAddItem) => {
    onClose();
    if (item.action === "bill") {
      router.push("/bills/add");
    } else if (item.action === "subscription") {
      router.push("/subscriptions/add");
    } else if (item.action === "paycheck") {
      router.push("/paychecks/add");
    } else if (item.action === "savings") {
      router.push("/savings/add");
    } else if (item.action === "spending") {
      router.push("/spending?openLog=true");
    }
  },
  [onClose, router]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/30 justify-end"
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
            ...shadows.lg,
          }}
        >
          {/* Handle */}
          <View className="items-center mb-6">
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.border,
              }}
            />
          </View>

          <Text className="text-xl font-bold text-text-primary mb-6 text-center">
            What would you like to add?
          </Text>

          {QUICK_ADD_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.action}
              onPress={() => handleAction(item)}
              activeOpacity={0.7}
              className="flex-row items-center px-4 py-4 rounded-xl mb-2"
              style={{
                minHeight: 48,
                backgroundColor: colors.surfaceMuted,
              }}
            >
              <Text className="text-2xl mr-4">{item.icon}</Text>
              <Text className="text-base font-semibold text-text-primary">
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Cancel */}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            className="items-center justify-center mt-4 rounded-xl"
            style={{
              minHeight: 48,
              backgroundColor: colors.surfaceMuted,
            }}
          >
            <Text className="text-base font-semibold text-text-secondary">
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
    <View className="items-center justify-center" style={{ minWidth: 48 }}>
      <Text
        className="text-2xl"
        style={{ opacity: focused ? 1 : 0.6 }}
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

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarShowLabel: false,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600" as const,
            marginTop: 2,
          },
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.borderLight,
            borderTopLeftRadius: borderRadius.xl,
            borderTopRightRadius: borderRadius.xl,
            height: 64,
            paddingBottom: 6,
            paddingTop: 6,
            ...shadows.sm,
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
