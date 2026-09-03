import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import type { FastRecord } from '@/db/schema';
import { updateFastRecord } from '@/services/dbService';
import {
  formatFastingStartDate,
  formatFastingStartDateEntry,
  formatFastingStartTime,
  formatFastingStartTimeEntry,
  parseFastingStartDateTime,
} from '@/services/fastingStartService';
import { translateText } from '@/services/i18n';
import { useAppPreferencesStore } from '@/store/app-preferences-store';

interface FastingEditModalProps {
  fast: FastRecord | null;
  onClose: () => void;
  onSaved: () => void;
  visible: boolean;
}

function formatDuration(ms: number): string {
  const totalMinutes = Math.max(1, Math.floor(ms / (1000 * 60)));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

export function FastingEditModal({
  fast,
  onClose,
  onSaved,
  visible,
}: FastingEditModalProps) {
  const language = useAppPreferencesStore((state) => state.language);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (fast) {
      setStartDate(formatFastingStartDate(fast.startTime));
      setStartTime(formatFastingStartTime(fast.startTime));
      setEndDate(formatFastingStartDate(fast.endTime));
      setEndTime(formatFastingStartTime(fast.endTime));
      setErrorMessage(null);
    }
  }, [fast]);

  const parsedDuration = useMemo(() => {
    const startResult = parseFastingStartDateTime(startDate, startTime);
    const endResult = parseFastingStartDateTime(endDate, endTime);

    if (!startResult.error && !endResult.error) {
      const durationMs = endResult.timestamp - startResult.timestamp;
      return durationMs > 0 ? durationMs : null;
    }

    return null;
  }, [startDate, startTime, endDate, endTime]);

  if (!fast || !visible) {
    return null;
  }

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    const startResult = parseFastingStartDateTime(startDate, startTime);
    if (startResult.error) {
      setErrorMessage(
        language === 'en'
          ? 'Invalid start date or time.'
          : 'Data ou hora de início inválida.',
      );
      return;
    }

    const endResult = parseFastingStartDateTime(endDate, endTime);
    if (endResult.error) {
      setErrorMessage(
        language === 'en'
          ? 'Invalid end date or time.'
          : 'Data ou hora de fim inválida.',
      );
      return;
    }

    if (endResult.timestamp <= startResult.timestamp) {
      setErrorMessage(
        translateText(
          'A hora de fim deve ser posterior à hora de início.',
          language,
        ),
      );
      return;
    }

    if (endResult.timestamp > Date.now() + 60 * 1000) {
      setErrorMessage(
        language === 'en'
          ? 'End time cannot be in the future.'
          : 'A hora de fim não pode estar no futuro.',
      );
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      await updateFastRecord({
        endTime: endResult.timestamp,
        id: fast.id,
        startTime: startResult.timestamp,
        targetHours: fast.targetHours,
      });

      onSaved();
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : translateText('Não foi possível guardar as alterações.', language),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const isTargetAchieved =
    parsedDuration !== null && fast.targetHours > 0
      ? parsedDuration >= fast.targetHours * 60 * 60 * 1000
      : false;

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/70"
      >
        <Pressable
          accessibilityLabel={translateText('Fechar', language)}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView edges={['bottom']}>
          <View
            className="rounded-t-[28px] border border-border bg-surface px-5 pb-6 pt-3"
            style={{ alignSelf: 'center', maxWidth: 520, width: '100%' }}
          >
            {/* Pega / Handle */}
            <View className="mb-3 h-1 w-10 self-center rounded-full bg-border" />

            {/* Cabeçalho */}
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-2">
                <Text className="font-label text-[10px] uppercase tracking-widest text-success">
                  {language === 'en' ? 'History' : 'Histórico'}
                </Text>
                <Text className="mt-0.5 font-headline text-xl text-foreground">
                  {translateText('Editar Jejum', language)}
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

            {/* Duração calculada em linha compacta */}
            <View className="mt-3.5 flex-row items-center justify-between rounded-xl border border-border bg-background px-3.5 py-2.5">
              <View>
                <Text className="font-label text-[10px] uppercase tracking-wider text-muted">
                  {translateText('Duração ajustada', language)}
                </Text>
                <Text className="mt-0.5 font-headline text-xl text-foreground">
                  {parsedDuration !== null
                    ? formatDuration(parsedDuration)
                    : '—'}
                </Text>
              </View>

              {parsedDuration !== null ? (
                <View className="items-end">
                  <View
                    className={`rounded-md px-2 py-0.5 border ${
                      isTargetAchieved
                        ? 'border-success/30 bg-success/15'
                        : 'border-[#F59E0B]/30 bg-[#F59E0B]/15'
                    }`}
                  >
                    <Text
                      className={`font-label text-[9px] uppercase tracking-wider font-bold ${
                        isTargetAchieved ? 'text-success' : 'text-[#FBBF24]'
                      }`}
                    >
                      {isTargetAchieved
                        ? language === 'en'
                          ? 'Goal met'
                          : 'Meta atingida'
                        : language === 'en'
                          ? 'Below goal'
                          : 'Abaixo da meta'}
                    </Text>
                  </View>
                  {fast.targetHours > 0 ? (
                    <Text className="mt-0.5 font-body text-[10px] text-muted">
                      {language === 'en' ? 'Target:' : 'Meta:'} {fast.targetHours}h
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>

            {/* Início do Jejum */}
            <View className="mt-3">
              <Text className="mb-1 font-headline text-[10px] uppercase tracking-[1.5px] text-muted">
                {language === 'en' ? 'Start of Fast' : 'Início do Jejum'}
              </Text>
              <View className="flex-row gap-2.5">
                <View className="flex-[1.2]">
                  <TextInput
                    accessibilityLabel="Data de início"
                    autoCorrect={false}
                    className="h-11 rounded-xl border border-border bg-background px-3 font-body text-sm text-foreground"
                    keyboardType="number-pad"
                    maxLength={10}
                    onChangeText={(value) => {
                      setStartDate(formatFastingStartDateEntry(value));
                      setErrorMessage(null);
                    }}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor={COLORS.muted}
                    value={startDate}
                  />
                </View>
                <View className="flex-1">
                  <TextInput
                    accessibilityLabel="Hora de início"
                    autoCorrect={false}
                    className="h-11 rounded-xl border border-border bg-background px-3 font-body text-sm text-foreground"
                    keyboardType="number-pad"
                    maxLength={5}
                    onChangeText={(value) => {
                      setStartTime(formatFastingStartTimeEntry(value));
                      setErrorMessage(null);
                    }}
                    placeholder="HH:MM"
                    placeholderTextColor={COLORS.muted}
                    value={startTime}
                  />
                </View>
              </View>
            </View>

            {/* Fim do Jejum */}
            <View className="mt-2.5">
              <Text className="mb-1 font-headline text-[10px] uppercase tracking-[1.5px] text-muted">
                {language === 'en' ? 'End of Fast' : 'Fim do Jejum'}
              </Text>
              <View className="flex-row gap-2.5">
                <View className="flex-[1.2]">
                  <TextInput
                    accessibilityLabel="Data de fim"
                    autoCorrect={false}
                    className="h-11 rounded-xl border border-border bg-background px-3 font-body text-sm text-foreground"
                    keyboardType="number-pad"
                    maxLength={10}
                    onChangeText={(value) => {
                      setEndDate(formatFastingStartDateEntry(value));
                      setErrorMessage(null);
                    }}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor={COLORS.muted}
                    value={endDate}
                  />
                </View>
                <View className="flex-1">
                  <TextInput
                    accessibilityLabel="Hora de fim"
                    autoCorrect={false}
                    className="h-11 rounded-xl border border-border bg-background px-3 font-body text-sm text-foreground"
                    keyboardType="number-pad"
                    maxLength={5}
                    onChangeText={(value) => {
                      setEndTime(formatFastingStartTimeEntry(value));
                      setErrorMessage(null);
                    }}
                    placeholder="HH:MM"
                    placeholderTextColor={COLORS.muted}
                    value={endTime}
                  />
                </View>
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

            {/* Botões de Ação */}
            <View className="mt-4 flex-row gap-2.5">
              <Pressable
                accessibilityRole="button"
                className="flex-1 h-11 items-center justify-center rounded-xl border border-border bg-background active:opacity-70"
                onPress={onClose}
              >
                <Text className="font-headline text-xs text-muted">
                  {language === 'en' ? 'Cancel' : 'Cancelar'}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                className="flex-[2] h-11 flex-row items-center justify-center rounded-xl bg-success px-4 active:opacity-80 disabled:opacity-50"
                disabled={isSaving}
                onPress={() => void handleSave()}
              >
                {isSaving ? (
                  <ActivityIndicator color="#3A2200" size="small" />
                ) : (
                  <>
                    <Ionicons color="#3A2200" name="checkmark" size={16} />
                    <Text className="ml-1.5 font-headline text-xs font-bold text-[#3A2200]">
                      {translateText('Guardar alterações', language)}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
