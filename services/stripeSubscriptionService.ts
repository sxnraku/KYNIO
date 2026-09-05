import type { SubscriptionTier } from "@/store/use-subscription-store";

/**
 * Native fallback (no-op). Native mobile apps use Google Play Billing / App Store instead of Stripe links.
 */
export const STRIPE_PAYMENT_LINKS: Record<string, string> = {};

export function openStripeCheckout(_tier: SubscriptionTier): boolean {
  return false;
}

export function handleStripeReturnIfPresent(): boolean {
  return false;
}
