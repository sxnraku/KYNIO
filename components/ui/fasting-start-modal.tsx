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
import { translateText } from '@/services/i18n';
import {
  formatFastingStartDate,
  formatFastingStartDateEntry,
  formatFastingStartTime,
  formatFastingStartTimeEntry,
  parseFastingStartDateTime,
  type FastingStartParseError,
} from '@/services/fastingStartService';
import { useAppPreferencesStore } from '@/store/app-preferences-store';

interface FastingStartModalProps {
  initialStartedAt: number | null;
  mode: 'edit' | 'start';
  onClose: () => void;
  onConfirm: (startedAt: number) => boolean;
}

const PRESETS = [
  { hours: 1, labelEn: '1h ago', labelPt: 'Há 1h' },
  { hours: 2, labelEn: '2h ago', labelPt: 'Há 2h' },
  { hours: 4, labelEn: '4h ago', labelPt: 'Há 4h' },
  { hours: 8, labelEn: '8h ago', labelPt: 'Há 8h' },
] as const;

const ERROR_MESSAGES: Record<FastingStartParseError, { en: string; pt: string }> = {
  future: {
    en: 'Start time cannot be in the future.',
    pt: 'A hora de início não pode estar no futuro.',
  },
  'invalid-date': {
    en: 'Enter a valid date in DD/MM/YYYY format.',
    pt: 'Introduz uma data válida no formato DD/MM/AAAA.',
  },
  'invalid-time': {
    en: 'Enter a valid time in HH:MM format.',
    pt: 'Introduz uma hora válida no formato HH:MM.',
  },
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
  const language = useAppPreferencesStore((state) => state.language);
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
      setErrorMessage(ERROR_MESSAGES[result.error][language]);
      return;
    }

    if (!onConfirm(result.timestamp)) {
      setErrorMessage(
        language === 'en'
          ? 'Could not save this start time.'
          : 'Não foi possível guardar esta hora de início.',
      );
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
          accessibilityLabel={translateText('Fechar seleção da hora de início', language)}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView edges={['bottom']}>
          <View
            className="rounded-t-[28px] border border-border bg-surface px-5 pb-5 pt-3"
            style={{ alignSelf: 'center', maxWidth: 520, width: '100%' }}
          >
            {/* Pega / Handle */}
            <View className="mb-3 h-1 w-10 self-center rounded-full bg-border" />

            {/* Header */}
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text className="font-headline text-xl text-foreground">
                  {mode === 'edit'
                    ? language === 'en'
                      ? 'Edit Start Time'
                      : 'Editar início'
                    : language === 'en'
                      ? 'When did you start?'
                      : 'Quando começaste?'}
                </Text>
              </View>
              <Pressable
                accessibilityLabel={translateText('Fechar', language)}
                accessibilityRole="button"
                className="h-8 w-8 items-center justify-center rounded-full bg-background active:opacity-60"
                onPress={onClose}
              >
                <Ionicons color={COLORS.muted} name="close" size={18} />
              </Pressable>
            </View>

            {/* Presets */}
            <View className="mt-3">
              <Text className="mb-1.5 font-headline text-[10px] uppercase tracking-[1.5px] text-muted">
                {language === 'en' ? 'Presets' : 'Atalhos'}
              </Text>
              <View className="flex-row gap-2">
                {PRESETS.map((preset) => (
                  <Pressable
                    accessibilityRole="button"
                    className="flex-1 h-9 items-center justify-center rounded-xl border border-border bg-surface-raised active:opacity-70"
                    key={preset.hours}
                    onPress={() => applyPreset(preset.hours)}
                  >
                    <Text className="font-headline text-xs text-foreground">
                      {language === 'en' ? preset.labelEn : preset.labelPt}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Data e Hora */}
            <View className="mt-3 flex-row gap-2.5">
              <View className="flex-[1.2]">
                <Text className="mb-1 font-headline text-[10px] uppercase tracking-[1.5px] text-muted">
                  {language === 'en' ? 'Date' : 'Data'}
                </Text>
                <TextInput
                  accessibilityLabel={translateText('Data de início do jejum', language)}
                  autoCorrect={false}
                  className="h-11 rounded-xl border border-border bg-background px-3 font-body text-sm text-foreground"
                  keyboardType="number-pad"
                  maxLength={10}
                  onChangeText={(value) => {
                    setDateInput(formatFastingStartDateEntry(value));
                    setErrorMessage(null);
                  }}
                  placeholder={language === 'en' ? 'DD/MM/YYYY' : 'DD/MM/AAAA'}
                  placeholderTextColor={COLORS.muted}
                  testID="fasting-start-date-input"
                  value={dateInput}
                />
              </View>
              <View className="flex-1">
                <Text className="mb-1 font-headline text-[10px] uppercase tracking-[1.5px] text-muted">
                  {language === 'en' ? 'Time' : 'Hora'}
                </Text>
                <TextInput
                  accessibilityLabel={translateText('Hora de início do jejum', language)}
                  autoCorrect={false}
                  className="h-11 rounded-xl border border-border bg-background px-3 font-body text-sm text-foreground"
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

            {/* Mensagem de Erro (se houver) */}
            {errorMessage ? (
              <View className="mt-2.5 rounded-xl border border-danger/35 bg-danger/10 px-3 py-2">
                <Text className="font-body text-xs text-danger">
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* Nota informativa sobre o relógio */}
            <View className="mt-3 flex-row items-center rounded-xl bg-background/60 px-3 py-2 border border-border/50">
              <Ionicons color={COLORS.success} name="time-outline" size={15} />
              <Text className="ml-2 flex-1 font-body text-[11px] leading-4 text-muted">
                {language === 'en'
                  ? 'The timer tracks from this time and continues even with the app closed.'
                  : 'O relógio conta a partir desta hora e continua mesmo com a app fechada.'}
              </Text>
            </View>

            {/* Botão de Confirmação */}
            <Pressable
              accessibilityRole="button"
              className="mt-3.5 h-11 flex-row items-center justify-center rounded-xl bg-success px-4 active:opacity-80"
              onPress={confirmStart}
              testID="confirm-fasting-start-button"
            >
              <Ionicons color="#3A2200" name="checkmark" size={18} />
              <Text className="ml-1.5 font-headline text-xs font-bold text-[#3A2200]">
                {mode === 'edit'
                  ? language === 'en'
                    ? 'Save start time'
                    : 'Guardar alteração'
                  : language === 'en'
                    ? 'Start from this time'
                    : 'Iniciar deste momento'}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
