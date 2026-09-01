# KYNIO

Tracker local e gamificado de jejum, refeições e treinos, criado com Expo, React Native e TypeScript.

## Executar

```bash
npm install
npm start
```

Use `npm run android` ou `npm run web` para abrir diretamente uma plataforma. A preparação de
distribuição atual está focada em Android.

## Verificação

```bash
npm run typecheck
npm test
npx expo install --check
```

Os testes unitários usam Jest com o preset `jest-expo`. `npm run test:watch` inicia o modo de
desenvolvimento e `npm run test:coverage` gera o relatório de cobertura em `coverage/`. Os mocks
manuais de Expo SQLite e Zustand impedem acesso à base real e repõem os stores entre testes.
Os testes de componentes usam `@testing-library/react-native`; a integração da tab de Refeições
substitui a API de IA e o serviço SQLite por mocks e verifica explicitamente que `fetch` não é
chamado.

## Testes E2E com Maestro

Os fluxos em `.maestro/` testam o onboarding, o início do temporizador, a exportação RGPD,
o registo manual de treinos, o contador de água, o registo de peso, o paywall e a alternância
de tema/idioma num binário nativo com o identificador `com.kynio.app`. O Maestro é uma
ferramenta externa e não adiciona dependências ao bundle React Native. Com a CLI instalada e
uma development build aberta num emulador/simulador, execute:

```bash
npm run e2e:onboarding
npm run e2e:export
npm run e2e:workout
npm run e2e:water
npm run e2e:weight
npm run e2e:paywall
npm run e2e:theme-language
# ou toda a suite
npm run e2e
```

O fluxo de exportação fecha a folha nativa de partilha antes de validar a confirmação na app. Em
Android, usa o botão nativo de voltar para fechar o seletor.

Os dados da aplicação começam guardados localmente com Expo SQLite e Drizzle ORM. A sincronização
remota só é ativada quando o utilizador liga voluntariamente uma conta Google.

## Tema e idioma

Em **Perfil → Definições** (e também no ecrã de Privacidade) é possível escolher modo Claro ou
Escuro e Português ou English. As preferências ficam no armazenamento local do dispositivo. O
onboarding permite escolher PT/EN antes de aceitar o aviso legal.

## Partilha de conquistas

O perfil gera um cartão PNG com nível, XP, streak e insígnias e partilha-o juntamente com um link.
Defina o destino público quando existir uma landing page ou página nas lojas:

```bash
EXPO_PUBLIC_APP_SHARE_URL=https://exemplo.com/kynio
```

Sem essa variável, a app usa `https://github.com/sxnraku/KYNIO`. No browser, quando a Web Share API
não aceita ficheiros, a imagem é descarregada e o texto com o link é copiado. A integração nativa
usa `react-native-share`, por isso Android precisa de uma development build nova depois desta
alteração; o Expo Go não contém este módulo nativo.

## Base de dados local

O schema encontra-se em `db/schema.ts` e as migrações empacotadas em `drizzle/`.

```bash
npm run db:generate
npm run db:check
```

As migrações são aplicadas automaticamente no primeiro acesso à base de dados local.

## Análise de refeições

A tab de Refeições envia texto/imagem para uma Edge Function Supabase, que chama a API Gemini e
devolve JSON estrito. O cliente precisa apenas das credenciais públicas Supabase:

```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

A chave Gemini fica exclusivamente no segredo `GEMINI_API_KEY` da função `analyze-meal` e nunca no
bundle. A função usa `store: false`, valida entrada e saída, limita abuso através de um hash salgado
temporário e não guarda fotografias ou descrições. Os registos confirmados — incluindo uma cópia
privada da imagem — ficam na SQLite e no diretório de documentos do dispositivo.

Consulte `docs/ANDROID_RELEASE.md` para publicar schema, segredos e funções.

## Privacidade, consentimento e RGPD

No primeiro arranque, a navegação fica bloqueada até existir uma aceitação explícita do aviso
legal. A data dessa aceitação é guardada apenas no perfil SQLite local.

O ícone de escudo no cabeçalho abre `app/settings.tsx`, onde é possível:

- exportar `fasts`, `meals` e `user_profile` para um ficheiro JSON;
- eliminar a base SQLite, as imagens privadas, os ficheiros temporários de exportação e o estado
  local em memória;
- consultar o aviso legal, Política de Privacidade, Termos, suporte e eliminação pela web.

A exportação não carrega dados para um servidor: em Android abre a folha nativa de partilha e na
Web cria um download local. Chamadas de rede só ocorrem nas funcionalidades opcionais escolhidas:
conta/sincronização Supabase, páginas legais e análise explícita de uma refeição. A chamada ao
Gemini não inclui o ID da conta nem o restante histórico local.

## Distribuição Android

O projeto inclui `eas.json`, perfil de produção AAB, páginas legais públicas, eliminação autenticada
pela web, rascunho Data Safety e textos da loja. Execute:

```bash
npm run release:check
npm run build:android:production
```

O procedimento completo e as ações que exigem contas Expo, Supabase, Google e Play Console estão em
`docs/ANDROID_RELEASE.md`.
