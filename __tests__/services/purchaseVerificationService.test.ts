import { verifyPurchaseWithServer } from '@/services/purchaseVerificationService';

const originalFetch = globalThis.fetch;

function mockFetchResponse(payload: unknown, ok = true) {
  globalThis.fetch = jest.fn().mockResolvedValue({
    json: jest.fn().mockResolvedValue(payload),
    ok,
  } as unknown as Response);
}

describe('purchaseVerificationService', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'publishable-key';
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    jest.restoreAllMocks();
  });

  it('devolve "unverified" quando não há purchaseToken', async () => {
    const result = await verifyPurchaseWithServer(
      { productId: 'kynio_pro_yearly' },
      'subscription',
    );

    expect(result).toBe('unverified');
    expect(globalThis.fetch).toBe(originalFetch);
  });

  it('devolve "unverified" sem variáveis de ambiente configuradas', async () => {
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    mockFetchResponse({ verified: true });

    const result = await verifyPurchaseWithServer(
      { productId: 'kynio_pro_yearly', purchaseToken: 'token' },
      'subscription',
    );

    expect(result).toBe('unverified');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('devolve "valid" quando o servidor confirma a compra', async () => {
    mockFetchResponse({ verified: true });

    const result = await verifyPurchaseWithServer(
      { productId: 'kynio_pro_yearly', purchaseToken: 'token' },
      'subscription',
    );

    expect(result).toBe('valid');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://example.supabase.co/functions/v1/verify-purchase',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('devolve "invalid" quando o servidor rejeita explicitamente', async () => {
    mockFetchResponse({ mode: 'rejected', verified: false });

    const result = await verifyPurchaseWithServer(
      { productId: 'kynio_pro_lifetime', purchaseToken: 'token' },
      'product',
    );

    expect(result).toBe('invalid');
  });

  it('devolve "unverified" em modo "unconfigured" ou "error"', async () => {
    mockFetchResponse({ mode: 'unconfigured', verified: false });

    await expect(
      verifyPurchaseWithServer(
        { productId: 'kynio_pro_yearly', purchaseToken: 'token' },
        'subscription',
      ),
    ).resolves.toBe('unverified');

    mockFetchResponse({ mode: 'error', verified: false });

    await expect(
      verifyPurchaseWithServer(
        { productId: 'kynio_pro_yearly', purchaseToken: 'token' },
        'subscription',
      ),
    ).resolves.toBe('unverified');
  });

  it('devolve "unverified" quando a resposta não é OK', async () => {
    mockFetchResponse({}, false);

    const result = await verifyPurchaseWithServer(
      { productId: 'kynio_pro_yearly', purchaseToken: 'token' },
      'subscription',
    );

    expect(result).toBe('unverified');
  });

  it('devolve "unverified" quando o fetch falha', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('sem rede'));

    const result = await verifyPurchaseWithServer(
      { productId: 'kynio_pro_yearly', purchaseToken: 'token' },
      'subscription',
    );

    expect(result).toBe('unverified');
  });
});
