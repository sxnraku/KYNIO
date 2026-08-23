import { Ionicons } from '@expo/vector-icons';
import { Pressable, Share, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { COLORS } from '@/constants/colors';
import type { GamificationProgressSnapshot } from '@/hooks/use-gamification-progress';

interface ProfileAchievementsCardProps {
  snapshot: GamificationProgressSnapshot | null;
}

export function ProfileAchievementsCard({ snapshot }: ProfileAchievementsCardProps) {
  const unlockedBadges = snapshot?.badges.filter((badge) => badge.unlocked) ?? [];

  const shareAchievements = async () => {
    if (!snapshot) {
      return;
    }

    const badgeText = unlockedBadges.length
      ? unlockedBadges.map((badge) => badge.title).join(', ')
      : 'A minha jornada começou agora';

    await Share.share({
      message: `No KYNIO alcancei o Nível ${snapshot.level} · ${snapshot.levelTitle}. Conquistas: ${badgeText}. A acompanhar hábitos ao meu ritmo.`,
      title: 'As minhas conquistas no KYNIO',
    });
  };

  return (
    <Card>
      <View className="flex-row items-start justify-between gap-4">
        <View className="min-w-0 flex-1">
          <Text className="font-label text-[10px] uppercase tracking-widest text-xp">
            Conquistas
          </Text>
          <Text className="mt-2 font-headline text-xl text-foreground">
            O teu progresso, à tua maneira
          </Text>
        </View>
        <View className="h-11 w-11 items-center justify-center rounded-full bg-xp/10">
          <Ionicons color={COLORS.xp} name="trophy-outline" size={22} />
        </View>
      </View>

      <View className="mt-5 flex-row gap-2">
        <View className="flex-1 rounded-xl bg-background p-3">
          <Text className="font-headline text-xl text-foreground">{snapshot?.level ?? '—'}</Text>
          <Text className="mt-1 font-label text-[9px] uppercase text-muted">Nível</Text>
        </View>
        <View className="flex-1 rounded-xl bg-background p-3">
          <Text className="font-headline text-xl text-foreground">
            {snapshot?.profile.totalXp ?? '—'}
          </Text>
          <Text className="mt-1 font-label text-[9px] uppercase text-muted">XP total</Text>
        </View>
        <View className="flex-1 rounded-xl bg-background p-3">
          <Text className="font-headline text-xl text-foreground">
            {snapshot?.stats.streakDays ?? '—'}
          </Text>
          <Text className="mt-1 font-label text-[9px] uppercase text-muted">Dias</Text>
        </View>
      </View>

      <View className="mt-4 flex-row flex-wrap gap-2">
        {unlockedBadges.length ? (
          unlockedBadges.map((badge) => (
            <View className="rounded-full bg-xp/10 px-3 py-2" key={badge.id}>
              <Text className="font-label text-[9px] text-xp">{badge.title}</Text>
            </View>
          ))
        ) : (
          <Text className="font-body text-xs leading-5 text-muted">
            As insígnias desbloqueadas aparecerão aqui.
          </Text>
        )}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !snapshot }}
        className="mt-5 min-h-12 flex-row items-center justify-center gap-2 rounded-xl bg-xp px-4 active:opacity-80 disabled:opacity-50"
        disabled={!snapshot}
        onPress={() => void shareAchievements()}>
        <Ionicons color={COLORS.surface} name="share-social-outline" size={19} />
        <Text className="font-headline text-sm text-surface">Partilhar conquistas</Text>
      </Pressable>
    </Card>
  );
}
