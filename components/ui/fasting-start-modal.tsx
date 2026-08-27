import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import {
  formatFastingStartDate,
  formatFastingStartDateEntry,
  formatFastingStartTime,
  formatFastingStartTimeEntry,
  parseFastingStartDateTime,
  type FastingStartParseError,
} from '@/services/fastingStartService';

interface FastingStartModalProps {
  initialStartedAt: number | null;
  mode: 'edit' | 'start';
  onClose: () => void;
  onConfirm: (startedAt: number) => boolean;
}

const PRESETS = [
  { hours: 1, label: 'Há 1h' },
  { hours: 2, label: 'Há 2h' },
  { hours: 4, label: 'Há 4h' },
  { hours: 8, label: 'Há 8h' },
] as const;

const ERROR_MESSAGES: Record<FastingStartParseError, string> = {
  future: 'A hora de início não pode estar no futuro.',
  'invalid-date': 'Introduz uma data válida no formato DD/MM/AAAA.',
  'invalid-time': 'Introduz uma hora válida no formato HH:MM.',
};

function getDefaultTimestamp({
  initialStartedAt,
  mode,
  openedAt,
}: Pick<FastingStartModalProps, 'initialStartedAt' | 'mode'> & {
  openedAt: number;
}): number {
  if (mode === 'edit' && initialStartedAt !== null) {
    return initialStartedAt;
  }

  return openedAt - 60 * 60 * 1000;
}

export function FastingStartModal({
  initialStartedAt,
  mode,
  onClose,
  onConfirm,
}: FastingStartModalProps) {
  const [openedAt] = useState(() => Date.now());
  const [initialTimestamp] = useState(() =>
    getDefaultTimestamp({ initialStartedAt, mode, openedAt }),
  );
  const [dateInput, setDateInput] = useState(() =>
    formatFastingStartDate(initialTimestamp),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeInput, setTimeInput] = useState(() =>
    formatFastingStartTime(initialTimestamp),
  );

  const applyPreset = (hoursAgo: number) => {
    const timestamp = openedAt - hoursAgo * 60 * 60 * 1000;
    setDateInput(formatFastingStartDate(timestamp));
    setTimeInput(formatFastingStartTime(timestamp));
    setErrorMessage(null);
  };

  const confirmStart = () => {
    const result = parseFastingStartDateTime(dateInput, timeInput);

    if (result.error) {
      setErrorMessage(ERROR_MESSAGES[result.error]);
      return;
    }

    if (!onConfirm(result.timestamp)) {
      setErrorMessage('Não foi possível guardar esta hora de início.');
      return;
    }

    onClose();
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/70"
      >
        <Pressable
          accessibilityLabel="Fechar seleção da hora de início"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView edges={['bottom']}>
          <View
            className="max-h-[92%] rounded-t-[32px] border border-border bg-surface"
            style={{ alignSelf: 'center', maxWidth: 560, width: '100%' }}
          >
            <ScrollView
              contentContainerClassName="px-5 pb-5 pt-3"
              keyboardShouldPersistTaps="handled"
            >
              <View className="mb-4 h-1 w-10 self-center rounded-full bg-border" />
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-4">
                  <Text className="font-headline text-2xl text-foreground">
                    {mode === 'edit' ? 'Editar início' : 'Quando começaste?'}
                  </Text>
                  <Text className="mt-1 font-body text-sm leading-5 text-muted">
                    Indica a hora real para recuperar o tempo já decorrido.
                  </Text>
                </View>
                <Pressable
                  accessibilityLabel="Fechar"
                  className="h-9 w-9 items-center justify-center rounded-full bg-background"
                  onPress={onClose}
                >
                  <Ionicons color={COLORS.muted} name="close" size={20} />
                </Pressable>
              </View>

              <Text className="mb-2 mt-6 font-headline text-xs uppercase tracking-[1.5px] text-muted">
                Atalhos
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <Pressable
                    accessibilityRole="button"
                    className="min-h-11 items-center justify-center rounded-full border border-border bg-surface-raised px-4 active:opacity-70"
                    key={preset.hours}
                    onPress={() => applyPreset(preset.hours)}
                  >
                    <Text className="font-headline text-sm text-foreground">
                      {preset.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View className="mt-5 flex-row gap-3">
                <View className="flex-[1.25]">
                  <Text className="mb-2 font-headline text-xs uppercase tracking-[1.5px] text-muted">
                    Data
                  </Text>
                  <TextInput
                    accessibilityLabel="Data de início do jejum"
                    autoCorrect={false}
                    className="min-h-14 rounded-2xl border border-border bg-background px-4 font-body text-base text-foreground"
                    keyboardType="number-pad"
                    maxLength={10}
                    onChangeText={(value) => {
                      setDateInput(formatFastingStartDateEntry(value));
                      setErrorMessage(null);
                    }}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor={COLORS.muted}
                    testID="fasting-start-date-input"
                    value={dateInput}
                  />
                </View>
                <View className="flex-1">
                  <Text className="mb-2 font-headline text-xs uppercase tracking-[1.5px] text-muted">
                    Hora
                  </Text>
                  <TextInput
                    accessibilityLabel="Hora de início do jejum"
                    autoCorrect={false}
                    className="min-h-14 rounded-2xl border border-border bg-background px-4 font-body text-base text-foreground"
                    keyboardType="number-pad"
                    maxLength={5}
                    onChangeText={(value) => {
                      setTimeInput(formatFastingStartTimeEntry(value));
                      setErrorMessage(null);
                    }}
                    placeholder="HH:MM"
                    placeholderTextColor={COLORS.muted}
                    testID="fasting-start-time-input"
                    value={timeInput}
                  />
                </View>
              </View>

              {errorMessage ? (
                <View className="mt-3 rounded-2xl border border-[#FB7185]/35 bg-[#FB7185]/10 px-4 py-3">
                  <Text className="font-body text-sm text-[#FB7185]">
                    {errorMessage}
                  </Text>
                </View>
              ) : null}

              <View className="mt-5 flex-row items-start rounded-2xl bg-background px-4 py-3">
                <Ionicons
                  color={COLORS.success}
                  name="time-outline"
                  size={18}
                />
                <Text className="ml-2 flex-1 font-body text-xs leading-5 text-muted">
                  O relógio usa esta data guardada no dispositivo e continua a
                  contar mesmo com a app fechada.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                className="mt-5 min-h-14 flex-row items-center justify-center rounded-2xl bg-success px-5 active:opacity-80"
                onPress={confirmStart}
                testID="confirm-fasting-start-button"
              >
                <Ionicons color="#002113" name="checkmark" size={20} />
                <Text className="ml-2 font-headline text-base text-[#002113]">
                  {mode === 'edit' ? 'Guardar alteração' : 'Iniciar deste momento'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
