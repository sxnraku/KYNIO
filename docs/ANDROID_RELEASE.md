# Publicação Android do KYNIO

Este guia prepara uma publicação no Google Play sem incluir iOS. Nunca coloques a chave Gemini
numa variável `EXPO_PUBLIC_*`: tudo o que tem esse prefixo fica legível no bundle da aplicação.

## 1. Rodar a chave Gemini

A chave usada durante o desenvolvimento foi exposta num cliente e deve ser revogada no Google AI
Studio. Cria uma nova chave apenas para a Edge Function. Guarda-a em
`supabase/.env.functions` (ficheiro ignorado pelo Git):

```dotenv
GEMINI_API_KEY=nova-chave
GEMINI_MODEL=gemini-3.5-flash-lite
AI_RATE_LIMIT_SALT=uma-frase-aleatoria-longa-e-unica
ALLOWED_ORIGINS=https://sxnraku.github.io,http://localhost:8081,http://127.0.0.1:8081
```

## 2. Publicar a camada Supabase

Liga a CLI ao projeto, aplica `supabase/schema.sql`, instala os segredos e publica as funções:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
npx supabase secrets set --env-file supabase/.env.functions
npx supabase functions deploy analyze-meal --no-verify-jwt
npx supabase functions deploy delete-account --no-verify-jwt
npx supabase functions deploy verify-purchase --no-verify-jwt
```

A função `delete-account` valida internamente o JWT do utilizador. A função `analyze-meal` não envia
o JWT do utilizador ao Gemini e mantém apenas um hash salgado de rede por até uma hora para limitar
abuso. Fotografias e descrições não são guardadas pela função.

A função `verify-purchase` valida compras Google Play junto da API Android Publisher. Sem o segredo
abaixo responde em modo "soft" (`mode: "unconfigured"`) e a app ativa o Pro localmente como até aqui.
Para ativar a verificação real:

1. No **Google Play Console → Configuração → Acesso à API**, associa um projeto Google Cloud.
2. Nesse projeto Google Cloud, cria uma **conta de serviço** e gera uma chave JSON.
3. De volta ao Play Console, concede à conta de serviço acesso de leitura às compras
   (permissão financeira/de encomendas) para a app.
4. Guarda o JSON completo da chave (numa única linha) como segredo Supabase:

```bash
npx supabase secrets set GOOGLE_PLAY_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

A chave privada da conta de serviço fica apenas nos segredos Supabase; nunca na app nem no repositório.

## 3. Google OAuth

No Supabase Authentication, ativa Google e adiciona estes redirects permitidos:

- `kynio://auth/callback`
- `https://sxnraku.github.io/KYNIO/account-deletion.html`
- os URLs locais utilizados em desenvolvimento

Confirma também no Google Cloud que o redirect Supabase indicado pelo painel está autorizado.

## 4. Publicar Política, Termos e eliminação web

As credenciais publicáveis Supabase usadas pela página de eliminação já estão em
`legal-site/config.js`; não dão acesso administrativo e a proteção real continua nas políticas RLS.
Em **Settings → Pages**, escolhe **GitHub Actions** como origem. O workflow
`.github/workflows/legal-pages.yml` publica `legal-site/`. Confirma os quatro URLs:

- `https://sxnraku.github.io/KYNIO/privacy.html`
- `https://sxnraku.github.io/KYNIO/terms.html`
- `https://sxnraku.github.io/KYNIO/account-deletion.html`
- `https://sxnraku.github.io/KYNIO/support.html`

Faz uma revisão jurídica e substitui o contacto de projeto por um canal privado antes do lançamento
público. Issues do GitHub são apenas para suporte técnico sem dados pessoais.

## 5. Configurar EAS

```bash
npx eas-cli login
npx eas-cli init
npx eas-cli env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value URL_PUBLICO
npx eas-cli env:create --environment production --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value CHAVE_PUBLICAVEL
npx eas-cli env:create --environment production --name EXPO_PUBLIC_APP_SHARE_URL --value https://play.google.com/store/apps/details?id=com.kynio.app
npx eas-cli env:create --environment production --name EXPO_PUBLIC_LEGAL_BASE_URL --value https://sxnraku.github.io/KYNIO
```

As chaves Supabase acima são publicáveis; a proteção dos dados depende das políticas RLS. A chave
Gemini fica exclusivamente nos segredos Supabase.

## 6. Verificar e gerar o Android App Bundle

```bash
npm run release:check
npm run build:android:production
```

O perfil `production` gera `.aab`, usa assinatura gerida pelo EAS e incrementa o código da versão.
Instala primeiro um APK `preview` num Android real e executa os fluxos Maestro.

## 7. Play Console

1. Cria a aplicação com package `com.kynio.app`.
2. Usa os recursos prontos em `store/google-play/assets/app-icon-512x512.png` e
   `store/google-play/assets/feature-graphic-1024x500.png`; adiciona screenshots reais de um Android.
3. Adiciona Política de Privacidade e o URL de eliminação de conta.
4. Revê `docs/GOOGLE_PLAY_DATA_SAFETY.md` e preenche Data Safety com o comportamento da build final.
5. Define categoria, público-alvo e classificação etária sem alegações clínicas.
6. Envia primeiro para **Internal testing**, executa testes reais e só depois promove para produção.

O primeiro envio do AAB pelo EAS pode exigir que um AAB seja enviado manualmente uma vez no Play
Console. Guarda as credenciais da conta Play apenas no EAS/Google, nunca no repositório.
