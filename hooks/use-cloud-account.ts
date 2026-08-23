import { useCallback, useEffect, useState } from 'react';

import {
  getCurrentCloudAccount,
  signInWithGoogle,
  signOutCloudAccount,
  toCloudAccount,
} from '@/services/cloudAuthService';
import { syncAllUserData } from '@/services/cloudSyncService';
import { isCloudSyncConfigured, supabase } from '@/services/supabaseClient';
import type { CloudAccount } from '@/types/cloud';

interface CloudAccountState {
  account: CloudAccount | null;
  error: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  message: string | null;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useCloudAccount(onLocalDataChanged?: () => void | Promise<void>) {
  const [state, setState] = useState<CloudAccountState>({
    account: null,
    error: null,
    isLoading: isCloudSyncConfigured,
    isSyncing: false,
    message: null,
  });

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isMounted = true;

    void getCurrentCloudAccount()
      .then((account) => {
        if (isMounted) {
          setState((current) => ({ ...current, account, isLoading: false }));
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setState((current) => ({
            ...current,
            error: getErrorMessage(error, 'Não foi possível recuperar a sessão.'),
            isLoading: false,
          }));
        }
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setState((current) => ({
          ...current,
          account: session?.user ? toCloudAccount(session.user) : null,
          isLoading: false,
        }));
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async () => {
    setState((current) => ({ ...current, error: null, isLoading: true, message: null }));

    try {
      const account = await signInWithGoogle();
      setState((current) => ({
        ...current,
        account: account ?? current.account,
        isLoading: false,
        message: account ? 'Conta Google ligada. Podes sincronizar os dados.' : null,
      }));
      await onLocalDataChanged?.();
    } catch (error) {
      setState((current) => ({
        ...current,
        error: getErrorMessage(error, 'Não foi possível ligar a conta Google.'),
        isLoading: false,
      }));
    }
  }, [onLocalDataChanged]);

  const signOut = useCallback(async () => {
    setState((current) => ({ ...current, error: null, isLoading: true, message: null }));

    try {
      await signOutCloudAccount();
      setState((current) => ({
        ...current,
        account: null,
        isLoading: false,
        message: 'Conta desligada. Os dados locais foram mantidos neste dispositivo.',
      }));
      await onLocalDataChanged?.();
    } catch (error) {
      setState((current) => ({
        ...current,
        error: getErrorMessage(error, 'Não foi possível desligar a conta.'),
        isLoading: false,
      }));
    }
  }, [onLocalDataChanged]);

  const syncNow = useCallback(async () => {
    if (!state.account || state.isSyncing) {
      return;
    }

    setState((current) => ({ ...current, error: null, isSyncing: true, message: null }));

    try {
      const result = await syncAllUserData();
      setState((current) => ({
        ...current,
        isSyncing: false,
        message: `Sincronização concluída: ${result.uploadedRecords} enviados, ${result.downloadedRecords} recebidos.`,
      }));
      await onLocalDataChanged?.();
    } catch (error) {
      setState((current) => ({
        ...current,
        error: getErrorMessage(error, 'Não foi possível sincronizar agora.'),
        isSyncing: false,
      }));
    }
  }, [onLocalDataChanged, state.account, state.isSyncing]);

  return {
    ...state,
    isConfigured: isCloudSyncConfigured,
    signIn,
    signOut,
    syncNow,
  };
}
