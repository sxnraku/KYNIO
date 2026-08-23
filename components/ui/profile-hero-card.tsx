import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Image, Pressable, Text, TextInput, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { COLORS } from '@/constants/colors';

interface ProfileHeroCardProps {
  avatarUri: string | null;
  bio: string;
  displayName: string;
  isSaving: boolean;
  onChangeBio: (value: string) => void;
  onChangeDisplayName: (value: string) => void;
  onPickAvatar: () => void;
  onRemoveAvatar: () => void;
  onSave: () => void;
}

function getInitial(displayName: string): string {
  return displayName.trim().charAt(0).toLocaleUpperCase('pt-PT') || 'K';
}

export function ProfileHeroCard({
  avatarUri,
  bio,
  displayName,
  isSaving,
  onChangeBio,
  onChangeDisplayName,
  onPickAvatar,
  onRemoveAvatar,
  onSave,
}: ProfileHeroCardProps) {
  return (
    <Card>
      <View className="items-center">
        <View>
          {avatarUri ? (
            <Image
              accessibilityLabel="Fotografia de perfil"
              resizeMode="cover"
              source={{ uri: avatarUri }}
              style={{ borderRadius: 32, height: 96, width: 96 }}
            />
          ) : (
            <View
              className="items-center justify-center bg-success"
              style={{ borderRadius: 32, height: 96, width: 96 }}>
              <Text className="font-headline text-4xl text-background">
                {getInitial(displayName)}
              </Text>
            </View>
          )}

          <Pressable
            accessibilityLabel="Escolher fotografia de perfil"
            accessibilityRole="button"
            className="absolute -bottom-1 -right-1 h-10 w-10 items-center justify-center rounded-full border-4 border-surface bg-foreground active:opacity-80"
            onPress={onPickAvatar}>
            <Ionicons color={COLORS.surface} name="camera" size={18} />
          </Pressable>
        </View>

        <View className="mt-4 flex-row items-center gap-2 rounded-full bg-success/10 px-3 py-2">
          <Ionicons color={COLORS.success} name="phone-portrait-outline" size={14} />
          <Text className="font-label text-[9px] uppercase text-success">Perfil local privado</Text>
        </View>

        {avatarUri ? (
          <Pressable
            accessibilityRole="button"
            className="mt-3 px-3 py-1 active:opacity-60"
            onPress={onRemoveAvatar}>
            <Text className="font-body text-xs text-muted">Remover fotografia</Text>
          </Pressable>
        ) : null}
      </View>

      <Text className="mb-2 mt-6 font-label text-[10px] uppercase tracking-widest text-muted">
        Nome
      </Text>
      <TextInput
        accessibilityLabel="Nome do perfil"
        className="min-h-12 rounded-xl border border-border bg-background px-4 py-3 font-body text-base text-foreground"
        maxLength={40}
        onChangeText={onChangeDisplayName}
        placeholder="Como queres aparecer?"
        placeholderTextColor={COLORS.muted}
        value={displayName}
      />

      <View className="mb-2 mt-5 flex-row items-end justify-between">
        <Text className="font-label text-[10px] uppercase tracking-widest text-muted">Bio</Text>
        <Text className="font-body text-[10px] text-muted">{bio.length}/160</Text>
      </View>
      <TextInput
        accessibilityLabel="Biografia do perfil"
        className="rounded-xl border border-border bg-background px-4 py-3 font-body text-sm leading-5 text-foreground"
        maxLength={160}
        multiline
        onChangeText={onChangeBio}
        placeholder="Uma frase sobre o teu ritmo, objetivos ou motivação."
        placeholderTextColor={COLORS.muted}
        style={{ minHeight: 96 }}
        textAlignVertical="top"
        value={bio}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isSaving }}
        className="mt-5 min-h-14 flex-row items-center justify-center gap-2 rounded-xl bg-foreground px-4 active:opacity-80 disabled:opacity-60"
        disabled={isSaving}
        onPress={onSave}>
        {isSaving ? (
          <ActivityIndicator color={COLORS.surface} size="small" />
        ) : (
          <Ionicons color={COLORS.surface} name="checkmark" size={19} />
        )}
        <Text className="font-headline text-sm text-surface">
          {isSaving ? 'A guardar…' : 'Guardar perfil'}
        </Text>
      </Pressable>
    </Card>
  );
}
