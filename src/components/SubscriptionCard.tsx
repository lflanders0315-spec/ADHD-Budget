import { View, Text, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import type { Subscription } from "@/models";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { colors } from "@/constants/theme";

const PROVIDER_LOGOS: Record<string, string> = {
  netflix: "🔴",
  spotify: "🟢",
  "amazon prime": "📦",
  "planet fitness": "🏋️",
  "icloud+": "☁️",
};

function getProviderIcon(provider: string): string {
  const key = provider.toLowerCase();
  return PROVIDER_LOGOS[key] ?? "💳";
}

interface SubscriptionCardProps {
  subscription: Subscription;
  onPress?: (subscription: Subscription) => void;
}

export function SubscriptionCard({ subscription, onPress }: SubscriptionCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const providerIcon = subscription.logo ?? getProviderIcon(subscription.provider);

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={() => onPress?.(subscription)}
        onPressIn={() => {
          scale.value = withSpring(0.97);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        activeOpacity={0.9}
        className="bg-surface rounded-xl mb-3 overflow-hidden"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
          minHeight: 72,
          opacity: subscription.active ? 1 : 0.5,
        }}
      >
        <View className="flex-row items-center p-4">
          {/* Provider icon */}
          <View
            className="items-center justify-center rounded-xl mr-3"
            style={{
              width: 44,
              height: 44,
              backgroundColor: colors.surfaceMuted,
            }}
          >
            <Text style={{ fontSize: 22 }}>{providerIcon}</Text>
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text
                className="text-base font-semibold text-text-primary flex-1 mr-2"
                numberOfLines={1}
              >
                {subscription.name}
              </Text>
              <Text className="text-base font-bold text-text-primary">
                {formatCurrency(subscription.monthlyCost)}
                <Text className="text-xs text-text-muted font-normal">/mo</Text>
              </Text>
            </View>

            <View className="flex-row items-center mt-1">
              <Text className="text-sm text-text-secondary">
                {subscription.provider}
              </Text>
              <Text className="text-sm text-text-muted mx-2">·</Text>
              <Text className="text-sm text-text-secondary">
                Next: {formatDate(subscription.nextBillingDate)}
              </Text>

              {/* Active/inactive indicator */}
              <View className="ml-auto flex-row items-center">
                <View
                  className="w-2 h-2 rounded-full mr-1.5"
                  style={{
                    backgroundColor: subscription.active
                      ? colors.success
                      : colors.textMuted,
                  }}
                />
                <Text className="text-xs text-text-muted">
                  {subscription.active ? "Active" : "Paused"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
