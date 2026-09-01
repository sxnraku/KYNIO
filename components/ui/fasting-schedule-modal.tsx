import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { COLORS, successWithAlpha } from '@/constants/colors';
import { triggerSuccessFeedback } from '@/services/hapticsService';
import { translateText } from '@/services/i18n';
import {
  FastingScheduleMode,
  PRESET_SCHEDULES,
} from '@/services/fastingScheduleService';
import { scheduleRoutineReminderNotification } from '@/services/fastingNotificationService';
import { useFastingScheduleStore } from '@/store/use-fasting-schedule-store';
import { useAppPreferencesStore } from '@/store/app-preferences-store';

interface FastingScheduleModalProps {
  onClose: () => void;
  visible: boolean;
}

const WEEKDAYS = [
  { id: 1, label: 'S', name: 'Seg', nameEn: 'Mon' },
  { id: 2, label: 'T', name: 'Ter', nameEn: 'Tue' },
  { id: 3, label: 'Q', name: 'Qua', nameEn: 'Wed' },
  { id: 4, label: 'Q', name: 'Qui', nameEn: 'Thu' },
  { id: 5, label: 'S', name: 'Sex', nameEn: 'Fri' },
  { id: 6, label: 'S', name: 'Sáb', nameEn: 'Sat' },
  { id: 0, label: 'D', name: 'Dom', nameEn: 'Sun' },
];

const TARGET_PRESETS = [16, 18, 20, 24, 36, 48];
const REMINDER_PRESETS = [
  { minutes: 0, label: 'Na hora', labelEn: 'On time' },
  { minutes: 15, label: '15 min antes', labelEn: '15m before' },
  { minutes: 30, label: '30 min antes', labelEn: '30m before' },
  { minutes: 60, label: '1h antes', labelEn: '1h before' },
];

export function FastingScheduleModal({ onClose, visible }: FastingScheduleModalProps) {
  const language = useAppPreferencesStore((state) => state.language);
  const isEn = language === 'en';

  const scheduleStore = useFastingScheduleStore();

  const [enabled, setEnabled] = useState(scheduleStore.enabled);
  const [mode, setMode] = useState<FastingScheduleMode>(scheduleStore.mode === 'none' ? 'adf' : scheduleStore.mode);
  const [targetHours, setTargetHours] = useState(scheduleStore.targetHours || 36);
  const [startTime, setStartTime] = useState(scheduleStore.startTime || '20:00');
  const [customDays, setCustomDays] = useState<number[]>(scheduleStore.customDays || [1, 3, 5]);
  const [remindBeforeMinutes, setRemindBeforeMinutes] = useState(scheduleStore.remindBeforeMinutes ?? 15);

  const toggleDay = (dayId: number) => {
    if (customDays.includes(dayId)) {
      if (customDays.length > 1) {
        setCustomDays(customDays.filter((d) => d !== dayId));
      }
    } else {
      setCustomDays([...customDays, dayId]);
    }
  };

  const applyPreset = (preset: typeof PRESET_SCHEDULES[number]) => {
    setMode(preset.mode);
    setTargetHours(preset.targetHours);
    if (!enabled) {
      setEnabled(true);
    }
  };

  const handleSave = () => {
    triggerSuccessFeedback();
    scheduleStore.updateConfig({
      customDays,
      enabled,
      mode: enabled ? mode : 'none',
      remindBeforeMinutes,
      startTime,
      targetHours,
    });

    if (enabled) {
      const nextDate = scheduleStore.getNextFastDate();
      if (nextDate) {
        void scheduleRoutineReminderNotification(nextDate, targetHours, remindBeforeMinutes);
      }
    }

    onClose();
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={styles.backdrop}>
          <SafeAreaView edges={['bottom']} style={styles.safeArea}>
            <View style={styles.sheetContainer}>
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.headerTitle}>
                    {isEn ? 'Fasting Routine' : 'Rotina de Jejum'}
                  </Text>
                  <Text style={styles.headerSubtitle}>
                    {isEn
                      ? 'Automated schedules & ADF reminders'
                      : 'Agendamento automático e lembretes ADF'}
                  </Text>
                </View>
                <Pressable
                  accessibilityLabel={translateText('Fechar', language)}
                  accessibilityRole="button"
                  onPress={onClose}
                  style={styles.closeButton}
                >
                  <Ionicons color={COLORS.muted} name="close" size={20} />
                </Pressable>
              </View>

              <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* Main Toggle Switch */}
                <View style={styles.toggleRow}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={styles.toggleLabel}>
                      {isEn ? 'Enable Automatic Schedule' : 'Ativar Rotina Automática'}
                    </Text>
                    <Text style={styles.toggleDesc}>
                      {isEn
                        ? 'Receive automatic reminders to start and stop fasts.'
                        : 'Recebe lembretes automáticos para começar e terminar.'}
                    </Text>
                  </View>
                  <Switch
                    onValueChange={setEnabled}
                    thumbColor={enabled ? '#FFFFFF' : '#71717A'}
                    trackColor={{ false: '#3A3428', true: COLORS.success }}
                    value={enabled}
                  />
                </View>

                {enabled ? (
                  <>
                    {/* Quick Presets */}
                    <Text style={styles.sectionHeading}>
                      {isEn ? 'Select Routine' : 'Selecionar Rotina'}
                    </Text>
                    <View style={styles.presetsGrid}>
                      {PRESET_SCHEDULES.map((preset) => {
                        const isSelected = mode === preset.mode && targetHours === preset.targetHours;
                        return (
                          <Pressable
                            key={preset.id}
                            onPress={() => applyPreset(preset)}
                            style={[
                              styles.presetCard,
                              isSelected && styles.presetCardActive,
                            ]}
                          >
                            <View style={styles.presetHeader}>
                              <Text
                                style={[
                                  styles.presetLabel,
                                  isSelected && styles.presetLabelActive,
                                ]}
                              >
                                {isEn ? preset.labelEn : preset.label}
                              </Text>
                              {preset.id === 'adf_36' ? (
                                <View style={styles.badgePro}>
                                  <Text style={styles.badgeProText}>ADF</Text>
                                </View>
                              ) : null}
                            </View>
                            <Text style={styles.presetDesc}>
                              {isEn ? preset.descriptionEn : preset.description}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    {/* Custom Weekdays Picker (if custom_days mode) */}
                    {mode === 'custom_days' ? (
                      <View style={styles.customDaysBox}>
                        <Text style={styles.subHeading}>
                          {isEn ? 'Fasting Days' : 'Dias de Jejum'}
                        </Text>
                        <View style={styles.weekdaysRow}>
                          {WEEKDAYS.map((day) => {
                            const isDaySelected = customDays.includes(day.id);
                            return (
                              <Pressable
                                key={day.id}
                                onPress={() => toggleDay(day.id)}
                                style={[
                                  styles.dayButton,
                                  isDaySelected && styles.dayButtonActive,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.dayText,
                                    isDaySelected && styles.dayTextActive,
                                  ]}
                                >
                                  {isEn ? day.nameEn : day.name}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>
                    ) : null}

                    {/* Start Time & Target Duration */}
                    <View style={styles.settingsGrid}>
                      <View style={styles.timeBox}>
                        <Text style={styles.subHeading}>
                          {isEn ? 'Start Time' : 'Hora de Início'}
                        </Text>
                        <TextInput
                          maxLength={5}
                          onChangeText={setStartTime}
                          placeholder="20:00"
                          placeholderTextColor="#71717A"
                          style={styles.timeInput}
                          value={startTime}
                        />
                      </View>

                      <View style={styles.durationBox}>
                        <Text style={styles.subHeading}>
                          {isEn ? 'Target Duration' : 'Duração Alvo'}
                        </Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          style={styles.durationScroll}
                        >
                          {TARGET_PRESETS.map((h) => {
                            const isHSelected = targetHours === h;
                            return (
                              <Pressable
                                key={h}
                                onPress={() => setTargetHours(h)}
                                style={[
                                  styles.hPill,
                                  isHSelected && styles.hPillActive,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.hPillText,
                                    isHSelected && styles.hPillTextActive,
                                  ]}
                                >
                                  {h}h
                                </Text>
                              </Pressable>
                            );
                          })}
                        </ScrollView>
                      </View>
                    </View>

                    {/* Reminder Timing */}
                    <Text style={styles.sectionHeading}>
                      {isEn ? 'Start Reminder' : 'Lembrete de Início'}
                    </Text>
                    <View style={styles.reminderRow}>
                      {REMINDER_PRESETS.map((rem) => {
                        const isRemSelected = remindBeforeMinutes === rem.minutes;
                        return (
                          <Pressable
                            key={rem.minutes}
                            onPress={() => setRemindBeforeMinutes(rem.minutes)}
                            style={[
                              styles.reminderPill,
                              isRemSelected && styles.reminderPillActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.reminderText,
                                isRemSelected && styles.reminderTextActive,
                              ]}
                            >
                              {isEn ? rem.labelEn : rem.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </>
                ) : null}
              </ScrollView>

              {/* Action Button */}
              <View style={styles.footer}>
                <Pressable
                  accessibilityRole="button"
                  onPress={handleSave}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveButtonText}>
                    {isEn ? 'Save Routine' : 'Guardar Rotina'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  badgePro: {
    backgroundColor: successWithAlpha(0.15),
    borderColor: successWithAlpha(0.4),
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeProText: {
    color: COLORS.success,
    fontFamily: 'HankenGrotesk_800ExtraBold',
    fontSize: 10,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#3A3428',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  customDaysBox: {
    backgroundColor: '#211E18',
    borderColor: '#3A3428',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 14,
    padding: 14,
  },
  dayButton: {
    alignItems: 'center',
    backgroundColor: '#2B2620',
    borderColor: '#443D2E',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 38,
  },
  dayButtonActive: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  dayText: {
    color: '#A79D88',
    fontFamily: 'HankenGrotesk_700Bold',
    fontSize: 11,
  },
  dayTextActive: {
    color: '#3A2200',
  },
  durationBox: {
    flex: 1.4,
  },
  durationScroll: {
    flexDirection: 'row',
    marginTop: 6,
  },
  footer: {
    borderTopColor: '#3A3428',
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  hPill: {
    alignItems: 'center',
    backgroundColor: '#211E18',
    borderColor: '#3A3428',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    marginRight: 6,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  hPillActive: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  hPillText: {
    color: '#F1E9D6',
    fontFamily: 'HankenGrotesk_700Bold',
    fontSize: 13,
  },
  hPillTextActive: {
    color: '#3A2200',
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#3A3428',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 14,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  headerSubtitle: {
    color: '#A79D88',
    fontFamily: 'HankenGrotesk_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
  headerTitle: {
    color: '#F1E9D6',
    fontFamily: 'HankenGrotesk_800ExtraBold',
    fontSize: 18,
  },
  keyboardContainer: {
    flex: 1,
  },
  presetCard: {
    backgroundColor: '#211E18',
    borderColor: '#3A3428',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    padding: 14,
  },
  presetCardActive: {
    backgroundColor: successWithAlpha(0.08),
    borderColor: COLORS.success,
  },
  presetDesc: {
    color: '#A79D88',
    fontFamily: 'HankenGrotesk_400Regular',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  presetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetLabel: {
    color: '#F1E9D6',
    fontFamily: 'HankenGrotesk_700Bold',
    fontSize: 14,
  },
  presetLabelActive: {
    color: COLORS.success,
  },
  presetsGrid: {
    marginTop: 8,
  },
  reminderPill: {
    alignItems: 'center',
    backgroundColor: '#211E18',
    borderColor: '#3A3428',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 6,
  },
  reminderPillActive: {
    backgroundColor: successWithAlpha(0.15),
    borderColor: COLORS.success,
  },
  reminderRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  reminderText: {
    color: '#A79D88',
    fontFamily: 'HankenGrotesk_600SemiBold',
    fontSize: 11,
  },
  reminderTextActive: {
    color: COLORS.success,
  },
  safeArea: {
    maxHeight: '90%',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: COLORS.success,
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 50,
  },
  saveButtonText: {
    color: '#3A2200',
    fontFamily: 'HankenGrotesk_800ExtraBold',
    fontSize: 15,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeading: {
    color: '#F1E9D6',
    fontFamily: 'HankenGrotesk_700Bold',
    fontSize: 13,
    marginTop: 18,
    textTransform: 'uppercase',
  },
  settingsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  sheetContainer: {
    backgroundColor: '#0F0F12',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '100%',
  },
  subHeading: {
    color: '#A79D88',
    fontFamily: 'HankenGrotesk_600SemiBold',
    fontSize: 12,
    marginBottom: 4,
  },
  timeBox: {
    flex: 0.9,
  },
  timeInput: {
    backgroundColor: '#211E18',
    borderColor: '#3A3428',
    borderRadius: 12,
    borderWidth: 1,
    color: '#F1E9D6',
    fontFamily: 'HankenGrotesk_700Bold',
    fontSize: 16,
    marginTop: 6,
    minHeight: 46,
    textAlign: 'center',
  },
  toggleDesc: {
    color: '#A79D88',
    fontFamily: 'HankenGrotesk_400Regular',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  toggleLabel: {
    color: '#F1E9D6',
    fontFamily: 'HankenGrotesk_700Bold',
    fontSize: 14,
  },
  toggleRow: {
    alignItems: 'center',
    backgroundColor: '#211E18',
    borderColor: '#3A3428',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  weekdaysRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
});
