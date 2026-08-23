import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { COLORS } from '@/constants/colors';

export function PrivacyNote() {
  return (
    <View className="mt-8 items-center">
      <View className="flex-row items-center">
        <Ionicons color={COLORS.muted} name="lock-closed" size={13} />
        <Text className="ml-1.5 font-label text-[10px] text-muted">
          Local por defeito · sincronização opcional
        </Text>
      </View>
      <Text className="mt-2 max-w-xs text-center font-body text-xs leading-4 text-muted opacity-70">
        A cloud só é usada após ligares uma conta. A aplicação não substitui aconselhamento
        profissional.
      </Text>
    </View>
  );
}
