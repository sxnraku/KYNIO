import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { linkCloudAccount, unlinkCloudAccount } from '@/services/dbService';
import { requireSupabase } from '@/services/supabaseClient';
import type { CloudAccount } from '@/types/cloud';

WebBrowser.maybeCompleteAuthSession();

function getMetadataString(metadata: Record<string, unknown>, key: string): string | null {
  const value = metadata[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
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
    throw new Error(error.message);
  }

  if (!data.session?.user) {
    return null;
  }

  const account = toCloudAccount(data.session.user);
  await persistLinkedAccount(account);
  return account;
}

export async function signInWithGoogle(): Promise<CloudAccount | null> {
  const client = requireSupabase();
  const redirectTo = makeRedirectUri({ scheme: 'kynio', path: 'auth/callback' });
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });

  if (error) {
    throw new Error(error.message);
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
    throw new Error(exchange.error.message);
  }

  const user = exchange.data.session?.user;

  if (!user) {
    throw new Error('Não foi possível criar a sessão do KYNIO.');
  }

  const account = toCloudAccount(user);
  await persistLinkedAccount(account);
  return account;
}

export async function signOutCloudAccount(): Promise<void> {
  const client = requireSupabase();
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
