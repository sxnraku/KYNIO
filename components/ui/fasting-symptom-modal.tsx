import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import { saveFastingSymptomRecord } from '@/services/dbService';
import {
  SYMPTOM_DEFINITIONS,
  type SymptomDefinition,
} from '@/services/fastingSymptomsService';
import { translateText } from '@/services/i18n';
import { useAppPreferencesStore } from '@/store/app-preferences-store';

interface FastingSymptomModalProps {
  currentPhaseIndex: number;
  fastId?: number | null;
  onClose: () => void;
  onSaved?: () => void;
  visible: boolean;
}

export function FastingSymptomModal({
  currentPhaseIndex,
  fastId,
  onClose,
  onSaved,
  visible,
}: FastingSymptomModalProps) {
  const language = useAppPreferencesStore((state) => state.language);
  const [selectedKey, setSelectedKey] = useState<string>('hunger_peak');
  const [intensity, setIntensity] = useState<number>(2);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const symptomList = Object.values(SYMPTOM_DEFINITIONS);
  const currentSymptom: SymptomDefinition =
    SYMPTOM_DEFINITIONS[selectedKey] ?? symptomList[0];

  const handleSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      await saveFastingSymptomRecord({
        fastId: fastId ?? null,
        intensity,
        phaseIndex: currentPhaseIndex,
        symptomKey: selectedKey,
        timestamp: Date.now(),
      });

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onSaved?.();
        onClose();
      }, 700);
    } catch {
      // Ignorar erro não crítico
    } finally {
      setIsSaving(false);
    }
  };

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
                  {language === 'en' ? 'Biology & Body' : 'Corpo & Biologia'}
                </Text>
                <Text className="mt-0.5 font-headline text-xl text-foreground">
                  {language === 'en' ? 'How are you feeling?' : 'Como te sentes agora?'}
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

            {/* Grelha Compacta de Sintomas / Sensações */}
            <View className="mt-3.5 flex-row flex-wrap gap-2">
              {symptomList.map((sym) => {
                const isSelected = sym.key === selectedKey;
                return (
                  <Pressable
                    key={sym.key}
                    accessibilityRole="button"
                    className={`flex-row items-center rounded-xl border px-3 py-2 ${
                      isSelected
                        ? 'border-success bg-success/15'
                        : 'border-border bg-background'
                    }`}
                    onPress={() => setSelectedKey(sym.key)}
                  >
                    <Ionicons
                      color={isSelected ? COLORS.success : COLORS.muted}
                      name={sym.icon as any}
                      size={15}
                    />
                    <Text
                      className={`ml-1.5 font-label text-[11px] uppercase tracking-wider ${
                        isSelected
                          ? 'font-bold text-success'
                          : 'text-foreground'
                      }`}
                    >
                      {sym.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Cartão de Explicação Biológica Neutra */}
            <View className="mt-3 rounded-xl border border-border bg-background p-3">
              <View className="flex-row items-center">
                <Ionicons color={COLORS.success} name="information-circle" size={16} />
                <Text className="ml-1.5 font-label text-[10px] uppercase tracking-wider text-success font-bold">
                  {language === 'en' ? 'Biological Context' : 'Contexto Biológico'}
                </Text>
              </View>
              <Text className="mt-1 font-body text-xs leading-relaxed text-muted">
                {currentSymptom.description}
              </Text>
            </View>

            {/* Seletor de Intensidade (1 a 3) */}
            <View className="mt-3 flex-row items-center justify-between">
              <Text className="font-label text-[10px] uppercase tracking-wider text-muted">
                {language === 'en' ? 'Intensity' : 'Intensidade'}
              </Text>
              <View className="flex-row gap-1.5">
                {[
                  { label: language === 'en' ? 'Light' : 'Leve', value: 1 },
                  { label: language === 'en' ? 'Moderate' : 'Moderado', value: 2 },
                  { label: language === 'en' ? 'Intense' : 'Intenso', value: 3 },
                ].map((item) => (
                  <Pressable
                    key={item.value}
                    accessibilityRole="button"
                    className={`rounded-lg border px-2.5 py-1 ${
                      intensity === item.value
                        ? 'border-success bg-success/20'
                        : 'border-border bg-background'
                    }`}
                    onPress={() => setIntensity(item.value)}
                  >
                    <Text
                      className={`font-label text-[10px] uppercase tracking-wider ${
                        intensity === item.value
                          ? 'font-bold text-success'
                          : 'text-muted'
                      }`}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Botão de Gravação */}
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
                ) : savedSuccess ? (
                  <>
                    <Ionicons color="#3A2200" name="checkmark-circle" size={16} />
                    <Text className="ml-1.5 font-headline text-xs font-bold text-[#3A2200]">
                      {language === 'en' ? 'Recorded!' : 'Registado!'}
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons color="#3A2200" name="checkmark" size={16} />
                    <Text className="ml-1.5 font-headline text-xs font-bold text-[#3A2200]">
                      {language === 'en' ? 'Save Feeling' : 'Registar Sensação'}
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
