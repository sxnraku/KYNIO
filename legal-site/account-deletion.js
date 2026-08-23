import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.112.3';

const config = window.KYNIO_PUBLIC_CONFIG ?? {};
const setupWarning = document.querySelector('#setup-warning');
const signedOut = document.querySelector('#signed-out');
const signedIn = document.querySelector('#signed-in');
const accountEmail = document.querySelector('#account-email');
const signInButton = document.querySelector('#sign-in-button');
const signOutButton = document.querySelector('#sign-out-button');
const deleteButton = document.querySelector('#delete-button');
const confirmation = document.querySelector('#delete-confirmation');
const status = document.querySelector('#deletion-status');
const isConfigured = Boolean(config.supabaseUrl && config.supabasePublishableKey);
const language = () => document.documentElement.dataset.activeLanguage ?? 'pt';

function setStatus(message, type = '') {
  status.textContent = message;
  status.className = `status ${type}`.trim();
}

function message(pt, en) {
  return language() === 'en' ? en : pt;
}

if (!isConfigured) {
  setupWarning.hidden = false;
  signedOut.hidden = true;
  signedIn.hidden = true;
} else {
  const supabase = createClient(config.supabaseUrl, config.supabasePublishableKey, {
    auth: { detectSessionInUrl: true, flowType: 'pkce', persistSession: true },
  });

  async function renderSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      setStatus(message('Não foi possível validar a sessão.', 'The session could not be verified.'), 'error');
      return;
    }

    const session = data.session;
    signedOut.hidden = Boolean(session);
    signedIn.hidden = !session;
    accountEmail.textContent = session?.user.email ?? session?.user.id ?? '';
  }

  signInButton.addEventListener('click', async () => {
    setStatus('');
    signInButton.disabled = true;
    const redirectTo = `${window.location.origin}${window.location.pathname}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });

    if (error) {
      signInButton.disabled = false;
      setStatus(message('Não foi possível abrir o Google.', 'Google sign-in could not be opened.'), 'error');
    }
  });

  confirmation.addEventListener('change', () => {
    deleteButton.disabled = !confirmation.checked;
  });

  signOutButton.addEventListener('click', async () => {
    await supabase.auth.signOut();
    confirmation.checked = false;
    deleteButton.disabled = true;
    setStatus('');
    await renderSession();
  });

  deleteButton.addEventListener('click', async () => {
    if (!confirmation.checked) return;
    deleteButton.disabled = true;
    signOutButton.disabled = true;
    setStatus(message('A eliminar…', 'Deleting…'));
    const { error } = await supabase.functions.invoke('delete-account');

    if (error) {
      deleteButton.disabled = false;
      signOutButton.disabled = false;
      setStatus(message('A conta não foi eliminada. Tenta novamente.', 'The account was not deleted. Please try again.'), 'error');
      return;
    }

    await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
    signedIn.hidden = true;
    signedOut.hidden = true;
    setStatus(message('Conta e dados sincronizados eliminados.', 'Account and synced data deleted.'), 'success');
  });

  await renderSession();
}
