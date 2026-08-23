import { syncAllUserData } from '@/services/cloudSyncService';
import { isCloudSyncConfigured, supabase } from '@/services/supabaseClient';

let pendingSync: ReturnType<typeof setTimeout> | null = null;
let activeSync: Promise<void> | null = null;

async function syncIfAuthenticated(): Promise<void> {
  if (!isCloudSyncConfigured || !supabase || activeSync) {
    return;
  }

  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    return;
  }

  activeSync = syncAllUserData()
    .then(() => undefined)
    .catch(() => undefined)
    .finally(() => {
      activeSync = null;
    });

  await activeSync;
}

export function requestCloudSync(delayMs = 800): void {
  if (!isCloudSyncConfigured) {
    return;
  }

  if (pendingSync) {
    clearTimeout(pendingSync);
  }

  pendingSync = setTimeout(() => {
    pendingSync = null;
    void syncIfAuthenticated();
  }, delayMs);
}

export function runCloudSyncInBackground(): void {
  void syncIfAuthenticated();
}
