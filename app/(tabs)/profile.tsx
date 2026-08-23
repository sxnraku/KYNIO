import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { FriendsPanel } from '@/components/ui/friends-panel';
import { PageTitle } from '@/components/ui/page-title';
import { ProfileAchievementsCard } from '@/components/ui/profile-achievements-card';
import { ProfileHeroCard } from '@/components/ui/profile-hero-card';
import {
  type ProfileSection,
  ProfileSectionTabs,
} from '@/components/ui/profile-section-tabs';
import { ProfileSettingsPanel } from '@/components/ui/profile-settings-panel';
import { Screen } from '@/components/ui/screen';
import { COLORS } from '@/constants/colors';
import { useGamificationProgress } from '@/hooks/use-gamification-progress';
import { useLocalProfile } from '@/hooks/use-local-profile';

export default function ProfileScreen() {
  const router = useRouter();
  const localProfile = useLocalProfile();
  const gamification = useGamificationProgress();
  const [activeSection, setActiveSection] = useState<ProfileSection>('profile');
  const [bio, setBio] = useState('');
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (localProfile.profile) {
      setBio(localProfile.profile.bio);
      setDisplayName(localProfile.profile.displayName);
    }
  }, [
    localProfile.profile?.bio,
    localProfile.profile?.displayName,
    localProfile.profile?.id,
  ]);

  return (
    <Screen>
      <PageTitle
        description="A tua identidade, círculo e preferências, com controlo claro sobre a sincronização."
        title="Perfil"
      />

      <View className="mt-6">
        <ProfileSectionTabs activeSection={activeSection} onChange={setActiveSection} />
      </View>

      {localProfile.error ? (
        <View className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <Text className="font-body text-sm leading-5 text-red-500">{localProfile.error}</Text>
        </View>
      ) : null}

      {localProfile.success ? (
        <View className="mt-4 rounded-xl border border-success/20 bg-success/10 p-4">
          <Text className="font-body text-sm leading-5 text-success">{localProfile.success}</Text>
        </View>
      ) : null}

      {localProfile.isLoading && !localProfile.profile ? (
        <View className="items-center py-20">
          <ActivityIndicator color={COLORS.success} size="large" />
          <Text className="mt-4 font-body text-sm text-muted">A preparar o perfil…</Text>
        </View>
      ) : null}

      {localProfile.profile && activeSection === 'profile' ? (
        <View className="mt-4 gap-4">
          <ProfileHeroCard
            avatarUri={localProfile.profile.avatarUri}
            bio={bio}
            displayName={displayName}
            isSaving={localProfile.isSaving}
            onChangeBio={setBio}
            onChangeDisplayName={setDisplayName}
            onPickAvatar={() => void localProfile.pickAvatar()}
            onRemoveAvatar={() => void localProfile.removeAvatar()}
            onSave={() => void localProfile.saveDetails({ bio, displayName })}
          />
          <ProfileAchievementsCard snapshot={gamification.snapshot} />
        </View>
      ) : null}

      {activeSection === 'friends' ? (
        <View className="mt-4">
          <FriendsPanel
            friends={localProfile.friends}
            isSaving={localProfile.isSaving}
            onAdd={localProfile.addFriend}
            onRemove={localProfile.removeFriend}
          />
        </View>
      ) : null}

      {activeSection === 'settings' ? (
        <View className="mt-4">
          <ProfileSettingsPanel
            onLocalDataChanged={localProfile.reload}
            onOpenPrivacy={() => router.push('/settings')}
          />
        </View>
      ) : null}
    </Screen>
  );
}
