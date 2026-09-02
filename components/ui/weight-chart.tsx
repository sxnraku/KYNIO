import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import {
  WEIGHT_CHART_LAYOUT,
  type WeightChartData,
} from '@/services/weightChartService';
import type { WeightUnit } from '@/services/dbService';
import type { AppLanguage } from '@/store/app-preferences-store';

interface WeightChartProps {
  chartData: WeightChartData | null;
  isLoading: boolean;
  language: AppLanguage;
  unit: WeightUnit;
}

function GridLine({ y }: { y: number }) {
  return (
    <Line
      stroke={COLORS.border}
      strokeDasharray="4 4"
      x1={WEIGHT_CHART_LAYOUT.paddingLeft}
      x2={WEIGHT_CHART_LAYOUT.width - WEIGHT_CHART_LAYOUT.paddingRight}
      y1={y}
      y2={y}
    />
  );
}

export function WeightChart({
  chartData,
  isLoading,
  language,
  unit,
}: WeightChartProps) {
  if (isLoading) {
    return <ActivityIndicator className="my-10" color={COLORS.xp} />;
  }

  if (!chartData || !chartData.points.length) {
    return (
      <View className="mt-4 rounded-2xl border border-dashed border-border bg-background p-5 text-center">
        <Text className="text-center font-headline text-base text-foreground">
          {language === 'en' ? 'No weight logs yet' : 'Sem registos de peso'}
        </Text>
        <Text className="mt-1 text-center font-body text-xs text-muted">
          {language === 'en'
            ? 'Tap + to track your weight over time.'
            : 'Toca em + para acompanhar a tua evolução ao longo do tempo.'}
        </Text>
      </View>
    );
  }

  const middleGridY =
    WEIGHT_CHART_LAYOUT.paddingTop +
    (WEIGHT_CHART_LAYOUT.height -
      WEIGHT_CHART_LAYOUT.paddingTop -
      WEIGHT_CHART_LAYOUT.paddingBottom) /
      2;
  const bottomGridY = WEIGHT_CHART_LAYOUT.height - WEIGHT_CHART_LAYOUT.paddingBottom;
  const labelX = WEIGHT_CHART_LAYOUT.width - WEIGHT_CHART_LAYOUT.paddingRight + 4;

  return (
    <View className="mt-3 items-center">
      <Svg height={WEIGHT_CHART_LAYOUT.height} width={WEIGHT_CHART_LAYOUT.width}>
        <GridLine y={WEIGHT_CHART_LAYOUT.paddingTop} />
        <SvgText
          fill="#71717A"
          fontSize="10"
          textAnchor="start"
          x={labelX}
          y={WEIGHT_CHART_LAYOUT.paddingTop + 4}
        >
          {chartData.maxWeight}
        </SvgText>
        <GridLine y={middleGridY} />
        <SvgText fill="#71717A" fontSize="10" textAnchor="start" x={labelX} y={middleGridY + 4}>
          {chartData.midWeight}
        </SvgText>
        <GridLine y={bottomGridY} />
        <SvgText fill="#71717A" fontSize="10" textAnchor="start" x={labelX} y={bottomGridY + 4}>
          {chartData.minWeight}
        </SvgText>

        {chartData.targetY !== null ? (
          <>
            <Line
              stroke="#EAB308"
              strokeDasharray="3 3"
              strokeWidth="1.5"
              x1={WEIGHT_CHART_LAYOUT.paddingLeft}
              x2={WEIGHT_CHART_LAYOUT.width - WEIGHT_CHART_LAYOUT.paddingRight}
              y1={chartData.targetY}
              y2={chartData.targetY}
            />
            <Circle cx={WEIGHT_CHART_LAYOUT.paddingLeft + 6} cy={chartData.targetY} fill="#EAB308" r="3" />
            <SvgText fill="#EAB308" fontSize="9" x={WEIGHT_CHART_LAYOUT.paddingLeft + 12} y={chartData.targetY - 4}>
              {language === 'en' ? 'Goal' : 'Objetivo'}
            </SvgText>
          </>
        ) : null}

        {chartData.pathD ? <Path d={chartData.pathD} fill="none" stroke="#FACC15" strokeWidth="2.5" /> : null}
        {chartData.points.map((point, index) => {
          const showLabel =
            chartData.points.length <= 4 ||
            index === 0 ||
            index === chartData.points.length - 1 ||
            index === Math.floor(chartData.points.length / 2);

          return (
            <React.Fragment key={`${point.x}-${point.y}`}>
              <Circle
                cx={point.x}
                cy={point.y}
                fill="#FACC15"
                r="4"
                stroke={COLORS.foreground}
                strokeWidth="2"
              />
              {showLabel ? (
                <SvgText
                  fill="#71717A"
                  fontSize="9"
                  textAnchor="middle"
                  x={point.x}
                  y={WEIGHT_CHART_LAYOUT.height - 6}
                >
                  {point.date}
                </SvgText>
              ) : null}
            </React.Fragment>
          );
        })}
      </Svg>

      <View className="mt-3 flex-row items-center justify-center gap-4">
        <View className="flex-row items-center gap-1.5">
          <View className="h-2.5 w-2.5 rounded-full bg-[#FACC15]" />
          <Text className="font-label text-[11px] text-muted">
            {language === 'en' ? 'Weight' : 'Peso'}
          </Text>
        </View>
        {chartData.targetVal !== null ? (
          <View className="flex-row items-center gap-1.5">
            <View className="h-0.5 w-3 bg-[#EAB308]" />
            <Text className="font-label text-[11px] text-[#EAB308]">
              {language === 'en' ? 'Goal' : 'Objetivo'} ({chartData.targetVal} {unit})
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
