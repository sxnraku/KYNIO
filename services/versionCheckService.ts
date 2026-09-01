import Constants from "expo-constants";

export interface RemoteVersionInfo {
  minimumVersionCode: number;
  latestVersionCode: number;
  latestVersionName: string;
  forceUpdate: boolean;
  title?: string;
  title_en?: string;
  message?: string;
  message_en?: string;
  releaseNotes?: string[];
  storeUrl?: string;
}

export type VersionCheckStatus = "UP_TO_DATE" | "OPTIONAL_UPDATE" | "FORCE_UPDATE" | "ERROR";

export interface VersionCheckResult {
  status: VersionCheckStatus;
  currentVersionCode: number;
  currentVersionName: string;
  latestVersionName?: string;
  isForceUpdate: boolean;
  title?: string;
  message?: string;
  storeUrl: string;
}

// Lidos da configuração da app (app.json) via expo-constants, para nunca divergirem
// da build instalada. Os fallbacks correspondem a app.json e servem apenas quando
// expoConfig não está disponível (ex.: testes unitários).
const FALLBACK_VERSION_CODE = 20;
const FALLBACK_VERSION_NAME = "1.2.0";

function resolveCurrentVersionCode(): number {
  const code = Constants.expoConfig?.android?.versionCode;
  return typeof code === "number" && Number.isInteger(code) && code > 0
    ? code
    : FALLBACK_VERSION_CODE;
}

function resolveCurrentVersionName(): string {
  const version = Constants.expoConfig?.version;
  return typeof version === "string" && version.length > 0
    ? version
    : FALLBACK_VERSION_NAME;
}

export const CURRENT_VERSION_CODE = resolveCurrentVersionCode();
export const CURRENT_VERSION_NAME = resolveCurrentVersionName();

export const PLAY_STORE_PACKAGE = "com.kynio.app";
export const DEFAULT_STORE_URL = `market://details?id=${PLAY_STORE_PACKAGE}`;
export const FALLBACK_WEB_URL = `https://play.google.com/store/apps/details?id=${PLAY_STORE_PACKAGE}`;

const REMOTE_VERSION_URLS = [
  "https://raw.githubusercontent.com/sxnraku/KYNIO/main/public/version.json",
  "https://sxnraku.github.io/KYNIO/version.json",
];

export async function fetchRemoteVersionInfo(timeoutMs = 4000): Promise<RemoteVersionInfo | null> {
  for (const url of REMOTE_VERSION_URLS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(`${url}?t=${Date.now()}`, {
        headers: { "Cache-Control": "no-cache" },
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (response.ok) {
        const data = (await response.json()) as RemoteVersionInfo;
        if (typeof data.minimumVersionCode === "number") {
          return data;
        }
      }
    } catch {
      // Continue to fallback url
    }
  }
  return null;
}

export function evaluateVersion(
  remote: RemoteVersionInfo,
  currentCode = CURRENT_VERSION_CODE,
  currentName = CURRENT_VERSION_NAME,
): VersionCheckResult {
  const storeUrl = remote.storeUrl || DEFAULT_STORE_URL;

  if (currentCode < remote.minimumVersionCode && remote.forceUpdate) {
    return {
      status: "FORCE_UPDATE",
      currentVersionCode: currentCode,
      currentVersionName: currentName,
      latestVersionName: remote.latestVersionName,
      isForceUpdate: true,
      title: remote.title || "Atualização Obrigatória",
      message:
        remote.message ||
        "Uma nova versão do KYNIO é necessária para continuares a usar a aplicação com total segurança.",
      storeUrl,
    };
  }

  if (currentCode < remote.latestVersionCode) {
    return {
      status: "OPTIONAL_UPDATE",
      currentVersionCode: currentCode,
      currentVersionName: currentName,
      latestVersionName: remote.latestVersionName,
      isForceUpdate: false,
      title: remote.title || "Nova Versão Disponível",
      message:
        remote.message ||
        `O KYNIO ${remote.latestVersionName} já está disponível no Google Play com novas melhorias e novidades.`,
      storeUrl,
    };
  }

  return {
    status: "UP_TO_DATE",
    currentVersionCode: currentCode,
    currentVersionName: currentName,
    isForceUpdate: false,
    storeUrl,
  };
}

export async function checkAppVersion(): Promise<VersionCheckResult> {
  try {
    const remoteInfo = await fetchRemoteVersionInfo();
    if (!remoteInfo) {
      return {
        status: "UP_TO_DATE",
        currentVersionCode: CURRENT_VERSION_CODE,
        currentVersionName: CURRENT_VERSION_NAME,
        isForceUpdate: false,
        storeUrl: DEFAULT_STORE_URL,
      };
    }
    return evaluateVersion(remoteInfo);
  } catch {
    return {
      status: "ERROR",
      currentVersionCode: CURRENT_VERSION_CODE,
      currentVersionName: CURRENT_VERSION_NAME,
      isForceUpdate: false,
      storeUrl: DEFAULT_STORE_URL,
    };
  }
}
