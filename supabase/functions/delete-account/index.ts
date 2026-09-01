import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Origin': '*',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authorization = request.headers.get('Authorization');

  if (!authorization) {
    return new Response(JSON.stringify({ error: 'Sessão em falta.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const publishableKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Função remota não configurada.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  const userClient = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data, error } = await userClient.auth.getUser();

  if (error || !data.user) {
    return new Response(JSON.stringify({ error: 'Sessão inválida.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const avatarListing = await adminClient.storage.from('profile-avatars').list(data.user.id);

  if (!avatarListing.error && avatarListing.data.length) {
    await adminClient.storage
      .from('profile-avatars')
      .remove(avatarListing.data.map((file) => `${data.user.id}/${file.name}`));
  }

  const deletion = await adminClient.auth.admin.deleteUser(data.user.id);

  if (deletion.error) {
    console.error('[delete-account] Falha ao eliminar utilizador:', deletion.error);
    return new Response(JSON.stringify({ error: 'Não foi possível eliminar a conta. Tenta novamente mais tarde.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  return new Response(JSON.stringify({ deleted: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
});
