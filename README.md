# KYNIO

> **Gamified Circadian Fasting & Habit Tracker**

KYNIO é uma aplicação móvel focada em ritmo circadiano, jejum intermitente consciente, refeições, hidratação e atividade física. Desenvolvida para Android e Web com foco absoluto em privacidade, desempenho nativo e uma experiência visual minimalista.

---

## Filosofia & Princípios

- **Privacidade em Primeiro Lugar (RGPD)**: Todos os registos de jejum, refeições, peso e atividade física residem localmente no dispositivo (armazenamento encriptado pelo hardware do sistema operativo via Android File-Based Encryption). Sem dependência de servidores centrais nem recolha de dados por predefinição.
- **Design Circadiano**: Estética quente e intemporal — papel quente, tinta carvão e acento âmbar. Tipografia precisa (Hanken Grotesk e JetBrains Mono) e animações baseadas em física fluida sem ruído visual.
- **Gamificação Positiva**: Streaks, XP, níveis e desafios semanais desenhados para construir hábitos sustentáveis sem pressão ou aconselhamento invasivo.
- **Zero AI Slop**: Toda a interface é 100% nativa em React Native. Quaisquer análises inteligentes operam sob esquemas estritos de dados estruturados.

---

## Stack Tecnológica

- **Framework**: React Native 0.86 / Expo SDK 57 (New Architecture)
- **Linguagem**: TypeScript (Strict Mode)
- **Navegação**: Expo Router (Typed Routes)
- **Estilos**: NativeWind (Tailwind CSS)
- **Armazenamento Local**: Expo SQLite + Drizzle ORM
- **Estado**: Zustand

---

## Desenvolvimento Local

### Pré-requisitos
- Node.js 22+
- npm 10+

### Instalação e Execução

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm start
```

Pressione `a` para executar no emulador/dispositivo Android conectado ou `w` para pré-visualização web.

### Testes de Qualidade

```bash
# Verificação de tipos TypeScript
npm run typecheck

# Suite de testes unitários
npm test
```

---

## Licença e Direitos de Autor

© 2026 KYNIO. Todos os direitos reservados.

Este repositório contém código e design proprietários. É estritamente proibida a cópia, reprodução, redistribuição, engenharia reversa ou publicação não autorizada deste software ou de qualquer um dos seus componentes em lojas de aplicações (incluindo Google Play Store e Apple App Store) ou plataformas públicas de distribuição.
