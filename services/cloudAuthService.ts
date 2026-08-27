import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { linkCloudAccount, unlinkCloudAccount } from '@/services/dbService';
import { requireSupabase } from '@/services/supabaseClient';
import type { CloudAccount } from '@/types/cloud';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ||
  '590155512529-0r43ejrr20iousklkjvkjtqmr3l1kmm7.apps.googleusercontent.com';

if (Platform.OS !== 'web') {
  try {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      scopes: ['profile', 'email'],
    });
  } catch {
    // Silently ignore configure errors
  }
}

function getMetadataString(
  metadata: Record<string, unknown>,
  key: string,
): string | null {
  const value = metadata[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function getCloudAuthErrorMessage(message: string): string {
  const normalized = message.toLowerCase();

  if (
    normalized.includes('unsupported provider') ||
    normalized.includes('provider is not enabled')
  ) {
    return 'O login Google ainda não está ativado no servidor KYNIO. Tenta novamente após a configuração do fornecedor.';
  }

  if (normalized.includes('redirect') || normalized.includes('callback')) {
    return 'A ligação Google não reconheceu o endereço de regresso da app.';
  }

  return message;
}

export function toCloudAccount(user: {
  email?: string;
  id: string;
  user_metadata: Record<string, unknown>;
}): CloudAccount {
  const displayName =
    getMetadataString(user.user_metadata, 'full_name') ??
    getMetadataString(user.user_metadata, 'name') ??
    user.email?.split('@')[0] ??
    'Utilizador KYNIO';

  return {
    avatarUrl:
      getMetadataString(user.user_metadata, 'avatar_url') ??
      getMetadataString(user.user_metadata, 'picture'),
    displayName,
    email: user.email ?? null,
    userId: user.id,
  };
}

async function persistLinkedAccount(account: CloudAccount): Promise<void> {
  await linkCloudAccount({
    avatarUrl: account.avatarUrl,
    displayName: account.displayName,
    email: account.email,
    userId: account.userId,
  });
}

export async function getCurrentCloudAccount(): Promise<CloudAccount | null> {
  const client = requireSupabase();
  const { data, error } = await client.auth.getSession();

  if (error) {
    throw new Error(getCloudAuthErrorMessage(error.message));
  }

  if (!data.session?.user) {
    return null;
  }

  const account = toCloudAccount(data.session.user);
  await persistLinkedAccount(account);
  return account;
}

async function signInWithWebOAuth(): Promise<CloudAccount | null> {
  const client = requireSupabase();
  const redirectTo = makeRedirectUri({
    scheme: 'kynio',
    path: 'auth/callback',
  });
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });

  if (error) {
    throw new Error(getCloudAuthErrorMessage(error.message));
  }

  if (!data.url) {
    throw new Error('O Google não devolveu um endereço de autenticação.');
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== 'success' || !result.url) {
    return null;
  }

  const callbackUrl = new URL(result.url);
  const code = callbackUrl.searchParams.get('code');

  if (!code) {
    throw new Error('A autenticação Google não devolveu um código válido.');
  }

  const exchange = await client.auth.exchangeCodeForSession(code);

  if (exchange.error) {
    throw new Error(getCloudAuthErrorMessage(exchange.error.message));
  }

  const user = exchange.data.session?.user;

  if (!user) {
    throw new Error('Não foi possível criar a sessão do KYNIO.');
  }

  const account = toCloudAccount(user);
  await persistLinkedAccount(account);
  return account;
}

export async function signInWithGoogle(): Promise<CloudAccount | null> {
  const client = requireSupabase();

  // 1. Tentar Fluxo Nativo no Android e iOS
  if (Platform.OS !== 'web') {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken ?? (response as any).idToken;

      if (idToken) {
        const { data, error } = await client.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });

        if (!error && data.session?.user) {
          const account = toCloudAccount(data.session.user);
          await persistLinkedAccount(account);
          return account;
        }
      }
    } catch (nativeError: any) {
      if (
        nativeError.code === statusCodes.SIGN_IN_CANCELLED ||
        nativeError.message?.includes('CANCELLED')
      ) {
        return null;
      }
      // Se der DEVELOPER_ERROR (ex: SHA-1 ainda não registada na Google Cloud),
      // faz fallback automático para o Web OAuth sem quebrar para o utilizador!
    }
  }

  // 2. Fallback fiável para Web OAuth
  return await signInWithWebOAuth();
}

export async function signOutCloudAccount(): Promise<void> {
  const client = requireSupabase();

  if (Platform.OS !== 'web') {
    try {
      await GoogleSignin.signOut();
    } catch {
      // Ignorar se não estava conectado nativamente
    }
  }

  const { error } = await client.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  await unlinkCloudAccount();
}

export async function deleteCloudAccountAndData(): Promise<void> {
  const client = requireSupabase();
  const { data } = await client.auth.getSession();

  if (!data.session) {
    return;
  }

  const result = await client.functions.invoke('delete-account');

  if (result.error) {
    throw new Error(result.error.message);
  }

  await client.auth.signOut({ scope: 'local' });
}
