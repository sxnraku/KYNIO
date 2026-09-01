import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";

import { PageTitle } from "@/components/ui/page-title";
import { ProfileAchievementsCard } from "@/components/ui/profile-achievements-card";
import { ProfileHeroCard } from "@/components/ui/profile-hero-card";
import { Screen } from "@/components/ui/screen";
import { COLORS } from "@/constants/colors";
import type { UserProfileRecord } from "@/db/schema";
import { useGamificationProgress } from "@/hooks/use-gamification-progress";
import { useLocalProfile } from "@/hooks/use-local-profile";
import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";

interface ProfileEditorProps {
  isSaving: boolean;
  onPickAvatar: () => void;
  onRemoveAvatar: () => void;
  onSave: (input: { bio: string; displayName: string }) => void;
  profile: UserProfileRecord;
}

function ProfileEditor({
  isSaving,
  onPickAvatar,
  onRemoveAvatar,
  onSave,
  profile,
}: ProfileEditorProps) {
  const [bio, setBio] = useState(profile.bio);
  const [displayName, setDisplayName] = useState(profile.displayName);

  return (
    <ProfileHeroCard
      avatarUri={profile.avatarUri}
      bio={bio}
      displayName={displayName}
      isSaving={isSaving}
      onChangeBio={setBio}
      onChangeDisplayName={setDisplayName}
      onPickAvatar={onPickAvatar}
      onRemoveAvatar={onRemoveAvatar}
      onSave={() => onSave({ bio, displayName })}
    />
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const language = useAppPreferencesStore((state) => state.language);
  const localProfile = useLocalProfile();
  const gamification = useGamificationProgress();

  return (
    <Screen>
      <PageTitle
        action={
          <Pressable
            accessibilityLabel={translateText("Abrir definições", language)}
            accessibilityRole="button"
            className="h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface active:opacity-70"
            onPress={() => router.push("/settings")}
            testID="profile-settings-button"
          >
            <Ionicons
              color={COLORS.foreground}
              name="settings-outline"
              size={23}
            />
          </Pressable>
        }
        description="A tua identidade e progresso pessoal no KYNIO."
        title="Perfil"
      />

      {localProfile.error ? (
        <View className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <Text className="font-body text-sm leading-5 text-red-500">
            {localProfile.error}
          </Text>
        </View>
      ) : null}

      {localProfile.success ? (
        <View className="mt-4 rounded-xl border border-success/20 bg-success/10 p-4">
          <Text className="font-body text-sm leading-5 text-success">
            {localProfile.success}
          </Text>
        </View>
      ) : null}

      {localProfile.isLoading && !localProfile.profile ? (
        <View className="items-center py-20">
          <ActivityIndicator color={COLORS.success} size="large" />
          <Text className="mt-4 font-body text-sm text-muted">
            A preparar o perfil…
          </Text>
        </View>
      ) : null}

      {localProfile.profile ? (
        <View className="mt-4 gap-4">
          <ProfileEditor
            isSaving={localProfile.isSaving}
            key={`${localProfile.profile.id}:${localProfile.profile.profileUpdatedAt}:${localProfile.profile.avatarUri ?? "no-avatar"}`}
            onPickAvatar={() => void localProfile.pickAvatar()}
            onRemoveAvatar={() => void localProfile.removeAvatar()}
            onSave={(input) => void localProfile.saveDetails(input)}
            profile={localProfile.profile}
          />
          <ProfileAchievementsCard snapshot={gamification.snapshot} />
        </View>
      ) : null}
    </Screen>
  );
}

