import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Text, View } from 'react-native';

import { PageTitle } from '@/components/ui/page-title';
import { PrivacyNote } from '@/components/ui/privacy-note';
import { Screen } from '@/components/ui/screen';
import { WorkoutEntryCard } from '@/components/ui/workout-entry-card';
import { WorkoutHistory } from '@/components/ui/workout-history';
import { WorkoutSummaryCard } from '@/components/ui/workout-summary-card';
import { COLORS } from '@/constants/colors';
import { useWorkoutTracker } from '@/hooks/use-workout-tracker';

export default function WorkoutsScreen() {
  const {
    duration,
    effort,
    error,
    isLoading,
    isSaving,
    notes,
    records,
    saveWorkout,
    selectedType,
    setDuration,
    setEffort,
    setNotes,
    setSelectedType,
    success,
    summary,
  } = useWorkoutTracker();

  return (
    <Screen>
      <PageTitle
        description="Regista o movimento que escolheste fazer, ao teu ritmo e sem metas obrigatórias."
        title="Treinos"
      />

      <View className="mt-7">
        <WorkoutSummaryCard records={records} summary={summary} />
      </View>

      {error ? (
        <View
          accessibilityLiveRegion="polite"
          className="mt-4 flex-row items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <Ionicons color="#E11D48" name="alert-circle-outline" size={19} />
          <Text className="flex-1 font-body text-sm leading-5 text-[#BE123C]">{error}</Text>
        </View>
      ) : null}

      {success ? (
        <View
          accessibilityLiveRegion="polite"
          className="mt-4 flex-row items-center gap-2 rounded-xl border border-success/20 bg-success-dark p-4">
          <Ionicons color={COLORS.success} name="checkmark-circle" size={19} />
          <Text className="flex-1 font-headline text-sm text-foreground">{success}</Text>
        </View>
      ) : null}

      <View className="mt-5">
        <WorkoutEntryCard
          duration={duration}
          effort={effort}
          isSaving={isSaving}
          notes={notes}
          onChangeDuration={setDuration}
          onChangeEffort={setEffort}
          onChangeNotes={setNotes}
          onChangeType={setSelectedType}
          onSave={saveWorkout}
          selectedType={selectedType}
        />
      </View>

      <View className="mb-4 mt-8 flex-row items-end justify-between px-1">
        <View>
          <Text className="font-headline text-xl text-foreground">Atividade recente</Text>
          <Text className="mt-1 font-body text-sm text-muted">Guardada apenas neste dispositivo.</Text>
        </View>
        {isLoading ? <ActivityIndicator color={COLORS.success} size="small" /> : null}
      </View>

      <WorkoutHistory records={records} />

      <View className="mt-5 rounded-2xl border border-border bg-surface-raised p-4">
        <Text className="font-headline text-sm text-foreground">Uma ferramenta de registo, não de prescrição</Text>
        <Text className="mt-2 font-body text-xs leading-[18px] text-muted">
          As categorias e o esforço percebido são descritivos. Não constituem aconselhamento médico ou de treino e não substituem orientação profissional adequada ao teu caso.
        </Text>
      </View>

      <PrivacyNote />
    </Screen>
  );
}
