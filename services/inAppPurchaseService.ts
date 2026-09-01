import { Platform } from "react-native";
import {
  initConnection,
  endConnection,
  getSubscriptions,
  getProducts,
  requestSubscription,
  requestPurchase,
  getAvailablePurchases,
  finishTransaction,
  flushFailedPurchasesCachedAsPendingAndroid,
  type Subscription,
  type Product,
  type Purchase,
  type PurchaseError,
} from "react-native-iap";

export const IAP_SKUS = {
  ANNUAL_SUBSCRIPTION: "kynio_pro_yearly",
  MONTHLY_SUBSCRIPTION: "kynio_pro_monthly",
  LIFETIME_PRODUCT: "kynio_pro_lifetime",
} as const;

export const ALL_SUBSCRIPTION_SKUS = [
  IAP_SKUS.ANNUAL_SUBSCRIPTION,
  IAP_SKUS.MONTHLY_SUBSCRIPTION,
];

export const ALL_PRODUCT_SKUS = [
  IAP_SKUS.LIFETIME_PRODUCT,
];

export interface FormattedPlanInfo {
  sku: string;
  title: string;
  priceFormatted: string;
  monthlyEquivalentFormatted?: string;
  currency: string;
  hasFreeTrial: boolean;
  trialPeriodDays?: number;
  offerToken?: string;
}

let isInitialized = false;

/**
 * Initializes the Google Play Billing / App Store connection.
 */
export async function initializeIap(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  try {
    const result = await initConnection();
    isInitialized = Boolean(result);

    if (Platform.OS === "android") {
      try {
        await flushFailedPurchasesCachedAsPendingAndroid();
      } catch {
        // Silently ignore flush errors on start
      }
    }

    return isInitialized;
  } catch (error) {
    console.warn("[IAP] Failed to initialize connection:", error);
    isInitialized = false;
    return false;
  }
}

/**
 * Closes the IAP connection.
 */
export async function closeIapConnection(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await endConnection();
    isInitialized = false;
  } catch {
    // Ignore close errors
  }
}

/**
 * Fetches real subscription and product pricing from the Google Play Store.
 */
export async function fetchStoreOfferings(): Promise<{
  annual?: FormattedPlanInfo;
  monthly?: FormattedPlanInfo;
  lifetime?: FormattedPlanInfo;
}> {
  if (Platform.OS === "web") {
    return getDefaultFallbacks();
  }

  try {
    if (!isInitialized) {
      await initializeIap();
    }

    const [subscriptions, products] = await Promise.all([
      getSubscriptions({ skus: ALL_SUBSCRIPTION_SKUS }).catch(() => [] as Subscription[]),
      getProducts({ skus: ALL_PRODUCT_SKUS }).catch(() => [] as Product[]),
    ]);

    const result: {
      annual?: FormattedPlanInfo;
      monthly?: FormattedPlanInfo;
      lifetime?: FormattedPlanInfo;
    } = {};

    // Parse Subscriptions
    for (const sub of subscriptions) {
      const isAnnual = sub.productId === IAP_SKUS.ANNUAL_SUBSCRIPTION;
      const isMonthly = sub.productId === IAP_SKUS.MONTHLY_SUBSCRIPTION;

      if (isAnnual || isMonthly) {
        // Android Google Play Billing v5+ uses subscriptionOfferDetails
        const offerDetails = (sub as unknown as { subscriptionOfferDetails?: Array<{
          offerToken: string;
          pricingPhases: {
            pricingPhaseList: Array<{
              formattedPrice: string;
              priceCurrencyCode: string;
              priceAmountMicros: string;
              billingPeriod: string;
            }>;
          };
        }> }).subscriptionOfferDetails;

        let formattedPrice = isAnnual ? "34,99 €" : "4,99 €";
        let currency = "EUR";
        let offerToken: string | undefined = undefined;
        let hasFreeTrial = false;

        if (offerDetails && offerDetails.length > 0) {
          const firstOffer = offerDetails[0];
          offerToken = firstOffer.offerToken;
          const phases = firstOffer.pricingPhases?.pricingPhaseList || [];
          
          if (phases.length > 1) {
            // There is a trial or introductory phase
            hasFreeTrial = true;
            formattedPrice = phases[phases.length - 1].formattedPrice;
            currency = phases[phases.length - 1].priceCurrencyCode;
          } else if (phases.length === 1) {
            formattedPrice = phases[0].formattedPrice;
            currency = phases[0].priceCurrencyCode;
          }
        }

        const planInfo: FormattedPlanInfo = {
          sku: sub.productId,
          title: sub.title || (isAnnual ? "Plano Anual" : "Plano Mensal"),
          priceFormatted: formattedPrice,
          currency,
          hasFreeTrial,
          trialPeriodDays: hasFreeTrial ? 7 : undefined,
          offerToken,
        };

        if (isAnnual) {
          result.annual = planInfo;
        } else {
          result.monthly = planInfo;
        }
      }
    }

    // Parse Lifetime Product
    for (const prod of products) {
      if (prod.productId === IAP_SKUS.LIFETIME_PRODUCT) {
        result.lifetime = {
          sku: prod.productId,
          title: prod.title || "Acesso Vitalício",
          priceFormatted: prod.localizedPrice || "69,99 €",
          currency: prod.currency || "EUR",
          hasFreeTrial: false,
        };
      }
    }

    return {
      annual: result.annual || getDefaultFallbacks().annual,
      monthly: result.monthly || getDefaultFallbacks().monthly,
      lifetime: result.lifetime || getDefaultFallbacks().lifetime,
    };
  } catch (error) {
    console.warn("[IAP] Error fetching offerings, using local fallbacks:", error);
    return getDefaultFallbacks();
  }
}

/**
 * Requests subscription purchase on Google Play.
 */
export async function buySubscriptionSku(
  sku: string,
  offerToken?: string,
): Promise<Purchase | null> {
  if (Platform.OS === "web") {
    throw new Error("Compras nativas não disponíveis na Web.");
  }

  if (!isInitialized) {
    await initializeIap();
  }

  if (Platform.OS === "android") {
    if (!offerToken) {
      throw new Error(
        "Oferta da subscrição indisponível no Google Play. Tenta novamente.",
      );
    }
    return (await requestSubscription({
      subscriptionOffers: [{ sku, offerToken }],
    })) as unknown as Purchase;
  }

  return (await requestSubscription({ sku })) as unknown as Purchase;
}

/**
 * Requests one-time in-app purchase (e.g. Lifetime).
 */
export async function buyOneTimeProductSku(sku: string): Promise<Purchase | null> {
  if (Platform.OS === "web") {
    throw new Error("Compras nativas não disponíveis na Web.");
  }

  if (!isInitialized) {
    await initializeIap();
  }

  return (await requestPurchase(
    Platform.OS === "android" ? { skus: [sku] } : { sku },
  )) as unknown as Purchase;
}

/**
 * Restores all previously active purchases for the user's Google account.
 */
export async function restoreActivePurchases(): Promise<{
  hasActiveSubscription: boolean;
  tier: "annual" | "monthly" | "lifetime" | "free";
  purchases: Purchase[];
}> {
  if (Platform.OS === "web") {
    return { hasActiveSubscription: false, tier: "free", purchases: [] };
  }

  try {
    if (!isInitialized) {
      await initializeIap();
    }

    const available = await getAvailablePurchases();

    let isLifetime = false;
    let isAnnual = false;
    let isMonthly = false;

    for (const p of available) {
      if (p.productId === IAP_SKUS.LIFETIME_PRODUCT) {
        isLifetime = true;
      } else if (p.productId === IAP_SKUS.ANNUAL_SUBSCRIPTION) {
        isAnnual = true;
      } else if (p.productId === IAP_SKUS.MONTHLY_SUBSCRIPTION) {
        isMonthly = true;
      }

      // Complete any pending acknowledge
      try {
        await finishTransaction({ purchase: p, isConsumable: false });
      } catch {
        // Ignore already finished
      }
    }

    if (isLifetime) {
      return { hasActiveSubscription: true, tier: "lifetime", purchases: available };
    }
    if (isAnnual) {
      return { hasActiveSubscription: true, tier: "annual", purchases: available };
    }
    if (isMonthly) {
      return { hasActiveSubscription: true, tier: "monthly", purchases: available };
    }

    return { hasActiveSubscription: false, tier: "free", purchases: available };
  } catch (error) {
    console.warn("[IAP] Restore purchases error:", error);
    return { hasActiveSubscription: false, tier: "free", purchases: [] };
  }
}

/**
 * Acknowledges the purchase with Google Play to ensure no automatic refunds occur.
 */
export async function confirmPurchaseTransaction(purchase: Purchase): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await finishTransaction({ purchase, isConsumable: false });
  } catch (error) {
    console.warn("[IAP] finishTransaction error:", error);
  }
}

function getDefaultFallbacks(): {
  annual: FormattedPlanInfo;
  monthly: FormattedPlanInfo;
  lifetime: FormattedPlanInfo;
} {
  return {
    annual: {
      sku: IAP_SKUS.ANNUAL_SUBSCRIPTION,
      title: "Plano Anual",
      priceFormatted: "34,99 €",
      monthlyEquivalentFormatted: "2,91 €",
      currency: "EUR",
      hasFreeTrial: true,
      trialPeriodDays: 7,
    },
    monthly: {
      sku: IAP_SKUS.MONTHLY_SUBSCRIPTION,
      title: "Plano Mensal",
      priceFormatted: "4,99 €",
      monthlyEquivalentFormatted: "4,99 €",
      currency: "EUR",
      hasFreeTrial: false,
    },
    lifetime: {
      sku: IAP_SKUS.LIFETIME_PRODUCT,
      title: "Acesso Vitalício",
      priceFormatted: "69,99 €",
      currency: "EUR",
      hasFreeTrial: false,
    },
  };
}
