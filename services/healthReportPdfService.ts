import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import {
  getFastRecords,
  getMealRecords,
  getUserProfile,
  getWeightEntries,
} from '@/services/dbService';

interface FastStats {
  averageDurationHours: number;
  completedCount: number;
  longestDurationHours: number;
  totalFasts: number;
  totalHours: number;
  weeklyAverageHours: number;
}

interface WeightStats {
  changeKg: number;
  currentKg: number;
  entries: { date: string; kg: number }[];
  initialKg: number;
}

interface NutritionStats {
  averageDailyCalories: number;
  carbsGrams: number;
  carbsPercent: number;
  fatGrams: number;
  fatPercent: number;
  proteinGrams: number;
  proteinPercent: number;
  totalMeals: number;
}

export async function generateClinicalReportHtml(
  language: 'en' | 'pt' = 'pt',
): Promise<string> {
  const [fasts, weightEntries, meals, profile] = await Promise.all([
    getFastRecords(),
    getWeightEntries(),
    getMealRecords(),
    getUserProfile(),
  ]);

  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  // 1. Filtrar registos dos últimos 30 dias (ou todos se houver menos)
  const recentFasts = fasts.filter((f) => f.startTime >= thirtyDaysAgo);
  const relevantFasts = recentFasts.length > 0 ? recentFasts : fasts.slice(0, 30);

  let totalDurationMs = 0;
  let completedCount = 0;
  let longestDurationMs = 0;

  for (const fast of relevantFasts) {
    const duration = Math.max(0, fast.endTime - fast.startTime);
    totalDurationMs += duration;
    if (fast.completed) completedCount += 1;
    if (duration > longestDurationMs) longestDurationMs = duration;
  }

  const totalHours = totalDurationMs / (1000 * 60 * 60);
  const fastStats: FastStats = {
    averageDurationHours:
      relevantFasts.length > 0
        ? Number((totalHours / relevantFasts.length).toFixed(1))
        : 0,
    completedCount,
    longestDurationHours: Number(
      (longestDurationMs / (1000 * 60 * 60)).toFixed(1),
    ),
    totalFasts: relevantFasts.length,
    totalHours: Math.round(totalHours),
    weeklyAverageHours: Number((totalHours / 4.2).toFixed(1)), // Média semanal nos ~30 dias
  };

  // 2. Estatísticas de Peso
  const sortedWeights = [...weightEntries].sort(
    (a, b) => a.timestamp - b.timestamp,
  );
  const initialWeight = sortedWeights[0]?.weightGrams ?? 0;
  const currentWeight =
    sortedWeights[sortedWeights.length - 1]?.weightGrams ?? 0;
  const initialKg = Number((initialWeight / 1000).toFixed(1));
  const currentKg = Number((currentWeight / 1000).toFixed(1));
  const changeKg = Number((currentKg - initialKg).toFixed(1));

  const weightStats: WeightStats = {
    changeKg,
    currentKg,
    entries: sortedWeights.slice(-8).map((w) => ({
      date: new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'pt-PT', {
        day: 'numeric',
        month: 'short',
      }).format(new Date(w.timestamp)),
      kg: Number((w.weightGrams / 1000).toFixed(1)),
    })),
    initialKg,
  };

  // 3. Macronutrientes e Nutrição Média
  const recentMeals = meals.filter((m) => m.timestamp >= thirtyDaysAgo);
  const relevantMeals = recentMeals.length > 0 ? recentMeals : meals.slice(0, 30);

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const meal of relevantMeals) {
    totalCalories += meal.estimatedCalories ?? 0;
    totalProtein += meal.proteinGrams ?? 0;
    totalCarbs += meal.carbsGrams ?? 0;
    totalFat += meal.fatGrams ?? 0;
  }

  const mealCount = Math.max(1, relevantMeals.length);
  const avgProtein = Math.round(totalProtein / mealCount);
  const avgCarbs = Math.round(totalCarbs / mealCount);
  const avgFat = Math.round(totalFat / mealCount);
  const totalMacros = avgProtein + avgCarbs + avgFat || 1;

  const nutritionStats: NutritionStats = {
    averageDailyCalories: Math.round(totalCalories / Math.min(30, mealCount)),
    carbsGrams: avgCarbs,
    carbsPercent: Math.round((avgCarbs / totalMacros) * 100),
    fatGrams: avgFat,
    fatPercent: Math.round((avgFat / totalMacros) * 100),
    proteinGrams: avgProtein,
    proteinPercent: Math.round((avgProtein / totalMacros) * 100),
    totalMeals: relevantMeals.length,
  };

  const reportDate = new Intl.DateTimeFormat(
    language === 'en' ? 'en-GB' : 'pt-PT',
    {
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      month: 'long',
      year: 'numeric',
    },
  ).format(new Date());

  const isPt = language === 'pt';

  return `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8" />
  <title>${isPt ? 'Dossiê de Hábitos KYNIO' : 'KYNIO Habits Dossier'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #FAF7F0;
      color: #2D2B28;
      padding: 36px 40px;
      line-height: 1.5;
    }
    .header {
      border-bottom: 2px solid #2D2B28;
      padding-bottom: 20px;
      margin-bottom: 28px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .logo {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 4px;
      color: #2D2B28;
    }
    .logo span { color: #D9922E; }
    .subtitle {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #736E65;
      margin-top: 4px;
    }
    .meta-box {
      text-align: right;
      font-size: 12px;
      color: #736E65;
    }
    .meta-box strong { color: #2D2B28; font-size: 13px; }
    
    .section-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.8px;
      color: #D9922E;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-title::after {
      content: "";
      flex: 1;
      height: 1px;
      background-color: #E2DBD0;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 28px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 28px;
    }
    .card {
      background: #FFFFFF;
      border: 1px solid #E2DBD0;
      border-radius: 8px;
      padding: 14px;
    }
    .card-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #736E65;
      margin-bottom: 6px;
    }
    .card-value {
      font-size: 22px;
      font-weight: 800;
      color: #2D2B28;
    }
    .card-sub {
      font-size: 11px;
      color: #736E65;
      margin-top: 4px;
    }

    .macro-bar {
      display: flex;
      height: 20px;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 12px;
      border: 1px solid #E2DBD0;
    }
    .macro-segment {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 700;
      color: #FFFFFF;
    }
    .macro-p { background-color: #D9922E; width: ${nutritionStats.proteinPercent}%; }
    .macro-c { background-color: #3A7D63; width: ${nutritionStats.carbsPercent}%; }
    .macro-f { background-color: #8C5242; width: ${nutritionStats.fatPercent}%; }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 12px;
    }
    th {
      text-align: left;
      padding: 8px 10px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #736E65;
      border-bottom: 1px solid #2D2B28;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #EAE3D5;
    }

    .disclaimer {
      margin-top: 36px;
      padding: 14px;
      background: #EFE9DC;
      border-left: 3px solid #D9922E;
      border-radius: 0 6px 6px 0;
      font-size: 11px;
      color: #59554E;
      line-height: 1.5;
    }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <div class="logo">KYNIO<span>·</span></div>
      <div class="subtitle">${isPt ? 'Relatório Clínico de Hábitos & Jejum' : 'Clinical Habit & Fasting Report'}</div>
    </div>
    <div class="meta-box">
      <div><strong>${profile?.displayName || (isPt ? 'Utilizador KYNIO' : 'KYNIO User')}</strong></div>
      <div>${isPt ? 'Emitido em' : 'Generated on'}: ${reportDate}</div>
      <div>${isPt ? 'Janela' : 'Window'}: ${isPt ? 'Últimos 30 Dias' : 'Last 30 Days'}</div>
    </div>
  </div>

  <!-- 1. CONSISTÊNCIA DE JEJUM -->
  <div class="section-title">${isPt ? '1. Prática de Jejum Intermitente' : '1. Intermittent Fasting Practice'}</div>
  <div class="grid-4">
    <div class="card">
      <div class="card-label">${isPt ? 'Média Semanal' : 'Weekly Average'}</div>
      <div class="card-value">${fastStats.weeklyAverageHours}h</div>
      <div class="card-sub">${isPt ? 'Horas / semana' : 'Hours / week'}</div>
    </div>
    <div class="card">
      <div class="card-label">${isPt ? 'Média por Jejum' : 'Average Fast'}</div>
      <div class="card-value">${fastStats.averageDurationHours}h</div>
      <div class="card-sub">${isPt ? 'Duração média' : 'Mean duration'}</div>
    </div>
    <div class="card">
      <div class="card-label">${isPt ? 'Total de Jejuns' : 'Total Fasts'}</div>
      <div class="card-value">${fastStats.totalFasts}</div>
      <div class="card-sub">${fastStats.completedCount} ${isPt ? 'metas cumpridas' : 'goals met'}</div>
    </div>
    <div class="card">
      <div class="card-label">${isPt ? 'Jejum Mais Longo' : 'Longest Fast'}</div>
      <div class="card-value">${fastStats.longestDurationHours}h</div>
      <div class="card-sub">${isPt ? 'Pico metabólico' : 'Peak duration'}</div>
    </div>
  </div>

  <!-- 2. EVOLUÇÃO DO PESO -->
  <div class="section-title">${isPt ? '2. Evolução Ponderal (Peso Corporal)' : '2. Body Weight Trend'}</div>
  <div class="grid-3">
    <div class="card">
      <div class="card-label">${isPt ? 'Peso Inicial' : 'Initial Weight'}</div>
      <div class="card-value">${weightStats.initialKg > 0 ? weightStats.initialKg + ' kg' : '—'}</div>
      <div class="card-sub">${isPt ? 'Primeiro registo' : 'Baseline'}</div>
    </div>
    <div class="card">
      <div class="card-label">${isPt ? 'Peso Atual' : 'Current Weight'}</div>
      <div class="card-value">${weightStats.currentKg > 0 ? weightStats.currentKg + ' kg' : '—'}</div>
      <div class="card-sub">${isPt ? 'Última pesagem' : 'Most recent'}</div>
    </div>
    <div class="card">
      <div class="card-label">${isPt ? 'Variação Líquida' : 'Net Change'}</div>
      <div class="card-value" style="color: ${weightStats.changeKg <= 0 ? '#3A7D63' : '#D9922E'};">
        ${weightStats.changeKg > 0 ? '+' : ''}${weightStats.changeKg} kg
      </div>
      <div class="card-sub">${isPt ? 'No período analisado' : 'Over period'}</div>
    </div>
  </div>

  ${
    weightStats.entries.length > 0
      ? `
  <table style="margin-bottom: 28px;">
    <thead>
      <tr>
        ${weightStats.entries.map((e) => `<th>${e.date}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      <tr>
        ${weightStats.entries.map((e) => `<td><strong>${e.kg} kg</strong></td>`).join('')}
      </tr>
    </tbody>
  </table>
  `
      : ''
  }

  <!-- 3. PERFIL NUTRICIONAL E MACRONUTRIENTES -->
  <div class="section-title">${isPt ? '3. Nutrição & Distribuição de Macronutrientes' : '3. Nutrition & Macronutrient Breakdown'}</div>
  <div class="card" style="margin-bottom: 28px;">
    <div class="card-label">${isPt ? 'Proporção Média de Macronutrientes' : 'Average Macro Proportion'}</div>
    <div class="macro-bar">
      <div class="macro-segment macro-p">${nutritionStats.proteinPercent}% P</div>
      <div class="macro-segment macro-c">${nutritionStats.carbsPercent}% ${isPt ? 'H' : 'C'}</div>
      <div class="macro-segment macro-f">${nutritionStats.fatPercent}% ${isPt ? 'G' : 'F'}</div>
    </div>
    <div style="display: flex; justify-content: space-around; font-size: 12px; margin-top: 8px;">
      <div><span style="color: #D9922E; font-weight: bold;">●</span> ${isPt ? 'Proteínas' : 'Protein'}: <strong>${nutritionStats.proteinGrams}g</strong> (${nutritionStats.proteinPercent}%)</div>
      <div><span style="color: #3A7D63; font-weight: bold;">●</span> ${isPt ? 'Hidratos' : 'Carbs'}: <strong>${nutritionStats.carbsGrams}g</strong> (${nutritionStats.carbsPercent}%)</div>
      <div><span style="color: #8C5242; font-weight: bold;">●</span> ${isPt ? 'Gorduras' : 'Fat'}: <strong>${nutritionStats.fatGrams}g</strong> (${nutritionStats.fatPercent}%)</div>
    </div>
  </div>

  <!-- AVISO DE ISENÇÃO DE RESPONSABILIDADE MÉDICA E NUTRICIONAL -->
  <div class="disclaimer">
    <strong>${isPt ? 'Nota de Registo Informativo' : 'Informational Log Notice'}:</strong>
    ${
      isPt
        ? 'Este documento foi compilado exclusivamente a partir de registos introduzidos pelo utilizador na aplicação KYNIO. As métricas e cálculos são descritivos e destinam-se ao registo pessoal ou partilha com os profissionais de saúde que acompanham o utilizador. Não constitui relatório clínico, prescrição dietética, recomendação de tratamento nem diagnóstico de qualquer condição.'
        : 'This document is compiled exclusively from self-reported logs within the KYNIO app. Metrics and calculations are descriptive and intended for personal habit tracking or discussion with health professionals. It does not constitute a clinical prescription, dietary advice, or medical diagnosis.'
    }
  </div>

</body>
</html>
  `;
}

export async function exportClinicalReportPdf(
  language: 'en' | 'pt' = 'pt',
): Promise<string> {
  const html = await generateClinicalReportHtml(language);
  const { uri } = await Print.printToFileAsync({
    html,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      UTI: '.pdf',
      dialogTitle:
        language === 'en'
          ? 'Share Habits Dossier'
          : 'Partilhar Dossiê de Hábitos',
      mimeType: 'application/pdf',
    });
  }

  return uri;
}
