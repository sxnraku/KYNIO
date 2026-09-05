import { forwardRef, useMemo } from "react";
import { Image, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { Text } from "@/components/ui/text";

import { getShareUrlLabel } from "@/services/achievementShareContent";
import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import type { AchievementSharePayload } from "@/types/achievement-share";

interface AchievementShareCardProps {
  payload: AchievementSharePayload;
}

// ---- Circadiano: Paleta Nobre --------------------------------------------
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

// ---- Arco solar (Calculado por coordenadas polares) ----------------------
const ARC_WIDTH = 260;
const ARC_HEIGHT = 130;
const RADIUS = 115;
const CENTER_X = ARC_WIDTH / 2;
const CENTER_Y = ARC_HEIGHT;

const DAY_START = 6;  // 06:00 (Aurora)
const DAY_END = 20;   // 20:00 (Crepúsculo)

function calculateSunPosition(hoursIntoDay: number) {
  const span = DAY_END - DAY_START; // 14 horas
  const progress = Math.min(Math.max(hoursIntoDay / span, 0), 1);
  const angle = Math.PI * (1 - progress); // PI (06h / esq) -> 0 (20h / dir)

  return {
    x: CENTER_X + RADIUS * Math.cos(angle),
    y: CENTER_Y - RADIUS * Math.sin(angle),
  };
}

export const AchievementShareCard = forwardRef<View, AchievementShareCardProps>(
  function AchievementShareCard({ payload }, ref) {
    const visibleBadges = payload.badgeTitles.slice(0, 3);
    const isEn = payload.language === "en";

    const themeMode = useAppPreferencesStore((state) => state.themeMode);
    const theme =
      themeMode === "dark" || themeMode === "amoled" || themeMode === "midnight"
        ? THEMES.dark
        : THEMES.light;

    const sunPosition = useMemo(() => {
      const now = new Date();
      const currentHours = now.getHours() + now.getMinutes() / 60;
      return calculateSunPosition(currentHours - DAY_START);
    }, []);

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
        {/* Header com Ícone Oficial da App */}
        <View className="items-center pt-7">
          <Image
            accessibilityLabel="KYNIO App Icon"
            className="h-9 w-9 rounded-xl"
            source={require("@/assets/images/icon-kynio-v1.png")}
            style={{ borderRadius: 12, height: 36, width: 36 }}
          />
          <Text
            className="mt-2.5 font-headline text-base"
            style={{ color: theme.ink, letterSpacing: 6 }}
          >
            KYNIO
          </Text>
          <Text
            className="mt-0.5 font-label text-[9px] uppercase"
            style={{ color: theme.inkMuted, letterSpacing: 4 }}
          >
            {isEn ? "MY JOURNEY" : "A MINHA JORNADA"}
          </Text>
        </View>

        <View
          className="mx-8 mt-5 h-px"
          style={{ backgroundColor: theme.hairline }}
        />

        {/* Arco Solar Vetorial com Sol Cravado na Linha */}
        <View className="items-center pt-6">
          <View style={{ height: ARC_HEIGHT + 24, width: ARC_WIDTH }}>
            <Svg height={ARC_HEIGHT + 2} width={ARC_WIDTH}>
              {/* Arco Semicircular Tracejado */}
              <Path
                d={`M ${CENTER_X - RADIUS} ${CENTER_Y} A ${RADIUS} ${RADIUS} 0 0 1 ${CENTER_X + RADIUS} ${CENTER_Y}`}
                fill="none"
                stroke={theme.hairline}
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
              {/* Linha do Horizonte */}
              <Line
                stroke={theme.hairline}
                strokeWidth={1}
                x1={10}
                x2={ARC_WIDTH - 10}
                y1={CENTER_Y}
                y2={CENTER_Y}
              />
              {/* Halo suave de luz */}
              <Circle
                cx={sunPosition.x}
                cy={sunPosition.y}
                fill={theme.chipFill}
                r={14}
              />
              {/* Sol com precisão vetorial milimétrica */}
              <Circle
                cx={sunPosition.x}
                cy={sunPosition.y}
                fill={theme.amberSoft}
                r={8}
                stroke={theme.bg}
                strokeWidth={3}
              />
            </Svg>

            {/* Escala Horária Circadiana */}
            <Text
              className="absolute font-label text-[9px]"
              style={{ color: theme.inkMuted, left: 10, top: CENTER_Y + 5 }}
            >
              06
            </Text>
            <Text
              className="absolute font-label text-[9px]"
              style={{
                color: theme.inkMuted,
                left: CENTER_X - 6,
                top: CENTER_Y + 5,
              }}
            >
              13
            </Text>
            <Text
              className="absolute font-label text-[9px]"
              style={{ color: theme.inkMuted, right: 10, top: CENTER_Y + 5 }}
            >
              20
            </Text>
          </View>
        </View>

        {/* Nível Mitológico Solar */}
        <View className="items-center px-6 pt-2">
          <Text
            className="font-label text-[9px] uppercase"
            style={{ color: theme.inkMuted, letterSpacing: 5 }}
          >
            {isEn ? "CURRENT LEVEL" : "NÍVEL ATUAL"}
          </Text>
          <Text
            className="mt-1 font-headline text-5xl tracking-tight"
            style={{ color: theme.ink }}
          >
            {isEn ? `Level ${payload.level}` : `Nível ${payload.level}`}
          </Text>
          <Text
            className="mt-1 font-label text-[11px] uppercase"
            style={{ color: theme.amber, letterSpacing: 4 }}
          >
            {translateText(payload.levelTitle, payload.language)}
          </Text>
        </View>

        <View
          className="mx-8 mt-6 h-px"
          style={{ backgroundColor: theme.hairline }}
        />

        {/* Estatísticas (Instrumento com Divisores de Linha) */}
        <View className="flex-row items-stretch px-6 py-4">
          <View className="flex-1 items-center">
            <Text className="font-headline text-2xl" style={{ color: theme.ink }}>
              {payload.totalXp}
            </Text>
            <Text
              className="mt-1 font-label text-[8px] uppercase"
              style={{ color: theme.inkMuted, letterSpacing: 2 }}
            >
              {isEn ? "TOTAL XP" : "XP TOTAL"}
            </Text>
          </View>
          {statDivider}
          <View className="flex-1 items-center">
            <Text className="font-headline text-2xl" style={{ color: theme.ink }}>
              {payload.streakDays}
            </Text>
            <Text
              className="mt-1 font-label text-[8px] uppercase"
              style={{ color: theme.inkMuted, letterSpacing: 2 }}
            >
              {isEn ? "STREAK DAYS" : "DIAS SEGUIDOS"}
            </Text>
          </View>
          {statDivider}
          <View className="flex-1 items-center">
            <Text className="font-headline text-2xl" style={{ color: theme.ink }}>
              {payload.badgeTitles.length}
            </Text>
            <Text
              className="mt-1 font-label text-[8px] uppercase"
              style={{ color: theme.inkMuted, letterSpacing: 2 }}
            >
              {isEn ? "BADGES" : "INSÍGNIAS"}
            </Text>
          </View>
        </View>

        <View
          className="mx-8 h-px"
          style={{ backgroundColor: theme.hairline }}
        />

        {/* Insígnias (Painéis Retangulares Minimalistas) */}
        <View className="flex-row flex-wrap justify-center gap-2 px-6 py-4">
          {visibleBadges.length ? (
            visibleBadges.map((badge) => (
              <View
                className="border px-3 py-1.5"
                key={badge}
                style={{
                  backgroundColor: theme.chipFill,
                  borderColor: theme.hairline,
                }}
              >
                <Text
                  className="font-label text-[8px] uppercase"
                  style={{ color: theme.amber, letterSpacing: 1 }}
                >
                  {translateText(badge, payload.language)}
                </Text>
              </View>
            ))
          ) : (
            <View
              className="border px-3 py-1.5"
              style={{
                backgroundColor: theme.chipFill,
                borderColor: theme.hairline,
              }}
            >
              <Text
                className="font-label text-[8px] uppercase"
                style={{ color: theme.amber, letterSpacing: 1 }}
              >
                {isEn ? "JOURNEY STARTED" : "JORNADA INICIADA"}
              </Text>
            </View>
          )}
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
  },
);

