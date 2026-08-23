import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';

export const isCloudSyncConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase: SupabaseClient | null = isCloudSyncConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        ...(Platform.OS === 'web' ? {} : { storage: AsyncStorage }),
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
        lock: processLock,
        persistSession: true,
      },
    })
  : null;

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Configura EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY para ativar contas e sincronização.',
    );
  }

  return supabase;
}

if (supabase && Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
