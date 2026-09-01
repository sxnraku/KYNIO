# AGENTS.md — KYNIO

Guia para agentes de IA que trabalham neste repositório. Documentação e comentários do projeto
são em português (pt-PT); mantém esse idioma em novos artefactos, mensagens e strings da UI.

## Visão geral do projeto

**KYNIO** é uma aplicação mobile (Expo / React Native / TypeScript) de tracking gamificado de
jejum, refeições, água, peso e treinos, com XP, níveis, streaks e desafios semanais.

Princípios rígidos (de `.cursorrules`):

1. **Privacidade primeiro (RGPD)**: todos os dados de jejum, refeições e treinos ficam no
   dispositivo (Expo SQLite + Drizzle ORM). Não existe backend centralizado de utilizadores; a
   sincronização na cloud (Supabase) só é ativada quando o utilizador liga voluntariamente uma
   conta Google.
2. **Sem aconselhamento médico/fitness**: a linguagem da UI é neutra, informativa e descritiva.
   Nunca prescrever dietas, calorias obrigatórias ou treinos rígidos.
3. **Zero AI slop**: integrações de IA exigem respostas em JSON estrito. Nunca exibir texto
   corrido gerado por LLM na UI; a UI é 100% nativa.
4. **Código modular**: componentes pequenos, tipos TypeScript explícitos, sem `any`.

## Stack tecnológica

- **Expo SDK 57** (`expo ~57.0.16`), **React Native 0.86.2**, **React 19.2.3**, TypeScript
  (modo `strict`), Node 22.23.x / npm 10.9.x (fixados em `engines`).
- **expo-router** (typed routes ativados) para navegação; entrada `expo-router/entry`.
- **NativeWind 4** (Tailwind CSS) para estilos; config em `tailwind.config.js`, `global.css`,
  Babel com `babel-plugin-inline-import` para `.sql`.
- **Tipografia**: Hanken Grotesk (400/600/700/800) para texto e JetBrains Mono Medium para
  etiquetas, carregadas com `expo-font` em `app/_layout.tsx`
  (`@expo-google-fonts/hanken-grotesk`, `@expo-google-fonts/jetbrains-mono`); famílias Tailwind
  `font-body`, `font-headline`, `font-label`.
- **react-native-svg** para os gráficos desenhados à mão do design (arco solar, dot-clock).
- **Expo SQLite + Drizzle ORM** para persistência local; schema em `db/schema.ts`, cliente em
  `db/client.ts`, migrações geradas em `drizzle/` (config em `drizzle.config.ts`).
- **Zustand 5** para estado local (stores em `store/`).
- **Supabase** (`@supabase/supabase-js`) para autenticação Google, sincronização opcional e Edge
  Functions (`supabase/functions/`).
- **react-native-iap** para compras Pro (verificação via Edge Function `verify-purchase`).
- Plataformas: foco atual em **Android** (`com.kynio.app`); iOS e web configurados mas a
  distribuição é Android-only.

## Estrutura do código

- `app/` — rotas expo-router: `(tabs)/` (index, meals, progress, workouts, profile), `auth/`
  (callback OAuth), `_layout.tsx`, `settings.tsx`.
- `components/` — componentes de UI (inclui `components/ui/`); fora de `app/` ficam também os
  componentes de ecrã e de domínio usados pelas tabs.
- `services/` — lógica de negócio sem UI: `dbService.ts` (acesso à base de dados),
  `gamificationService.ts`, `fasting*.ts`, `aiMealService.ts`, `cloudAuthService.ts`,
  `cloudSyncService.ts` / `cloudSyncScheduler.ts`, `dataPrivacyService.ts` (exportação/eliminação
  RGPD), `inAppPurchaseService.ts` + `purchaseVerificationService.ts` (verificação server-side de
  compras), `waterXpService.ts` (XP de hidratação determinístico), `weeklyChallengesService.ts`
  (claims semanais persistidos), `i18n.ts` (mapa PT→EN; o texto-fonte é português), etc.
- `store/` — stores Zustand (`useFastingStore.ts`, `useWaterStore.ts`,
  `use-weekly-challenges-store.ts`, `user-progress-store.ts`, `app-preferences-store.ts`, …).
- `hooks/` — hooks React que ligam UI aos serviços/stores.
- `db/` — schema Drizzle e cliente SQLite; migrações em `drizzle/` aplicadas automaticamente no
  primeiro acesso.
- `supabase/` — `schema.sql`, `config.toml` e Edge Functions Deno/TypeScript: `analyze-meal`
  (chama a API Gemini; a chave fica só nos segredos Supabase), `delete-account`, `verify-purchase`.
  Estas funções estão **excluídas do `tsconfig.json`** principal.
- `legal-site/` — páginas legais estáticas (privacidade, termos, eliminação de conta, suporte)
  publicadas no GitHub Pages por `.github/workflows/legal-pages.yml`.
- `types/`, `constants/colors.ts`, `assets/`, `store/google-play/` (textos e assets da loja),
  `docs/` (ANDROID_RELEASE, CLOUD_SETUP, GOOGLE_PLAY_DATA_SAFETY),
  `design-proposta/` (mockup HTML estático do redesign "Circadiano", servido por `server.js`;
  não faz parte da app).

## Sistema de design — "Circadiano"

O tema visual atual é o **Circadiano**: papel quente, tinta carvão e um único acento âmbar
(o "sol" do mostrador). Modo escuro "Noite": âmbar-vela sobre carvão quente.

- **Paleta** em `constants/colors.ts` (`LIGHT_COLORS`/`DARK_COLORS`, proxy `COLORS` sensível ao
  tema, helper `successWithAlpha(alpha)`): fundo `#EDE6D3` / tinta `#3A3A38` / acento `#D9922E`
  (escuro: `#1C1915` / `#F1E9D6` / `#E8A83E`). O acento âmbar é único — não introduzir cores novas.
- **Estética**: minimalista e plana — sem sombras, sem gradientes decorativos, cartões planos com
  hairlines (`border`) e separadores `border-b`; hierarquia por peso tipográfico e espaçamento.
  Etiquetas em mono maiúsculas com tracking largo (estilo "label").
- **Componentes de assinatura**: `components/ui/dot-clock.tsx` (relógio de matriz de pontos 5×7
  em SVG) e `components/ui/fasting-timer.tsx` (arco solar em cúpula com ticks das fases do jejum
  e "phase rail"; react-native-svg não tem `pathLength`, o arco usa comprimento calculado por
  ângulo).
- **Web**: props RN de acessibilidade (`accessibilityElementsHidden`, `importantForAccessibility`)
  nunca diretamente em `<Svg>` — vão numa `<View>` envolvente (react-native-web rejeita-as no DOM).

## Comandos de build e desenvolvimento

```bash
npm install
npm start                    # expo start
npm run dev                  # expo start --web (preview rápido no browser)
npm run android              # expo run:android (development build; Expo Go NÃO suporta módulos nativos como react-native-share)
npm run web
npm run typecheck            # tsc --noEmit
npm run lint                 # expo lint (eslint-config-expo)
npm run db:generate          # drizzle-kit generate (após alterar db/schema.ts)
npm run db:check             # drizzle-kit check
```

Builds Android (`eas.json`): `npm run build:android:preview` (APK interno) e
`npm run build:android:production` (AAB, autoIncrement). Locais: `android/build-apk.bat` /
`android/build-aab.bat` via scripts `build:android:local-*`. Submissão: `npm run submit:android`.
O pipeline completo de release é `npm run release:check` (typecheck + lint + testes + contratos +
expo-doctor + export). Procedimento detalhado em `docs/ANDROID_RELEASE.md`.

## Testes

- **Unitários**: Jest + `jest-expo`, com `@testing-library/react-native`. Executar com
  `npm test` (sempre `--runInBand`), `npm run test:watch`, `npm run test:coverage`.
  - Testes vivem em `__tests__/{components,services,store}` e espelham a estrutura do código.
  - `jest.setup.ts` faz mock global de `expo-sqlite`, `zustand`, AsyncStorage, Google Sign-In,
    haptics, notifications e camera. Os mocks manuais em `__mocks__/` impedem acesso à base real
    e repõem os stores Zustand entre testes (regista novos stores com o padrão existente).
  - Alias `@/*` mapeia para a raiz do projeto (igual ao `tsconfig`).
- **Contratos**: `npm run test:ai-contract` (`scripts/verify-ai-meal-service.cjs`) e
  `npm run test:legal-site` (`scripts/verify-legal-site.cjs`).
- **E2E**: Maestro (CLI externa) em `.maestro/`, contra uma development build com id
  `com.kynio.app`: `npm run e2e`, `e2e:onboarding`, `e2e:export`, `e2e:workout`, `e2e:water`,
  `e2e:weight`, `e2e:paywall`, `e2e:theme-language`.

## Convenções de código

- TypeScript estrito, **sem `any`**; tipos explícitos em interfaces públicas dos serviços.
- Imports com alias `@/` (ex.: `import { getInitializedDatabase } from '@/db/client'`).
- Strings da UI em português no código-fonte; a tradução inglesa vive no mapa
  `ENGLISH_BY_PORTUGUESE` de `services/i18n.ts` — ao adicionar texto novo, adiciona a entrada
  correspondente. Preferências de tema e idioma ficam em `store/app-preferences-store.ts`.
- Estilos com classes NativeWind/Tailwind; cores de tema centralizadas em `constants/colors.ts`
  (nunca hex hardcoded nos componentes — usar `COLORS` / classes de tema / `successWithAlpha`).
- Persistência sempre via `services/dbService.ts` / `db/`, nunca SQL direto espalhado pela UI.
- Registos locais (`fasts`, `meals`, `workouts`, `weight_entries`) usam **soft delete** (`deleted_at`)
  para o sync de cloud propagar apagamentos; todas as leituras filtram `deletedAt IS NULL`.
- Formatação: Prettier com `prettier-plugin-tailwindcss`; ESLint via `eslint-config-expo`.

## Limites de recursos para subagentes (consultivo)

Regras ao delegar trabalho a subagentes (ferramentas `Agent`/`AgentSwarm`):

- **Nunca** escrever em prompts de subagentes frases como "usa tantos recursos quanto possível" ou
  equivalentes — foi isso que causou um loop de contexto que esgotou a quota de 5 horas.
- Prompts de subagentes têm escopo fechado: ficheiros/zonas permitidas, critério de paragem e
  validação obrigatória (`npm run typecheck` + `npm test`).
- Máximo **3 subagentes em paralelo**; mais que isso só com razão explícita.
- Se um subagente falhar por quota/timeout, **não o retomar automaticamente em loop** — retomar no
  máximo 1 vez; se falhar de novo, reportar ao utilizador.
- Os hard limits do runtime vivem em `~/.kimi-code/config.toml` (`[loop_control]`,
  `[background] max_running_tasks`, `[subagent] timeout_ms`, `[swarm] timeout_ms`,
  `[secondary_model]`) — esta secção é consultiva e complementar.

## Segurança e privacidade

- **Nunca** colocar segredos em variáveis `EXPO_PUBLIC_*` — tudo com esse prefixo fica legível
  no bundle. A chave Gemini vive apenas no segredo `GEMINI_API_KEY` da Edge Function
  `analyze-meal` (`supabase/.env.functions`, ignorado pelo Git).
- As chaves Supabase usadas na app são publicáveis; a proteção real está nas políticas RLS
  (`supabase/schema.sql`).
- Dados locais nunca saem do dispositivo sem ação explícita do utilizador (exportação JSON,
  análise de refeição, sincronização opcional). A chamada ao Gemini não inclui ID da conta nem
  histórico; fotografias não são guardadas pela função.
- `credentials/`, `credentials.json` e chaves de assinatura nunca devem ser commitados nem lidos
  por ferramentas automatizadas.
- O primeiro arranque bloqueia a navegação até aceitação explícita do aviso legal
  (`store/legal-consent-store.ts`); a exportação e a eliminação RGPD ficam em `app/settings.tsx` +
  `services/dataPrivacyService.ts`.
