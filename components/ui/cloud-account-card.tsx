import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";

import { Card } from "@/components/ui/card";
import { PaywallModal } from "@/components/ui/paywall-modal";
import { COLORS } from "@/constants/colors";
import { useCloudAccount } from "@/hooks/use-cloud-account";
import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import { useSubscriptionStore } from "@/store/use-subscription-store";

interface CloudAccountCardProps {
  onLocalDataChanged: () => void | Promise<void>;
}

export function CloudAccountCard({
  onLocalDataChanged,
}: CloudAccountCardProps) {
  const account = useCloudAccount(onLocalDataChanged);
  const language = useAppPreferencesStore((state) => state.language);
  const isPro = useSubscriptionStore((state) => state.isPro);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  return (
    <Card>
      <View className="flex-row items-start gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-success/10">
          <Ionicons color={COLORS.success} name="cloud-outline" size={23} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="font-headline text-lg text-foreground">
            Conta e sincronização
          </Text>
          <Text className="mt-1 font-body text-sm leading-5 text-muted">
            Mantém uma cópia local e sincroniza entre os teus dispositivos
            quando tens internet.
          </Text>
        </View>
      </View>

      {!account.isConfigured ? (
        <View className="mt-5 rounded-xl border border-xp/20 bg-xp/5 p-4">
          <Text className="font-headline text-sm text-foreground">
            Configuração necessária
          </Text>
          <Text className="mt-2 font-body text-xs leading-5 text-muted">
            Adiciona EXPO_PUBLIC_SUPABASE_URL e
            EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ao ficheiro .env.local para
            ativar o login Google.
          </Text>
        </View>
      ) : account.account ? (
        <View className="mt-5">
          <View className="flex-row items-center rounded-xl border border-border bg-background p-4">
            {account.account.avatarUrl ? (
              <Image
                accessibilityLabel={translateText(
                  "Fotografia da conta Google",
                  language,
                )}
                source={{ uri: account.account.avatarUrl }}
                style={{ borderRadius: 18, height: 48, width: 48 }}
              />
            ) : (
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-success">
                <Text className="font-headline text-xl text-background">
                  {account.account.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View className="ml-3 min-w-0 flex-1">
              <Text
                className="font-headline text-base text-foreground"
                numberOfLines={1}
              >
                {account.account.displayName}
              </Text>
              <Text
                className="mt-0.5 font-body text-xs text-muted"
                numberOfLines={1}
              >
                {account.account.email ?? "Conta Google ligada"}
              </Text>
            </View>
            <Ionicons
              color={COLORS.success}
              name="checkmark-circle"
              size={22}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: account.isSyncing }}
            className="mt-4 min-h-12 flex-row items-center justify-center gap-2 rounded-xl bg-success px-4 active:opacity-80 disabled:opacity-60"
            disabled={account.isSyncing}
            onPress={() => void account.syncNow()}
          >
            {account.isSyncing ? (
              <ActivityIndicator color={COLORS.background} size="small" />
            ) : (
              <Ionicons color={COLORS.background} name="sync" size={19} />
            )}
            <Text className="font-headline text-sm text-background">
              {account.isSyncing ? "A sincronizar…" : "Sincronizar agora"}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            className="mt-2 min-h-11 items-center justify-center px-4 active:opacity-60"
            onPress={() => void account.signOut()}
          >
            <Text className="font-body text-sm text-muted">
              Desligar conta Google
            </Text>
          </Pressable>
        </View>
      ) : (
        <View className="mt-5">
          <View className="rounded-xl border border-border bg-background p-4">
            <View className="flex-row items-start gap-2">
              <Ionicons
                color={COLORS.muted}
                name="shield-checkmark-outline"
                size={18}
              />
              <Text className="flex-1 font-body text-xs leading-5 text-muted">
                Ao ligar a conta, nome, email, perfil, peso e registos
                de hábitos são guardados remotamente para sincronização. A
                ligação é opcional e pode ser removida.
              </Text>
            </View>
          </View>

          {isPro ? (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: account.isLoading }}
              className="mt-4 min-h-14 flex-row items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 active:opacity-70 disabled:opacity-60"
              disabled={account.isLoading}
              onPress={() => void account.signIn()}
            >
              {account.isLoading ? (
                <ActivityIndicator color={COLORS.foreground} size="small" />
              ) : (
                <Ionicons color="#4285F4" name="logo-google" size={20} />
              )}
              <Text className="font-headline text-sm text-foreground">
                Continuar com Google
              </Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              className="mt-4 min-h-14 flex-row items-center justify-center gap-3 rounded-xl border border-xp/40 bg-xp/10 px-4 active:opacity-70"
              onPress={() => setIsPaywallOpen(true)}
              testID="cloud-sync-pro-button"
            >
              <Ionicons color={COLORS.xp} name="lock-closed" size={18} />
              <Text className="font-headline text-sm text-foreground">
                Sincronização em nuvem · Sol Pro
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {account.error ? (
        <Text className="mt-4 font-body text-xs leading-5 text-red-500">
          {account.error}
        </Text>
      ) : null}
      {account.message ? (
        <Text className="mt-4 font-body text-xs leading-5 text-success">
          {account.message}
        </Text>
      ) : null}

      <PaywallModal
        onClose={() => setIsPaywallOpen(false)}
        visible={isPaywallOpen}
      />
    </Card>
  );
}
