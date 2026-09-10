import { useWindowDimensions, View } from "react-native";
import { Text } from "@/components/ui/text";
import Svg, {
  Circle,
  Defs,
  G,
  Path,
  RadialGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";

import { DotClock } from "@/components/ui/dot-clock";
import { getColorPalette } from "@/constants/colors";
import { translateText } from "@/services/i18n";
import {
  ESTIMATED_METABOLIC_PHASES,
  formatElapsedTime,
  getEstimatedPhaseIndex,
  type EstimatedMetabolicPhaseId,
} from "@/services/fasting";
import { useAppPreferencesStore } from "@/store/app-preferences-store";

interface FastingTimerProps {
  elapsedMs: number;
  goalLabel: string;
  isActive: boolean;
  progress: number;
  targetDurationMs: number;
}

/** Etiquetas curtas das fases para as marcas do arco solar. */
const PHASE_TICK_LABELS: Record<EstimatedMetabolicPhaseId, string> = {
  autophagy: "Autofagia",
  deep_renewal: "Renovação",
  digestion: "Digestão",
  fat_burning: "Queima",
  glucose: "Glicose",
  ketosis: "Cetose",
};

// Geometria do arco solar (cúpula rasa) num viewBox 320×150.
const VIEW_W = 320;
const VIEW_H = 150;
const BASE_Y = 136;
const CX = VIEW_W / 2;
const RADIUS = 170;
const HALF_CHORD = 140;
const CENTER_Y = BASE_Y + Math.sqrt(RADIUS * RADIUS - HALF_CHORD * HALF_CHORD);
const PHI = Math.atan2(CENTER_Y - BASE_Y, HALF_CHORD);
const THETA_LEFT = -(Math.PI - PHI);
const THETA_RIGHT = -PHI;
const ARC_PATH = `M ${CX - HALF_CHORD} ${BASE_Y} A ${RADIUS} ${RADIUS} 0 0 1 ${CX + HALF_CHORD} ${BASE_Y}`;
const ARC_LENGTH = RADIUS * (THETA_RIGHT - THETA_LEFT);

// Margens para que o halo luminoso do sol (raio 30) nunca seja cortado nas extremidades nem na base
const PAD_X = 20; // x=-20 até x=340 cobre com folga o halo (-10 a 330)
const PAD_BOTTOM = 24; // y=174 cobre com folga a base do halo (y=166)
const VB_X = -PAD_X;
const VB_Y = 0;
const VB_W = VIEW_W + PAD_X * 2; // 360
const VB_H = VIEW_H + PAD_BOTTOM; // 174

function arcPointAt(p: number): { x: number; y: number } {
  const theta = THETA_LEFT + p * (THETA_RIGHT - THETA_LEFT);
  return {
    x: CX + RADIUS * Math.cos(theta),
    y: CENTER_Y + RADIUS * Math.sin(theta),
  };
}

/** "14h 32m" / "32 min" — formato compacto para a legenda mono. */
function compactDuration(durationMs: number): string {
  const totalMinutes = Math.max(0, Math.floor(durationMs / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return `${minutes} min`;
  }
  return minutes === 0 ? `${hours}h` : `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

export function FastingTimer({
  elapsedMs,
  goalLabel,
  isActive,
  progress,
  targetDurationMs,
}: FastingTimerProps) {
  const language = useAppPreferencesStore((state) => state.language);
  const themeMode = useAppPreferencesStore((state) => state.themeMode);
  const colors = getColorPalette(themeMode);
  const isLight = themeMode === "light";

  const { width } = useWindowDimensions();
  const dialWidth = Math.min(Math.max(width - 64, 260), 340);
  const dialHeight = (dialWidth * VB_H) / VB_W;

  const isOpenGoal = goalLabel.toLowerCase().includes("livre");
  const elapsedHours = elapsedMs / (60 * 60 * 1000);
  const currentPhase =
    ESTIMATED_METABOLIC_PHASES[getEstimatedPhaseIndex(elapsedHours)];

  // No modo livre, o arco reflete o ciclo de 24h (como o antigo anel)
  const effectiveProgress = isOpenGoal
    ? isActive
      ? Math.max(0.02, (elapsedMs % (24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000))
      : 0
    : progress;

  // Escala horária das marcas de fase: a meta do objetivo, ou 24h no modo livre
  const scaleHours = isOpenGoal ? 24 : Math.max(1, targetDurationMs / 3_600_000);

  const ticks: { fraction: number; id: EstimatedMetabolicPhaseId }[] = [];
  for (const phase of ESTIMATED_METABOLIC_PHASES) {
    const fraction = Math.min(1, phase.startHour / scaleHours);
    if (ticks.some((tick) => Math.abs(tick.fraction - fraction) < 0.001)) {
      continue;
    }
    ticks.push({ fraction, id: phase.id });
  }

  const sun = arcPointAt(effectiveProgress);

  const totalMinutes = Math.floor(Math.max(0, elapsedMs) / 60_000);
  const clockValue = `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;

  return (
    <View className="items-center py-1">
      <View
        accessible
        accessibilityLabel={translateText(
          `Objetivo ${goalLabel}, temporizador ${formatElapsedTime(elapsedMs)}, ${isActive ? "Jejum Ativo" : "Jejum Inativo"}`,
          language,
        )}
        style={{ width: dialWidth }}
        testID="fasting-timer"
      >
        <Svg
          height={dialHeight}
          style={{ overflow: "visible" }}
          viewBox={`${VB_X} ${VB_Y} ${VB_W} ${VB_H}`}
          width={dialWidth}
        >
          <Defs>
            <RadialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={colors.success} stopOpacity={isLight ? "0.65" : "0.95"} />
              <Stop offset="55%" stopColor={colors.success} stopOpacity={isLight ? "0.22" : "0.35"} />
              <Stop offset="100%" stopColor={colors.success} stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* arco base */}
          <Path d={ARC_PATH} fill="none" stroke={colors.border} strokeWidth={1.4} />
          {/* arco decorrido */}
          <Path
            d={ARC_PATH}
            fill="none"
            stroke={colors.success}
            strokeDasharray={`${effectiveProgress * ARC_LENGTH} ${ARC_LENGTH}`}
            strokeLinecap="round"
            strokeWidth={2.4}
          />

          {/* marcas das fases metabólicas */}
          {ticks.map((tick) => {
            const point = arcPointAt(tick.fraction);
            const isCurrent =
              isActive &&
              ESTIMATED_METABOLIC_PHASES[getEstimatedPhaseIndex(elapsedHours)]
                .id === tick.id;
            const anchor =
              tick.fraction <= 0.001
                ? "start"
                : tick.fraction >= 0.999
                  ? "end"
                  : "middle";
            return (
              <G key={tick.id}>
                <Circle
                  cx={point.x}
                  cy={point.y}
                  fill={isCurrent ? colors.success : (isLight ? "#9E957F" : colors.muted)}
                  r={isCurrent ? 3.2 : 2.6}
                />
                <SvgText
                  fill={isCurrent ? colors.foreground : (isLight ? "#545045" : colors.muted)}
                  fontFamily="JetBrainsMono_500Medium"
                  fontSize={7.5}
                  fontWeight={isCurrent ? "700" : "500"}
                  letterSpacing={0.4}
                  textAnchor={anchor}
                  x={point.x}
                  y={point.y - 10}
                >
                  {translateText(PHASE_TICK_LABELS[tick.id], language).toUpperCase()}
                </SvgText>
              </G>
            );
          })}

          {/* sol: halo luminoso + núcleo */}
          <G x={sun.x} y={sun.y}>
            <Circle r={30} fill="url(#sunGlow)" />
            <Circle
              fill={colors.success}
              r={8.5}
              stroke={colors.warning}
              strokeWidth={1.2}
            />
          </G>
        </Svg>

        {/* relógio de matriz de pontos */}
        <View className="-mt-3 items-center">
          <DotClock
            cellSize={7}
            colonColor={isLight ? "#B45309" : colors.success}
            dotColor={isLight ? "#1E1D1B" : colors.foreground}
            dotRadius={2.8}
            value={clockValue}
          />
        </View>

        {/* trilho de fases: segmentos preenchidos até à fase atual */}
        <View
          accessibilityElementsHidden
          className="mt-4 flex-row gap-1.5"
          importantForAccessibility="no-hide-descendants"
        >
          {ESTIMATED_METABOLIC_PHASES.map((phase, index) => {
            const currentIndex = getEstimatedPhaseIndex(elapsedHours);
            const state =
              isActive && index < currentIndex
                ? "done"
                : isActive && index === currentIndex
                  ? "current"
                  : "todo";
            return (
              <View
                className="h-1 flex-1 rounded-full"
                key={phase.id}
                style={{
                  backgroundColor:
                    state === "todo" ? colors.border : colors.success,
                  opacity: state === "done" ? 0.45 : 1,
                }}
              />
            );
          })}
        </View>
      </View>

      {/* legenda mono: decorrido / restante */}
      <Text
        className="mt-4 text-center font-label text-[11px] uppercase"
        style={{
          letterSpacing: 1.8,
          color: isLight ? "#45433E" : colors.muted,
          fontWeight: "600",
        }}
        translate={false}
      >
        {isActive
          ? isOpenGoal
            ? language === "en"
              ? `Elapsed ${compactDuration(elapsedMs)} · Open fast`
              : `Decorridos ${compactDuration(elapsedMs)} · Jejum livre`
            : language === "en"
              ? `Elapsed of ${goalLabel} · ${compactDuration(Math.max(0, targetDurationMs - elapsedMs))} left`
              : `Decorridos de ${goalLabel} · Faltam ${compactDuration(Math.max(0, targetDurationMs - elapsedMs))}`
          : isOpenGoal
            ? translateText("Pronto para iniciar jejum livre", language)
            : translateText(`Pronto para o objetivo ${goalLabel}`, language)}
      </Text>

      <View
        className="mt-3 flex-row items-center rounded-full border px-3 py-1.5"
        style={{ borderColor: isActive ? colors.success : (isLight ? "#C7BC9F" : colors.border) }}
      >
        <View
          className="mr-2 h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor: isActive ? colors.success : (isLight ? "#7A7463" : colors.muted),
          }}
        />
        <Text
          className="font-label text-[10px]"
          style={{ color: isActive ? colors.success : (isLight ? "#45433E" : colors.muted) }}
        >
          {translateText(isActive ? "JEJUM ATIVO" : "JEJUM INATIVO", language)}
        </Text>
      </View>

      {isActive ? (
        <Text
          className="mt-2 text-center font-body text-xs"
          style={{ color: isLight ? "#4A4740" : colors.muted }}
          translate={false}
        >
          {isOpenGoal
            ? translateText(
                `Fase: ${currentPhase.title} · Sem limite pré-fixado`,
                language,
              )
            : `${Math.round(progress * 100)}% · ${translateText(currentPhase.title, language)}`}
        </Text>
      ) : null}
    </View>
  );
}

