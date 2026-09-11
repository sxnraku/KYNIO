import { supabase } from "@/services/supabaseClient";
import {
  SubscriptionTier,
  useSubscriptionStore,
} from "@/store/use-subscription-store";

/**
 * Stripe Payment Links for Web / PWA subscriptions.
 * Configured in Stripe Dashboard under "Payment Links" with redirect containing ?session_id={CHECKOUT_SESSION_ID}.
 */
export const STRIPE_PAYMENT_LINKS: Record<
  Exclude<SubscriptionTier, "free" | "trial">,
  string
> = {
  annual:
    process.env.EXPO_PUBLIC_STRIPE_ANNUAL_LINK ||
    "https://buy.stripe.com/3cI8wI0dj9yJcz8emw9ws00",
  monthly:
    process.env.EXPO_PUBLIC_STRIPE_MONTHLY_LINK ||
    "https://buy.stripe.com/aFaeV6d05eT356G0vG9ws02",
  lifetime:
    process.env.EXPO_PUBLIC_STRIPE_LIFETIME_LINK ||
    "https://buy.stripe.com/4gMaEQ8JP26hfLk1zK9ws01",
};

/**
 * Redirects the user to Stripe Checkout with support for Apple Pay, Google Pay, Cards, and MB WAY.
 */
export function openStripeCheckout(tier: SubscriptionTier): boolean {
  if (tier === "free" || tier === "trial") {
    return false;
  }

  const targetUrl = STRIPE_PAYMENT_LINKS[tier];
  if (!targetUrl) {
    return false;
  }

  if (typeof window !== "undefined") {
    window.location.href = targetUrl;
    return true;
  }

  return false;
}

/**
 * Checks if the user was redirected back from a successful Stripe Checkout.
 * Validates session_id with the Supabase Edge Function to prevent URL spoofing.
 */
export async function handleStripeReturnIfPresent(): Promise<boolean> {
  if (typeof window === "undefined" || typeof window.location === "undefined") {
    return false;
  }

  try {
    const url = new URL(window.location.href);
    const sessionId = url.searchParams.get("session_id");

    const cleanUrl = () => {
      url.searchParams.delete("checkout");
      url.searchParams.delete("sub");
      url.searchParams.delete("status");
      url.searchParams.delete("tier");
      url.searchParams.delete("session_id");
      window.history.replaceState({}, document.title, url.pathname + url.search);
    };

    // Sem session_id válido da Stripe (começado por cs_), rejeitar ativação espúria
    if (!sessionId || !sessionId.startsWith("cs_")) {
      if (url.searchParams.has("checkout") || url.searchParams.has("sub")) {
        cleanUrl();
      }
      return false;
    }

    // Se temos cliente Supabase configurado, validar via Edge Function segura
    if (supabase) {
      const { data, error } = await supabase.functions.invoke(
        "verify-stripe-payment",
        {
          body: { sessionId },
        },
      );

      cleanUrl();

      if (!error && data && data.valid === true) {
        const tier: SubscriptionTier =
          data.tier === "monthly" || data.tier === "lifetime"
            ? data.tier
            : "annual";
        useSubscriptionStore.getState().activateSubscription(tier);
        return true;
      }
      return false;
    }

    cleanUrl();
    return false;
  } catch {
    return false;
  }
}
