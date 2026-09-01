import { memo } from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { COLORS } from "@/constants/colors";

/**
 * Relógio de matriz de pontos ("Circadiano"): dígitos desenhados como
 * constelações de círculos SVG — entre o LED e o grão de luz solar.
 * Suporta dígitos 0-9 e ":"; qualquer outro caráter é ignorado.
 */

const DIGIT_GLYPHS: Record<string, readonly string[]> = {
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  ":": ["000", "010", "010", "000", "010", "010", "000"],
};

const GLYPH_GAP = 1.6; // em células

interface DotClockProps {
  /** Texto a desenhar (ex.: "14:32"). Caracteres fora de 0-9/":" são ignorados. */
  value: string;
  /** Tamanho de cada célula da grelha em px (espaçamento entre centros). */
  cellSize?: number;
  /** Raio de cada ponto em px. */
  dotRadius?: number;
}

interface DotSpec {
  cx: number;
  cy: number;
  isColon: boolean;
}

export const DotClock = memo(function DotClock({
  value,
  cellSize = 7,
  dotRadius = 2.5,
}: DotClockProps) {
  const dots: DotSpec[] = [];
  let cursorX = dotRadius;

  for (const char of value) {
    const glyph = DIGIT_GLYPHS[char];
    if (!glyph) {
      continue;
    }
    const glyphWidth = glyph[0].length;
    for (let row = 0; row < glyph.length; row += 1) {
      for (let col = 0; col < glyphWidth; col += 1) {
        if (glyph[row][col] !== "1") {
          continue;
        }
        dots.push({
          cx: cursorX + col * cellSize,
          cy: dotRadius + row * cellSize,
          isColon: char === ":",
        });
      }
    }
    cursorX += (glyphWidth + GLYPH_GAP) * cellSize;
  }

  const width = Math.max(cursorX - GLYPH_GAP * cellSize + dotRadius, cellSize);
  const height = 7 * cellSize;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg height={height} width={width}>
        {dots.map((dot, index) => (
          <Circle
            cx={dot.cx}
            cy={dot.cy}
            fill={dot.isColon ? COLORS.success : COLORS.foreground}
            key={`${dot.cx}-${dot.cy}-${index}`}
            r={dotRadius}
          />
        ))}
      </Svg>
    </View>
  );
});
