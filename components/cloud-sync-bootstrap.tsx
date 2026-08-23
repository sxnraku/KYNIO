import { useEffect } from 'react';
import { AppState } from 'react-native';

import {
  requestCloudSync,
  runCloudSyncInBackground,
} from '@/services/cloudSyncScheduler';
import { supabase } from '@/services/supabaseClient';

export function CloudSyncBootstrap() {
  useEffect(() => {
    if (!supabase) {
      return;
    }

    runCloudSyncInBackground();

    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        runCloudSyncInBackground();
      }
    });
    const { data: authSubscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        requestCloudSync(1_200);
      }
    });

    return () => {
      appStateSubscription.remove();
      authSubscription.subscription.unsubscribe();
    };
  }, []);

  return null;
}
