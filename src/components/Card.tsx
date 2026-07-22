import { View } from "react-native";
import type { ViewProps } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padded?: boolean;
}

export function Card({ children, padded = true, style, ...props }: CardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: padded ? 16 : 0,
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
