const VERIFY_PURCHASE_FUNCTION = 'verify-purchase';
const VERIFICATION_TIMEOUT_MS = 15_000;

export type PurchaseVerificationType = 'product' | 'subscription';
export type PurchaseVerificationResult = 'invalid' | 'unverified' | 'valid';

interface VerifyPurchaseInput {
  productId: string;
  purchaseToken?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getFunctionConfiguration(): { publishableKey: string; url: string } | null {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey =
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!supabaseUrl || !publishableKey) {
    return null;
  }

  return {
    publishableKey,
    url: `${supabaseUrl.replace(/\/$/, '')}/functions/v1/${VERIFY_PURCHASE_FUNCTION}`,
  };
}

/**
 * Verifica uma compra Google Play junto do servidor Supabase.
 * Nunca bloqueia a ativação local: falhas de rede, configuração em falta
 * ou erros internos do servidor devolvem "unverified" e o cliente decide.
 */
export async function verifyPurchaseWithServer(
  purchase: VerifyPurchaseInput,
  type: PurchaseVerificationType,
): Promise<PurchaseVerificationResult> {
  if (!purchase.purchaseToken) {
    return 'unverified';
  }

  const configuration = getFunctionConfiguration();

  if (!configuration) {
    return 'unverified';
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), VERIFICATION_TIMEOUT_MS);

  try {
    const response = await fetch(configuration.url, {
      body: JSON.stringify({
        productId: purchase.productId,
        purchaseToken: purchase.purchaseToken,
        type,
      }),
      headers: {
        apikey: configuration.publishableKey,
        Authorization: `Bearer ${configuration.publishableKey}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      signal: controller.signal,
    });

    if (!response.ok) {
      return 'unverified';
    }

    const payload = (await response.json()) as unknown;

    if (!isRecord(payload)) {
      return 'unverified';
    }

    if (payload.mode === 'rejected' || payload.verified === false) {
      return payload.mode === 'rejected' ? 'invalid' : 'unverified';
    }

    if (payload.verified === true) {
      return 'valid';
    }

    // mode "unconfigured" | "error" ou resposta inesperada
    return 'unverified';
  } catch {
    return 'unverified';
  } finally {
    clearTimeout(timeout);
  }
}
