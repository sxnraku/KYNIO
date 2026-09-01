import type { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { AppHeader } from "@/components/ui/app-header";

type ScreenProps = PropsWithChildren;

export function Screen({ children }: ScreenProps) {
  // Margem inferior para a barra de gestos (iOS/Android) ou os 3 botões
  // do Android: o conteúdo nunca fica por baixo das zonas do sistema.
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <AppHeader />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: 40 + insets.bottom,
          paddingHorizontal: 20,
          paddingTop: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 560, width: "100%" }}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
