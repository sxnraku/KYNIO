import React, { useEffect, useState } from "react";
import {
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { AppText } from "@/components/ui/text";
import {
  checkAppVersion,
  FALLBACK_WEB_URL,
  VersionCheckResult,
} from "@/services/versionCheckService";

export function ForceUpdateModal() {
  const [versionResult, setVersionResult] = useState<VersionCheckResult | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    checkAppVersion().then((result) => {
      if (isMounted && (result.status === "FORCE_UPDATE" || result.status === "OPTIONAL_UPDATE")) {
        setVersionResult(result);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!versionResult || (dismissed && !versionResult.isForceUpdate)) {
    return null;
  }

  const handleUpdate = async () => {
    try {
      const canOpen = await Linking.canOpenURL(versionResult.storeUrl);
      if (canOpen) {
        await Linking.openURL(versionResult.storeUrl);
      } else {
        await Linking.openURL(FALLBACK_WEB_URL);
      }
    } catch {
      await Linking.openURL(FALLBACK_WEB_URL);
    }
  };

  const isForce = versionResult.isForceUpdate;

  return (
    <Modal
      animationType="fade"
      transparent
      visible
      onRequestClose={() => {
        if (!isForce) {
          setDismissed(true);
        }
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Top Badge */}
          <View style={styles.iconContainer}>
            <AppText style={styles.iconEmoji}>🚀</AppText>
          </View>

          <View style={[styles.badge, isForce ? styles.badgeForce : styles.badgeOptional]}>
            <AppText style={[styles.badgeText, isForce ? styles.badgeTextForce : styles.badgeTextOptional]}>
              {isForce ? "ATUALIZAÇÃO OBRIGATÓRIA" : "NOVA VERSÃO DISPONÍVEL"}
            </AppText>
          </View>

          {/* Title & Message */}
          <AppText style={styles.title}>{versionResult.title}</AppText>
          <AppText style={styles.message}>{versionResult.message}</AppText>

          {versionResult.latestVersionName ? (
            <View style={styles.versionRow}>
              <AppText style={styles.versionLabel}>Versão instalada:</AppText>
              <AppText style={styles.versionValue}>{versionResult.currentVersionName}</AppText>
              <AppText style={styles.versionArrow}>→</AppText>
              <AppText style={styles.versionLabel}>Nova versão:</AppText>
              <AppText style={styles.versionValueNew}>{versionResult.latestVersionName}</AppText>
            </View>
          ) : null}

          {/* Buttons */}
          <Pressable onPress={handleUpdate} style={styles.primaryButton}>
            <AppText style={styles.primaryButtonText}>Atualizar no Google Play</AppText>
          </Pressable>

          {!isForce ? (
            <Pressable onPress={() => setDismissed(true)} style={styles.secondaryButton}>
              <AppText style={styles.secondaryButtonText}>Lembrar mais tarde</AppText>
            </Pressable>
          ) : (
            <AppText style={styles.footerNote}>
              É necessário atualizar para continuar a utilizar o KYNIO.
            </AppText>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.88)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#18181b",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#27272a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderWidth: 1,
    borderColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  iconEmoji: {
    fontSize: 32,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeForce: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderColor: "#ef4444",
    borderWidth: 1,
  },
  badgeOptional: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "#10B981",
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  badgeTextForce: {
    color: "#f87171",
  },
  badgeTextOptional: {
    color: "#10B981",
  },
  title: {
    color: "#f4f4f5",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    color: "#a1a1aa",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  versionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#121214",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  versionLabel: {
    color: "#71717a",
    fontSize: 11,
  },
  versionValue: {
    color: "#a1a1aa",
    fontSize: 11,
    fontWeight: "700",
  },
  versionArrow: {
    color: "#52525b",
    fontSize: 11,
  },
  versionValueNew: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: "#10B981",
    borderRadius: 16,
    paddingVertical: 15,
    width: "100%",
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#71717a",
    fontSize: 13,
    fontWeight: "600",
  },
  footerNote: {
    color: "#52525b",
    fontSize: 11,
    marginTop: 14,
    textAlign: "center",
  },
});
