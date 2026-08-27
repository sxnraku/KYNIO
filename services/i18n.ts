import type { AppLanguage } from "@/store/app-preferences-store";

const ENGLISH_BY_PORTUGUESE: Record<string, string> = {
  "1 refeição confirmada": "1 confirmed meal",
  "36h Monge": "36h Monk Fast",
  "48h Reset": "48h Reset",
  "A análise de refeição envia apenas a fotografia e/ou descrição escolhida, através do KYNIO, para a Google Gemini; o restante histórico e o ID da conta não acompanham esse pedido.":
    "Meal analysis only sends the chosen photo and/or description through KYNIO to Google Gemini; the rest of your history and account ID are not included.",
  "A aplicação não substitui aconselhamento profissional.":
    "The app does not replace professional advice.",
  "A calcular progresso local…": "Calculating local progress…",
  "A cloud só é usada após ligares uma conta. A aplicação não substitui aconselhamento profissional.":
    "Cloud sync is only used after you connect an account. The app does not replace professional advice.",
  "A concluir a ligação segura…": "Completing the secure connection…",
  "A conta pode já estar ligada. Volta ao perfil para confirmar.":
    "The account may already be connected. Return to your profile to confirm.",
  "A digestão está concluída e a insulina começa a descer. O corpo recorre ao glicogénio acumulado no fígado (glicogenólise) para manter a energia e alimentar o cérebro.":
    "Digestion is complete and insulin starts falling. The body taps into stored liver glycogen (glycogenolysis) to sustain energy and fuel the brain.",
  "A exportação abre o seletor do sistema; só sai do dispositivo quando escolhes um destino.":
    "Export opens the system picker; data only leaves the device when you choose a destination.",
  "A fotografia e os dados do perfil ficam no dispositivo, exceto quando ligas a sincronização opcional.":
    "Your photo and profile data stay on the device unless you enable optional sync.",
  "A guardar…": "Saving…",
  "A imagem não ficou clara? Clarifica aqui:": "Image unclear? Clarify here:",
  "A ingestão regular de água mineral apoia o equilíbrio natural de eletrólitos durante o jejum. Em caso de condições de saúde, consulta o teu médico.":
    "Regular mineral water intake supports natural electrolyte balance during fasting. For medical conditions, consult your doctor.",
  "A intensidade suaviza quando há uma pausa; o histórico permanece.":
    "Intensity softens after a pause; your history remains.",
  "A minha jornada": "My journey",
  "A minha jornada começou agora.": "My journey has just begun.",
  "A partilha do link foi cancelada.": "Link sharing was cancelled.",
  "A preparar a câmara…": "Preparing the camera…",
  "A preparar imagem…": "Preparing image…",
  "A preparar o armazenamento local…": "Preparing local storage…",
  "A preparar o perfil…": "Preparing your profile…",
  "A processar…": "Processing…",
  "A recalcular…": "Recalculating…",
  "A resposta não é armazenada remotamente pela app.":
    "The response is not stored remotely by the app.",
  "A recuperar o jejum em curso…": "Restoring your active fast…",
  "A sincronizar…": "Syncing…",
  "A tua identidade e o teu círculo, com controlo claro sobre o que partilhas.":
    "Your identity and circle, with clear control over what you share.",
  "A tua identidade, círculo e preferências, com controlo claro sobre a sincronização.":
    "Your identity, circle and preferences, with clear control over syncing.",
  "A tua jornada": "Your journey",
  "Abre a câmara em direto, escolhe uma imagem da galeria ou descreve o que comeste.":
    "Open the live camera, choose a gallery image or describe what you ate.",
  "Abrir definições": "Open settings",
  "Absorção dos macro e micronutrientes da última refeição":
    "Absorption of macro and micronutrients from the last meal",
  "Acesso a 36h Monge, 48h Reset, OMAD e Jejum Livre prolongado.":
    "Access to 36h Monk, 48h Reset, OMAD and extended Open Fasting.",
  "Acesso a análises aprofundadas de macronutrientes e tendências de cetose.":
    "Access to in-depth macronutrient analyses and ketosis trends.",
  "Acesso total aos temporizadores de jejum e registo local ilimitado.":
    "Full access to fasting timers and unlimited local logging.",
  "Acesso Vitalício": "Lifetime Access",
  "Acompanha o teu ritmo, sem pressão.": "Track your rhythm, without pressure.",
  "Acompanhamento pessoal": "Personal tracking",
  "Acompanhamento pessoal descritivo. Não avalia a saúde, não define um peso ideal e não substitui orientação profissional.":
    "Descriptive personal tracking. It does not assess health, define an ideal weight or replace professional guidance.",
  "Acompanhar hábitos ao meu ritmo.": "Tracking habits at my own pace.",
  "Acumula 50 horas registadas.": "Accumulate 50 logged hours.",
  "Adiciona apenas se quiseres acompanhar esta medida ao longo do tempo.":
    "Only add entries if you want to track this measurement over time.",
  "Adiciona EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ao ficheiro .env.local para ativar o login Google.":
    "Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local to enable Google sign-in.",
  "Adiciona o primeiro nome ao teu círculo.":
    "Add the first person to your circle.",
  "Adiciona uma pitada de sal marinho na água para manter o equilíbrio eletrolítico.":
    "Stay well hydrated with mineral water to support natural electrolyte balance.",
  "Adicionar amigo": "Add friend",
  "Adicionar registo de peso": "Add weight entry",
  "Ainda sem atividades": "No activities yet",
  "Ainda sem jejuns registados": "No completed fasts yet",
  "Ajuda e suporte": "Help and support",
  "Ajustar": "Adjust",
  Amigos: "Friends",
  "Análises de IA Ilimitadas": "Unlimited AI Analyses",
  "análises de refeição ilimitadas com IA": "unlimited AI meal analyses",
  "Analisar refeição": "Analyse meal",
  "Antes de começar": "Before you begin",
  "Ao ligar a conta, nome, email, perfil, amigos, peso e registos de hábitos são guardados remotamente para sincronização. A ligação é opcional e pode ser removida.":
    "When you connect an account, your name, email, profile, friends, weight and habit logs are stored remotely for syncing. The connection is optional and can be removed.",
  "Ao ligares uma conta Google, perfil, amigos e registos são também sincronizados para permitir utilização em vários dispositivos.":
    "When you connect a Google account, profile, friends and logs are also synced for use across multiple devices.",
  "Ao ligares uma conta Google, perfil, amigos, peso e registos são também sincronizados para permitir utilização em vários dispositivos.":
    "When you connect a Google account, profile, friends, weight and logs are also synced for use across multiple devices.",
  "Ao tocar em Analisar, autorizas o envio desta fotografia e/ou descrição, através do KYNIO, para a Google Gemini. O restante histórico e o ID da conta não são enviados. A app não guarda a fotografia nem a resposta remotamente.":
    "By tapping Analyse, you authorise KYNIO to send this photo and/or description to Google Gemini. Your other history and account ID are not sent. The app does not remotely store the photo or response.",
  Aparência: "Appearance",
  "Aparência e idioma": "Appearance and language",
  Aprendiz: "Apprentice",
  "As categorias e o esforço percebido são descritivos. Não constituem aconselhamento médico ou de treino e não substituem orientação profissional adequada ao teu caso.":
    "Categories and perceived effort are descriptive. They are not medical or training advice and do not replace professional guidance suited to your situation.",
  "As insígnias desbloqueadas aparecerão aqui.":
    "Unlocked badges will appear here.",
  "As preferências ficam guardadas apenas neste dispositivo.":
    "Preferences are stored only on this device.",
  "As reservas de glicogénio do fígado ficam significativamente reduzidas. O corpo faz a transição para oxidar ácidos gordos, convertendo lípidos em energia.":
    "Liver glycogen stores become significantly reduced. The body transitions to oxidising fatty acids, converting lipids into fuel.",
  "Ativa realces visuais esmeralda e micro-animações personalizadas.":
    "Enables emerald visual highlights and custom micro-animations.",
  "Ativar câmara": "Enable camera",
  "Ativas": "Active",
  Atividade: "Activity",
  "Atividade recente": "Recent activity",
  "ATUAL": "CURRENT",
  Atual: "Current",
  "Aura Essencial": "Essential Aura",
  "Aura Pro Ativo ✦": "Aura Pro Active ✦",
  Autofagia: "Autophagy",
  "Autofagia Celular": "Cellular Autophagy",
  "Autofagia Estimada": "Estimated autophagy",
  "Aumento de glucagon e adrenalina, estimulando a quebra dos triglicéridos no tecido adiposo.":
    "Rise in glucagon and adrenaline, stimulating the breakdown of triglycerides in adipose tissue.",
  "Aumento da flexibilidade metabólica": "Increase in metabolic flexibility",
  "Aviso legal": "Legal notice",
  "AVISO DE SAÚDE & PRIVACIDADE RGPD": "HEALTH ADVISORY & GDPR PRIVACY",
  "BASE": "BASE",
  "Benefícios comprovados": "Proven benefits",
  "Bicicleta": "Cycling",
  Bio: "Bio",
  "BIOLOGIA & HORMONAS": "BIOLOGY & HORMONES",
  Bloqueada: "Locked",
  Bloqueado: "Locked",
  "Calorias estimadas": "Estimated calories",
  "Calorias estimadas, editável": "Estimated calories, editable",
  "Calorias registadas hoje": "Calories logged today",
  "Calorias, macros, tags e confiança aparecerão aqui para revisão manual.":
    "Calories, macros, tags and confidence will appear here for manual review.",
  Câmara: "Camera",
  Caminhada: "Walk",
  Cancelar: "Cancel",
  "Captar fotografia": "Take photo",
  Cetose: "Ketosis",
  "Cetose Ativa": "Active Ketosis",
  "Cetose Estimada": "Estimated ketosis",
  Claro: "Light",
  "Clareza mental aguçada e ausência de picos de fome":
    "Sharp mental clarity and absence of hunger spikes",
  "Cobrado mensalmente · Cancela quando quiseres":
    "Billed monthly · Cancel anytime",
  "Como queres aparecer?": "How would you like to appear?",
  "Compreendo e aceito os termos.": "I understand and accept the terms.",
  "CONCLUÍDO": "COMPLETED",
  Concluído: "Completed",
  "Conclui um jejum no objetivo.": "Complete a fast at your target.",
  "Configuração necessária": "Setup required",
  "Confiança alta": "High confidence",
  "Confiança baixa": "Low confidence",
  "Confiança média": "Medium confidence",
  "Confirma a primeira análise de refeição.":
    "Confirm your first meal analysis.",
  "Confirmar e Ganhar +30 XP": "Confirm and Earn +30 XP",
  Consistente: "Consistent",
  "Constrói o teu ritmo": "Build your rhythm",
  "Conta e sincronização": "Account and sync",
  "Conta Google ligada": "Google account connected",
  "Continuar com Google": "Continue with Google",
  Continuar: "Continue",
  Conquista: "Achievement",
  Conquistas: "Achievements",
  "(Copo)": "(Glass)",
  Copo: "Glass",
  Corrida: "Run",
  "Cria um ficheiro JSON com todo o histórico da SQLite local e abre as opções do sistema para o guardar.":
    "Creates a JSON file with your full local SQLite history and opens the system options to save it.",
  "Dá identidade à tua jornada": "Give your journey an identity",
  Decorrido: "Elapsed",
  Definições: "Settings",
  Desbloqueada: "Unlocked",
  Desbloqueado: "Unlocked",
  "Desbloquear": "Unlock",
  "Desbloquear Pro →": "Unlock Pro →",
  "Desbloquear Aura Pro": "Unlock Aura Pro",
  "Desbloqueadas pelos teus registos locais.":
    "Unlocked by your local records.",
  "Desbloqueia vantagens Aura e passes premium com o teu progresso.":
    "Unlock Aura perks and premium passes with your progress.",
  "Desligar conta Google": "Disconnect Google account",
  "DICA PRÁTICA": "PRACTICAL TIP",
  "Dica de Hidratação Saudável": "Healthy Hydration Tip",
  Digestão: "Digestion",
  "Digestão & Absorção": "Digestion & Absorption",
  "Diminuição acentuada de IGF-1 e ativação da apoptose de células danificadas com regeneração imunitária.":
    "Marked drop in IGF-1 and activation of damaged cell clearance with immune rejuvenation.",
  Disciplinado: "Disciplined",
  "Documentos e suporte": "Documents and support",
  "Duração em minutos": "Duration in minutes",
  "Editar início": "Edit start",
  "Editar objetivo": "Edit target",
  Elevado: "High",
  "Eliminar definitivamente": "Delete permanently",
  "Eliminar conta pela web": "Delete account on the web",
  "Eliminar este registo?": "Delete this entry?",
  "Eliminar Todos os Dados": "Delete All Data",
  "Eliminar todos os dados?": "Delete all data?",
  "Em Movimento": "On the Move",
  "EM BREVE": "COMING SOON",
  "Em jejuns prolongados superiores a 48 horas, o corpo desencadeia a renovação de leucócitos e células do sistema imunitário através de células estaminais, promovendo regeneração sistémica.":
    "In prolonged fasts over 48 hours, the body triggers white blood cell and immune renewal via stem cells, promoting systemic rejuvenation.",
  "Elevação sustentada de cetonas no sangue e redução da dependência de glicose exógena.":
    "Sustained rise of blood ketones and reduced dependence on exogenous glucose.",
  "Enquadra a refeição": "Frame the meal",
  Entendido: "Understood",
  Entrar: "Enter",
  "Escolhe a janela que pretendes acompanhar.":
    "Choose the window you want to track.",
  "Escolhe o nome que aparece no teu perfil. Podes alterá-lo mais tarde.":
    "Choose the name shown on your profile. You can change it later.",
  "Escolhe o protocolo ou opta por jejum livre sem limite fixo.":
    "Choose a protocol or opt for open fasting with no fixed limit.",
  "Escolhe um nome para o teu perfil.": "Choose a name for your profile.",
  "Escolhes o destino. Nada é publicado automaticamente.":
    "You choose the destination. Nothing is posted automatically.",
  "ESCOLHE O TEU PLANO": "CHOOSE YOUR PLAN",
  Escuro: "Dark",
  "Esforço percebido": "Perceived effort",
  "Esta ação elimina permanentemente jejuns, refeições, peso, XP, perfil, consentimento, fotografias privadas e, se existir, a conta sincronizada. Não elimina ficheiros que já tenhas exportado e não pode ser anulada.":
    "This permanently deletes fasts, meals, weight, XP, profile, consent, private photos and any synced account. It does not delete files you already exported and cannot be undone.",
  "Esta app é uma ferramenta de acompanhamento pessoal de estilo de vida e gamificação. Não presta aconselhamento médico, nutricional ou de treino.":
    "This app is a personal lifestyle tracking and gamification tool. It does not provide medical, nutritional or training advice.",
  "Esta é a fase estimada em que o teu organismo se encontra agora.":
    "This is the estimated phase your body is currently in.",
  "Esta janela fecha automaticamente quando a conta Google estiver ligada.":
    "This window closes automatically when the Google account is connected.",
  "Estabilização da glicemia sanguínea": "Stabilisation of blood glucose",
  "Excelente momento para caminhadas ligeiras ou trabalho focado; a clareza mental começa a aumentar.":
    "Great time for light walks or deep focused work; mental clarity begins to sharpen.",
  "Ex.: 250g, 1 prato cheio, 2 fatias, 1 taça":
    "E.g. 250g, 1 full plate, 2 slices, 1 bowl",
  "Ex.: é tofu com arroz integral, cerca de 300g":
    "E.g. tofu with brown rice, around 300g",
  "Ex.: salmão grelhado com arroz e legumes":
    "E.g. grilled salmon with rice and vegetables",
  "Experiência": "Experience",
  "Experimentar 7 Dias Grátis": "Start 7-Day Free Trial",
  "Explicações biológicas aprofundadas, cetose e autofagia celular.":
    "In-depth biological explanations, ketosis and cellular autophagy.",
  "Exportar os meus Dados": "Export My Data",
  "Exportar, eliminar e consultar onde os dados são guardados.":
    "Export, delete and review where your data is stored.",
  Fase: "Phase",
  "Fases metabólicas · Toca para ver o que acontece no corpo":
    "Metabolic phases · Tap to see what happens in your body",
  "Fases Metabólicas Detalhadas": "Detailed Metabolic Phases",
  "Fases metabólicas estimadas": "Estimated metabolic phases",
  "Fases metabólicas estimadas com base em literatura geral. Varia de pessoa para pessoa.":
    "Metabolic phases are estimated from general literature. They vary from person to person.",
  "Ferramenta de acompanhamento pessoal de estilo de vida e gamificação. Não presta aconselhamento médico, nutricional ou de treino.":
    "Personal lifestyle tracking and gamification tool. It does not provide medical, nutritional or training advice.",
  "FLEXÍVEL": "FLEXIBLE",
  Força: "Strength",
  "Fotografa ou descreve o que comeste e revê sempre as estimativas.":
    "Photograph or describe what you ate and always review the estimates.",
  "Fotografa e analisa refeições sem limites diários de tokens.":
    "Photograph and analyse meals without daily token limits.",
  "Fotografar refeição": "Photograph meal",
  Galeria: "Gallery",
  "(Garrafa)": "(Bottle)",
  Garrafa: "Bottle",
  "ganhos esta semana": "earned this week",
  "Gerir": "Manage",
  Glicose: "Glucose",
  Gordura: "Fat",
  "Gordura, editável": "Fat, editable",
  "Guardada apenas neste dispositivo.": "Stored only on this device.",
  "Guardar atividade · +50 XP": "Save activity · +50 XP",
  "Guardar perfil": "Save profile",
  "Guardar registo": "Save entry",
  "Guarda pessoas importantes e sincroniza a lista entre os teus dispositivos. Não são partilhados jejuns, refeições ou treinos automaticamente.":
    "Keep important people in your circle and sync the list across your devices. Fasts, meals and workouts are never shared automatically.",
  "Hábitos ao meu ritmo.": "Habits at my own pace.",
  Hidratos: "Carbs",
  "Hidratos, editável": "Carbs, editable",
  "Histórico completo de consistência, peso e estimativas nutricionais.":
    "Complete consistency history, weight and nutritional estimates.",
  Hoje: "Today",
  "IA BOOST": "AI BOOST",
  "IA ilimitada, todos os jejuns e temas exclusivos":
    "Unlimited AI, all fasts and exclusive themes",
  Idioma: "Language",
  "Imagem descarregada e link aberto para partilha.":
    "Image downloaded and link opened for sharing.",
  "Imagem descarregada e texto com o link copiado.":
    "Image downloaded and text with the link copied.",
  "Imagem e link enviados para a app escolhida.":
    "Image and link sent to the selected app.",
  "Imagem e link partilhados.": "Image and link shared.",
  Iniciado: "Initiated",
  "Inicia-se a autofagia, um processo biológico nobre em que as células reciclam organelos danificados, vírus latentes e proteínas acumuladas, rejuvenescendo os tecidos.":
    "Autophagy begins—a cellular process where damaged organelles, latent viruses, and aggregated proteins are recycled, rejuvenating tissues.",
  "Início de Queima de Glicose": "Early glucose use",
  "Início ativo da queima de gordura corporal (lipólise)":
    "Active onset of body fat burning (lipolysis)",
  "Inibição de mTOR e ativação de AMPK, desencadeando a reciclagem autofágica celular profunda.":
    "Inhibition of mTOR and activation of AMPK, triggering deep cellular autophagic recycling.",
  "Insígnia de Prestígio Mestre e estatuto honorário permanente de pioneiro Kynio.":
    "Master Prestige badge and permanent honorary Kynio pioneer status.",
  Insígnias: "Badges",
  "Intensidade alta · 1 dia de tolerância usado":
    "High intensity · 1 grace day used",
  "Intensidade máxima · atividade hoje": "Maximum intensity · activity today",
  "Intensidade suave · 1 dia em pausa": "Gentle intensity · 1 day paused",
  "Introduz um peso válido superior a zero.":
    "Enter a valid weight greater than zero.",
  "Introduz um peso válido ou deixa o campo vazio.":
    "Enter a valid weight or leave the field empty.",
  "Já comecei antes": "Started earlier",
  Jejum: "Fasting",
  "JEJUM ATIVO": "FAST ACTIVE",
  "JEJUM INATIVO": "FAST INACTIVE",
  "Jejum Livre": "Open Fasting",
  "Jejum livre": "Open fasting",
  "Jejuns, refeições, peso, progresso e fotografias confirmadas ficam sempre disponíveis neste dispositivo.":
    "Fasts, meals, weight, progress and confirmed photos always remain available on this device.",
  "Jejuns, refeições, progresso e fotografias confirmadas ficam sempre disponíveis neste dispositivo.":
    "Fasts, meals, progress and confirmed photos always remain available on this device.",
  "Jornada iniciada": "Journey started",
  "Kynio Aura Pass Pro": "Kynio Aura Pass Pro",
  Leve: "Light",
  "Leva o teu jejum e nutrição ao próximo nível com IA ilimitada.":
    "Take your fasting and nutrition to the next level with unlimited AI.",
  "Ligar Google agora · opcional": "Connect Google now · optional",
  "Limpeza de mitocôndrias disfuncionais (mitofagia)":
    "Clearance of dysfunctional mitochondria (mitophagy)",
  "Linha de 7 Dias": "7-Day Line",
  "Linha de Consistência": "Consistency Line",
  "Lista vazia": "Empty list",
  "Local por defeito · cloud opcional": "Local by default · optional cloud",
  "Local por defeito · sincronização opcional":
    "Local by default · optional sync",
  "Macros estimados · editáveis": "Estimated macros · editable",
  "Manutenção temporária dos níveis energéticos":
    "Temporary maintenance of energy levels",
  "Mantém atividade durante 7 dias seguidos.":
    "Stay active for 7 consecutive days.",
  "Mantém-te hidratado apenas com água para facilitar o trânsito digestivo.":
    "Stay hydrated with water to support digestive transit.",
  "Mantém uma cópia local e sincroniza entre os teus dispositivos quando tens internet.":
    "Keep a local copy and sync between your devices when you are online.",
  "Mestre da Consistência": "Master of Consistency",
  "Mestre da Longevidade": "Master of Longevity",
  "Métricas & Tendências Avançadas": "Advanced Metrics & Trends",
  "Métricas Avançadas": "Advanced Metrics",
  "minutos no total": "total minutes",
  Mobilidade: "Mobility",
  Moderado: "Moderate",
  "Modo IA Pro Turbo": "AI Pro Turbo Mode",
  "Mostra ou descreve a refeição": "Show or describe the meal",
  "Na tua lista privada": "In your private list",
  "Não foi possível abrir o documento. Tenta novamente.":
    "The document could not be opened. Please try again.",
  "Não foi possível calcular o resumo de hoje.":
    "Today's summary could not be calculated.",
  "Não foi possível concluir a ligação Google.":
    "The Google connection could not be completed.",
  "Não foi possível eliminar este registo.": "This entry could not be deleted.",
  "Não foi possível eliminar todos os dados locais.":
    "Could not delete all local data.",
  "Não foi possível exportar os dados locais.":
    "Could not export local data.",
  "Não foi possível guardar o perfil.": "The profile could not be saved.",
  "Não foi possível guardar o registo.": "The entry could not be saved.",
  "Não foi possível preparar o perfil. Tenta novamente.":
    "The profile could not be prepared. Please try again.",
  "Não são partilhados jejuns, refeições ou treinos automaticamente.":
    "Fasts, meals and workouts are not shared automatically.",
  "Nenhuma análise": "No analysis",
  Nível: "Level",
  "Nível atual": "Current level",
  "Níveis, consistência e conquistas calculados apenas com os teus registos locais.":
    "Levels, consistency and achievements calculated only from your local logs.",
  Nome: "Name",
  "Nome do amigo": "Friend's name",
  "Nome do perfil": "Profile name",
  "Notas opcionais: percurso, como te sentiste…":
    "Optional notes: route, how you felt…",
  "Nova análise": "New analysis",
  "Novo registo": "New entry",
  "O acesso é usado apenas para enquadrar e fotografar esta refeição. A captura só acontece quando tocares no botão.":
    "Access is only used to frame and photograph this meal. A photo is only taken when you tap the button.",
  "O fígado começa a produzir corpos cetónicos a partir da gordura. O cérebro utiliza as cetonas como combustível limpo e supereficiente, promovendo foco e bem-estar.":
    "The liver starts producing ketone bodies from fat. The brain uses ketones as a clean, super-efficient fuel, boosting focus and wellbeing.",
  "O histórico começa guardado no dispositivo. Se ligares uma conta Google, perfil, amigos, peso e registos serão também sincronizados remotamente entre os teus dispositivos. Uma fotografia de refeição só é enviada, através do KYNIO, para a Google Gemini quando pedes uma análise.":
    "History starts on your device. If you connect a Google account, profile, friends, weight and logs are also synced remotely across your devices. A meal photo is only sent through KYNIO to Google Gemini when you request an analysis.",
  "O organismo está focado na digestão da última refeição. A glicose e os níveis de insulina sobem, permitindo às células utilizar o açúcar no sangue como fonte primária de energia.":
    "The body is focused on digesting the last meal. Glucose and insulin levels rise, allowing cells to use blood sugar as their primary energy source.",
  "O que comeste?": "What did you eat?",
  "O que está a acontecer no organismo": "What is happening in your body",
  "O que fizeste hoje?": "What did you do today?",
  "O registo de peso serve apenas para acompanhamento pessoal. Não avalia a tua saúde, não define um peso ideal e não substitui orientação profissional.":
    "Weight logging is only for personal tracking. It does not assess your health, define an ideal weight or replace professional guidance.",
  "O teu círculo": "Your circle",
  "O teu histórico aparecerá aqui depois do primeiro registo.":
    "Your history will appear here after the first entry.",
  "O teu movimento": "Your movement",
  "O teu progresso, à tua maneira": "Your progress, your way",
  "Objetivo de jejum": "Fasting target",
  "Opcional, descritivo e sem metas obrigatórias.":
    "Optional, descriptive and without mandatory targets.",
  "Otimização profunda da sensibilidade à insulina":
    "Deep optimisation of insulin sensitivity",
  "Outra duração": "Other duration",
  Outro: "Other",
  "Ouve sempre os sinais do teu corpo. Jejuns prolongados (superiores a 24h) não são indicados para menores, grávidas ou sem acompanhamento médico. Todos os teus registos são 100% locais e confidenciais.":
    "Always listen to your body. Prolonged fasts (over 24h) are not suitable for minors, during pregnancy, or without medical supervision. All your records are 100% local and confidential.",
  "Pagamento único · Acesso permanente": "One-time payment · Permanent access",
  "Partilhar conquistas": "Share achievements",
  "Partilhar imagem e link": "Share image and link",
  Perfil: "Profile",
  "Perfil local privado": "Private local profile",
  "Permitir acesso à câmara": "Allow camera access",
  "Personaliza a interface com visuais Obsidian Glow e Emerald Neon.":
    "Customise the interface with Obsidian Glow and Emerald Neon visuals.",
  Peso: "Weight",
  "Peso atual (opcional)": "Current weight (optional)",
  "Pico de insulina circulante e início do armazenamento de glicose sob a forma de glicogénio muscular e hepático.":
    "Peak circulating insulin and onset of glucose storage as muscle and liver glycogen.",
  "Plano Anual": "Annual Plan",
  "Plano Mensal": "Monthly Plan",
  "Política de Privacidade": "Privacy Policy",
  "POUPA 42% · MAIS POPULAR": "SAVE 42% · MOST POPULAR",
  "Potencial proteção neurodegenerativa e longevidade celular":
    "Potential neuroprotective support and cellular longevity",
  "Pré-visualização em direto": "Live preview",
  Preferências: "Preferences",
  "PREMIUM PASS": "PREMIUM PASS",
  "PRESTÍGIO": "PRESTIGE",
  "Primeiras 50h": "First 50h",
  "Primeiro Objetivo": "First Target",
  "Primeiro Scan de IA": "First AI Scan",
  "Prioridade e precisão aumentada no modelo Gemini de análise de refeições.":
    "Priority and enhanced precision in the Gemini meal analysis model.",
  Privacidade: "Privacy",
  "Privacidade e controlo": "Privacy and control",
  "Privacidade e dados": "Privacy and data",
  "Produção consistente de corpos cetónicos (beta-hidroxibutirato)":
    "Consistent production of ketone bodies (beta-hydroxybutyrate)",
  Progresso: "Progress",
  "Progresso indisponível": "Progress unavailable",
  "Pronto para iniciar jejum livre": "Ready to start open fasting",
  "Pronto para o objetivo": "Ready for target",
  Proteína: "Protein",
  "Proteína, editável": "Protein, editable",
  "Quando terminares o teu primeiro jejum, ele aparecerá aqui com a duração, meta e XP ganho.":
    "When you finish your first fast, it will appear here with duration, goal details, and XP earned.",
  "Quantidade / Porção (opcional)": "Quantity / Portion (optional)",
  "Quebra o jejum prolongado com caldos nutritivos e porções pequenas de fácil digestão.":
    "Break extended fasts with nourishing broths and small, easily digestible portions.",
  "Queda dos níveis de açúcar no sangue e desbloqueio gradual das vias de oxidação lipídica.":
    "Drop in blood sugar levels and gradual unlocking of lipid oxidation pathways.",
  "Queima de Glicose": "Glucose Burn",
  "Queima de Gordura": "Fat Burning",
  "Quero acompanhar o meu peso": "I want to track my weight",
  "Queres ajustar ingredientes ou porção?":
    "Want to adjust ingredients or portion?",
  "Quota diária de IA atingida": "Daily AI quota reached",
  "Recalcular com estes detalhes": "Recalculate with these details",
  "Reciclagem celular e degradação de proteínas senescentes":
    "Cellular recycling and degradation of senescent proteins",
  "Redução de marcadores inflamatórios sistémicos":
    "Reduction of systemic inflammatory markers",
  "Redução drástica do stress oxidativo e inflamação":
    "Drastic reduction in oxidative stress and inflammation",
  "Redução progressiva da insulina plasmática":
    "Progressive reduction of plasma insulin",
  Refeições: "Meals",
  Referência: "Reference",
  "Regeneração & Reset": "Renewal & Reset",
  "Regista a primeira atividade realizada.":
    "Log your first completed activity.",
  "Regista apenas atividade já realizada. A app não recomenda duração, intensidade ou um plano de treino.":
    "Only log activity you have already completed. The app does not recommend duration, intensity or a training plan.",
  "Regista o movimento que escolheste fazer, ao teu ritmo e sem metas obrigatórias.":
    "Log the movement you chose to do, at your own pace and without mandatory targets.",
  "Registar atividade": "Log activity",
  "Registo opcional": "Optional log",
  Remover: "Remove",
  "Remover amigo?": "Remove friend?",
  "Remover fotografia": "Remove photo",
  Repetir: "Retake",
  "Repouso e hidratação com eletrólitos (sódio, potássio, magnésio) são essenciais em jejuns de dia completo.":
    "Rest and hydration with mineral water and electrolytes are key during full-day fasts.",
  Restante: "Remaining",
  "Restaurar": "Restore",
  "Resultado estruturado": "Structured result",
  "Resumo de hoje": "Today's summary",
  "Resumo do jejum": "Fasting summary",
  "Rever tutorial guiado": "Replay guided tour",
  "Se sentires fome súbita, bebe água ou chá sem açúcar; é apenas o reflexo hormonal da grelina.":
    "If you feel sudden hunger, drink water or unsweetened tea; it is simply ghrelin's hormonal wave.",
  "Segurança de Saúde & Privacidade RGPD": "Health Safety & GDPR Privacy",
  "Sem atividade registada": "No activity logged",
  "Sem limite fixo (>1 dia / livre)": "No fixed limit (>1 day / flexible)",
  "Sem meta pré-fixada · Conta até decidires terminar":
    "No preset target · Counts until you choose to end",
  "Sem registos": "No entries",
  "Sensibilidade melhorada dos recetores de insulina":
    "Enhanced sensitivity of insulin receptors",
  "Sincronização em Nuvem": "Cloud Sync",
  "Sincronizar agora": "Sync now",
  "Só a fotografia e a descrição desta análise são enviadas à API. A resposta não é armazenada remotamente pela app.":
    "Only this analysis photo and description are sent to the API. The response is not stored remotely by the app.",
  Sobre: "About",
  "Subscrição com renovação automática através da tua conta Google Play. Cancela a qualquer momento nas definições da Play Store com pelo menos 24h de antecedência.":
    "Auto-renewing subscription through your Google Play account. Cancel anytime in Play Store settings at least 24h in advance.",
  "Tema Aura Glow": "Aura Glow Theme",
  "Temas Exclusivos Aura": "Exclusive Aura Themes",
  "Tentar novamente": "Try again",
  "Terminar Jejum": "End Fast",
  "Termos": "Terms",
  "Termos de Utilização": "Terms of Use",
  "Toca no valor para ajustar": "Tap the value to adjust",
  "Todos os Protocolos de Jejum": "All Fasting Protocols",
  "Totais dos registos confirmados. Sem metas prescritas.":
    "Totals from confirmed logs. No prescribed targets.",
  Treinos: "Workouts",
  "Uma ferramenta de registo, não de prescrição":
    "A logging tool, not a prescription",
  "Uma frase sobre o teu ritmo, objetivos ou motivação.":
    "A sentence about your rhythm, goals or motivation.",
  "Usar fotografia": "Use photo",
  "Utilizador KYNIO": "KYNIO User",
  "Últimos 7 dias": "Last 7 days",
  "Valores estimados por IA para acompanhamento pessoal de hábitos. Ajuste manualmente conforme necessário.":
    "AI-estimated values for personal habit tracking. Adjust manually as needed.",
  "Ver biologia & dicas →": "View biology & tips →",
  "VISUAL": "VISUAL",
  "Volta a apresentar o guia de Jejum, Refeições, Treinos, Progresso e Privacidade.":
    "Shows the Fasting, Meals, Workouts, Progress and Privacy guide again.",
  "Voltar ao perfil": "Return to profile",
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
    const levelLabel = normalized.match(/^Nível (\d+)\s*[-:]\s*(.+)$/i);
    const levelOnly = normalized.match(/^Nível (\d+)$/i);
    const pausedIntensity = normalized.match(
      /^Intensidade reduzida · (\d+) dias em pausa$/i,
    );
    const activityCount = normalized.match(/^(\d+) atividades registadas$/i);
    const fastProgress = normalized.match(/^(\d+)% do objetivo (.+)$/i);
    const readyTarget = normalized.match(/^Pronto para o objetivo (.+)$/i);
    const fastingWindow = normalized.match(
      /^(\d+)h de jejum · (\d+)h de janela$/i,
    );
    const fastingWindowWithDesc = normalized.match(
      /^(\d+)h de jejum · (\d+)h janela · (.+)$/i,
    );
    const nextLevel = normalized.match(/^(\d+) XP PARA NÍVEL (\d+)$/i);
    const weightDelta = normalized.match(
      /^([+-]?[\d.,]+) (kg|lb) desde o registo anterior$/i,
    );
    const confirmedMeals = normalized.match(/^(\d+) refeições confirmadas$/i);
    const remainingScans = normalized.match(/^(\d+) análises grátis hoje$/i);
    const activeTiers = normalized.match(/^(\d+)\/(\d+) Ativas$/i);
    const levelTierRequirement = normalized.match(/^Nv\. (\d+) \((\d+) XP\)$/i);
    const targetWithProtocol = normalized.match(/^Objetivo · (.+)$/i);
    const activePlanTier = normalized.match(/^Plano ativo \((.+)\) · Acesso total$/i);
    const exportPrepared = normalized.match(/^Exportação preparada: (.+)$/i);

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
    } else if (fastingWindowWithDesc) {
      translation = `${fastingWindowWithDesc[1]}h fasting · ${fastingWindowWithDesc[2]}h window · ${fastingWindowWithDesc[3]}`;
    } else if (nextLevel) {
      translation = `${nextLevel[1]} XP TO LEVEL ${nextLevel[2]}`;
    } else if (weightDelta) {
      translation = `${weightDelta[1]} ${weightDelta[2]} since the previous entry`;
    } else if (confirmedMeals) {
      translation = `${confirmedMeals[1]} confirmed meals`;
    } else if (remainingScans) {
      translation = `${remainingScans[1]} free analyses today`;
    } else if (activeTiers) {
      translation = `${activeTiers[1]}/${activeTiers[2]} Active`;
    } else if (levelTierRequirement) {
      translation = `Lv. ${levelTierRequirement[1]} (${levelTierRequirement[2]} XP)`;
    } else if (targetWithProtocol) {
      translation = `Target · ${targetWithProtocol[1]}`;
    } else if (activePlanTier) {
      translation = `Active plan (${activePlanTier[1]}) · Full access`;
    } else if (exportPrepared) {
      translation = `Export ready: ${exportPrepared[1]}`;
    }
  }

  if (!translation) {
    return value;
  }

  const leadingWhitespace = value.match(/^\s*/)?.[0] ?? "";
  const trailingWhitespace = value.match(/\s*$/)?.[0] ?? "";
  return `${leadingWhitespace}${translation}${trailingWhitespace}`;
}
