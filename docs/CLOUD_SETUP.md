# Contas Google e sincronização remota

O KYNIO continua a guardar primeiro na SQLite do dispositivo. Quando o utilizador liga uma conta
Google, os registos são sincronizados com um projeto Supabase e ficam disponíveis nos outros
dispositivos ligados à mesma conta.

## 1. Criar o projeto

1. Cria um projeto Supabase numa região da União Europeia, como Frankfurt ou Irlanda.
2. No SQL Editor, executa `supabase/schema.sql`.
3. Em Authentication > Providers, ativa o Google e configura o Client ID e o Client Secret do
   Google Cloud.
4. Em Authentication > URL Configuration, adiciona os redirects usados pela app:
   - desenvolvimento nativo: `kynio://auth/callback`
   - desenvolvimento web: o endereço devolvido pelo Expo, normalmente
     `http://localhost:8081/auth/callback`
   - produção: os redirects finais da build publicada

O callback `/auth/callback` já faz parte da app e conclui a janela OAuth no web.

## 2. Variáveis locais

Copia `.env.example` para `.env.local` e preenche:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICAVEL
```

A publishable key pode existir no cliente; a proteção real é feita pelas políticas RLS de
`supabase/schema.sql`. Nunca coloques a `service_role` na app.

## 3. Eliminação de conta

Instala a Supabase CLI, liga o projeto e publica a função que remove a conta e os dados associados:

```bash
supabase functions deploy delete-account
```

O botão “Eliminar Todos os Dados” só conclui a eliminação remota se esta função estiver publicada.
Se a eliminação remota falhar, a app mantém os dados locais para evitar uma eliminação parcial.

## 4. Testar o Google no telemóvel

OAuth não deve ser validado no Expo Go. Usa uma development build (`npx expo run:android`,
`npx expo run:ios` ou EAS Development Build) para testar o redirect personalizado `kynio://`.

## Comportamento de sincronização

- A app guarda sempre primeiro no dispositivo e continua funcional sem internet.
- A sincronização ocorre ao iniciar/retomar a app, depois do login e após alterações locais.
- O utilizador também pode usar “Sincronizar agora” em Perfil > Definições.
- As políticas RLS limitam cada linha ao `auth.uid()` da sessão autenticada.
- Fotos originais de refeições não são copiadas para a cloud; só os valores e metadados do registo
  são sincronizados. A foto de perfil é guardada num bucket privado e disponibilizada através de
  links temporários apenas à conta autenticada.
