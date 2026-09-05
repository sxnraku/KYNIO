import { SubscriptionTier, useSubscriptionStore } from "@/store/use-subscription-store";

/**
 * Stripe Payment Links for Web / PWA subscriptions.
 * These can be configured in your Stripe Dashboard under "Payment Links".
 */
export const STRIPE_PAYMENT_LINKS: Record<Exclude<SubscriptionTier, "free" | "trial">, string> = {
  annual: process.env.EXPO_PUBLIC_STRIPE_ANNUAL_LINK || "https://buy.stripe.com/3cI8wI0dj9yJcz8emw9ws00",
  monthly: process.env.EXPO_PUBLIC_STRIPE_MONTHLY_LINK || "https://buy.stripe.com/aFaeV6d05eT356G0vG9ws02",
  lifetime: process.env.EXPO_PUBLIC_STRIPE_LIFETIME_LINK || "https://buy.stripe.com/4gMaEQ8JP26hfLk1zK9ws01",
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
 * Activates Pro and cleans the URL without reloading.
 */
export function handleStripeReturnIfPresent(): boolean {
  if (typeof window === "undefined" || typeof window.location === "undefined") {
    return false;
  }

  try {
    const url = new URL(window.location.href);
    const hasSuccess =
      url.searchParams.get("checkout") === "success" ||
      url.searchParams.get("sub") === "pro" ||
      url.searchParams.get("status") === "success";

    if (hasSuccess) {
      const tierParam = url.searchParams.get("tier");
      const tier: SubscriptionTier =
        tierParam === "monthly" || tierParam === "lifetime" ? tierParam : "annual";

      useSubscriptionStore.getState().activateSubscription(tier);

      // Clean query params from URL
      url.searchParams.delete("checkout");
      url.searchParams.delete("sub");
      url.searchParams.delete("status");
      url.searchParams.delete("tier");
      url.searchParams.delete("session_id");

      window.history.replaceState({}, document.title, url.pathname + url.search);
      return true;
    }
  } catch {
    // Ignore URL parse errors
  }

  return false;
}

