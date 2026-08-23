import { Pressable, Text, View } from 'react-native';

export type ProfileSection = 'profile' | 'friends' | 'settings';

const SECTIONS: Array<{ id: ProfileSection; label: string }> = [
  { id: 'profile', label: 'Perfil' },
  { id: 'friends', label: 'Amigos' },
  { id: 'settings', label: 'Definições' },
];

interface ProfileSectionTabsProps {
  activeSection: ProfileSection;
  onChange: (section: ProfileSection) => void;
}

export function ProfileSectionTabs({ activeSection, onChange }: ProfileSectionTabsProps) {
  return (
    <View className="flex-row rounded-2xl border border-border bg-surface p-1.5">
      {SECTIONS.map((section) => {
        const isActive = activeSection === section.id;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            className={`min-h-11 flex-1 items-center justify-center rounded-xl px-2 active:opacity-70 ${
              isActive ? 'bg-success' : 'bg-transparent'
            }`}
            key={section.id}
            onPress={() => onChange(section.id)}>
            <Text
              className={`font-headline text-xs ${isActive ? 'text-background' : 'text-muted'}`}>
              {section.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
