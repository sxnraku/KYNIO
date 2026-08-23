import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { CloudAccountCard } from '@/components/ui/cloud-account-card';
import { COLORS } from '@/constants/colors';

interface ProfileSettingsPanelProps {
  onLocalDataChanged: () => void | Promise<void>;
  onOpenPrivacy: () => void;
}

export function ProfileSettingsPanel({
  onLocalDataChanged,
  onOpenPrivacy,
}: ProfileSettingsPanelProps) {
  return (
    <View className="gap-4">
      <CloudAccountCard onLocalDataChanged={onLocalDataChanged} />

      <Card>
        <Text className="font-label text-[10px] uppercase tracking-widest text-success">
          Privacidade
        </Text>
        <Pressable
          accessibilityRole="button"
          className="mt-4 flex-row items-center rounded-xl border border-border bg-background p-4 active:opacity-70"
          onPress={onOpenPrivacy}>
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-success/10">
            <Ionicons color={COLORS.success} name="shield-checkmark-outline" size={21} />
          </View>
          <View className="ml-3 min-w-0 flex-1">
            <Text className="font-headline text-base text-foreground">Privacidade e dados</Text>
            <Text className="mt-1 font-body text-xs leading-4 text-muted">
              Exportar, eliminar e consultar onde os dados são guardados.
            </Text>
          </View>
          <Ionicons color={COLORS.muted} name="chevron-forward" size={20} />
        </Pressable>
      </Card>

      <View className="rounded-2xl border border-border bg-surface p-5">
        <Text className="font-label text-[10px] uppercase tracking-widest text-xp">Sobre</Text>
        <Text className="mt-3 font-headline text-lg text-foreground">KYNIO 1.0</Text>
        <Text className="mt-2 font-body text-sm leading-6 text-muted">
          Ferramenta de acompanhamento pessoal de estilo de vida e gamificação. Não presta
          aconselhamento médico, nutricional ou de treino.
        </Text>
      </View>
    </View>
  );
}
