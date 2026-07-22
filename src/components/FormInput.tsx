import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  type TextInputProps,
  type KeyboardTypeOptions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { colors, borderRadius, spacing } from "@/constants/theme";

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  icon?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

export function FormInput({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  icon,
  keyboardType,
  secureTextEntry,
  multiline,
  numberOfLines,
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderAnimation = useSharedValue(0);

  const handleFocus = () => {
    setIsFocused(true);
    borderAnimation.value = withTiming(1, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderAnimation.value = withTiming(0, { duration: 200 });
  };

  const borderStyle = useAnimatedStyle(() => {
    const borderColor =
      error
        ? colors.danger
        : borderAnimation.value === 1
          ? colors.primary
          : colors.border;
    return { borderColor };
  });

  return (
    <View className="mb-4">
      {/* Label */}
      <Text className="text-sm font-semibold text-text-secondary mb-2">
        {label}
      </Text>

      {/* Input container */}
      <Animated.View
        className="flex-row items-center bg-surface rounded-xl border px-4"
        style={[
          {
            borderWidth: 2,
            minHeight: spacing.touch,
          },
          borderStyle,
        ]}
      >
        {icon && (
          <Text className="text-lg mr-3">{icon}</Text>
        )}

        <TextInput
          className="flex-1 text-base text-text-primary py-3"
          style={{ minHeight: multiline ? 80 : spacing.touch - 4 }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={colors.primary}
        />

        {/* Clear button */}
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeText("")}
            className="ml-2 items-center justify-center"
            style={{ width: 32, height: 32, borderRadius: 16 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="text-text-muted text-base">✕</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Error text */}
      {error && (
        <Text className="text-sm text-danger mt-1.5 ml-1">{error}</Text>
      )}
    </View>
  );
}
