import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, Text, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { COLORS } from '@/constants/colors';

WebBrowser.maybeCompleteAuthSession();

export default function AuthCallbackScreen() {
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
          Esta janela fecha automaticamente quando a conta Google estiver ligada.
        </Text>
      </View>
    </Screen>
  );
}
