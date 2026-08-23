import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { COLORS } from '@/constants/colors';
import { useUserProgress } from '@/hooks/use-user-progress';
import { formatLevelLabel } from '@/services/progress';

export function AppHeader() {
  const progress = useUserProgress();
  const router = useRouter();

  return (
    <View className="bg-background px-5 pb-3 pt-3">
      <View
        className="min-h-12 flex-row items-center justify-between"
        style={{ alignSelf: 'center', maxWidth: 560, width: '100%' }}>
        <View className="min-w-0 flex-1 flex-row items-center">
          <View className="h-11 w-11 items-center justify-center rounded-2xl border border-success/20 bg-success/10">
            <Ionicons color={COLORS.success} name="sparkles" size={21} />
          </View>
          <View className="ml-3 min-w-0 flex-1">
            <Text className="font-headline text-xl leading-6 text-foreground">KYNIO</Text>
            <Text className="mt-0.5 font-body text-xs text-muted">{formatLevelLabel(progress)}</Text>
            <View
              accessibilityLabel={`${progress.currentXp} de ${progress.targetXp} XP neste nível`}
              accessibilityRole="progressbar"
              accessibilityValue={{
                max: progress.targetXp,
                min: 0,
                now: progress.currentXp,
              }}
              className="mt-1.5 h-1 w-24 overflow-hidden rounded-full bg-border">
              <View
                className="h-full rounded-full bg-xp"
                style={{ width: `${progress.progress * 100}%` }}
              />
            </View>
          </View>
        </View>

        <Pressable
          accessibilityLabel="Abrir definições de privacidade"
          accessibilityRole="button"
          className="ml-3 h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface active:opacity-70"
          hitSlop={8}
          onPress={() => router.push('/settings')}
          testID="privacy-settings-button">
          <Ionicons color={COLORS.foreground} name="shield-checkmark-outline" size={21} />
        </Pressable>
      </View>
    </View>
  );
}
