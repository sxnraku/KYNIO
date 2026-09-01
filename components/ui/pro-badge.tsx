import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/text";
import { COLORS, successWithAlpha } from "@/constants/colors";



interface ProBadgeProps {
  size?: "small" | "medium";
}

export function ProBadge({ size = "small" }: ProBadgeProps) {
  const isSmall = size === "small";

  return (
    <View
      style={[
        styles.badge,
        { borderColor: COLORS.success },
        isSmall ? styles.badgeSmall : styles.badgeMedium,
      ]}
    >
      <AppText
        style={[
          styles.badgeText,
          { color: COLORS.success },
          isSmall ? styles.textSmall : styles.textMedium,
        ]}
      >
        ✦ PRO
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: successWithAlpha(0.15),
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeMedium: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  textSmall: {
    fontSize: 10,
  },
  textMedium: {
    fontSize: 12,
  },
});
