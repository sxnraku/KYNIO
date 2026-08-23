# KYNIO

Tracker local e gamificado de jejum, refeições e treinos, criado com Expo, React Native e TypeScript.

## Executar

```bash
npm install
npm start
```

Use `npm run android`, `npm run ios` ou `npm run web` para abrir diretamente uma plataforma.

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

Os fluxos em `.maestro/` testam o onboarding, o início do temporizador e a exportação RGPD num
binário nativo com o identificador `com.kynio.app`. O Maestro é uma ferramenta externa e não
adiciona dependências ao bundle React Native. Com a CLI instalada e uma development build aberta
num emulador/simulador, execute:

```bash
npm run e2e:onboarding
npm run e2e:export
# ou toda a suite
npm run e2e
```

O fluxo de exportação fecha a folha nativa de partilha antes de validar a confirmação na app. Em
iOS, o seletor aceita os rótulos de sistema em inglês e português; em Android usa o botão nativo
de voltar.

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
usa `react-native-share`, por isso Android/iOS precisam de uma development build nova depois desta
alteração; o Expo Go não contém este módulo nativo.

## Base de dados local

O schema encontra-se em `db/schema.ts` e as migrações empacotadas em `drizzle/`.

```bash
npm run db:generate
npm run db:check
```

As migrações são aplicadas automaticamente no primeiro acesso à base de dados local.

## Análise de refeições

A tab de Refeições usa a API Gemini com entrada de texto/imagem e resposta em JSON estrito.
Crie um ficheiro `.env.local` a partir de `.env.example` e adicione uma chave apenas no ambiente
de desenvolvimento:

```bash
EXPO_PUBLIC_GEMINI_API_KEY=...
```

As variáveis `EXPO_PUBLIC_*` são incluídas no bundle da aplicação. Não distribua uma build de
produção com uma chave secreta desta forma; substitua a origem da credencial por um mecanismo de
autenticação adequado antes da publicação. A chamada usa `store: false`, a resposta é validada
localmente como JSON estrito e os registos confirmados — incluindo uma cópia privada da imagem —
ficam na SQLite e no diretório de documentos do dispositivo.

## Privacidade, consentimento e RGPD

No primeiro arranque, a navegação fica bloqueada até existir uma aceitação explícita do aviso
legal. A data dessa aceitação é guardada apenas no perfil SQLite local.

O ícone de escudo no cabeçalho abre `app/settings.tsx`, onde é possível:

- exportar `fasts`, `meals` e `user_profile` para um ficheiro JSON;
- eliminar a base SQLite, as imagens privadas, os ficheiros temporários de exportação e o estado
  local em memória;
- consultar novamente o aviso legal e o resumo de privacidade.

A exportação não carrega dados para um servidor: em Android/iOS abre a folha nativa de partilha e
na Web cria um download local. A única chamada de rede da app permanece a análise explícita de uma
refeição, sem ID de utilizador e sem incluir o restante histórico local.
