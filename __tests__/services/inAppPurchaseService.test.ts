import {
  initializeIap,
  fetchStoreOfferings,
  buySubscriptionSku,
  buyOneTimeProductSku,
  restoreActivePurchases,
  IAP_SKUS,
} from "@/services/inAppPurchaseService";

jest.mock("react-native-iap", () => ({
  initConnection: jest.fn().mockResolvedValue(true),
  endConnection: jest.fn().mockResolvedValue(true),
  getSubscriptions: jest.fn().mockResolvedValue([
    {
      productId: "kynio_pro_yearly",
      title: "Plano Anual",
      localizedPrice: "34,99 €",
      currency: "EUR",
      subscriptionOfferDetails: [
        {
          offerToken: "mock_offer_token_annual",
          pricingPhases: {
            pricingPhaseList: [
              {
                formattedPrice: "0,00 €",
                priceCurrencyCode: "EUR",
                priceAmountMicros: "0",
                billingPeriod: "P7D",
              },
              {
                formattedPrice: "34,99 €",
                priceCurrencyCode: "EUR",
                priceAmountMicros: "34990000",
                billingPeriod: "P1Y",
              },
            ],
          },
        },
      ],
    },
    {
      productId: "kynio_pro_monthly",
      title: "Plano Mensal",
      localizedPrice: "4,99 €",
      currency: "EUR",
      subscriptionOfferDetails: [
        {
          offerToken: "mock_offer_token_monthly",
          pricingPhases: {
            pricingPhaseList: [
              {
                formattedPrice: "4,99 €",
                priceCurrencyCode: "EUR",
                priceAmountMicros: "4990000",
                billingPeriod: "P1M",
              },
            ],
          },
        },
      ],
    },
  ]),
  getProducts: jest.fn().mockResolvedValue([
    {
      productId: "kynio_pro_lifetime",
      title: "Acesso Vitalício",
      localizedPrice: "69,99 €",
      currency: "EUR",
    },
  ]),
  requestSubscription: jest.fn().mockResolvedValue({
    productId: "kynio_pro_yearly",
    purchaseToken: "mock_token_123",
    transactionId: "GPA.1234-5678-9012",
  }),
  requestPurchase: jest.fn().mockResolvedValue({
    productId: "kynio_pro_lifetime",
    purchaseToken: "mock_token_life",
    transactionId: "GPA.9999-8888-7777",
  }),
  getAvailablePurchases: jest.fn().mockResolvedValue([
    {
      productId: "kynio_pro_yearly",
      purchaseToken: "mock_token_123",
    },
  ]),
  finishTransaction: jest.fn().mockResolvedValue(true),
  flushFailedPurchasesCachedAsPendingAndroid: jest.fn().mockResolvedValue(true),
}));

describe("inAppPurchaseService", () => {
  it("initializes IAP connection successfully", async () => {
    const initialized = await initializeIap();
    expect(initialized).toBe(true);
  });

  it("fetches store offerings and parses subscriptions and products correctly", async () => {
    const offerings = await fetchStoreOfferings();
    expect(offerings.annual).toBeDefined();
    expect(offerings.annual?.sku).toBe(IAP_SKUS.ANNUAL_SUBSCRIPTION);
    expect(offerings.annual?.offerToken).toBe("mock_offer_token_annual");
    expect(offerings.annual?.priceFormatted).toBe("34,99 €");

    expect(offerings.monthly).toBeDefined();
    expect(offerings.monthly?.sku).toBe(IAP_SKUS.MONTHLY_SUBSCRIPTION);

    expect(offerings.lifetime).toBeDefined();
    expect(offerings.lifetime?.sku).toBe(IAP_SKUS.LIFETIME_PRODUCT);
  });

  it("requests subscription purchase with correct SKU and offerToken", async () => {
    const purchase = await buySubscriptionSku(IAP_SKUS.ANNUAL_SUBSCRIPTION, "mock_offer_token_annual");
    expect(purchase).toBeDefined();
    expect(purchase?.purchaseToken).toBe("mock_token_123");
  });

  it("requests one-time lifetime purchase", async () => {
    const purchase = await buyOneTimeProductSku(IAP_SKUS.LIFETIME_PRODUCT);
    expect(purchase).toBeDefined();
    expect(purchase?.purchaseToken).toBe("mock_token_life");
  });

  it("restores active purchases and identifies active annual subscription", async () => {
    const result = await restoreActivePurchases();
    expect(result.hasActiveSubscription).toBe(true);
    expect(result.tier).toBe("annual");
  });
});
