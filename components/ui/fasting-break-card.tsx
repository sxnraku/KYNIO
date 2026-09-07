import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { COLORS } from '@/constants/colors';
import { useAppPreferencesStore } from '@/store/app-preferences-store';
import { useFastingStore } from '@/store/useFastingStore';
import type { FastingBreakAnalysis } from '@/types/fasting-break';

interface FastingBreakCardProps {
  analysis: FastingBreakAnalysis;
  onDismiss?: () => void;
}

export function FastingBreakCard({ analysis, onDismiss }: FastingBreakCardProps) {
  const language = useAppPreferencesStore((state) => state.language);
  const isFastingActive = useFastingStore((state) => state.isActive);
  const endFasting = useFastingStore((state) => state.endFasting);
  const isSavingFast = useFastingStore((state) => state.isSaving);
  const [fastEndedSuccess, setFastEndedSuccess] = useState(false);

  const isClean = !analysis.breaksFasting && !analysis.autophagyDisrupted;
  const isAutophagyOnly = !analysis.breaksFasting && analysis.autophagyDisrupted;

  const statusColor = isClean
    ? COLORS.success
    : isAutophagyOnly
    ? COLORS.warning
    : COLORS.danger;

  const verdictTitle =
    language === 'en' ? analysis.verdictTitleEn : analysis.verdictTitle;

  const explanation =
    language === 'en' ? analysis.explanationEn : analysis.explanation;

  return (
    <Card>
      {/* Topo do Cartão com Badge de Veredicto */}
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="font-label text-[10px] uppercase tracking-widest text-muted">
            {language === 'en' ? 'Fast-Break Analysis' : 'Verificador de Jejum'}
          </Text>
          <Text className="mt-1 font-headline text-xl text-foreground" numberOfLines={1}>
            {analysis.productName}
          </Text>
        </View>

        <View
          className="rounded-full px-3 py-1.5"
          style={{ backgroundColor: `${statusColor}1A` }}
        >
          <Text
            className="font-label text-[10px] font-bold uppercase tracking-wider"
            style={{ color: statusColor }}
          >
            {verdictTitle}
          </Text>
        </View>
      </View>

      {/* Três Pilares Metabólicos */}
      <View className="mt-4 flex-row gap-2">
        {/* Cetose */}
        <View className="flex-1 rounded-xl border border-border bg-background p-3">
          <View className="flex-row items-center gap-1.5">
            <Ionicons
              color={analysis.ketoSafe ? COLORS.success : COLORS.danger}
              name={analysis.ketoSafe ? 'flame-outline' : 'alert-circle-outline'}
              size={15}
            />
            <Text className="font-label text-[9px] uppercase tracking-wider text-muted">
              Cetose
            </Text>
          </View>
          <Text
            className="mt-1 font-headline text-xs"
            style={{ color: analysis.ketoSafe ? COLORS.success : COLORS.danger }}
          >
            {analysis.ketoSafe
              ? language === 'en' ? 'Safe' : 'Seguro'
              : language === 'en' ? 'At Risk' : 'Risco'}
          </Text>
        </View>

        {/* Insulina */}
        <View className="flex-1 rounded-xl border border-border bg-background p-3">
          <View className="flex-row items-center gap-1.5">
            <Ionicons
              color={analysis.breaksFasting ? COLORS.danger : COLORS.success}
              name={analysis.breaksFasting ? 'trending-up-outline' : 'pulse-outline'}
              size={15}
            />
            <Text className="font-label text-[9px] uppercase tracking-wider text-muted">
              Insulina
            </Text>
          </View>
          <Text
            className="mt-1 font-headline text-xs"
            style={{ color: analysis.breaksFasting ? COLORS.danger : COLORS.success }}
          >
            {analysis.breaksFasting
              ? language === 'en' ? 'Spiked' : 'Estimulada'
              : language === 'en' ? 'Stable' : 'Estável'}
          </Text>
        </View>

        {/* Autofagia */}
        <View className="flex-1 rounded-xl border border-border bg-background p-3">
          <View className="flex-row items-center gap-1.5">
            <Ionicons
              color={!analysis.autophagyDisrupted ? COLORS.success : COLORS.warning}
              name={!analysis.autophagyDisrupted ? 'shield-checkmark-outline' : 'pause-circle-outline'}
              size={15}
            />
            <Text className="font-label text-[9px] uppercase tracking-wider text-muted">
              Autofagia
            </Text>
          </View>
          <Text
            className="mt-1 font-headline text-xs"
            style={{ color: !analysis.autophagyDisrupted ? COLORS.success : COLORS.warning }}
          >
            {!analysis.autophagyDisrupted
              ? language === 'en' ? 'Active' : 'Ativa'
              : language === 'en' ? 'Paused' : 'Pausada'}
          </Text>
        </View>
      </View>

      {/* Ingredientes Sensíveis Detetados */}
      {analysis.sensitiveIngredients.length > 0 ? (
        <View className="mt-3 flex-row flex-wrap items-center gap-1.5">
          <Text className="font-label text-[10px] uppercase tracking-wider text-muted">
            {language === 'en' ? 'Detected:' : 'Detetado:'}
          </Text>
          {analysis.sensitiveIngredients.map((ingredient, idx) => (
            <View
              className="rounded-full border border-border bg-background px-2.5 py-1"
              key={`${ingredient}-${idx}`}
            >
              <Text className="font-label text-[10px] text-foreground">
                {ingredient}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Explicação e Diagnóstico */}
      <View className="mt-3 rounded-xl border border-border bg-background p-3.5">
        <Text className="font-body text-xs leading-5 text-foreground">
          {explanation}
        </Text>
      </View>

      {/* Ação para encerrar o jejum se estiver ativo e o alimento quebrar o jejum */}
      {isFastingActive && analysis.breaksFasting ? (
        <View className="mt-4 rounded-xl border border-danger/30 bg-danger/10 p-3.5">
          <View className="flex-row items-center gap-2">
            <Ionicons color={COLORS.danger} name="timer-outline" size={17} />
            <Text className="flex-1 font-headline text-xs font-semibold text-danger">
              {language === 'en' ? 'Active Fast in Progress' : 'Jejum em Curso'}
            </Text>
          </View>
          <Text className="mt-1 font-body text-xs leading-4 text-foreground/80">
            {language === 'en'
              ? 'This food breaks your metabolic fast. Would you like to stop and save your fast now?'
              : 'Este alimento quebra o teu jejum. Desejas encerrar o contador e registar o jejum agora?'}
          </Text>
          <Pressable
            accessibilityRole="button"
            className="mt-3 flex-row items-center justify-center gap-2 rounded-xl bg-danger py-2.5 px-4 active:opacity-80"
            disabled={isSavingFast}
            onPress={async () => {
              await endFasting();
              setFastEndedSuccess(true);
            }}
            testID="end-fast-from-break-card-button"
          >
            <Ionicons color="#FFFFFF" name="stop" size={15} />
            <Text className="font-label text-xs font-bold uppercase text-white">
              {isSavingFast
                ? (language === 'en' ? 'Saving fast...' : 'A guardar...')
                : (language === 'en' ? 'End Fast Now' : 'Terminar Jejum Agora')}
            </Text>
          </Pressable>
        </View>
      ) : fastEndedSuccess ? (
        <View className="mt-4 flex-row items-center gap-2 rounded-xl border border-success/30 bg-success/10 p-3">
          <Ionicons color={COLORS.success} name="checkmark-circle-outline" size={17} />
          <Text className="font-body text-xs text-success">
            {language === 'en'
              ? 'Fast stopped and saved to history.'
              : 'Jejum terminado e registado no teu histórico.'}
          </Text>
        </View>
      ) : null}

      {onDismiss ? (
        <Pressable
          accessibilityRole="button"
          className="mt-3 min-h-10 items-center justify-center rounded-xl bg-surfaceRaised active:opacity-70"
          onPress={onDismiss}
        >
          <Text className="font-label text-xs uppercase tracking-wider text-muted">
            {language === 'en' ? 'Close result' : 'Fechar resultado'}
          </Text>
        </Pressable>
      ) : null}
    </Card>
  );
}
