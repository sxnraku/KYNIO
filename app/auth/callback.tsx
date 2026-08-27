import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";

import { Screen } from "@/components/ui/screen";
import { COLORS } from "@/constants/colors";
import { getCurrentCloudAccount } from "@/services/cloudAuthService";
import { supabase } from "@/services/supabaseClient";

WebBrowser.maybeCompleteAuthSession();

export default function AuthCallbackScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    let isChecking = false;
    let hasFinished = false;

    const completeConnection = async () => {
      if (!isActive || isChecking || hasFinished) {
        return;
      }

      isChecking = true;
      try {
        const account = await getCurrentCloudAccount();

        if (account && isActive) {
          hasFinished = true;
          setError(null);
          router.replace("/profile");
        }
      } catch (caughtError) {
        if (isActive) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Não foi possível concluir a ligação Google.",
          );
        }
      } finally {
        isChecking = false;
      }
    };

    void completeConnection();
    const interval = setInterval(() => void completeConnection(), 500);
    const timeout = setTimeout(() => {
      if (isActive && !hasFinished) {
        setError(
          "A conta pode já estar ligada. Volta ao perfil para confirmar.",
        );
      }
    }, 12_000);
    const authListener = supabase?.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void completeConnection();
      }
    });

    return () => {
      isActive = false;
      clearInterval(interval);
      clearTimeout(timeout);
      authListener?.data.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <Screen>
      <View className="flex-1 items-center justify-center px-6 py-20">
        <View className="h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
          <ActivityIndicator color={COLORS.success} size="large" />
        </View>
        <Text className="mt-5 text-center font-headline text-xl text-foreground">
          A concluir a ligação segura…
        </Text>
        <Text className="mt-2 text-center font-body text-sm leading-5 text-muted">
          Esta janela fecha automaticamente quando a conta Google estiver
          ligada.
        </Text>
        {error ? (
          <View className="mt-5 w-full rounded-2xl border border-border bg-surface p-4">
            <Text className="text-center font-body text-sm leading-5 text-muted">
              {error}
            </Text>
            <Pressable
              accessibilityRole="button"
              className="mt-4 min-h-12 items-center justify-center rounded-xl bg-success px-4 active:opacity-80"
              onPress={() => router.replace("/profile")}
            >
              <Text className="font-headline text-sm text-background">
                Voltar ao perfil
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
