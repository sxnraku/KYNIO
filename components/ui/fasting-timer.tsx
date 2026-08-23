import { useWindowDimensions, View } from "react-native";
import { Text } from "@/components/ui/text";
import Svg, { Circle } from "react-native-svg";

import { COLORS } from "@/constants/colors";
import { formatElapsedTime } from "@/services/fasting";

interface FastingTimerProps {
  elapsedMs: number;
  goalLabel: string;
  isActive: boolean;
  progress: number;
}

export function FastingTimer({
  elapsedMs,
  goalLabel,
  isActive,
  progress,
}: FastingTimerProps) {
  const { width } = useWindowDimensions();
  const size = Math.min(Math.max(width - 180, 198), 238);
  const center = size / 2;
  const radius = center - 12;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference * (1 - progress);

  return (
    <View className="items-center py-1">
      <View
        accessible
        accessibilityLabel={`Objetivo ${goalLabel}, temporizador ${formatElapsedTime(elapsedMs)}, ${isActive ? "Jejum Ativo" : "Jejum Inativo"}`}
        style={{ height: size, width: size }}
        testID="fasting-timer"
      >
        <Svg height={size} width={size}>
          <Circle
            cx={center}
            cy={center}
            fill="transparent"
            r={radius}
            stroke={COLORS.surfaceRaised}
            strokeWidth={11}
          />
          <Circle
            cx={center}
            cy={center}
            fill="transparent"
            r={radius}
            stroke={COLORS.success}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            strokeWidth={11}
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>

        <View className="absolute inset-0 items-center justify-center px-5">
          <Text className="font-body text-xs text-muted">
            Objetivo de jejum
          </Text>
          <Text
            className="mt-1 font-label tracking-tighter text-foreground"
            style={{ fontSize: size < 220 ? 30 : 36 }}
          >
            {formatElapsedTime(elapsedMs)}
          </Text>
          <View
            className="mt-2 flex-row items-center rounded-full border bg-background px-3 py-1.5"
            style={{ borderColor: isActive ? COLORS.success : COLORS.border }}
          >
            <View
              className="mr-2 h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: isActive ? COLORS.success : COLORS.muted,
              }}
            />
            <Text
              className="font-label text-[10px]"
              style={{ color: isActive ? COLORS.success : COLORS.muted }}
            >
              {isActive ? "JEJUM ATIVO" : "JEJUM INATIVO"}
            </Text>
          </View>
        </View>
      </View>

      <Text className="mt-3 font-body text-sm text-muted">
        {isActive
          ? `${Math.round(progress * 100)}% do objetivo ${goalLabel}`
          : `Pronto para o objetivo ${goalLabel}`}
      </Text>
    </View>
  );
}
