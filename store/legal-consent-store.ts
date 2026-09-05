import { create } from 'zustand';

import { acceptLegalTerms, getUserProfile } from '@/services/dbService';

interface LegalConsentState {
  acceptTerms: () => Promise<void>;
  errorMessage: string | null;
  hasAcceptedTerms: boolean;
  hydrateConsent: () => Promise<void>;
  isAccepting: boolean;
  isHydrated: boolean;
  isLoading: boolean;
  resetConsent: () => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes('separador') ||
      msg.includes('bloqueada') ||
      msg.includes('invalid vfs state') ||
      msg.includes('nomodificationallowederror') ||
      msg.includes('createsyncaccesshandle') ||
      msg.includes('access handle') ||
      msg.includes('locked')
    ) {
      return 'A base de dados local está em uso noutro separador do navegador. Fecha o separador onde abriste o KYNIO e clica em "Tentar novamente".';
    }

    if (error.message && !error.message.includes('[object Object]')) {
      return error.message;
    }
  }

  return 'Não foi possível preparar o armazenamento local. Tenta novamente.';
}

export const useLegalConsentStore = create<LegalConsentState>((set, get) => ({
  acceptTerms: async () => {
    if (get().isAccepting) {
      return;
    }

    set({ errorMessage: null, isAccepting: true });

    try {
      await acceptLegalTerms();
      set({ hasAcceptedTerms: true, isAccepting: false });
    } catch (error) {
      set({ errorMessage: getErrorMessage(error), isAccepting: false });
    }
  },
  errorMessage: null,
  hasAcceptedTerms: false,
  hydrateConsent: async () => {
    if (get().isLoading) {
      return;
    }

    set({ errorMessage: null, isLoading: true });

    try {
      const profile = await getUserProfile();
      set({
        hasAcceptedTerms: profile.termsAcceptedAt !== null,
        isHydrated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ errorMessage: getErrorMessage(error), isHydrated: true, isLoading: false });
    }
  },
  isAccepting: false,
  isHydrated: false,
  isLoading: false,
  resetConsent: () =>
    set({
      errorMessage: null,
      hasAcceptedTerms: false,
      isAccepting: false,
      isHydrated: true,
      isLoading: false,
    }),
}));
