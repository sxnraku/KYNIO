import type { AppLanguage } from "@/store/app-preferences-store";

const ENGLISH_BY_PORTUGUESE: Record<string, string> = {
  "A aplicação não substitui aconselhamento profissional.":
    "The app does not replace professional advice.",
  "A calcular progresso local…": "Calculating local progress…",
  "A concluir a ligação segura…": "Completing the secure connection…",
  "A guardar…": "Saving…",
  "A minha jornada": "My journey",
  "A minha jornada começou agora.": "My journey has just begun.",
  "A preparar a câmara…": "Preparing the camera…",
  "A preparar imagem…": "Preparing image…",
  "A preparar o armazenamento local…": "Preparing local storage…",
  "A preparar o perfil…": "Preparing your profile…",
  "A resposta não é armazenada remotamente pela app.":
    "The response is not stored remotely by the app.",
  "A recuperar o jejum em curso…": "Restoring your active fast…",
  "A sincronizar…": "Syncing…",
  "A tua identidade, círculo e preferências, com controlo claro sobre a sincronização.":
    "Your identity, circle and preferences, with clear control over syncing.",
  "A tua jornada": "Your journey",
  "Acompanha o teu ritmo, sem pressão.": "Track your rhythm, without pressure.",
  "Acompanhar hábitos ao meu ritmo.": "Tracking habits at my own pace.",
  "A análise de refeição envia apenas a fotografia e/ou descrição escolhida, através do KYNIO, para a Google Gemini; o restante histórico e o ID da conta não acompanham esse pedido.":
    "Meal analysis only sends the chosen photo and/or description through KYNIO to Google Gemini; the rest of your history and account ID are not included.",
  "A cloud só é usada após ligares uma conta. A aplicação não substitui aconselhamento profissional.":
    "Cloud sync is only used after you connect an account. The app does not replace professional advice.",
  "A exportação abre o seletor do sistema; só sai do dispositivo quando escolhes um destino.":
    "Export opens the system picker; data only leaves the device when you choose a destination.",
  "A intensidade suaviza quando há uma pausa; o histórico permanece.":
    "Intensity softens after a pause; your history remains.",
  "A partilha do link foi cancelada.": "Link sharing was cancelled.",
  "Abre a câmara em direto, escolhe uma imagem da galeria ou descreve o que comeste.":
    "Open the live camera, choose a gallery image or describe what you ate.",
  "Abrir definições": "Open settings",
  "Ainda sem atividades": "No activities yet",
  "Ajuda e suporte": "Help and support",
  Amigos: "Friends",
  "Analisar refeição": "Analyse meal",
  "Antes de começar": "Before you begin",
  Aparência: "Appearance",
  "Aparência e idioma": "Appearance and language",
  "As insígnias desbloqueadas aparecerão aqui.":
    "Unlocked badges will appear here.",
  "As preferências ficam guardadas apenas neste dispositivo.":
    "Preferences are stored only on this device.",
  Aprendiz: "Apprentice",
  "Ativar câmara": "Enable camera",
  Atividade: "Activity",
  "Atividade recente": "Recent activity",
  Autofagia: "Autophagy",
  "Autofagia Estimada": "Estimated autophagy",
  "Aviso legal": "Legal notice",
  Bio: "Bio",
  Bloqueada: "Locked",
  Bloqueado: "Locked",
  "Calorias estimadas": "Estimated calories",
  "Calorias, macros, tags e confiança aparecerão aqui para revisão manual.":
    "Calories, macros, tags and confidence will appear here for manual review.",
  Câmara: "Camera",
  Caminhada: "Walk",
  Cancelar: "Cancel",
  "Captar fotografia": "Take photo",
  Cetose: "Ketosis",
  "Cetose Estimada": "Estimated ketosis",
  Claro: "Light",
  "Como queres aparecer?": "How would you like to appear?",
  "Compreendo e aceito os termos.": "I understand and accept the terms.",
  "Conclui um jejum no objetivo.": "Complete a fast at your target.",
  "Configuração necessária": "Setup required",
  "Confirmar e Ganhar +30 XP": "Confirm and Earn +30 XP",
  Consistente: "Consistent",
  "Constrói o teu ritmo": "Build your rhythm",
  "Conta e sincronização": "Account and sync",
  "Conta Google ligada": "Google account connected",
  "Continuar com Google": "Continue with Google",
  Conquista: "Achievement",
  Conquistas: "Achievements",
  Corrida: "Run",
  Decorrido: "Elapsed",
  Definições: "Settings",
  Desbloqueada: "Unlocked",
  "Desbloqueadas pelos teus registos locais.":
    "Unlocked by your local records.",
  "Desligar conta Google": "Disconnect Google account",
  "Documentos e suporte": "Documents and support",
  Digestão: "Digestion",
  "Dias seguidos": "Day streak",
  Disciplinado: "Disciplined",
  "Duração em minutos": "Duration in minutes",
  "Editar objetivo": "Edit target",
  Elevado: "High",
  "Eliminar definitivamente": "Delete permanently",
  "Eliminar conta pela web": "Delete account on the web",
  "Eliminar Todos os Dados": "Delete All Data",
  "Eliminar todos os dados?": "Delete all data?",
  "Em Movimento": "On the Move",
  "EM BREVE": "COMING SOON",
  "Enquadra a refeição": "Frame the meal",
  Entrar: "Enter",
  "Escolhe a janela que pretendes acompanhar.":
    "Choose the window you want to track.",
  "Escolhes o destino. Nada é publicado automaticamente.":
    "You choose the destination. Nothing is posted automatically.",
  Escuro: "Dark",
  "Esforço percebido": "Perceived effort",
  "Esta app é uma ferramenta de acompanhamento pessoal de estilo de vida e gamificação. Não presta aconselhamento médico, nutricional ou de treino.":
    "This app is a personal lifestyle tracking and gamification tool. It does not provide medical, nutritional or training advice.",
  "Esta janela fecha automaticamente quando a conta Google estiver ligada.":
    "This window closes automatically when the Google account is connected.",
  Experiência: "Experience",
  "Exportar os meus Dados": "Export My Data",
  Fase: "Phase",
  "Fases metabólicas estimadas": "Estimated metabolic phases",
  "Fases metabólicas estimadas com base em literatura geral. Varia de pessoa para pessoa.":
    "Metabolic phases are estimated from general literature. They vary from person to person.",
  Força: "Strength",
  "Fotografa ou descreve o que comeste e revê sempre as estimativas.":
    "Photograph or describe what you ate and always review the estimates.",
  "Fotografar refeição": "Photograph meal",
  Galeria: "Gallery",
  "ganhos esta semana": "earned this week",
  Glicose: "Glucose",
  Gordura: "Fat",
  "Guardada apenas neste dispositivo.": "Stored only on this device.",
  "Guardar atividade · +50 XP": "Save activity · +50 XP",
  "Guardar perfil": "Save profile",
  "Hábitos ao meu ritmo.": "Habits at my own pace.",
  Hidratos: "Carbs",
  Hoje: "Today",
  Idioma: "Language",
  "Imagem descarregada e link aberto para partilha.":
    "Image downloaded and link opened for sharing.",
  "Imagem descarregada e texto com o link copiado.":
    "Image downloaded and text with the link copied.",
  "Imagem e link enviados para a app escolhida.":
    "Image and link sent to the selected app.",
  "Imagem e link partilhados.": "Image and link shared.",
  Iniciado: "Initiated",
  Jejum: "Fasting",
  "JEJUM ATIVO": "FAST ACTIVE",
  "JEJUM INATIVO": "FAST INACTIVE",
  "Iniciar Jejum": "Start Fast",
  "Início de Queima de Glicose": "Early glucose use",
  Insígnias: "Badges",
  "Intensidade alta · 1 dia de tolerância usado":
    "High intensity · 1 grace day used",
  "Intensidade máxima · atividade hoje": "Maximum intensity · activity today",
  "Intensidade suave · 1 dia em pausa": "Gentle intensity · 1 day paused",
  "Jornada iniciada": "Journey started",
  Leve: "Light",
  "Linha de 7 Dias": "7-Day Line",
  "Linha de Consistência": "Consistency Line",
  "Lista vazia": "Empty list",
  "Local por defeito · cloud opcional": "Local by default · optional cloud",
  "Local por defeito · sincronização opcional":
    "Local by default · optional sync",
  "Macros estimados · editáveis": "Estimated macros · editable",
  "Mantém atividade durante 7 dias seguidos.":
    "Stay active for 7 consecutive days.",
  "Mantém uma cópia local e sincroniza entre os teus dispositivos quando tens internet.":
    "Keep a local copy and sync between your devices when you are online.",
  "Mestre da Consistência": "Master of Consistency",
  Mobilidade: "Mobility",
  Moderado: "Moderate",
  "Mostra ou descreve a refeição": "Show or describe the meal",
  "Na tua lista privada": "In your private list",
  "Não são partilhados jejuns, refeições ou treinos automaticamente.":
    "Fasts, meals and workouts are not shared automatically.",
  "Não foi possível abrir o documento. Tenta novamente.":
    "The document could not be opened. Please try again.",
  "Nenhuma análise": "No analysis",
  Nível: "Level",
  "Nível atual": "Current level",
  Nome: "Name",
  "Nome do amigo": "Friend's name",
  "Nova análise": "New analysis",
  "O acesso é usado apenas para enquadrar e fotografar esta refeição. A captura só acontece quando tocares no botão.":
    "Access is only used to frame and photograph this meal. A photo is only taken when you tap the button.",
  "O que comeste?": "What did you eat?",
  "O que fizeste hoje?": "What did you do today?",
  "O teu círculo": "Your circle",
  "O teu histórico aparecerá aqui depois do primeiro registo.":
    "Your history will appear here after the first entry.",
  "O teu movimento": "Your movement",
  "O teu progresso, à tua maneira": "Your progress, your way",
  "Objetivo de jejum": "Fasting target",
  Outro: "Other",
  "Outra duração": "Other duration",
  "Partilhar conquistas": "Share achievements",
  "Partilhar imagem e link": "Share image and link",
  Perfil: "Profile",
  "Perfil local privado": "Private local profile",
  "Permitir acesso à câmara": "Allow camera access",
  Português: "Portuguese",
  "Política de Privacidade": "Privacy Policy",
  Preferências: "Preferences",
  "Primeiras 50h": "First 50h",
  "Primeiro Objetivo": "First Target",
  "Primeiro Scan de IA": "First AI Scan",
  Privacidade: "Privacy",
  "Privacidade e controlo": "Privacy and control",
  "Privacidade e dados": "Privacy and data",
  Progresso: "Progress",
  "Progresso indisponível": "Progress unavailable",
  Proteína: "Protein",
  "Pronto para o objetivo": "Ready for target",
  "Pré-visualização em direto": "Live preview",
  Refeições: "Meals",
  Referência: "Reference",
  "Regista apenas atividade já realizada. A app não recomenda duração, intensidade ou um plano de treino.":
    "Only log activity you have already completed. The app does not recommend duration, intensity or a training plan.",
  "Regista o movimento que escolheste fazer, ao teu ritmo e sem metas obrigatórias.":
    "Log the movement you chose to do, at your own pace and without mandatory targets.",
  "Registar atividade": "Log activity",
  Remover: "Remove",
  "Remover fotografia": "Remove photo",
  Repetir: "Retake",
  Restante: "Remaining",
  "Resultado estruturado": "Structured result",
  "Resumo do jejum": "Fasting summary",
  "Sem atividade registada": "No activity logged",
  "Sincronizar agora": "Sync now",
  "Só a fotografia e a descrição desta análise são enviadas à API. A resposta não é armazenada remotamente pela app.":
    "Only this analysis photo and description are sent to the API. The response is not stored remotely by the app.",
  Sobre: "About",
  "Terminar Jejum": "End Fast",
  "Termos de Utilização": "Terms of Use",
  "Toca no valor para ajustar": "Tap the value to adjust",
  Treinos: "Workouts",
  "Uma ferramenta de registo, não de prescrição":
    "A logging tool, not a prescription",
  "Usar fotografia": "Use photo",
  "Últimos 7 dias": "Last 7 days",
  "Valores estimados por IA para acompanhamento pessoal de hábitos. Ajuste manualmente conforme necessário.":
    "AI-estimated values for personal habit tracking. Adjust manually as needed.",
  "A fotografia e os dados do perfil ficam no dispositivo, exceto quando ligas a sincronização opcional.":
    "Your photo and profile data stay on the device unless you enable optional sync.",
  "Adiciona EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ao ficheiro .env.local para ativar o login Google.":
    "Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local to enable Google sign-in.",
  "Adiciona o primeiro nome ao teu círculo.":
    "Add the first person to your circle.",
  "Ao ligar a conta, nome, email, perfil, amigos, peso e registos de hábitos são guardados remotamente para sincronização. A ligação é opcional e pode ser removida.":
    "When you connect an account, your name, email, profile, friends, weight and habit logs are stored remotely for syncing. The connection is optional and can be removed.",
  "Cria um ficheiro JSON com todo o histórico da SQLite local e abre as opções do sistema para o guardar.":
    "Creates a JSON file with your full local SQLite history and opens the system options to save it.",
  "Esta ação elimina permanentemente jejuns, refeições, XP, perfil, consentimento, fotografias privadas e, se existir, a conta sincronizada. Não elimina ficheiros que já tenhas exportado e não pode ser anulada.":
    "This permanently deletes fasts, meals, XP, profile, consent, private photos and any synced account. It does not delete files you already exported and cannot be undone.",
  "Ferramenta de acompanhamento pessoal de estilo de vida e gamificação. Não presta aconselhamento médico, nutricional ou de treino.":
    "Personal lifestyle tracking and gamification tool. It does not provide medical, nutritional or training advice.",
  "Guarda pessoas importantes e sincroniza a lista entre os teus dispositivos. Não são partilhados jejuns, refeições ou treinos automaticamente.":
    "Keep important people in your circle and sync the list across your devices. Fasts, meals and workouts are never shared automatically.",
  "Jejuns, refeições, progresso e fotografias confirmadas ficam sempre disponíveis neste dispositivo.":
    "Fasts, meals, progress and confirmed photos always remain available on this device.",
  "Notas opcionais: percurso, como te sentiste…":
    "Optional notes: route, how you felt…",
  "O histórico começa guardado no dispositivo. Se ligares uma conta Google, perfil, amigos, peso e registos serão também sincronizados remotamente entre os teus dispositivos. Uma fotografia de refeição só é enviada, através do KYNIO, para a Google Gemini quando pedes uma análise.":
    "History starts on your device. If you connect a Google account, profile, friends, weight and logs are also synced remotely across your devices. A meal photo is only sent through KYNIO to Google Gemini when you request an analysis.",
  "Remove a base SQLite, fotografias privadas e, quando ligada, a conta e os dados sincronizados.":
    "Removes the SQLite database, private photos and, when connected, the account and synced data.",
  "Uma frase sobre o teu ritmo, objetivos ou motivação.":
    "A sentence about your rhythm, goals or motivation.",
  "Exportar, eliminar e consultar onde os dados são guardados.":
    "Export, delete and review where your data is stored.",
  "Acumula 50 horas registadas.": "Accumulate 50 logged hours.",
  "Ao ligares uma conta Google, perfil, amigos e registos são também sincronizados para permitir utilização em vários dispositivos.":
    "When you connect a Google account, profile, friends and logs are also synced for use across multiple devices.",
  "Ao tocar em Analisar, autorizas o envio desta fotografia e/ou descrição, através do KYNIO, para a Google Gemini. O restante histórico e o ID da conta não são enviados. A app não guarda a fotografia nem a resposta remotamente.":
    "By tapping Analyse, you authorise KYNIO to send this photo and/or description to Google Gemini. Your other history and account ID are not sent. The app does not remotely store the photo or response.",
  "As categorias e o esforço percebido são descritivos. Não constituem aconselhamento médico ou de treino e não substituem orientação profissional adequada ao teu caso.":
    "Categories and perceived effort are descriptive. They are not medical or training advice and do not replace professional guidance suited to your situation.",
  "Confiança alta": "High confidence",
  "Confiança baixa": "Low confidence",
  "Confiança média": "Medium confidence",
  "Confirma a primeira análise de refeição.":
    "Confirm your first meal analysis.",
  "Ex.: salmão grelhado com arroz e legumes":
    "E.g. grilled salmon with rice and vegetables",
  "minutos no total": "total minutes",
  "Níveis, consistência e conquistas calculados apenas com os teus registos locais.":
    "Levels, consistency and achievements calculated only from your local logs.",
  "Regista a primeira atividade realizada.":
    "Log your first completed activity.",
  "Remover amigo?": "Remove friend?",
  "Tentar novamente": "Try again",
  "A tua identidade e o teu círculo, com controlo claro sobre o que partilhas.":
    "Your identity and circle, with clear control over what you share.",
  "Acompanhamento pessoal": "Personal tracking",
  "Acompanhamento pessoal descritivo. Não avalia a saúde, não define um peso ideal e não substitui orientação profissional.":
    "Descriptive personal tracking. It does not assess health, define an ideal weight or replace professional guidance.",
  "Adiciona apenas se quiseres acompanhar esta medida ao longo do tempo.":
    "Only add entries if you want to track this measurement over time.",
  "Adicionar registo de peso": "Add weight entry",
  "Dá identidade à tua jornada": "Give your journey an identity",
  Continuar: "Continue",
  "Escolhe o nome que aparece no teu perfil. Podes alterá-lo mais tarde.":
    "Choose the name shown on your profile. You can change it later.",
  "Escolhe um nome para o teu perfil.": "Choose a name for your profile.",
  "Eliminar este registo?": "Delete this entry?",
  "Guardar registo": "Save entry",
  "Introduz um peso válido superior a zero.":
    "Enter a valid weight greater than zero.",
  "Introduz um peso válido ou deixa o campo vazio.":
    "Enter a valid weight or leave the field empty.",
  "Não foi possível carregar os registos de peso.":
    "Weight entries could not be loaded.",
  "Não foi possível eliminar este registo.": "This entry could not be deleted.",
  "Não foi possível guardar o registo.": "The entry could not be saved.",
  "Não foi possível guardar o perfil.": "The profile could not be saved.",
  "Não foi possível preparar o perfil. Tenta novamente.":
    "The profile could not be prepared. Please try again.",
  "Nome do perfil": "Profile name",
  "Novo registo": "New entry",
  "O registo de peso serve apenas para acompanhamento pessoal. Não avalia a tua saúde, não define um peso ideal e não substitui orientação profissional.":
    "Weight logging is only for personal tracking. It does not assess your health, define an ideal weight or replace professional guidance.",
  "Opcional, descritivo e sem metas obrigatórias.":
    "Optional, descriptive and without mandatory targets.",
  Peso: "Weight",
  "Peso atual (opcional)": "Current weight (optional)",
  "Quero acompanhar o meu peso": "I want to track my weight",
  "Registo opcional": "Optional log",
  "Sem registos": "No entries",
  "Ao ligares uma conta Google, perfil, amigos, peso e registos são também sincronizados para permitir utilização em vários dispositivos.":
    "When you connect a Google account, profile, friends, weight and logs are also synced for use across multiple devices.",
  "Jejuns, refeições, peso, progresso e fotografias confirmadas ficam sempre disponíveis neste dispositivo.":
    "Fasts, meals, weight, progress and confirmed photos always remain available on this device.",
  "Esta ação elimina permanentemente jejuns, refeições, peso, XP, perfil, consentimento, fotografias privadas e, se existir, a conta sincronizada. Não elimina ficheiros que já tenhas exportado e não pode ser anulada.":
    "This permanently deletes fasts, meals, weight, XP, profile, consent, private photos and any synced account. It does not delete files you already exported and cannot be undone.",
  "XP total": "Total XP",
};

function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function translateText(value: string, language: AppLanguage): string {
  if (language === "pt") {
    return value;
  }

  const normalized = normalize(value);
  let translation = ENGLISH_BY_PORTUGUESE[normalized];

  if (!translation) {
    const levelLabel = normalized.match(/^Nível (\d+)\s*[-:]\s*(.+)$/);
    const levelOnly = normalized.match(/^Nível (\d+)$/);
    const pausedIntensity = normalized.match(
      /^Intensidade reduzida · (\d+) dias em pausa$/,
    );
    const activityCount = normalized.match(/^(\d+) atividades registadas$/);
    const fastProgress = normalized.match(/^(\d+)% do objetivo (.+)$/);
    const readyTarget = normalized.match(/^Pronto para o objetivo (.+)$/);
    const fastingWindow = normalized.match(
      /^(\d+)h de jejum · (\d+)h de janela$/,
    );
    const nextLevel = normalized.match(/^(\d+) XP PARA NÍVEL (\d+)$/);
    const weightDelta = normalized.match(
      /^([+-]?[\d.,]+) (kg|lb) desde o registo anterior$/,
    );

    if (levelLabel) {
      translation = `Level ${levelLabel[1]} - ${translateText(levelLabel[2], language)}`;
    } else if (levelOnly) {
      translation = `Level ${levelOnly[1]}`;
    } else if (pausedIntensity) {
      translation = `Reduced intensity · ${pausedIntensity[1]} days paused`;
    } else if (activityCount) {
      translation = `${activityCount[1]} activities logged`;
    } else if (normalized === "1 atividade registada") {
      translation = "1 activity logged";
    } else if (fastProgress) {
      translation = `${fastProgress[1]}% of target ${fastProgress[2]}`;
    } else if (readyTarget) {
      translation = `Ready for target ${readyTarget[1]}`;
    } else if (fastingWindow) {
      translation = `${fastingWindow[1]}h fasting · ${fastingWindow[2]}h eating window`;
    } else if (nextLevel) {
      translation = `${nextLevel[1]} XP TO LEVEL ${nextLevel[2]}`;
    } else if (weightDelta) {
      translation = `${weightDelta[1]} ${weightDelta[2]} since the previous entry`;
    }
  }

  if (!translation) {
    return value;
  }

  const leadingWhitespace = value.match(/^\s*/)?.[0] ?? "";
  const trailingWhitespace = value.match(/\s*$/)?.[0] ?? "";
  return `${leadingWhitespace}${translation}${trailingWhitespace}`;
}
