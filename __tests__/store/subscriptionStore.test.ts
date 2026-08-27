import { useSubscriptionStore } from "@/store/use-subscription-store";

describe("useSubscriptionStore", () => {
  beforeEach(() => {
    useSubscriptionStore.setState({
      dailyAiScansCount: 0,
      dailyAiScansDate: new Date().toISOString().slice(0, 10),
      expiresAt: null,
      isPro: false,
      maxFreeDailyAiScans: 3,
      tier: "free",
      trialStartedAt: null,
    });
  });

  it("initializes with free tier and 3 free scans", () => {
    const state = useSubscriptionStore.getState();
    expect(state.isPro).toBe(false);
    expect(state.tier).toBe("free");
    expect(state.getRemainingAiScans()).toBe(3);
    expect(state.canPerformAiScan()).toBe(true);
  });

  it("consumes daily scans and stops when limit reached", () => {
    const store = useSubscriptionStore.getState();

    expect(store.consumeAiScan()).toBe(true);
    expect(useSubscriptionStore.getState().getRemainingAiScans()).toBe(2);

    expect(store.consumeAiScan()).toBe(true);
    expect(useSubscriptionStore.getState().getRemainingAiScans()).toBe(1);

    expect(store.consumeAiScan()).toBe(true);
    expect(useSubscriptionStore.getState().getRemainingAiScans()).toBe(0);

    // 4th scan should fail for free users
    expect(store.canPerformAiScan()).toBe(false);
    expect(store.consumeAiScan()).toBe(false);
  });

  it("activates 7-day free trial and unlocks unlimited scans", () => {
    const store = useSubscriptionStore.getState();
    const trialActivated = store.activateFreeTrial();

    expect(trialActivated).toBe(true);
    const updated = useSubscriptionStore.getState();
    expect(updated.isPro).toBe(true);
    expect(updated.tier).toBe("trial");
    expect(updated.trialStartedAt).toBeTruthy();
    expect(updated.expiresAt).toBeTruthy();
    expect(updated.getRemainingAiScans()).toBe(999);
    expect(updated.canPerformAiScan()).toBe(true);
    expect(updated.consumeAiScan()).toBe(true);

    // Cannot reactivate trial a second time
    expect(updated.activateFreeTrial()).toBe(false);
  });

  it("activates annual subscription and cancels cleanly", () => {
    const store = useSubscriptionStore.getState();
    store.activateSubscription("annual");

    let state = useSubscriptionStore.getState();
    expect(state.isPro).toBe(true);
    expect(state.tier).toBe("annual");
    expect(state.expiresAt).toBeTruthy();

    store.cancelSubscription();
    state = useSubscriptionStore.getState();
    expect(state.isPro).toBe(false);
    expect(state.tier).toBe("free");
  });

  it("permite ativar planos mensais, vitalícios e durações personalizadas", () => {
    const store = useSubscriptionStore.getState();
    store.activateSubscription("monthly");
    expect(useSubscriptionStore.getState().tier).toBe("monthly");

    store.activateSubscription("lifetime");
    expect(useSubscriptionStore.getState().tier).toBe("lifetime");
    expect(useSubscriptionStore.getState().expiresAt).toBeNull();

    store.activateSubscription("annual", 14);
    expect(useSubscriptionStore.getState().expiresAt).toBeTruthy();
  });

  it("faz expirar subscrição vencida e faz rollover de data nos scans diários", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);

    useSubscriptionStore.setState({
      expiresAt: pastDate.toISOString(),
      isPro: true,
      tier: "annual",
    });

    expect(useSubscriptionStore.getState().canPerformAiScan()).toBe(true);
    expect(useSubscriptionStore.getState().isPro).toBe(false);

    useSubscriptionStore.setState({
      dailyAiScansCount: 3,
      dailyAiScansDate: "2020-01-01",
    });

    expect(useSubscriptionStore.getState().canPerformAiScan()).toBe(true);
    expect(useSubscriptionStore.getState().consumeAiScan()).toBe(true);
  });
});

