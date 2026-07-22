import { View } from "react-native";
import type { ViewProps } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padded?: boolean;
}

export function Card({ children, padded = true, className, ...props }: CardProps) {
  return (
    <View
      className={`bg-surface rounded-xl ${padded ? "p-4" : ""} ${className ?? ""}`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      }}
      {...props}
    >
      {children}
    </View>
  );
}
