/* ============================================================
   KYNIO — interações
   ============================================================ */
(() => {
  "use strict";

  /* ---------------- i18n ---------------- */
  const I18N = {
    pt: {
      "nav.phases": "Fases", "nav.features": "Funcionalidades", "nav.screens": "Ecrãs",
      "nav.cta": "Aderir à Beta",
      "hero.badge": "Beta fechada · Google Play",
      "hero.t1": "Constrói o teu ritmo.", "hero.t2": "Sem pressão.",
      "hero.sub": "Acompanha quando o teu corpo entra em queima de gordura, cetose e autofagia celular. Fotografa o prato para rever estimativas de calorias e macronutrientes. 100% privado, na SQLite local do teu telemóvel.",
      "hero.cta1": "Entrar na Beta do Android", "hero.cta2": "Ver como funciona",
      "hero.meta": "Privacidade local&nbsp;&nbsp;·&nbsp;&nbsp;Sem anúncios&nbsp;&nbsp;·&nbsp;&nbsp;Google Play Store",
      "chip.water": "2000 ml", "chip.level": "Nível 4 · Consistente",
      "phases.eyebrow": "O teu corpo, em tempo real",
      "phases.title": "Cinco fases. Um arco.",
      "phases.sub": "O KYNIO traduz literatura biológica num temporizador vivo — sabe exatamente onde estás no jejum, sem adivinhar.",
      "arc.elapsed": "decorridos", "arc.remain": "restantes",
      "ph.0.t": "Digestão", "ph.0.d": "A glicose da última refeição ainda está em circulação. O corpo usa-a primeiro.",
      "ph.1.t": "Queima de Glicose", "ph.1.d": "Os níveis de insulina descem. O glicogénio do fígado torna-se a fonte principal.",
      "ph.2.t": "Queima de Gordura", "ph.2.d": "O interruptor metabólico: a gordura armazenada passa a ser o combustível.",
      "ph.3.t": "Cetose", "ph.3.d": "Os corpos cetónicos alimentam o cérebro. Clareza mental e energia estável.",
      "ph.4.t": "Autofagia Celular", "ph.4.d": "A limpeza celular profunda: reciclagem de componentes danificados.",
      "feat.eyebrow": "Funcionalidades",
      "feat.title": "Foco em hábitos e saúde.<br>Sem complicações.",
      "feat.sub": "Uma ferramenta pessoal desenvolvida para manter a tua consistência diária de forma simples e intuitiva.",
      "f.0.t": "Fases Metabólicas Reais", "f.0.d": "Acompanha a transição entre Digestão, Queima de Gordura, Cetose e Autofagia Celular com base em literatura biológica.",
      "f.1.t": "Scanner de Refeições", "f.1.d": "Tira uma foto ao teu prato para estimar instantaneamente calorias e macronutrientes — proteína, hidratos e gorduras.",
      "f.2.t": "Água & Eletrólitos", "f.2.d": "Controlo prático de hidratação diária com atalhos de copos e orientações saudáveis para o jejum.",
      "f.3.t": "Privacidade Local", "f.3.d": "Os teus registos ficam guardados no teu dispositivo, numa SQLite privada. Sem anúncios e sem rastreio invasivo.",
      "scr.eyebrow": "Ecrãs da app",
      "scr.title": "Capturas autênticas.<br>Sem maquilhagem.",
      "scr.hint": "arrasta para explorar →",
      "cap.0": "Temporizador & Alvos", "cap.1": "Scanner de Prato", "cap.2": "Registo de Atividade",
      "cap.3": "Níveis de XP & Metas", "cap.4": "Badges & Partilha",
      "fin.eyebrow": "Beta fechada no Google Play",
      "fin.title": "Pronto para o teu<br>primeiro jejum?",
      "fin.sub": "Acede à versão oficial de teste fechado na Google Play Store. Dois passos e estás dentro.",
      "fin.cta": "Aderir à Beta no Google Play",
      "ft.privacy": "Política de Privacidade", "ft.terms": "Termos de Utilização",
      "ft.delete": "Eliminar Conta", "ft.support": "Suporte & Contacto",
      "ft.note": "KYNIO · Ferramenta pessoal de acompanhamento de estilo de vida e gamificação. Não presta aconselhamento médico ou nutricional.",
      "md.eyebrow": "Acesso à Beta do Android",
      "md.title": "Dois passos e estás dentro.",
      "md.s1t": "Entrar no Grupo de Testers", "md.s1d": "Autoriza a tua conta Google para ter acesso à versão de teste na Play Store.",
      "md.s1b": "Entrar no Grupo Google",
      "md.s2t": "Descarregar na Google Play", "md.s2d": "Abre o link oficial e instala o KYNIO no teu Android.",
      "md.s2b": "Abrir na Google Play Store",
      "phaseNames": ["Digestão", "Queima de Glicose", "Queima de Gordura", "Cetose", "Autofagia Celular"]
    },
    en: {
      "nav.phases": "Phases", "nav.features": "Features", "nav.screens": "Screens",
      "nav.cta": "Join Beta",
      "hero.badge": "Closed Beta · Google Play",
      "hero.t1": "Build your rhythm.", "hero.t2": "Without pressure.",
      "hero.sub": "Track when your body transitions to fat burning, ketosis, and cellular autophagy. Snap a meal photo to review calorie and macro estimates. 100% private, in your phone's local SQLite.",
      "hero.cta1": "Join the Android Beta", "hero.cta2": "See how it works",
      "hero.meta": "Local privacy&nbsp;&nbsp;·&nbsp;&nbsp;Ad-free&nbsp;&nbsp;·&nbsp;&nbsp;Google Play Store",
      "chip.water": "2000 ml", "chip.level": "Level 4 · Consistent",
      "phases.eyebrow": "Your body, in real time",
      "phases.title": "Five phases. One arc.",
      "phases.sub": "KYNIO turns biological literature into a living timer — know exactly where you are in your fast, no guessing.",
      "arc.elapsed": "elapsed", "arc.remain": "remaining",
      "ph.0.t": "Digestion", "ph.0.d": "Glucose from your last meal is still circulating. The body uses it first.",
      "ph.1.t": "Glucose Burning", "ph.1.d": "Insulin levels drop. Liver glycogen becomes the primary source.",
      "ph.2.t": "Fat Burning", "ph.2.d": "The metabolic switch: stored fat becomes the fuel.",
      "ph.3.t": "Ketosis", "ph.3.d": "Ketone bodies feed the brain. Mental clarity and steady energy.",
      "ph.4.t": "Cellular Autophagy", "ph.4.d": "Deep cellular cleanup: recycling of damaged components.",
      "feat.eyebrow": "Features",
      "feat.title": "Focused on habits and health.<br>No friction.",
      "feat.sub": "A personal tool built to keep your daily consistency simple, clean, and intuitive.",
      "f.0.t": "Real Metabolic Phases", "f.0.d": "Track your progress through Digestion, Fat Burning, Ketosis and Cellular Autophagy grounded in biological literature.",
      "f.1.t": "Meal Scanner", "f.1.d": "Snap a photo of your plate to instantly estimate calories and macronutrients — protein, carbs, and fat.",
      "f.2.t": "Water & Electrolytes", "f.2.d": "Effortless daily hydration tracking with quick cup shortcuts and healthy fasting guidance.",
      "f.3.t": "Local Privacy", "f.3.d": "Your records stay on your device in a private SQLite database. Zero ads, zero invasive tracking.",
      "scr.eyebrow": "App screens",
      "scr.title": "Authentic captures.<br>No makeup.",
      "scr.hint": "drag to explore →",
      "cap.0": "Timer & Protocols", "cap.1": "Meal Scanner", "cap.2": "Activity Logging",
      "cap.3": "XP Levels & Goals", "cap.4": "Badges & Sharing",
      "fin.eyebrow": "Closed beta on Google Play",
      "fin.title": "Ready for your<br>first fast?",
      "fin.sub": "Get access to the official closed beta on the Google Play Store. Two steps and you're in.",
      "fin.cta": "Join Beta on Google Play",
      "ft.privacy": "Privacy Policy", "ft.terms": "Terms of Use",
      "ft.delete": "Delete Account", "ft.support": "Support & Contact",
      "ft.note": "KYNIO · Personal lifestyle and gamification tracking tool. Does not provide medical or nutritional advice.",
      "md.eyebrow": "Android Beta Access",
      "md.title": "Two steps and you're in.",
      "md.s1t": "Join the Testers Group", "md.s1d": "Authorise your Google account to get access to the test version on the Play Store.",
      "md.s1b": "Join Google Group",
      "md.s2t": "Download on Google Play", "md.s2d": "Open the official link and install KYNIO on your Android device.",
      "md.s2b": "Open on Google Play Store",
      "phaseNames": ["Digestion", "Glucose Burning", "Fat Burning", "Ketosis", "Cellular Autophagy"]
    }
  };

  let lang = localStorage.getItem("kynio-lang") || "pt";

  const SCREENSHOTS = {
    pt: [
      { src: "assets/screenshots/00_jejum_tracker.png", alt: "Temporizador de jejum 16:8" },
      { src: "assets/screenshots/01_refeicoes_nutricao_ia.png", alt: "Scanner de refeições com IA" },
      { src: "assets/screenshots/02_treinos_movimento.png", alt: "Registo de treinos" },
      { src: "assets/screenshots/03_progresso_gamificado.png", alt: "Progresso e níveis de XP" },
      { src: "assets/screenshots/04_conquistas_partilha.png", alt: "Conquistas e partilha" },
    ],
    en: [
      { src: "assets/screenshots/en/00_fasting_tracker.png", alt: "16:8 Fasting Timer" },
      { src: "assets/screenshots/en/01_ai_meal_nutrition.png", alt: "AI Meal Scanner" },
      { src: "assets/screenshots/en/02_workouts_movement.png", alt: "Workouts & Movement" },
      { src: "assets/screenshots/en/03_gamified_progress.png", alt: "Gamified Progress & XP" },
      { src: "assets/screenshots/en/04_achievements_share.png", alt: "Achievements & Sharing" },
    ],
  };

  function updateScreenshots(l) {
    const list = SCREENSHOTS[l] || SCREENSHOTS.pt;
    const phoneImgs = document.querySelectorAll("#phoneScreen img");
    const dragImgs = document.querySelectorAll("#dragStrip .shot-frame img");
    list.forEach((item, idx) => {
      if (phoneImgs[idx]) {
        phoneImgs[idx].src = item.src;
        phoneImgs[idx].alt = item.alt;
      }
      if (dragImgs[idx]) {
        dragImgs[idx].src = item.src;
        dragImgs[idx].alt = item.alt;
      }
    });
  }

  function applyLang(l) {
    lang = l;
    localStorage.setItem("kynio-lang", l);
    document.documentElement.lang = l;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const v = I18N[l]?.[el.dataset.i18n];
      if (v !== undefined) el.innerHTML = v;
    });
    document.querySelectorAll(".lang-opt").forEach(el =>
      el.classList.toggle("active", el.dataset.lang === l));
    updateScreenshots(l);
  }

  const langToggle = document.getElementById("langToggle");
  if (langToggle) {
    langToggle.addEventListener("click", () =>
      applyLang(lang === "pt" ? "en" : "pt"));
  }

  /* ---------------- nav scroll state ---------------- */
  const nav = document.getElementById("nav");
  if (nav) {
    addEventListener("scroll", () =>
      nav.classList.toggle("scrolled", scrollY > 12), { passive: true });
  }

  /* ---------------- phone scrollview + dots ---------------- */
  const screen = document.getElementById("phoneScreen");
  const dots = [...document.querySelectorAll("#phoneDots .dot")];
  let dotTick = false;
  if (screen && dots.length > 0) {
    screen.addEventListener("scroll", () => {
      if (dotTick) return;
      dotTick = true;
      requestAnimationFrame(() => {
        const i = Math.round(screen.scrollTop / screen.clientHeight);
        dots.forEach((d, k) => d.classList.toggle("active", k === i));
        dotTick = false;
      });
    }, { passive: true });
  }

  /* ---------------- arco metabólico ao vivo ---------------- */
  const PHASE_HOURS = [0, 4, 12, 16, 24];
  const FAST_GOAL_H = 16;
  // jejum simulado: começou há 8h23m41s em relação ao carregamento da página
  const fastStart = Date.now() - (8 * 3600 + 23 * 60 + 41) * 1000;

  const track = document.getElementById("arcTrack");
  const fill = document.getElementById("arcFill");
  const dot = document.getElementById("arcDot");
  const glow = document.getElementById("arcGlow");
  const nodesG = document.getElementById("arcNodes");
  const timerEl = document.getElementById("arcTimer");
  const phaseEl = document.getElementById("arcPhaseName");
  const elapsedEl = document.getElementById("arcElapsed");
  const remainEl = document.getElementById("arcRemain");
  const phaseItems = [...document.querySelectorAll(".phase-item")];

  let nodeEls = [];
  if (track && fill && dot && glow && nodesG && timerEl && phaseEl) {
    const L = track.getTotalLength();
    fill.style.strokeDasharray = L;
    fill.style.strokeDashoffset = L;

    // nós das fases no arco (progresso 0→24h mapeado 0→1)
    const SVGNS = "http://www.w3.org/2000/svg";
    nodeEls = PHASE_HOURS.map((h, i) => {
      const p = track.getPointAtLength((h / 24) * L);
      const g = document.createElementNS(SVGNS, "g");

      const c = document.createElementNS(SVGNS, "circle");
      c.setAttribute("cx", p.x); c.setAttribute("cy", p.y);
      c.setAttribute("r", 7); c.setAttribute("class", "arc-node-dot");
      g.appendChild(c);

      const anchor = i === 0 ? "start" : i === PHASE_HOURS.length - 1 ? "end" : "middle";
      const labelX = i === 0 ? 6 : i === PHASE_HOURS.length - 1 ? 894 : p.x;

      const label = document.createElementNS(SVGNS, "text");
      label.setAttribute("class", "arc-node-label");
      const above = p.y < 300;
      label.setAttribute("x", labelX);
      label.setAttribute("y", above ? p.y - 26 : p.y + 34);
      label.setAttribute("text-anchor", anchor);
      label.dataset.phaseIdx = i;
      g.appendChild(label);

      const hour = document.createElementNS(SVGNS, "text");
      hour.setAttribute("class", "arc-node-hour");
      hour.setAttribute("x", labelX);
      hour.setAttribute("y", above ? p.y - 44 : p.y + 52);
      hour.setAttribute("text-anchor", anchor);
      hour.textContent = h + "h";
      g.appendChild(hour);

      nodesG.appendChild(g);
      return { circle: c, label, h };
    });

    const pad2 = n => String(n).padStart(2, "0");

    function tickArc() {
      const elapsedS = (Date.now() - fastStart) / 1000;
      const elapsedH = elapsedS / 3600;

      // posição no arco (0–24h)
      const t = Math.min(elapsedH / 24, 1);
      const pt = track.getPointAtLength(t * L);
      dot.setAttribute("cx", pt.x); dot.setAttribute("cy", pt.y);
      glow.setAttribute("cx", pt.x); glow.setAttribute("cy", pt.y);
      fill.style.strokeDashoffset = L * (1 - t);

      // fase atual
      let phase = 0;
      for (let i = 0; i < PHASE_HOURS.length; i++) if (elapsedH >= PHASE_HOURS[i]) phase = i;
      if (phaseEl && I18N[lang]?.phaseNames) phaseEl.textContent = I18N[lang].phaseNames[phase];

      nodeEls.forEach((n, i) => {
        const on = elapsedH >= n.h;
        n.circle.classList.toggle("reached", on);
        n.label.classList.toggle("reached", on);
      });
      phaseItems.forEach((el, i) => el.classList.toggle("lit", i === phase));

      // textos
      const h = Math.floor(elapsedH);
      const m = Math.floor((elapsedS % 3600) / 60);
      const s = Math.floor(elapsedS % 60);
      if (timerEl) timerEl.textContent = `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
      if (elapsedEl) elapsedEl.textContent = `${h}h ${pad2(m)}m`;
      const remainS = Math.max(FAST_GOAL_H * 3600 - elapsedS, 0);
      if (remainEl) remainEl.textContent = `${Math.floor(remainS / 3600)}h ${pad2(Math.floor((remainS % 3600) / 60))}m`;
    }

    function arcLabels() {
      if (I18N[lang]?.phaseNames) {
        nodeEls.forEach((n, i) => n.label.textContent = I18N[lang].phaseNames[i]);
      }
    }

    tickArc();
    arcLabels();
    setInterval(tickArc, 1000);
    if (langToggle) langToggle.addEventListener("click", arcLabels);
  }

  /* ---------------- carrossel com arraste + inércia ---------------- */
  const strip = document.getElementById("dragStrip");
  const bar = document.getElementById("dragBar");
  if (strip && bar) {
    let x = 0, startX = 0, lastX = 0, vel = 0, dragging = false, raf = null;

    const maxScroll = () => Math.max(strip.scrollWidth - strip.parentElement.clientWidth, 0);

    function setX(nx) {
      const max = maxScroll();
      // resistência nas bordas
      if (nx > 0) nx = nx * .35;
      if (nx < -max) nx = -max + (nx + max) * .35;
      x = nx;
      strip.style.transform = `translate3d(${x}px,0,0)`;
      const p = max ? Math.min(Math.max(-x / max, 0), 1) : 0;
      bar.style.left = (p * 80) + "%";
    }

    strip.addEventListener("pointerdown", e => {
      dragging = true;
      strip.classList.add("dragging");
      try { strip.setPointerCapture(e.pointerId); } catch (_) {}
      startX = e.clientX - x;
      lastX = e.clientX;
      vel = 0;
      cancelAnimationFrame(raf);
    });

    strip.addEventListener("pointermove", e => {
      if (!dragging) return;
      vel = e.clientX - lastX;
      lastX = e.clientX;
      setX(e.clientX - startX);
    });

    function snapBack() {
      cancelAnimationFrame(raf);
      const target = Math.min(Math.max(x, -maxScroll()), 0);
      const step = () => {
        setX(x + (target - x) * .18);
        if (Math.abs(target - x) > .5) raf = requestAnimationFrame(step);
        else setX(target);
      };
      step();
    }

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      strip.classList.remove("dragging");
      // inércia
      (function glide() {
        vel *= .94;
        if (Math.abs(vel) < .3 && x <= 0 && x >= -maxScroll()) { snapBack(); return; }
        setX(x + vel);
        if (x > 0 || x < -maxScroll()) { snapBack(); return; }
        raf = requestAnimationFrame(glide);
      })();
    }

    strip.addEventListener("pointerup", endDrag);
    strip.addEventListener("pointercancel", endDrag);
    addEventListener("resize", () => setX(Math.min(Math.max(x, -maxScroll()), 0)));
    setX(0);
  }

  /* ---------------- modal beta ---------------- */
  const modal = document.getElementById("betaModal");
  if (modal) {
    const openModal = () => { modal.hidden = false; document.body.style.overflow = "hidden"; };
    const closeModal = () => { modal.hidden = true; document.body.style.overflow = ""; };

    document.querySelectorAll("[data-open-beta]").forEach(b => b.addEventListener("click", openModal));
    document.querySelectorAll("[data-close-beta]").forEach(b => b.addEventListener("click", closeModal));
    addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) closeModal(); });
  }

  /* ---------------- suporte legal pages (data-language-button) ---------------- */
  const legalButtons = document.querySelectorAll("[data-language-button]");
  if (legalButtons.length > 0) {
    const setLegalLang = (l) => {
      document.documentElement.dataset.activeLanguage = l;
      document.documentElement.lang = l;
      localStorage.setItem("kynio-legal-language", l);
      legalButtons.forEach(btn => {
        const isActive = btn.dataset.languageButton === l;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
      });
    };
    legalButtons.forEach(btn => {
      btn.addEventListener("click", () => setLegalLang(btn.dataset.languageButton));
    });
    const saved = localStorage.getItem("kynio-legal-language") || (navigator.language.startsWith("pt") ? "pt" : "en");
    setLegalLang(saved);
  }

  /* ---------------- init ---------------- */
  applyLang(lang);
})();
