import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/text";



interface ProBadgeProps {
  size?: "small" | "medium";
}

export function ProBadge({ size = "small" }: ProBadgeProps) {
  const isSmall = size === "small";

  return (
    <View style={[styles.badge, isSmall ? styles.badgeSmall : styles.badgeMedium]}>
      <AppText style={[styles.badgeText, isSmall ? styles.textSmall : styles.textMedium]}>
        ✦ PRO
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "#10B981",
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
    color: "#10B981",
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

