const corsHeaders = {
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Origin': '*',
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    if (!isRecord(body) || typeof body.sessionId !== 'string') {
      return jsonResponse({ error: 'sessionId é obrigatório.' }, 400);
    }

    const sessionId = body.sessionId.trim();
    if (!sessionId.startsWith('cs_')) {
      return jsonResponse(
        { error: 'Formato de session_id da Stripe inválido.' },
        400,
      );
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      // Modo seguro: se a chave não estiver configurada no Supabase,
      // rejeita ativação não autenticada para evitar evasão de pagamento.
      return jsonResponse(
        {
          error: 'Verificação da Stripe não configurada no servidor.',
          mode: 'unconfigured',
          valid: false,
        },
        503,
      );
    }

    // Consulta direta à API oficial da Stripe
    const stripeUrl = `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`;
    const stripeResponse = await fetch(stripeUrl, {
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
      },
      method: 'GET',
    });

    if (!stripeResponse.ok) {
      return jsonResponse(
        {
          error: 'Sessão de pagamento não encontrada na Stripe.',
          valid: false,
        },
        400,
      );
    }

    const sessionData = await stripeResponse.json();
    const isPaid =
      sessionData.payment_status === 'paid' ||
      sessionData.status === 'complete';

    if (!isPaid) {
      return jsonResponse(
        {
          error: 'O pagamento da sessão não foi concluído.',
          paymentStatus: sessionData.payment_status,
          valid: false,
        },
        402,
      );
    }

    // Identificar o tier a partir dos metadados ou valor
    let tier = 'annual';
    if (sessionData.metadata && typeof sessionData.metadata.tier === 'string') {
      tier = sessionData.metadata.tier;
    } else if (
      sessionData.amount_total &&
      typeof sessionData.amount_total === 'number'
    ) {
      // Exemplo: mensal (< 10€) vs anual vs lifetime (> 50€)
      if (sessionData.amount_total > 5000) {
        tier = 'lifetime';
      } else if (sessionData.amount_total < 1000) {
        tier = 'monthly';
      }
    }

    return jsonResponse(
      {
        customerEmail: sessionData.customer_details?.email ?? null,
        mode: 'verified',
        tier,
        valid: true,
      },
      200,
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno.';
    return jsonResponse({ error: message, valid: false }, 500);
  }
});
