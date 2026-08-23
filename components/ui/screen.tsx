import type { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/ui/app-header';
import { COLORS } from '@/constants/colors';

type ScreenProps = PropsWithChildren;

export function Screen({ children }: ScreenProps) {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: COLORS.background }}>
      <AppHeader />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{
          alignItems: 'center',
          paddingBottom: 40,
          paddingHorizontal: 20,
          paddingTop: 20,
        }}
        showsVerticalScrollIndicator={false}>
        <View style={{ maxWidth: 560, width: '100%' }}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
