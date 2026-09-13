/**
 * solarCycleService.ts
 *
 * Cálculo matemático determinístico e 100% local do ciclo solar diário
 * (amanhecer, meio-dia solar e pôr do sol) com base na data do dispositivo
 * e fuso horário resolvido (sem chamadas de rede nem permissões de GPS).
 *
 * Princípio Circadiano: O ritmo biológico humano regula a sensibilidade à
 * insulina, melatonina e termogénese de acordo com a exposição à luz natural.
 */

export type SolarPhase =
  | 'dawn'               // Primeira luz antes do amanhecer
  | 'active_daylight'   // Janela ótima de ingestão e gasto metabólico
  | 'golden_hour'       // Fim de tarde: declínio da sensibilidade à insulina
  | 'circadian_night';  // Noite circadiana: fase de repouso e autofagia

export interface SolarCycleInfo {
  sunrise: string;          // Formato "HH:MM"
  sunset: string;           // Formato "HH:MM"
  solarNoon: string;        // Formato "HH:MM"
  sunriseTimestamp: number; // Milissegundos Unix
  sunsetTimestamp: number;  // Milissegundos Unix
  daylightDurationHours: number; // Duração da luz do dia em horas
  isDaylight: boolean;      // True se estiver entre sunrise e sunset
  daylightProgress: number; // 0.0 a 1.0 (apenas durante o dia; 0 à noite)
  phase: SolarPhase;
  phaseLabel: string;       // Rótulo descritivo pt-PT ou en-US
  circadianTip: string;     // Observação biológica neutra
}

/** Coordenadas aproximadas por padrão de timezone (latitude, longitude). */
const TIMEZONE_COORDINATES: Record<string, [number, number]> = {
  // Europa Ocidental / Portugal
  'Europe/Lisbon': [38.72, -9.14],
  'Atlantic/Madeira': [32.65, -16.91],
  'Atlantic/Azores': [37.74, -25.67],
  'Europe/London': [51.51, -0.13],
  'Europe/Madrid': [40.42, -3.70],
  'Europe/Paris': [48.86, 2.35],
  'Europe/Berlin': [52.52, 13.40],
  'Europe/Rome': [41.90, 12.50],
  // Américas
  'America/Sao_Paulo': [-23.55, -46.63],
  'America/Rio_de_Janeiro': [-22.91, -43.17],
  'America/New_York': [40.71, -74.01],
  'America/Chicago': [41.88, -87.63],
  'America/Denver': [39.74, -104.99],
  'America/Los_Angeles': [34.05, -118.24],
  'America/Toronto': [43.65, -79.38],
  // Ásia / Oceânia
  'Asia/Tokyo': [35.68, 139.69],
  'Australia/Sydney': [-33.87, 151.21],
};

const DEFAULT_COORDINATES: [number, number] = [38.72, -9.14]; // Lisboa por predefinição

function resolveDeviceCoordinates(): [number, number] {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_COORDINATES[tz]) {
      return TIMEZONE_COORDINATES[tz];
    }
    // Inferência por deslocamento de fuso se a timezone exata não estiver no mapa
    const offsetHours = -new Date().getTimezoneOffset() / 60;
    if (offsetHours >= -1 && offsetHours <= 2) {
      return [40.0, -5.0]; // Europa / Ibéria
    }
    if (offsetHours >= -5 && offsetHours <= -3) {
      return [-23.0, -45.0]; // Brasil / América do Sul
    }
    if (offsetHours >= -8 && offsetHours <= -4) {
      return [38.0, -95.0]; // EUA / América do Norte
    }
  } catch {
    // Fallback silencioso
  }
  return DEFAULT_COORDINATES;
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDegrees(rad: number): number {
  return (rad * 180) / Math.PI;
}

function pad2(n: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(2, '0');
}

/**
 * Calcula os horários solares com base nas equações astronómicas de Spencer / NOAA.
 */
export function calculateSolarCycle(
  referenceDate: Date = new Date(),
  language: 'pt' | 'en' = 'pt',
): SolarCycleInfo {
  const [lat, lon] = resolveDeviceCoordinates();

  const year = referenceDate.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor(
    (referenceDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000),
  ) + 1;

  // Declinação solar aproximada em radianos
  const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const declination = toRadians(23.45 * Math.sin(b));

  // Equação do tempo (EoT) em minutos
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);

  // Ângulo zenital solar padrão para o nascer/pôr do sol com refração atmosférica (90.833°)
  const zenith = toRadians(90.833);
  const latRad = toRadians(lat);

  const cosHourAngle =
    (Math.cos(zenith) - Math.sin(latRad) * Math.sin(declination)) /
    (Math.cos(latRad) * Math.cos(declination));

  // Limitação entre -1 e 1 para latitudes extremas (ex.: sol da meia-noite)
  const clampedCos = Math.max(-1, Math.min(1, cosHourAngle));
  const hourAngleDeg = toDegrees(Math.acos(clampedCos));
  const halfDayHours = hourAngleDeg / 15;

  // Deslocamento de fuso horário local em minutos
  const tzOffsetMinutes = -referenceDate.getTimezoneOffset();
  const tzOffsetHours = tzOffsetMinutes / 60;

  // Meio-dia solar em horas locais
  const solarNoonHours = 12 + (tzOffsetHours - lon / 15) - eot / 60;

  const sunriseHoursDecimal = solarNoonHours - halfDayHours;
  const sunsetHoursDecimal = solarNoonHours + halfDayHours;

  const createDateAtHours = (decimalHours: number): Date => {
    const d = new Date(referenceDate);
    const totalMinutes = Math.round(decimalHours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = Math.max(0, totalMinutes % 60);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const sunriseDate = createDateAtHours(sunriseHoursDecimal);
  const sunsetDate = createDateAtHours(sunsetHoursDecimal);
  const noonDate = createDateAtHours(solarNoonHours);

  const sunriseStr = `${pad2(sunriseDate.getHours())}:${pad2(sunriseDate.getMinutes())}`;
  const sunsetStr = `${pad2(sunsetDate.getHours())}:${pad2(sunsetDate.getMinutes())}`;
  const noonStr = `${pad2(noonDate.getHours())}:${pad2(noonDate.getMinutes())}`;

  const currentMs = referenceDate.getTime();
  const sunriseMs = sunriseDate.getTime();
  const sunsetMs = sunsetDate.getTime();

  const isDaylight = currentMs >= sunriseMs && currentMs <= sunsetMs;
  const totalDaylightMs = Math.max(1, sunsetMs - sunriseMs);

  let daylightProgress = 0;
  if (isDaylight) {
    daylightProgress = Math.min(1, Math.max(0, (currentMs - sunriseMs) / totalDaylightMs));
  }

  // Determinação da fase circadiana do momento
  let phase: SolarPhase;
  let phaseLabel: string;
  let circadianTip: string;

  const oneHourMs = 60 * 60 * 1000;
  if (currentMs < sunriseMs - 30 * 60 * 1000) {
    phase = 'circadian_night';
    phaseLabel = language === 'en' ? 'Circadian Night' : 'Noite Circadiana';
    circadianTip =
      language === 'en'
        ? 'Melatonin high, core cellular renewal and autophagy active.'
        : 'Melatonina elevada; autofagia e renovação celular ativas.';
  } else if (currentMs >= sunriseMs - 30 * 60 * 1000 && currentMs < sunriseMs + oneHourMs) {
    phase = 'dawn';
    phaseLabel = language === 'en' ? 'Dawn & Early Sun' : 'Amanhecer & Primeira Luz';
    circadianTip =
      language === 'en'
        ? 'Natural cortisol rise, ideal window to hydrate.'
        : 'Elevação natural de cortisol; janela ideal para hidratação.';
  } else if (currentMs >= sunsetMs - oneHourMs && currentMs <= sunsetMs + 30 * 60 * 1000) {
    phase = 'golden_hour';
    phaseLabel = language === 'en' ? 'Solar Twilight' : 'Crepúsculo Solar';
    circadianTip =
      language === 'en'
        ? 'Insulin sensitivity decreasing, ideal time to close feeding window.'
        : 'Sensibilidade à insulina em declínio; ideal para encerrar alimentação.';
  } else if (isDaylight) {
    phase = 'active_daylight';
    phaseLabel = language === 'en' ? 'Metabolic Sunlight' : 'Luz Metabólica Ativa';
    circadianTip =
      language === 'en'
        ? 'Peak thermogenesis and optimal nutrient processing window.'
        : 'Pico termogénico e processamento ótimo de nutrientes.';
  } else {
    phase = 'circadian_night';
    phaseLabel = language === 'en' ? 'Circadian Night' : 'Noite Circadiana';
    circadianTip =
      language === 'en'
        ? 'Metabolic rest phase; body prioritizes lipid oxidation.'
        : 'Fase de repouso metabólico; oxidação lipídica e reparação.';
  }

  return {
    sunrise: sunriseStr,
    sunset: sunsetStr,
    solarNoon: noonStr,
    sunriseTimestamp: sunriseMs,
    sunsetTimestamp: sunsetMs,
    daylightDurationHours: Math.round((totalDaylightMs / (60 * 60 * 1000)) * 10) / 10,
    isDaylight,
    daylightProgress,
    phase,
    phaseLabel,
    circadianTip,
  };
}
