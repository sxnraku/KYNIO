import { forwardRef, useMemo } from "react";
import { Image, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { Text } from "@/components/ui/text";

import { getShareUrlLabel } from "@/services/achievementShareContent";
import {
  ESTIMATED_METABOLIC_PHASES,
  getEstimatedPhaseIndex,
} from "@/services/fasting";
import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import type { CompletedFastSummary } from "@/store/useFastingStore";

interface FastCompletionShareCardProps {
  summary: CompletedFastSummary;
}

const THEMES = {
  dark: {
    amber: "#E8A83E",
    amberSoft: "#E8A83E",
    bg: "#1C1915",
    chipFill: "rgba(232,168,62,0.12)",
    hairline: "rgba(246,240,222,0.18)",
    ink: "#F6F0DE",
    inkMuted: "rgba(246,240,222,0.45)",
    inkSoft: "#EDE6D3",
  },
  light: {
    amber: "#D9922E",
    amberSoft: "#E8A83E",
    bg: "#F6F0DE",
    chipFill: "rgba(217,146,46,0.08)",
    hairline: "rgba(58,58,56,0.18)",
    ink: "#1C1915",
    inkMuted: "rgba(58,58,56,0.45)",
    inkSoft: "#3A3A38",
  },
};

const ARC_WIDTH = 260;
const ARC_HEIGHT = 130;
const RADIUS = 115;
const CENTER_X = ARC_WIDTH / 2;
const CENTER_Y = ARC_HEIGHT;

function formatElapsedParts(elapsedHours: number): {
  hours: number;
  minutes: number;
} {
  const totalMinutes = Math.round(elapsedHours * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes };
}

function formatTimeOnly(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export const FastCompletionShareCard = forwardRef<
  View,
  FastCompletionShareCardProps
>(function FastCompletionShareCard({ summary }, ref) {
  const language = useAppPreferencesStore((state) => state.language);
  const isEn = language === "en";

  const themeMode = useAppPreferencesStore((state) => state.themeMode);
  const theme =
    themeMode === "dark" || themeMode === "amoled" || themeMode === "midnight"
      ? THEMES.dark
      : THEMES.light;

  const { hours, minutes } = formatElapsedParts(summary.elapsedHours);

  // Calcula a fase metabólica máxima alcançada
  const phaseIndex = getEstimatedPhaseIndex(summary.elapsedHours);
  const phase =
    ESTIMATED_METABOLIC_PHASES[phaseIndex] ?? ESTIMATED_METABOLIC_PHASES[0];

  // Ângulo do sol com base no progresso em relação à meta
  const progressRatio = summary.targetHours > 0
    ? Math.min(summary.elapsedHours / summary.targetHours, 1.3)
    : 1;

  const sunPosition = useMemo(() => {
    // 0 -> à esquerda (PI rad), 1 -> topo/direita
    const visualAngle = Math.PI * (1 - Math.min(progressRatio, 1));
    return {
      x: CENTER_X + RADIUS * Math.cos(visualAngle),
      y: CENTER_Y - RADIUS * Math.sin(visualAngle),
    };
  }, [progressRatio]);

  const statDivider = (
    <View
      className="w-px self-stretch"
      style={{ backgroundColor: theme.hairline }}
    />
  );

  return (
    <View
      className="overflow-hidden rounded-3xl border"
      collapsable={false}
      ref={ref}
      style={{
        backgroundColor: theme.bg,
        borderColor: theme.hairline,
      }}
    >
      {/* Header com Ícone Oficial */}
      <View className="items-center pt-7">
        <Image
          accessibilityLabel="KYNIO App Icon"
          className="h-9 w-9 rounded-xl"
          source={require("@/assets/images/icon-kynio-v1.png")}
        />
        <Text
          className="mt-2.5 font-headline text-base"
          style={{ color: theme.ink, letterSpacing: 6 }}
        >
          KYNIO
        </Text>
        <Text
          className="mt-0.5 font-label text-[9px] uppercase"
          style={{ color: theme.amber, letterSpacing: 4 }}
        >
          {isEn ? "FAST COMPLETED" : "JEJUM CONCLUÍDO"}
        </Text>
      </View>

      <View
        className="mx-8 mt-5 h-px"
        style={{ backgroundColor: theme.hairline }}
      />

      {/* Mostrador Circadiano em Arco com Sol */}
      <View className="items-center pt-6">
        <View style={{ height: ARC_HEIGHT + 14, width: ARC_WIDTH }}>
          <Svg height={ARC_HEIGHT + 2} width={ARC_WIDTH}>
            {/* Linha do horizonte */}
            <Line
              stroke={theme.hairline}
              strokeWidth={1}
              x1={10}
              x2={ARC_WIDTH - 10}
              y1={CENTER_Y}
              y2={CENTER_Y}
            />
            {/* Arco Semicircular Tracejado */}
            <Path
              d={`M ${CENTER_X - RADIUS} ${CENTER_Y} A ${RADIUS} ${RADIUS} 0 0 1 ${CENTER_X + RADIUS} ${CENTER_Y}`}
              fill="none"
              stroke={theme.hairline}
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            {/* Arco Preenchido Âmbar até o ponto do Sol */}
            <Path
              d={`M ${CENTER_X - RADIUS} ${CENTER_Y} A ${RADIUS} ${RADIUS} 0 0 1 ${sunPosition.x} ${sunPosition.y}`}
              fill="none"
              stroke={theme.amber}
              strokeWidth={3}
            />
            {/* Halo do Sol */}
            <Circle
              cx={sunPosition.x}
              cy={sunPosition.y}
              fill={theme.chipFill}
              r={14}
            />
            {/* Sol no progresso alcançado */}
            <Circle
              cx={sunPosition.x}
              cy={sunPosition.y}
              fill={theme.amberSoft}
              r={8}
              stroke={theme.bg}
              strokeWidth={3}
            />
          </Svg>
        </View>

        {/* Tempo Total de Jejum em Destaque */}
        <View className="items-center px-6 pt-1">
          <Text
            className="font-headline text-5xl tracking-tight"
            style={{ color: theme.ink }}
          >
            {`${hours}h ${minutes}m`}
          </Text>
          <Text
            className="mt-1 font-label text-[10px] uppercase"
            style={{ color: theme.inkMuted, letterSpacing: 3 }}
          >
            {isEn
              ? `PROTOCOL ${summary.goalLabel}`
              : `PROTOCOLO ${summary.goalLabel}`}
          </Text>
        </View>
      </View>

      <View
        className="mx-8 mt-5 h-px"
        style={{ backgroundColor: theme.hairline }}
      />

      {/* Fase Metabólica Máxima Atingida */}
      <View className="px-6 py-4">
        <View
          className="rounded-2xl border p-3.5"
          style={{
            backgroundColor: theme.chipFill,
            borderColor: theme.hairline,
          }}
        >
          <View className="flex-row items-center gap-2">
            <Text
              className="font-label text-[10px] uppercase"
              style={{ color: theme.amber, letterSpacing: 2 }}
            >
              {isEn ? "PEAK METABOLIC PHASE" : "FASE METABÓLICA MÁXIMA"}
            </Text>
          </View>
          <Text
            className="mt-1 font-headline text-base"
            style={{ color: theme.ink }}
          >
            {translateText(phase.title, language)}
          </Text>
          <Text
            className="mt-0.5 font-body text-xs leading-4"
            style={{ color: theme.inkMuted }}
          >
            {translateText(phase.tip, language)}
          </Text>
        </View>
      </View>

      <View
        className="mx-8 h-px"
        style={{ backgroundColor: theme.hairline }}
      />

      {/* Estatísticas de Instrumento */}
      <View className="flex-row items-stretch px-6 py-4">
        <View className="flex-1 items-center">
          <Text className="font-headline text-xl" style={{ color: theme.ink }}>
            {formatTimeOnly(summary.startTime)}
          </Text>
          <Text
            className="mt-1 font-label text-[8px] uppercase"
            style={{ color: theme.inkMuted, letterSpacing: 2 }}
          >
            {isEn ? "START" : "INÍCIO"}
          </Text>
        </View>
        {statDivider}
        <View className="flex-1 items-center">
          <Text className="font-headline text-xl" style={{ color: theme.ink }}>
            {formatTimeOnly(summary.endTime)}
          </Text>
          <Text
            className="mt-1 font-label text-[8px] uppercase"
            style={{ color: theme.inkMuted, letterSpacing: 2 }}
          >
            {isEn ? "END" : "FIM"}
          </Text>
        </View>
        {statDivider}
        <View className="flex-1 items-center">
          <Text className="font-headline text-xl" style={{ color: theme.amber }}>
            {`+${summary.xpEarned}`}
          </Text>
          <Text
            className="mt-1 font-label text-[8px] uppercase"
            style={{ color: theme.inkMuted, letterSpacing: 2 }}
          >
            {isEn ? "XP EARNED" : "XP GANHO"}
          </Text>
        </View>
      </View>

      {/* Rodapé Editorial */}
      <View className="items-center pb-6 pt-1">
        <Text
          className="font-body text-[11px]"
          style={{ color: theme.inkSoft }}
        >
          {isEn ? "“Habits at my own pace.”" : "“Hábitos ao meu ritmo.”"}
        </Text>
        <View className="mt-2.5 flex-row items-center gap-3">
          <View
            className="h-px w-8"
            style={{ backgroundColor: theme.hairline }}
          />
          <Text
            className="font-label text-[8px] uppercase"
            style={{ color: theme.inkMuted, letterSpacing: 2 }}
          >
            {getShareUrlLabel()}
          </Text>
          <View
            className="h-px w-8"
            style={{ backgroundColor: theme.hairline }}
          />
        </View>
      </View>
    </View>
  );
});
