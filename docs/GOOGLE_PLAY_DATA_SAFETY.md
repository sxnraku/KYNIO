# Rascunho de Data Safety — Google Play

Este documento é um mapa técnico, não uma resposta automática nem aconselhamento jurídico. Confirma
as respostas no Play Console contra a build efetivamente publicada e contra os contratos atuais dos
fornecedores.

## Segurança e controlo

- Dados em trânsito: **sim, cifrados por HTTPS**.
- Eliminação dentro da app: **sim**, em Privacidade e dados.
- Eliminação fora da app: **sim**, em `/account-deletion.html`.
- Conta obrigatória: **não**. Login Google e sincronização são opcionais.
- Exportação: **sim**, JSON criado localmente e entregue pelo seletor do sistema.

## Tipos de dados que podem sair do dispositivo

| Tipo Google Play | Quando | Destino/finalidade | Obrigatório |
| --- | --- | --- | --- |
| Nome, email e ID de utilizador | Liga conta Google | Supabase; autenticação e sincronização | Não |
| Fotografia de perfil | Escolhe avatar com conta ligada | Bucket privado Supabase; perfil | Não |
| Registos de jejum, refeições, atividade, peso, XP e streak | Ativa sincronização | Supabase; uso em vários dispositivos | Não |
| Contactos adicionados manualmente | Ativa sincronização | Supabase; círculo privado | Não |
| Fotografia/descrição da refeição | Toca em Analisar | Proxy KYNIO e Google Gemini; análise pedida | Não |
| Hash salgado temporário do endereço de rede | Usa análise | Supabase; segurança e limite de abuso | Necessário para essa função |

As fotografias de refeições guardadas depois da confirmação continuam locais e não são incluídas na
sincronização. O hash de limite expira no máximo após uma hora e não contém conteúdo da refeição nem
ID da conta.

## Pontos a confirmar no formulário

1. Declara dados de **Health and fitness** para jejuns, nutrição, treinos e peso
   nessa categoria, mesmo sendo registos de hábitos e não dados clínicos.
2. Declara **Photos and videos** para avatar e análise opcional.
3. Declara **Personal info** para nome, email e ID da conta Google.
4. Confirma se Google/Supabase qualificam como “service providers” nas definições atuais antes de
   marcar dados como “shared”. Não assumes uma isenção sem validar os contratos.
5. Classifica os dados como opcionais quando só saem do dispositivo após login ou ação explícita.
6. Inclui qualquer telemetria, crash reporting, publicidade ou novo SDK que venha a ser adicionado.
7. Mantém as respostas alinhadas com `legal-site/privacy.html`.

## Permissões Android esperadas

- Câmara: apenas para pré-visualizar e captar a fotografia de refeição.
- Fotografias: escolha iniciada pelo utilizador através do seletor de sistema.
- Internet: autenticação, sincronização opcional, páginas legais e análise opcional.

Não adicionar localização, contactos do dispositivo, microfone ou armazenamento amplo sem uma nova
auditoria e uma justificação funcional clara.
