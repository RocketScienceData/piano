/**
 * Hanon Piano Tutor - Full Frontend Engine
 * Real-time audio pitch detection, sheet music follower, 88-key virtual piano,
 * scrolling hand placement guide, and continuous course improvement telemetry.
 */

// Classical Method Books Catalog
const BOOKS_CATALOG = [
  {
    id: "hanon-part1",
    author: "C.L. Hanon",
    shortTitle: "Hanon Deel 1",
    fullTitle: "C.L. Hanon — Deel 1: Voorbereidende Oefeningen (1 t/m 20)",
    titleKey: "book_hanon1_title",
    shortKey: "book_hanon1_short",
    badgeKey: "book_hanon1_badge",
    descKey: "book_hanon1_desc",
    defaultBadge: "Essentiële Basis (1-20)",
    defaultDesc: "Versterkt de zwakkere vingers (4 en 5), ontwikkelt onafhankelijkheid, souplesse en volkomen gelijkmatigheid in beide handen.",
    totalExercises: 20,
    totalLessons: 120,
    range: [1, 20],
    startExId: "ex1",
    startLessonId: "les-1",
    pdfFile: "IMSLP91547-PMLP03129-Hanon_Final.pdf",
    icon: "🎹",
    badgeClass: "badge-cyan"
  },
  {
    id: "hanon-part2",
    author: "C.L. Hanon",
    shortTitle: "Hanon Deel 2",
    fullTitle: "C.L. Hanon — Deel 2: Gevorderde Techniek & Toonladders (21 t/m 43)",
    titleKey: "book_hanon2_title",
    shortKey: "book_hanon2_short",
    badgeKey: "book_hanon2_badge",
    descKey: "book_hanon2_desc",
    defaultBadge: "Toonladders & Arpeggio's (21-43)",
    defaultDesc: "Duimdoorgang, alle 24 majeur- en mineurtoonladders, arpeggio's en grondige voorbereiding op het klassieke repertoire.",
    totalExercises: 23,
    totalLessons: 138,
    range: [21, 43],
    startExId: "ex21",
    startLessonId: "les21-1",
    pdfFile: "IMSLP91547-PMLP03129-Hanon_Final.pdf",
    icon: "🎼",
    badgeClass: "badge-gold"
  },
  {
    id: "hanon-part3",
    author: "C.L. Hanon",
    shortTitle: "Hanon Deel 3",
    fullTitle: "C.L. Hanon — Deel 3: Virtuoze Oefeningen & Meesterschap (44 t/m 60)",
    titleKey: "book_hanon3_title",
    shortKey: "book_hanon3_short",
    badgeKey: "book_hanon3_badge",
    descKey: "book_hanon3_desc",
    defaultBadge: "Virtuoos Concertniveau (44-60)",
    defaultDesc: "De ultieme virtuositeit: repeterende toetsen, dubbelnoten (tertsen, sexten), trillers, tremolo's en concertbravoure.",
    totalExercises: 17,
    totalLessons: 102,
    range: [44, 60],
    startExId: "ex44",
    startLessonId: "les44-1",
    pdfFile: "IMSLP91547-PMLP03129-Hanon_Final.pdf",
    icon: "⚡",
    badgeClass: "badge-green"
  },
  {
    id: "czerny-599",
    author: "Carl Czerny",
    shortTitle: "Czerny Op. 599",
    fullTitle: "Carl Czerny — Op. 599: Practical Method for Beginners on the Pianoforte",
    titleKey: "book_czerny_title",
    shortKey: "book_czerny_short",
    badgeKey: "book_czerny_badge",
    descKey: "book_czerny_desc",
    defaultBadge: "100 Melodische Etudes",
    defaultDesc: "Dé beroemdste beginnersmethode ter wereld. Leert je noten lezen in viool- en bassleutel, zangerig spel en muzikaal gevoel.",
    totalExercises: 100,
    totalLessons: 200,
    range: [1, 100],
    startExId: "cz1",
    startLessonId: "les-cz1-1",
    pdfFile: "Czerny-599.pdf",
    altPdf: "IMSLP86518-PMLP177048-CZERNY_Practical_Method_for_Beginners_on_the_Pianoforte_Op._599.pdf",
    icon: "📖",
    badgeClass: "badge-purple"
  },
  {
    id: "bach-first",
    author: "J.S. Bach (Walter Carroll)",
    shortTitle: "Bach First Lessons",
    fullTitle: "J.S. Bach — First Lessons in Bach (Walter Carroll Edition)",
    titleKey: "book_bach_title",
    shortKey: "book_bach_short",
    badgeKey: "book_bach_badge",
    descKey: "book_bach_desc",
    defaultBadge: "Polyfonie & Zangstijl",
    defaultDesc: "Ontwikkel echte tweestemmige onafhankelijkheid en muzikale zangstijl met de Menuetten en Musettes van Johann Sebastian Bach.",
    totalExercises: 28,
    totalLessons: 56,
    range: [1, 28],
    startExId: "bach1",
    startLessonId: "les-bach1-1",
    pdfFile: "IMSLP302296-PMLP489228-BACH-Carroll_First_Lessons_in_Bach_PF.pdf",
    icon: "🎻",
    badgeClass: "badge-amber"
  }
];

// Global App State
const state = {
  currentBookId: localStorage.getItem("hanon_current_book") || "hanon-part1",
  currentExerciseId: "ex1",
  exercises: [],
  hanonData: null,
  lessons: [],
  currentLessonId: "les-1",
  currentHand: "both", // 'both' (two hands) by default, 'rh', 'lh'
  handDisplayMode: localStorage.getItem("hanon_keyboard_hand_mode") || "hands", // 'hands' (Flowkey moving hands) or 'blocks' (blocks under keyboard)
  showHandsOnKeyboard: (localStorage.getItem("hanon_keyboard_hand_mode") || "hands") === "hands",
  showBlocksUnder: (localStorage.getItem("hanon_keyboard_hand_mode") || "hands") === "blocks",
  currentMode: "wait", // 'wait', 'tempo'
  bpm: 60,
  metronomeOn: true,
  audioSource: "browser-mic", // 'browser-mic', 'python-mic', 'web-midi', 'virtual'
  sensitivity: 12,
  laptopOnPianoMode: localStorage.getItem("hanon_laptop_piano_mode") !== "false", // On-piano acoustic protection
  prevRms: 0,
  lastAttackTime: 0,
  hasNewAttackSinceLastNote: true,
  currentView: "hub", // 'hub', 'menu', 'tutor'
  
  // Lesson execution
  isPlaying: false,
  isDemo: false,
  activeNotesQueue: [],
  currentNoteIndex: 0,
  activeTarget: null,
  
  // Scoring
  correctCount: 0,
  wrongCount: 0,
  streak: 0,
  mistakes: [],
  startTime: null,
  
  // Hand placement guide
  measureGuideMap: {},
  
  // Telemetry for course improvement
  sessionUuid: (typeof crypto !== "undefined" && crypto.randomUUID) 
    ? crypto.randomUUID() 
    : `sess-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
  telemetryQueue: [],
  lastNotePromptTime: 0,

  // Audio context & mic
  audioCtx: null,
  micStream: null,
  analyser: null,
  pitchBuffer: null,
  pythonWs: null,
  midiAccess: null,
  metronomeTimer: null,
  demoTimer: null,
  
  // Pitch detection debounce
  lastDetectedNote: null,
  lastNoteTimestamp: 0,
  pitchHistory: []
};

// Note mapping constants
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function midiToNoteName(midi) {
  const rounded = Math.round(midi);
  const name = NOTE_NAMES[rounded % 12];
  const octave = Math.floor(rounded / 12) - 1;
  return `${name}${octave}`;
}

function noteNameToMidi(name) {
  const match = name.match(/([A-G]#?)([0-9])/);
  if (!match) return 60;
  const letter = match[1];
  const octave = parseInt(match[2]);
  const idx = NOTE_NAMES.indexOf(letter);
  return (octave + 1) * 12 + idx;
}

function midiToFreq(midi) {
  return 440.0 * Math.pow(2.0, (midi - 69) / 12.0);
}

function freqToMidi(freq) {
  if (freq < 20 || freq > 5000) return null;
  return 69.0 + 12.0 * Math.log2(freq / 440.0);
}

// Finger name translation (i18n supported)
function getFingerName(fingerNum) {
  const t = (k) => (window.I18N ? window.I18N.t(k) : k);
  switch (fingerNum) {
    case 1: return t("finger_1");
    case 2: return t("finger_2");
    case 3: return t("finger_3");
    case 4: return t("finger_4");
    case 5: return t("finger_5");
    default: return `${fingerNum}`;
  }
}

// Dynamic Lesson Title localization (supports all 60 exercises & languages)
function getLessonDisplayTitle(l, idx) {
  if (!l) return "";
  let step = (idx !== undefined) ? (idx + 1) : 1;
  if (l.id) {
    if (l.id.includes('-')) {
      const parts = l.id.split('-');
      const parsed = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 6) {
        step = parsed;
      }
    } else {
      const match = l.id.match(/\d+$/);
      if (match) {
        const parsed = parseInt(match[0], 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 6) {
          step = parsed;
        }
      }
    }
  }

  const curLang = (window.I18N && window.I18N.currentLang) || "nl";
  if (curLang === "nl") {
    return l.title || `Les ${step}: Motief & Vingerzetting`;
  }

  if (window.I18N) {
    const key = `lesson_${step}_title`;
    const trans = window.I18N.t(key);
    if (trans && trans !== key) {
      return trans;
    }
  }

  const lessonWord = (window.I18N && window.I18N.t("lesson_word")) || "Lesson";
  if (l.title && l.title.startsWith("Les ")) {
    return l.title.replace(/^Les (\d+)/, `${lessonWord} $1`);
  }

  return `${lessonWord} ${step}`;
}

// Initialize Application
document.addEventListener("DOMContentLoaded", async () => {
  setupTheme();
  setupSettingsDrawer();
  if (window.I18N) {
    window.I18N.applyTranslations();
  }
  setupUIEventListeners();
  buildPianoKeys();
  applyKeyboardLayoutVisibility(false);
  await loadData();
  updateAudioSourceSelectLabels();
  setupWaveformCanvas();
  preloadGrandPianoSamples();
  window.addEventListener("beforeunload", () => {
    if (state.telemetryQueue && state.telemetryQueue.length > 0) {
      flushTelemetry();
    }
  });
});

// Setup UI Event Listeners
function setupUIEventListeners() {
  document.getElementById("btn-start").addEventListener("click", togglePlay);
  document.getElementById("btn-reset").addEventListener("click", resetSession);
  document.getElementById("btn-demo").addEventListener("click", toggleDemo);
  document.getElementById("btn-history").addEventListener("click", openHistoryModal);
  
  const insightsBtn = document.getElementById("btn-insights");
  if (insightsBtn) {
    insightsBtn.addEventListener("click", openInsightsModal);
  }
  
  const exSelect = document.getElementById("exercise-select");
  if (exSelect) {
    exSelect.addEventListener("change", async (e) => {
      await switchExercise(e.target.value);
    });
  }

  document.getElementById("lesson-select").addEventListener("change", (e) => {
    state.currentLessonId = e.target.value;
    loadLesson(state.currentLessonId);
  });
  
  // Hand selector
  const handBtns = document.querySelectorAll("#hand-btn-group button");
  handBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      handBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.currentHand = btn.dataset.hand;
      updateTargetDisplay();
      highlightPianoTarget();
    });
  });

  // Flowkey Keyboard View Switcher: Hands on Keyboard vs Blocks Below
  const btnHands = document.getElementById("btn-view-hands");
  if (btnHands) {
    btnHands.addEventListener("click", () => setKeyboardHandMode("hands", true));
  }
  const btnBlocks = document.getElementById("btn-view-blocks");
  if (btnBlocks) {
    btnBlocks.addEventListener("click", () => setKeyboardHandMode("blocks", true));
  }

  // Keyboard shortcut: Press 'H' to toggle between Hands on Keyboard and Blocks Below
  window.addEventListener("keydown", (e) => {
    if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;
    if (e.key === "h" || e.key === "H") {
      e.preventDefault();
      const newMode = (state.handDisplayMode === "hands") ? "blocks" : "hands";
      setKeyboardHandMode(newMode, true);
    }
  });
  
  // Mode selector
  const modeBtns = document.querySelectorAll("#mode-btn-group button");
  modeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      modeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.currentMode = btn.dataset.mode;
    });
  });
  
  // BPM input
  const bpmInput = document.getElementById("bpm-input");
  bpmInput.addEventListener("change", (e) => {
    let val = parseInt(e.target.value);
    if (isNaN(val) || val < 40) val = 40;
    if (val > 140) val = 140;
    state.bpm = val;
    bpmInput.value = val;
  });
  
  // Metronome toggle
  const metroBtn = document.getElementById("btn-metronome");
  metroBtn.addEventListener("click", () => {
    state.metronomeOn = !state.metronomeOn;
    metroBtn.style.color = state.metronomeOn ? "var(--accent-gold)" : "var(--text-muted)";
  });
  
  // Audio source change
  document.getElementById("audio-source-select").addEventListener("change", async (e) => {
    state.audioSource = e.target.value;
    await switchAudioSource(state.audioSource);
  });
  
  // Sensitivity slider
  document.getElementById("mic-sensitivity").addEventListener("input", (e) => {
    state.sensitivity = parseInt(e.target.value);
  });
  
  // View switcher (Vector SVG vs PDF Scan)
  const btnVector = document.getElementById("btn-view-vector");
  const btnPdf = document.getElementById("btn-view-pdf");
  const vectorWrapper = document.getElementById("sheet-vector-wrapper");
  const pdfWrapper = document.getElementById("sheet-wrapper");

  if (btnVector && btnPdf) {
    btnVector.addEventListener("click", () => {
      btnVector.classList.add("active");
      btnPdf.classList.remove("active");
      if (vectorWrapper) vectorWrapper.style.display = "block";
      if (pdfWrapper) pdfWrapper.style.display = "none";
      if (window.VectorSheetRenderer && state.hanonData) {
        window.VectorSheetRenderer.render(state.hanonData, vectorWrapper);
        if (state.activeTarget) {
          window.VectorSheetRenderer.setTarget(state.activeTarget.measure, state.activeTarget.note_index, state.currentHand);
          window.VectorSheetRenderer.scrollToMeasure(state.activeTarget.measure);
        }
      }
    });

    btnPdf.addEventListener("click", () => {
      btnPdf.classList.add("active");
      btnVector.classList.remove("active");
      if (vectorWrapper) vectorWrapper.style.display = "none";
      if (pdfWrapper) pdfWrapper.style.display = "block";
      if (state.activeTarget) {
        highlightSheetPosition(state.activeTarget);
      }
    });
  }

  // Modals
  document.getElementById("modal-btn-retry").addEventListener("click", () => {
    closeModal("score-modal");
    resetSession();
    startLesson();
  });
  
  document.getElementById("modal-btn-next").addEventListener("click", () => {
    closeModal("score-modal");
    advanceToNextLesson();
  });
  
  document.getElementById("modal-btn-close").addEventListener("click", () => closeModal("score-modal"));
  document.getElementById("history-btn-close").addEventListener("click", () => closeModal("history-modal"));
  
  const insClose = document.getElementById("insights-btn-close");
  if (insClose) {
    insClose.addEventListener("click", () => closeModal("insights-modal"));
  }
}

// ==========================================================================
// Theme Management (Light / Dark / Auto)
// ==========================================================================
function setupTheme() {
  const savedTheme = localStorage.getItem("hanon_piano_theme") || "dark";
  applyTheme(savedTheme);

  const themeBtns = document.querySelectorAll("#theme-picker-group .theme-btn");
  themeBtns.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.theme === savedTheme);
    btn.addEventListener("click", () => {
      themeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const chosenTheme = btn.dataset.theme;
      applyTheme(chosenTheme);
      localStorage.setItem("hanon_piano_theme", chosenTheme);
    });
  });
}

function applyTheme(theme) {
  let effectiveTheme = theme;
  if (theme === "auto") {
    effectiveTheme = (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) ? "light" : "dark";
  }
  document.documentElement.setAttribute("data-theme", effectiveTheme);
}

// ==========================================================================
// Settings Drawer & Hamburger Menu
// ==========================================================================
function setupSettingsDrawer() {
  const btnHamburger = document.getElementById("btn-hamburger");
  const btnClose = document.getElementById("btn-close-settings");
  const overlay = document.getElementById("settings-overlay");
  const drawer = document.getElementById("settings-drawer");

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    if (overlay) overlay.style.display = "block";
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    if (overlay) overlay.style.display = "none";
  }

  if (btnHamburger) btnHamburger.addEventListener("click", openDrawer);
  if (btnClose) btnClose.addEventListener("click", closeDrawer);
  if (overlay) overlay.addEventListener("click", closeDrawer);

  // Language buttons
  const langBtns = document.querySelectorAll("#lang-picker-group .lang-btn");
  const currentL = (window.I18N && window.I18N.currentLang) || "nl";
  langBtns.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === currentL);
    btn.addEventListener("click", () => {
      langBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      if (window.I18N) {
        window.I18N.setLang(btn.dataset.lang);
      }
    });
  });

  // Drawer Keyboard Hand Mode buttons (Handen op Klavier vs Blokken Eronder)
  const drawerBtnHands = document.getElementById("drawer-btn-mode-hands");
  if (drawerBtnHands) {
    drawerBtnHands.addEventListener("click", () => setKeyboardHandMode("hands", true));
  }
  const drawerBtnBlocks = document.getElementById("drawer-btn-mode-blocks");
  if (drawerBtnBlocks) {
    drawerBtnBlocks.addEventListener("click", () => setKeyboardHandMode("blocks", true));
  }

  // Individual toggle switches
  const toggleHands = document.getElementById("toggle-opt-hands");
  if (toggleHands) {
    toggleHands.checked = state.showHandsOnKeyboard;
    toggleHands.addEventListener("change", (e) => {
      state.showHandsOnKeyboard = e.target.checked;
      state.handDisplayMode = state.showHandsOnKeyboard ? "hands" : "blocks";
      applyKeyboardLayoutVisibility(false);
    });
  }

  const toggleBlocks = document.getElementById("toggle-opt-blocks");
  if (toggleBlocks) {
    toggleBlocks.checked = state.showBlocksUnder;
    toggleBlocks.addEventListener("change", (e) => {
      state.showBlocksUnder = e.target.checked;
      state.handDisplayMode = state.showBlocksUnder ? "blocks" : "hands";
      applyKeyboardLayoutVisibility(false);
    });
  }

  // Keyboard display toggles
  const toggleBrackets = document.getElementById("toggle-opt-brackets");
  if (toggleBrackets) {
    toggleBrackets.checked = localStorage.getItem("hanon_show_brackets") !== "false";
    toggleBrackets.addEventListener("change", (e) => {
      localStorage.setItem("hanon_show_brackets", e.target.checked);
      highlightPianoTarget();
    });
  }

  const toggleBadges = document.getElementById("toggle-opt-badges");
  if (toggleBadges) {
    toggleBadges.checked = localStorage.getItem("hanon_show_badges") !== "false";
    toggleBadges.addEventListener("change", (e) => {
      localStorage.setItem("hanon_show_badges", e.target.checked);
      highlightPianoTarget();
    });
  }

  const toggleLabels = document.getElementById("toggle-opt-labels");
  if (toggleLabels) {
    toggleLabels.checked = localStorage.getItem("hanon_show_labels") !== "false";
    toggleLabels.addEventListener("change", (e) => {
      localStorage.setItem("hanon_show_labels", e.target.checked);
      document.querySelectorAll(".white-key .key-label").forEach(l => {
        l.style.display = e.target.checked ? "block" : "none";
      });
    });
  }

  // Synced Sensitivity Slider in drawer
  const drawerSens = document.getElementById("drawer-sens-slider");
  const drawerSensVal = document.getElementById("drawer-sens-val");
  const mainSens = document.getElementById("mic-sensitivity");
  if (drawerSens && drawerSensVal) {
    drawerSens.value = state.sensitivity;
    drawerSensVal.textContent = state.sensitivity;
    drawerSens.addEventListener("input", (e) => {
      const val = parseInt(e.target.value);
      state.sensitivity = val;
      drawerSensVal.textContent = val;
      if (mainSens) mainSens.value = val;
    });
    if (mainSens) {
      mainSens.addEventListener("input", (e) => {
        drawerSens.value = e.target.value;
        drawerSensVal.textContent = e.target.value;
      });
    }
  }

  // Metronome sound toggle
  const toggleMetroSound = document.getElementById("toggle-opt-metro-sound");
  if (toggleMetroSound) {
    toggleMetroSound.checked = state.metronomeOn;
    toggleMetroSound.addEventListener("change", (e) => {
      state.metronomeOn = e.target.checked;
      const metroBtn = document.getElementById("btn-metronome");
      if (metroBtn) {
        metroBtn.style.color = state.metronomeOn ? "var(--accent-gold)" : "var(--text-muted)";
      }
    });
  }

  // Laptop on Piano Mode toggle (in drawer & tutor header)
  const toggleLaptopPiano = document.getElementById("toggle-opt-laptop-piano");
  const btnToggleLaptopPiano = document.getElementById("btn-toggle-laptop-piano");

  if (toggleLaptopPiano) {
    toggleLaptopPiano.checked = state.laptopOnPianoMode;
    toggleLaptopPiano.addEventListener("change", (e) => {
      setLaptopPianoMode(e.target.checked, true);
    });
  }

  if (btnToggleLaptopPiano) {
    btnToggleLaptopPiano.classList.toggle("active", state.laptopOnPianoMode);
    btnToggleLaptopPiano.addEventListener("click", () => {
      setLaptopPianoMode(!state.laptopOnPianoMode, true);
    });
  }

  // Data management
  const btnExport = document.getElementById("btn-export-progress");
  if (btnExport) btnExport.addEventListener("click", exportProgressBackup);

  const btnImportTrigger = document.getElementById("btn-import-trigger");
  const importInput = document.getElementById("import-file-input");
  if (btnImportTrigger && importInput) {
    btnImportTrigger.addEventListener("click", () => importInput.click());
    importInput.addEventListener("change", importProgressBackup);
  }

  const btnResetAll = document.getElementById("btn-reset-all-progress");
  if (btnResetAll) btnResetAll.addEventListener("click", resetAllProgressData);
}

// Data Export / Import / Reset
function exportProgressBackup() {
  const data = {
    version: 2,
    timestamp: new Date().toISOString(),
    lessonProgress: JSON.parse(localStorage.getItem("hanon_piano_lesson_progress") || "{}"),
    sessions: JSON.parse(localStorage.getItem("hanon_piano_sessions") || "[]"),
    theme: localStorage.getItem("hanon_piano_theme") || "dark",
    lang: localStorage.getItem("hanon_i18n_lang") || "nl"
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hanon_ai_voortgang_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast((window.I18N && window.I18N.t("export_done")) || "Voortgang geëxporteerd!");
}

function importProgressBackup(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (parsed && (parsed.lessonProgress || parsed.sessions)) {
        if (parsed.lessonProgress) {
          localStorage.setItem("hanon_piano_lesson_progress", JSON.stringify(parsed.lessonProgress));
        }
        if (parsed.sessions) {
          localStorage.setItem("hanon_piano_sessions", JSON.stringify(parsed.sessions));
        }
        if (parsed.lang && window.I18N) {
          window.I18N.setLang(parsed.lang);
        }
        if (parsed.theme) {
          applyTheme(parsed.theme);
        }
        renderMainMenu();
        showToast((window.I18N && window.I18N.t("import_done")) || "Voortgang succesvol geïmporteerd!");
      } else {
        alert((window.I18N && window.I18N.t("import_invalid")) || "Ongeldig bestand.");
      }
    } catch (err) {
      alert((window.I18N && window.I18N.t("import_invalid")) || "Fout bij inlezen JSON.");
    }
  };
  reader.readAsText(file);
}

function resetAllProgressData() {
  const msg = (window.I18N && window.I18N.t("reset_confirm")) || "Weet je zeker dat je alle voortgang wilt wissen?";
  if (confirm(msg)) {
    localStorage.removeItem("hanon_piano_lesson_progress");
    localStorage.removeItem("hanon_piano_sessions");
    renderMainMenu();
    showToast((window.I18N && window.I18N.t("reset_done")) || "Alle voortgang gereset.");
  }
}

// Toast notification helper
function showToast(msg) {
  const container = document.getElementById("app-toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "app-toast";
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}

// Hook for language changed
window.onLanguageChanged = function(lang) {
  renderBooksHub();
  renderMainMenu();
  populateExerciseSelect();
  populateLessonSelect();
  updateAudioSourceSelectLabels();
  renderMainMenu();
  updateTargetDisplay();
  const c4Label = document.querySelector(".white-key.middle-c .key-label");
  if (c4Label) {
    c4Label.textContent = (window.I18N && window.I18N.t("middle_c_key")) || "C4 (Midden)";
  }
  const currentEx = state.exercises ? state.exercises.find(e => e.id === state.currentExerciseId) : null;
  const sheetTitle = document.getElementById("sheet-title");
  if (sheetTitle && currentEx) {
    const exName = (window.I18N && window.I18N.t("exercise_name_fmt", { num: currentEx.number })) || currentEx.name;
    sheetTitle.textContent = `🎼 C. L. Hanon - The Virtuoso Pianist • ${exName}`;
  }
};

function updateAudioSourceSelectLabels() {
  const sel = document.getElementById("audio-source-select");
  if (!sel) return;
  const options = sel.querySelectorAll("option");
  options.forEach(opt => {
    if (opt.value === "browser-mic") {
      opt.textContent = (window.I18N && window.I18N.t("audio_src_mic")) || "🎙️ Mic";
    } else if (opt.value === "python-mic") {
      opt.textContent = (window.I18N && window.I18N.t("audio_src_system")) || "🐍 Systeem";
    } else if (opt.value === "web-midi") {
      opt.textContent = (window.I18N && window.I18N.t("audio_src_midi")) || "🎹 MIDI";
    } else if (opt.value === "virtual") {
      opt.textContent = (window.I18N && window.I18N.t("audio_src_virtual")) || "💻 Scherm";
    }
  });
}

// Global hook for vector notes click
window.jumpToMeasureAndNote = function(measureNumber, noteIdx) {
  const queue = state.activeNotesQueue || [];
  const targetIdx = queue.findIndex(n => n.measure === measureNumber && n.note_index === noteIdx);
  if (targetIdx !== -1) {
    state.currentNoteIndex = targetIdx;
    updateTargetDisplay();
  }
};

// Resilient JSON fetcher with static file fallback for GitHub Pages
async function safeFetchJson(apiUrl, staticFallbackUrl) {
  try {
    const res = await fetch(apiUrl);
    if (res.ok) return await res.json();
  } catch (err) {
    // API not reachable on static host
  }
  if (staticFallbackUrl) {
    try {
      const fallbackRes = await fetch(staticFallbackUrl);
      if (fallbackRes.ok) return await fallbackRes.json();
    } catch (fallbackErr) {
      console.warn(`Fallback fetch error for ${staticFallbackUrl}:`, fallbackErr);
    }
  }
  return null;
}

// Load exercises & initial Hanon data
async function loadData() {
  try {
    let exercises = await safeFetchJson("/api/exercises?all=true", "./data/exercises.json");
    if (!exercises || exercises.length === 0) {
      exercises = await safeFetchJson("./data/exercises.json");
    }
    state.exercises = exercises || [];

    // Preload all lessons for Main Menu Dashboard
    const allLessons = await safeFetchJson("/api/lessons/all", "./data/all_lessons.json");
    state.allLessonsMap = allLessons || {};

    // Validate current book and select an initial exercise within it
    const curBook = BOOKS_CATALOG.find(b => b.id === state.currentBookId) || BOOKS_CATALOG[0];
    state.currentBookId = curBook.id;
    const bookExs = getBookExercises(curBook);
    if (bookExs.length > 0) {
      const curInBook = bookExs.find(e => e.id === state.currentExerciseId);
      if (!curInBook) {
        state.currentExerciseId = curBook.startExId || bookExs[0].id;
        const bLessons = (state.allLessonsMap && state.allLessonsMap[state.currentExerciseId]) || [];
        state.currentLessonId = (bLessons.length > 0) ? bLessons[0].id : (state.currentExerciseId === "ex1" ? "les-1" : `les-${state.currentExerciseId}-1`);
      }
    }

    populateExerciseSelect();
    await loadExerciseData(state.currentExerciseId);
    initMainMenu();

    if (window.location.hash === "#tutor") {
      toggleView("tutor");
    } else if (window.location.hash === "#menu" || window.location.hash === "#progress") {
      toggleView("menu");
    } else {
      toggleView("hub");
    }
  } catch (err) {
    console.error("Fout bij inladen data:", err);
  }
}

function populateExerciseSelect() {
  const sel = document.getElementById("exercise-select");
  if (!sel || !state.exercises.length) return;
  const currentVal = state.currentExerciseId;
  sel.innerHTML = "";

  const curBook = BOOKS_CATALOG.find(b => b.id === state.currentBookId) || BOOKS_CATALOG[0];
  const curBookExs = getBookExercises(curBook);

  // Group for the current active book
  const activeGroup = document.createElement("optgroup");
  let labelPrefix = "🎹 ";
  if (curBook.id === "czerny-599") labelPrefix = "📖 Carl Czerny Op. 599 ";
  else if (curBook.id === "bach-first") labelPrefix = "🎻 J.S. Bach First Lessons ";
  else labelPrefix = `🎹 ${curBook.shortTitle} `;
  activeGroup.label = `${labelPrefix}(${curBookExs.length} lessen)`;

  curBookExs.forEach(ex => {
    const opt = document.createElement("option");
    opt.value = ex.id;
    let focus = "";
    if (ex.subtitle && ex.subtitle.includes("(")) {
      focus = ` (${ex.subtitle.split("(")[1].replace(")", "")})`;
    } else if (ex.title) {
      const parts = ex.title.split(":");
      focus = parts.length > 1 ? ` (${parts[1].trim()})` : "";
    }
    opt.textContent = `${ex.name}${focus}`;
    if (ex.id === currentVal) opt.selected = true;
    activeGroup.appendChild(opt);
  });
  sel.appendChild(activeGroup);

  // Other books for quick navigation
  BOOKS_CATALOG.forEach(b => {
    if (b.id === curBook.id) return;
    const bExs = getBookExercises(b);
    if (!bExs.length) return;
    const otherGroup = document.createElement("optgroup");
    otherGroup.label = `📚 ${b.shortTitle} (${bExs.length} ${b.id.startsWith("cz") ? "etudes" : (b.id.startsWith("bach") ? "stukken" : "oefeningen")})`;
    bExs.forEach(ex => {
      const opt = document.createElement("option");
      opt.value = ex.id;
      opt.textContent = `${ex.name}`;
      if (ex.id === currentVal) opt.selected = true;
      otherGroup.appendChild(opt);
    });
    sel.appendChild(otherGroup);
  });

  if (currentVal) sel.value = currentVal;
}

async function switchExercise(exerciseId) {
  state.currentExerciseId = exerciseId;
  const currentEx = state.exercises.find(e => e.id === exerciseId);
  if (currentEx) {
    if (currentEx.book) {
      state.currentBookId = currentEx.book;
    } else if (currentEx.id.startsWith("cz")) {
      state.currentBookId = "czerny-599";
    } else if (currentEx.id.startsWith("bach")) {
      state.currentBookId = "bach-first";
    } else if (currentEx.number <= 20) {
      state.currentBookId = "hanon-part1";
    } else if (currentEx.number <= 43) {
      state.currentBookId = "hanon-part2";
    } else {
      state.currentBookId = "hanon-part3";
    }
    localStorage.setItem("hanon_current_book", state.currentBookId);
  }
  if (typeof gtag === "function") {
    gtag("event", "select_exercise", { exercise_id: exerciseId });
  }
  await loadExerciseData(exerciseId);
}

async function loadExerciseData(exerciseId) {
  try {
    stopDemo();
    pauseLesson();
    
    let hanonData = await safeFetchJson(`/api/hanon?exercise=${exerciseId}`, `./data/hanon_${exerciseId}.json`);
    if (!hanonData) {
      if (exerciseId.startsWith("cz")) {
        hanonData = await safeFetchJson(`./data/czerny_${exerciseId}.json`);
      } else if (exerciseId.startsWith("bach")) {
        hanonData = await safeFetchJson(`./data/bach_${exerciseId}.json`);
      }
    }
    state.hanonData = hanonData;
    
    let lessons = await safeFetchJson(`/api/lessons?exercise=${exerciseId}`);
    if (!lessons) {
      const allLessons = await safeFetchJson("./data/all_lessons.json");
      lessons = (allLessons && allLessons[exerciseId]) ? allLessons[exerciseId] : [];
    }
    state.lessons = lessons || [];
    
    const currentEx = state.exercises.find(e => e.id === exerciseId);
    
    // Update sheet image (relative paths for GitHub Pages)
    const sheetImg = document.getElementById("sheet-image");
    if (sheetImg) {
      const imgPath = currentEx && currentEx.sheet_image ? currentEx.sheet_image : `/static/sheet_${exerciseId}.png`;
      sheetImg.src = imgPath.startsWith("/") ? `.${imgPath}` : imgPath;
    }
    
    // Update sheet title according to composer & book
    const sheetTitle = document.getElementById("sheet-title");
    if (sheetTitle && currentEx) {
      if (currentEx.book === "czerny-599" || currentEx.id.startsWith("cz")) {
        sheetTitle.textContent = `🎼 Carl Czerny - Op. 599: Practical Method • ${currentEx.name}`;
      } else if (currentEx.book === "bach-first" || currentEx.id.startsWith("bach")) {
        sheetTitle.textContent = `🎼 J.S. Bach - First Lessons (Walter Carroll) • ${currentEx.name}`;
      } else {
        const exName = (window.I18N && window.I18N.t("exercise_name_fmt", { num: currentEx.number })) || currentEx.name;
        sheetTitle.textContent = `🎼 C. L. Hanon - The Virtuoso Pianist • ${exName}`;
      }
    }
    
    // Update PDF link
    const pdfLink = document.getElementById("sheet-pdf-link");
    if (pdfLink && currentEx) {
      let pdf = currentEx.pdf_file;
      if (!pdf) {
        if (currentEx.book === "czerny-599" || currentEx.id.startsWith("cz")) pdf = "Czerny-599.pdf";
        else if (currentEx.book === "bach-first" || currentEx.id.startsWith("bach")) pdf = "IMSLP302296-PMLP489228-BACH-Carroll_First_Lessons_in_Bach_PF.pdf";
        else pdf = "IMSLP91547-PMLP03129-Hanon_Final.pdf";
      }
      pdfLink.href = `./${encodeURIComponent(pdf)}`;
    }

    // Render Dynamic Vector Sheet Music (SVG)
    const vectorWrapper = document.getElementById("sheet-vector-wrapper");
    if (vectorWrapper && window.VectorSheetRenderer && state.hanonData) {
      window.VectorSheetRenderer.render(state.hanonData, vectorWrapper);
    }
    
    // Populate lesson selector
    populateLessonSelect();
    populateExerciseSelect();
    
    // Build scrolling hand placement guide cards
    buildHandPlacementGuide();
    
    // Select first lesson by default
    state.currentLessonId = state.lessons.length > 0 ? state.lessons[0].id : "custom";
    const lSelect = document.getElementById("lesson-select");
    if (lSelect) lSelect.value = state.currentLessonId;
    
    loadLesson(state.currentLessonId);
  } catch (err) {
    console.error("Fout bij laden van oefening data:", err);
  }
}

function populateLessonSelect() {
  const sel = document.getElementById("lesson-select");
  if (!sel) return;
  const currentVal = sel.value;
  sel.innerHTML = "";
  state.lessons.forEach((l, idx) => {
    const opt = document.createElement("option");
    opt.value = l.id;
    const title = getLessonDisplayTitle(l, idx);
    const range = (window.I18N && l.start_measure && l.end_measure)
      ? window.I18N.t("measures_range_fmt", { start: l.start_measure, end: l.end_measure })
      : l.subtitle;
    opt.textContent = `${title} (${range})`;
    if (l.id === (currentVal || state.currentLessonId) || idx === 0) opt.selected = true;
    sel.appendChild(opt);
  });
  // Add custom option
  const customOpt = document.createElement("option");
  customOpt.value = "custom";
  customOpt.textContent = (window.I18N && window.I18N.t("custom_range_select")) || "⚙️ Vrije Selectie (Kies maten)";
  sel.appendChild(customOpt);
  if (currentVal) sel.value = currentVal;
}

// Load a specific lesson
function loadLesson(lessonId) {
  if (!state.hanonData) return;
  
  const maxMeasures = state.hanonData.total_measures || 30;
  let startMeasure = 1;
  let endMeasure = maxMeasures;
  
  if (lessonId === "custom") {
    const s = prompt(`Startmaat (1 - ${maxMeasures}):`, "1");
    const e = prompt(`Eindmaat (1 - ${maxMeasures}):`, "4");
    startMeasure = Math.max(1, Math.min(maxMeasures, parseInt(s) || 1));
    endMeasure = Math.max(startMeasure, Math.min(maxMeasures, parseInt(e) || 4));
  } else {
    const lesson = state.lessons.find(l => l.id === lessonId);
    if (lesson) {
      startMeasure = lesson.start_measure;
      endMeasure = Math.min(lesson.end_measure, maxMeasures);
      state.bpm = lesson.recommended_bpm;
      document.getElementById("bpm-input").value = state.bpm;
      
      // Update coach banner tip
      if (lesson.tips && lesson.tips.length > 0) {
        document.getElementById("coach-message").innerHTML = 
          `<strong>${getLessonDisplayTitle(lesson)}:</strong> ${lesson.tips[0]}`;
      }
    }
  }
  
  // Flatten notes for this lesson
  state.activeNotesQueue = [];
  state.hanonData.measures.forEach(m => {
    if (m.measure >= startMeasure && m.measure <= endMeasure) {
      m.notes.forEach(n => {
        state.activeNotesQueue.push(n);
      });
    }
  });

  // Update vector sheet lesson boundaries & auto-scroll
  if (window.VectorSheetRenderer) {
    window.VectorSheetRenderer.setLessonRange(startMeasure, endMeasure);
    window.VectorSheetRenderer.scrollToMeasure(startMeasure);
  }
  
  resetSession();
}

// Reset lesson state
function resetSession() {
  stopDemo();
  stopTempoMode();
  state.isPlaying = false;
  state.currentNoteIndex = 0;
  state.correctCount = 0;
  state.wrongCount = 0;
  state.streak = 0;
  state.mistakes = [];
  state.startTime = null;
  if (state.telemetryQueue && state.telemetryQueue.length > 0) {
    flushTelemetry();
  }
  state.telemetryQueue = [];
  
  updateScoreUI();
  updateTargetDisplay();
  
  document.getElementById("start-btn-icon").textContent = "▶️";
  document.getElementById("start-btn-text").textContent = "Start";
  document.getElementById("coach-state").textContent = "GEREED";
  document.getElementById("coach-state").style.color = "var(--accent-cyan)";
}

// Toggle Play / Pause
async function togglePlay() {
  if (state.isPlaying) {
    pauseLesson();
  } else {
    await startLesson();
  }
}

// Start Lesson
async function startLesson() {
  // Ensure AudioContext is started
  if (!state.audioCtx) {
    state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (state.audioCtx.state === "suspended") {
    await state.audioCtx.resume();
  }
  
  // Start selected audio input if not already running
  if (state.audioSource === "browser-mic" && !state.micStream) {
    await initBrowserMic();
  } else if (state.audioSource === "python-mic" && !state.pythonWs) {
    initPythonWs();
  } else if (state.audioSource === "web-midi" && !state.midiAccess) {
    initWebMidi();
  }
  
  state.isPlaying = true;
  state.startTime = Date.now();
  document.getElementById("start-btn-icon").textContent = "⏸️";
  document.getElementById("start-btn-text").textContent = (window.I18N && window.I18N.t("btn_pause")) || "Pauze";
  document.getElementById("coach-state").textContent = (window.I18N && window.I18N.t("state_playing")) || "AAN HET SPELEN";
  document.getElementById("coach-state").style.color = "var(--accent-green)";
  
  updateTargetDisplay();
  
  if (state.currentMode === "tempo") {
    startTempoMode();
  }

  if (typeof gtag === "function") {
    gtag("event", "start_lesson", {
      exercise_id: state.currentExerciseId,
      lesson_id: state.currentLessonId,
      hand: state.currentHand,
      mode: state.currentMode
    });
  }
}

function pauseLesson() {
  state.isPlaying = false;
  stopTempoMode();
  document.getElementById("start-btn-icon").textContent = "▶️";
  document.getElementById("start-btn-text").textContent = (window.I18N && window.I18N.t("btn_resume")) || "Hervat";
  document.getElementById("coach-state").textContent = (window.I18N && window.I18N.t("state_paused")) || "GEPAUZEERD";
  document.getElementById("coach-state").style.color = "var(--accent-gold)";
}

// Update Target Display (HUD, Sheet highlighter, Piano key, Hand placement guide)
function updateTargetDisplay() {
  if (!state.activeNotesQueue || state.activeNotesQueue.length === 0) return;
  
  if (state.currentNoteIndex >= state.activeNotesQueue.length) {
    finishLesson();
    return;
  }
  
  const currentItem = state.activeNotesQueue[state.currentNoteIndex];
  state.activeTarget = currentItem;
  state.lastNotePromptTime = performance.now();
  
  let targetNote = currentItem.rh.note;
  let targetMidi = currentItem.rh.midi;
  let targetFinger = currentItem.rh.finger;
  let handIcon = "🤚";
  let handName = (window.I18N && window.I18N.t("hand_rh_full")) || "Rechterhand";
  const measureWord = (window.I18N && window.I18N.t("measure_word")) || "Maat";
  const noteWord = (window.I18N && window.I18N.t("note_word")) || "Noot";
  const fingerWord = (window.I18N && window.I18N.t("finger_word")) || "Vinger";
  
  if (state.currentHand === "lh") {
    targetNote = currentItem.lh.note;
    targetMidi = currentItem.lh.midi;
    targetFinger = currentItem.lh.finger;
    handIcon = "✋";
    handName = (window.I18N && window.I18N.t("hand_lh_full")) || "Linkerhand";
  } else if (state.currentHand === "both") {
    targetNote = `${currentItem.lh.note} (LH) + ${currentItem.rh.note} (RH)`;
    targetMidi = currentItem.rh.midi; // primary check
    targetFinger = `LH: ${fingerWord} ${currentItem.lh.finger} • RH: ${fingerWord} ${currentItem.rh.finger}`;
    handIcon = "🤝";
    handName = (window.I18N && window.I18N.t("hand_both_full")) || "Beide Handen";
  }
  
  // Update HUD
  document.getElementById("target-note-name").textContent = targetNote;
  document.getElementById("target-hand-icon").textContent = handIcon;
  document.getElementById("target-finger-desc").textContent = 
    (state.currentHand === "both")
      ? `${targetFinger} • ${measureWord} ${currentItem.measure} (${noteWord} ${currentItem.note_index + 1}/8)`
      : `${fingerWord} ${getFingerName(targetFinger)} • ${measureWord} ${currentItem.measure} (${noteWord} ${currentItem.note_index + 1}/8)`;
  
  const maxMeasures = state.hanonData ? state.hanonData.total_measures : 30;
  document.getElementById("sheet-measure-indicator").textContent = 
    (window.I18N && window.I18N.t("measure_fmt", { cur: currentItem.measure, total: maxMeasures }))
    || `${measureWord} ${currentItem.measure} / ${maxMeasures}`;
  
  // Update sheet highlighter
  highlightSheetPosition(currentItem);
  
  // Update piano keys
  highlightPianoTarget();
  
  // Update scrolling hand placement guide
  updateHandPlacementGuide(currentItem);
  
  // Progress bar
  updateScoreUI();
}

// Highlight Sheet Position
function highlightSheetPosition(noteItem) {
  const sheetImg = document.getElementById("sheet-image");
  const measureHighlight = document.getElementById("measure-highlight");
  const noteCursor = document.getElementById("note-cursor");
  const scrollArea = document.getElementById("sheet-scroll-area");
  
  if (!sheetImg.complete || sheetImg.naturalWidth === 0) return;
  
  // Calculate scaling factor between natural image and rendered width
  const scaleX = sheetImg.clientWidth / sheetImg.naturalWidth;
  const scaleY = sheetImg.clientHeight / sheetImg.naturalHeight;
  
  const box = noteItem.box;
  
  // Look up full measure box so measureHighlight frames the measure
  const currentMeasure = state.hanonData && state.hanonData.measures 
    ? state.hanonData.measures.find(m => m.measure === noteItem.measure) 
    : null;
  const mBox = currentMeasure ? currentMeasure.box : box;
  
  // Position measure box (framing the full measure)
  measureHighlight.style.display = "block";
  measureHighlight.style.left = `${(mBox.x1 - 4) * scaleX}px`;
  measureHighlight.style.top = `${(mBox.y1 - 4) * scaleY}px`;
  measureHighlight.style.width = `${((mBox.x2 - mBox.x1) + 8) * scaleX}px`;
  measureHighlight.style.height = `${((mBox.y2 - mBox.y1) + 8) * scaleY}px`;
  
  // Position note cursor (indicating active note within measure)
  noteCursor.style.display = "block";
  noteCursor.style.left = `${((box.x1 + box.x2) / 2) * scaleX}px`;
  
  // Adaptive clef cursor: Ex 2 (box height > 210) vs Ex 1 (height ~180)
  const boxH = box.y2 - box.y1;
  let clefY;
  if (state.currentHand === "lh") {
    clefY = box.y1 + (boxH > 210 ? 175 : 120);
  } else if (state.currentHand === "rh") {
    clefY = box.y1 + (boxH > 210 ? 105 : 45);
  } else {
    // 'both': center between treble and bass staff
    clefY = box.y1 + (boxH > 210 ? 140 : 82);
  }
  noteCursor.style.top = `${clefY * scaleY}px`;
  
  // Auto-scroll sheet so active system is visible
  const targetScrollTop = (mBox.y1 * scaleY) - (scrollArea.clientHeight / 2) + 50;
  scrollArea.scrollTo({
    top: Math.max(0, targetScrollTop),
    behavior: "smooth"
  });

  // Also update Vector Sheet Music renderer
  if (window.VectorSheetRenderer) {
    window.VectorSheetRenderer.setTarget(noteItem.measure, noteItem.note_index, state.currentHand);
    window.VectorSheetRenderer.scrollToMeasure(noteItem.measure);
  }
}

// Center key smoothly in piano scroll container without jerking page vertically
function centerKeyInPianoView(keyEl) {
  const container = document.getElementById("piano-container");
  if (!container || !keyEl) return;
  const targetLeft = keyEl.offsetLeft - (container.clientWidth / 2) + (keyEl.offsetWidth / 2);
  container.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
}

// Center piano view so BOTH hand zones (LH and RH) are centered on screen
function centerHandPositionInPianoView(currentItem) {
  if (!currentItem) return;
  const container = document.getElementById("piano-container");
  if (!container) return;

  let centerMidi;
  if (state.currentHand === "lh") {
    centerMidi = currentItem.lh ? currentItem.lh.midi : 36;
  } else if (state.currentHand === "rh") {
    centerMidi = currentItem.rh ? currentItem.rh.midi : 48;
  } else {
    // Both hands: exact midpoint between Left Hand and Right Hand
    const lhM = currentItem.lh ? currentItem.lh.midi : 36;
    const rhM = currentItem.rh ? currentItem.rh.midi : 48;
    centerMidi = Math.round((lhM + rhM) / 2);
  }

  const allKeys = Array.from(document.querySelectorAll(".white-key"));
  if (!allKeys.length) return;

  let closestKey = null;
  let minDiff = 999;
  allKeys.forEach(k => {
    const m = parseInt(k.dataset.midi, 10);
    const diff = Math.abs(m - centerMidi);
    if (diff < minDiff) {
      minDiff = diff;
      closestKey = k;
    }
  });

  if (closestKey) {
    centerKeyInPianoView(closestKey);
  }
}

// Update the real-time hand positioning cockpit bar above the piano
function updatePianoHandGuideBar(currentItem, lhSpanNotes, rhSpanNotes) {
  const lhContainer = document.getElementById("lh-fingers-container");
  const rhContainer = document.getElementById("rh-fingers-container");
  const lhPosText = document.getElementById("lh-position-text");
  const rhPosText = document.getElementById("rh-position-text");
  const postureHint = document.getElementById("hand-posture-hint");
  
  if (!lhContainer || !rhContainer || !currentItem) return;

  // LH fingers: 5, 4, 3, 2, 1
  const lhFingerMap = { 5: "-", 4: "-", 3: "-", 2: "-", 1: "-" };
  Object.entries(lhSpanNotes).forEach(([note, finger]) => {
    if (lhFingerMap[finger] !== undefined) lhFingerMap[finger] = note;
  });
  
  lhContainer.innerHTML = [5, 4, 3, 2, 1].map(f => {
    const isActive = (state.currentHand === "lh" || state.currentHand === "both") && (currentItem.lh && currentItem.lh.finger === f);
    return `
      <div class="hfinger-pill ${isActive ? 'hfinger-active hfinger-lh-active' : ''}" title="Vinger ${f} Linkerhand (${lhFingerMap[f]})">
        <span class="hfinger-f">V${f}</span>
        <span class="hfinger-note">${lhFingerMap[f]}</span>
      </div>
    `;
  }).join('');

  // RH fingers: 1, 2, 3, 4, 5
  const rhFingerMap = { 1: "-", 2: "-", 3: "-", 4: "-", 5: "-" };
  Object.entries(rhSpanNotes).forEach(([note, finger]) => {
    if (rhFingerMap[finger] !== undefined) rhFingerMap[finger] = note;
  });

  rhContainer.innerHTML = [1, 2, 3, 4, 5].map(f => {
    const isActive = (state.currentHand === "rh" || state.currentHand === "both") && (currentItem.rh && currentItem.rh.finger === f);
    return `
      <div class="hfinger-pill ${isActive ? 'hfinger-active hfinger-rh-active' : ''}" title="Vinger ${f} Rechterhand (${rhFingerMap[f]})">
        <span class="hfinger-f">V${f}</span>
        <span class="hfinger-note">${rhFingerMap[f]}</span>
      </div>
    `;
  }).join('');

  const toWord = (window.I18N && window.I18N.t("word_to")) || "t/m";
  const posFmt = (window.I18N && window.I18N.t("guide_pos_fmt")) || "Positie: {span}";

  if (lhPosText) {
    const keys = Object.keys(lhSpanNotes);
    const lhMin = keys[0] || (currentItem.lh ? currentItem.lh.note : "C2");
    const lhMax = keys[keys.length - 1] || (currentItem.lh ? currentItem.lh.note : "A2");
    lhPosText.textContent = posFmt.replace("{span}", `${lhMin} ${toWord} ${lhMax}`);
  }
  if (rhPosText) {
    const keys = Object.keys(rhSpanNotes);
    const rhMin = keys[0] || (currentItem.rh ? currentItem.rh.note : "C3");
    const rhMax = keys[keys.length - 1] || (currentItem.rh ? currentItem.rh.note : "A3");
    rhPosText.textContent = posFmt.replace("{span}", `${rhMin} ${toWord} ${rhMax}`);
  }

  if (postureHint) {
    if (currentItem.measure === 1) {
      postureHint.textContent = (window.I18N && window.I18N.t("posture_bass")) || "Beide handen in basbalk • 1 octaaf parallel • Vlakke polsen";
    } else if (currentItem.measure === 6) {
      postureHint.textContent = (window.I18N && window.I18N.t("posture_cross")) || "Rechterhand kruist naar vioolsleutel! Linkerhand blijft in bas";
    } else if (currentItem.measure === 15) {
      postureHint.textContent = (window.I18N && window.I18N.t("posture_turn")) || "Keerpunt naar de afdaling! Vinger 5 & 4 sprong omlaag";
    } else {
      postureHint.textContent = (window.I18N && window.I18N.t("posture_relaxed")) || "Ontspannen polsen • Til elke vinger hoog op als een hamertje";
    }
  }
}

// ==========================================================================
// Flowkey Animated Moving Hands & Mode Switcher
// ==========================================================================

function applyKeyboardLayoutVisibility(notify = false, customToast = null) {
  localStorage.setItem("hanon_keyboard_hand_mode", state.handDisplayMode);
  localStorage.setItem("hanon_show_hands", state.showHandsOnKeyboard ? "true" : "false");
  localStorage.setItem("hanon_show_blocks", state.showBlocksUnder ? "true" : "false");

  // Update header buttons
  const btnHands = document.getElementById("btn-view-hands");
  const btnBlocks = document.getElementById("btn-view-blocks");
  if (btnHands && btnBlocks) {
    btnHands.classList.toggle("active", state.handDisplayMode === "hands");
    btnBlocks.classList.toggle("active", state.handDisplayMode === "blocks");
  }

  // Update drawer segmented buttons
  const drawerBtnHands = document.getElementById("drawer-btn-mode-hands");
  const drawerBtnBlocks = document.getElementById("drawer-btn-mode-blocks");
  if (drawerBtnHands && drawerBtnBlocks) {
    drawerBtnHands.classList.toggle("active", state.handDisplayMode === "hands");
    drawerBtnBlocks.classList.toggle("active", state.handDisplayMode === "blocks");
  }

  // Update drawer checkboxes
  const chkHands = document.getElementById("toggle-opt-hands");
  const chkBlocks = document.getElementById("toggle-opt-blocks");
  if (chkHands) chkHands.checked = state.showHandsOnKeyboard;
  if (chkBlocks) chkBlocks.checked = state.showBlocksUnder;

  // Piano container sizing
  const pianoContainer = document.getElementById("piano-container");
  if (pianoContainer) {
    pianoContainer.classList.toggle("hands-mode", state.showHandsOnKeyboard);
  }

  // Show/Hide blocks underneath the keyboard
  const guideBar = document.getElementById("piano-hand-guide-bar");
  if (guideBar) {
    guideBar.style.display = state.showBlocksUnder ? "flex" : "none";
  }

  const placementWrapper = document.getElementById("hand-placement-wrapper");
  if (placementWrapper) {
    placementWrapper.style.display = state.showBlocksUnder ? "flex" : "none";
  }

  // Re-highlight piano target
  highlightPianoTarget();

  if (notify) {
    const msg = customToast || (
      (state.handDisplayMode === "hands")
        ? ((window.I18N && window.I18N.t("toast_mode_hands")) || "Klavierweergave: Handen op Klavier 👐")
        : ((window.I18N && window.I18N.t("toast_mode_blocks")) || "Klavierweergave: Blokken Eronder 📊")
    );
    showToast(msg);
  }
}

function setKeyboardHandMode(mode, notify = false) {
  state.handDisplayMode = (mode === "blocks") ? "blocks" : "hands";
  if (state.handDisplayMode === "hands") {
    state.showHandsOnKeyboard = true;
    state.showBlocksUnder = false;
  } else {
    state.showHandsOnKeyboard = false;
    state.showBlocksUnder = true;
  }
  applyKeyboardLayoutVisibility(notify);
}

function setLaptopPianoMode(enabled, notify = false) {
  state.laptopOnPianoMode = !!enabled;
  localStorage.setItem("hanon_laptop_piano_mode", state.laptopOnPianoMode ? "true" : "false");
  
  const chk = document.getElementById("toggle-opt-laptop-piano");
  if (chk) chk.checked = state.laptopOnPianoMode;
  
  const btn = document.getElementById("btn-toggle-laptop-piano");
  if (btn) btn.classList.toggle("active", state.laptopOnPianoMode);

  // Dynamically update audio filter settings if Web Audio is active
  if (state.audioCtx && state.hpFilter1 && state.hpFilter2) {
    const cutoff = state.laptopOnPianoMode ? 35 : 25;
    state.hpFilter1.frequency.setValueAtTime(cutoff, state.audioCtx.currentTime);
    state.hpFilter2.frequency.setValueAtTime(cutoff, state.audioCtx.currentTime);
  }
  if (state.audioCtx && state.compressor) {
    const threshold = state.laptopOnPianoMode ? -16 : -24;
    const ratio = state.laptopOnPianoMode ? 12 : 4;
    state.compressor.threshold.setValueAtTime(threshold, state.audioCtx.currentTime);
    state.compressor.ratio.setValueAtTime(ratio, state.audioCtx.currentTime);
  }

  if (notify) {
    const msg = state.laptopOnPianoMode
      ? ((window.I18N && window.I18N.t("toast_laptop_piano_on")) || "Laptop op piano modus ingeschakeld (trillingsdemping actief)")
      : ((window.I18N && window.I18N.t("toast_laptop_piano_off")) || "Laptop op piano modus uitgeschakeld");
    showToast(msg);
  }
}

function renderHandSvgMarkup(side, points, wristY, palmY) {
  if (!points || points.length !== 5) return "";
  const isLh = (side === "lh");

  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));
  const cx = (minX + maxX) / 2;

  // Wrist dimensions
  const wristW = 44;
  const wristLeft = cx - (wristW / 2);
  const wristRight = cx + (wristW / 2);
  const wristBaseY = wristY + 12;

  // Calculate knuckles along top palm arch
  const knuckles = points.map((p, idx) => {
    const kx = cx + (p.x - cx) * 0.74;
    const archOffset = (idx === 2) ? 6 : ((idx === 1 || idx === 3) ? 4 : 0);
    const ky = palmY - archOffset;
    return { kx, ky, p };
  });

  // Palm path
  const k0 = knuckles[0];
  const k4 = knuckles[4];
  const palmPathD = `
    M ${wristLeft} ${wristBaseY}
    L ${wristLeft} ${palmY + 8}
    Q ${wristLeft - 4} ${k0.ky + 6} ${k0.kx - 6} ${k0.ky}
    Q ${knuckles[1].kx} ${knuckles[1].ky - 4} ${knuckles[2].kx} ${knuckles[2].ky - 4}
    Q ${knuckles[3].kx} ${knuckles[3].ky - 4} ${k4.kx + 6} ${k4.ky}
    Q ${wristRight + 4} ${k4.ky + 6} ${wristRight} ${palmY + 8}
    L ${wristRight} ${wristBaseY}
    Z
  `;

  // Forearm gradient path
  const forearmPathD = `
    M ${wristLeft - 3} ${wristBaseY + 16}
    L ${wristLeft} ${wristBaseY - 4}
    L ${wristRight} ${wristBaseY - 4}
    L ${wristRight + 3} ${wristBaseY + 16}
    Z
  `;

  // Wrist badge text
  const badgeLabel = isLh ? "✋ LH" : "🤚 RH";
  const badgePill = `
    <g class="hand-wrist-badge-group">
      <rect x="${cx - 19}" y="${wristY - 14}" width="38" height="13" class="hand-wrist-pill" />
      <text x="${cx}" y="${wristY - 4.5}" text-anchor="middle" class="hand-wrist-badge" fill="#ffffff">${badgeLabel}</text>
    </g>
  `;

  // 5 Fingers markup
  let fingersHtml = "";
  knuckles.forEach(({ kx, ky, p }) => {
    const fx = p.x;
    const fy = p.y;
    const isActive = p.isActive;

    const dx = fx - kx;
    const dy = fy - ky;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    const wKnuckle = 6.8;
    const wTip = 5.6;

    const p1x = (kx - nx * wKnuckle).toFixed(1);
    const p1y = (ky - ny * wKnuckle).toFixed(1);
    const p2x = (fx - nx * wTip).toFixed(1);
    const p2y = (fy - ny * wTip).toFixed(1);
    const p3x = (fx + nx * wTip).toFixed(1);
    const p3y = (fy + ny * wTip).toFixed(1);
    const p4x = (kx + nx * wKnuckle).toFixed(1);
    const p4y = (ky + ny * wKnuckle).toFixed(1);

    const fingerPathD = `M ${p1x} ${p1y} L ${p2x} ${p2y} Q ${fx} ${fy - 3} ${p3x} ${p3y} L ${p4x} ${p4y} Z`;
    const mx = (kx + fx) / 2;
    const my = (ky + fy) / 2;
    const creaseD = `M ${(mx - nx * 4.5).toFixed(1)} ${(my - ny * 4.5).toFixed(1)} L ${(mx + nx * 4.5).toFixed(1)} ${(my + ny * 4.5).toFixed(1)}`;

    const rippleHtml = isActive ? `<circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" class="finger-press-ripple ${isLh ? 'ripple-lh' : 'ripple-rh'}" />` : "";

    fingersHtml += `
      <g class="hand-finger-group ${isActive ? 'hand-finger-active' : ''}">
        ${rippleHtml}
        <path d="${fingerPathD}" class="hand-finger-shaft" />
        <path d="${creaseD}" class="hand-finger-knuckle" />
        <circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="7.5" class="hand-fingertip-pad" />
        <text x="${fx.toFixed(1)}" y="${(fy + 3.2).toFixed(1)}" text-anchor="middle" class="hand-finger-num">${p.f}</text>
      </g>
    `;
  });

  return `
    <g id="group-hand-${side}" class="animated-hand-group hand-${side}" filter="url(#hand-depth-shadow)">
      <path d="${forearmPathD}" class="hand-forearm" />
      <path d="${palmPathD}" class="hand-palm-path" />
      ${badgePill}
      ${fingersHtml}
    </g>
  `;
}

function updatePianoAnimatedHands(lhSpanNotes, rhSpanNotes, currentItem) {
  const pianoKeys = document.getElementById("piano-keys");
  const pianoContainer = document.getElementById("piano-container");
  if (!pianoKeys || !pianoContainer) return;

  let handsSvg = document.getElementById("piano-animated-hands-svg");
  if (!handsSvg) {
    handsSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    handsSvg.id = "piano-animated-hands-svg";
    handsSvg.setAttribute("class", "piano-animated-hands-overlay");
    pianoKeys.appendChild(handsSvg);
  }

  // If moving hands are not enabled, hide hands overlay completely
  if (!state.showHandsOnKeyboard) {
    handsSvg.style.display = "none";
    handsSvg.innerHTML = "";
    return;
  }

  handsSvg.style.display = "block";

  const defsHtml = `
    <defs>
      <linearGradient id="hand-skin-grad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#dfb18c" stop-opacity="0.92" />
        <stop offset="50%" stop-color="#f5d6bf" stop-opacity="0.96" />
        <stop offset="100%" stop-color="#fff2e8" stop-opacity="0.98" />
      </linearGradient>
      <filter id="hand-depth-shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="5" stdDeviation="4.5" flood-color="rgba(0,0,0,0.5)" />
      </filter>
    </defs>
  `;

  function getKeyPos(noteName, fallbackX, fallbackY) {
    if (!noteName) return { x: fallbackX, y: fallbackY, isBlack: false };
    const el = pianoKeys.querySelector(`[data-note="${noteName}"]`);
    if (!el) return { x: fallbackX, y: fallbackY, isBlack: false };
    const isBlack = el.classList.contains("black-key");
    const x = el.offsetLeft + (el.offsetWidth / 2);
    const y = isBlack ? 42 : 72;
    return { x, y, isBlack };
  }

  const keysHeight = pianoKeys.offsetHeight || 108;
  const wristY = keysHeight;
  const palmY = wristY - 26;

  // Render Left Hand
  let lhHtml = "";
  if (state.currentHand === "lh" || state.currentHand === "both") {
    const lhFingerOrder = [5, 4, 3, 2, 1];
    const lhPoints = [];
    const fToNote = {};
    Object.entries(lhSpanNotes || {}).forEach(([n, f]) => { fToNote[f] = n; });

    let anchorX = 280;
    for (let f of lhFingerOrder) {
      if (fToNote[f]) {
        const p = getKeyPos(fToNote[f], 0, 0);
        if (p.x > 0) {
          anchorX = p.x;
          break;
        }
      }
    }

    lhFingerOrder.forEach((f, idx) => {
      const note = fToNote[f];
      const defaultOffset = (idx - 2) * 19;
      const pos = getKeyPos(note, anchorX + defaultOffset, 72);
      const isActive = currentItem && currentItem.lh && (currentItem.lh.finger === f);
      lhPoints.push({
        f,
        note,
        x: pos.x,
        y: pos.y + (isActive ? 4 : 0),
        isBlack: pos.isBlack,
        isActive
      });
    });

    lhHtml = renderHandSvgMarkup("lh", lhPoints, wristY, palmY);
  }

  // Render Right Hand
  let rhHtml = "";
  if (state.currentHand === "rh" || state.currentHand === "both") {
    const rhFingerOrder = [1, 2, 3, 4, 5];
    const rhPoints = [];
    const fToNote = {};
    Object.entries(rhSpanNotes || {}).forEach(([n, f]) => { fToNote[f] = n; });

    let anchorX = 480;
    for (let f of rhFingerOrder) {
      if (fToNote[f]) {
        const p = getKeyPos(fToNote[f], 0, 0);
        if (p.x > 0) {
          anchorX = p.x;
          break;
        }
      }
    }

    rhFingerOrder.forEach((f, idx) => {
      const note = fToNote[f];
      const defaultOffset = (idx - 2) * 19;
      const pos = getKeyPos(note, anchorX + defaultOffset, 72);
      const isActive = currentItem && currentItem.rh && (currentItem.rh.finger === f);
      rhPoints.push({
        f,
        note,
        x: pos.x,
        y: pos.y + (isActive ? 4 : 0),
        isBlack: pos.isBlack,
        isActive
      });
    });

    rhHtml = renderHandSvgMarkup("rh", rhPoints, wristY, palmY);
  }

  handsSvg.innerHTML = defsHtml + lhHtml + rhHtml;
}

// Dynamic Hand Zone Brackets directly over keyboard keys
function updatePianoHandBrackets(lhSpanNotes, rhSpanNotes) {
  const pianoKeys = document.getElementById("piano-keys");
  if (!pianoKeys) return;

  let bracketLh = document.getElementById("piano-bracket-lh");
  if (!bracketLh) {
    bracketLh = document.createElement("div");
    bracketLh.id = "piano-bracket-lh";
    bracketLh.className = "piano-hand-bracket bracket-lh";
    pianoKeys.appendChild(bracketLh);
  }

  let bracketRh = document.getElementById("piano-bracket-rh");
  if (!bracketRh) {
    bracketRh = document.createElement("div");
    bracketRh.id = "piano-bracket-rh";
    bracketRh.className = "piano-hand-bracket bracket-rh";
    pianoKeys.appendChild(bracketRh);
  }

  const showBrackets = localStorage.getItem("hanon_show_brackets") !== "false";
  if (!showBrackets) {
    bracketLh.style.display = "none";
    bracketRh.style.display = "none";
    return;
  }

  // Left Hand bracket
  const lhNotesArr = Object.keys(lhSpanNotes || {});
  if (lhNotesArr.length > 0 && (state.currentHand === "lh" || state.currentHand === "both")) {
    let minLeft = Infinity;
    let maxRight = -Infinity;
    lhNotesArr.forEach(noteName => {
      const el = pianoKeys.querySelector(`[data-note="${noteName}"]`);
      if (el) {
        minLeft = Math.min(minLeft, el.offsetLeft);
        maxRight = Math.max(maxRight, el.offsetLeft + el.offsetWidth);
      }
    });
    if (minLeft !== Infinity && maxRight > minLeft) {
      bracketLh.style.display = "flex";
      bracketLh.style.left = `${minLeft}px`;
      bracketLh.style.width = `${maxRight - minLeft}px`;
      const tagLh = (window.I18N && window.I18N.t("bracket_lh")) || "✋ Linkerhand";
      bracketLh.innerHTML = `<span class="bracket-tag">${tagLh}</span>`;
    } else {
      bracketLh.style.display = "none";
    }
  } else {
    bracketLh.style.display = "none";
  }

  // Right Hand bracket
  const rhNotesArr = Object.keys(rhSpanNotes || {});
  if (rhNotesArr.length > 0 && (state.currentHand === "rh" || state.currentHand === "both")) {
    let minLeft = Infinity;
    let maxRight = -Infinity;
    rhNotesArr.forEach(noteName => {
      const el = pianoKeys.querySelector(`[data-note="${noteName}"]`);
      if (el) {
        minLeft = Math.min(minLeft, el.offsetLeft);
        maxRight = Math.max(maxRight, el.offsetLeft + el.offsetWidth);
      }
    });
    if (minLeft !== Infinity && maxRight > minLeft) {
      bracketRh.style.display = "flex";
      bracketRh.style.left = `${minLeft}px`;
      bracketRh.style.width = `${maxRight - minLeft}px`;
      const tagRh = (window.I18N && window.I18N.t("bracket_rh")) || "🤚 Rechterhand";
      bracketRh.innerHTML = `<span class="bracket-tag">${tagRh}</span>`;
    } else {
      bracketRh.style.display = "none";
    }
  } else {
    bracketRh.style.display = "none";
  }
}

// Highlight piano target key(s) on 88-key piano, showing exact hand positions for both hands
function highlightPianoTarget(singleNote = null, singleFinger = null) {
  // Clear existing active target keys and hand zone keys
  document.querySelectorAll(".white-key, .black-key").forEach(k => {
    k.classList.remove("active-target", "active-target-lh", "active-target-rh", "hand-key-lh", "hand-key-rh");
    const badge = k.querySelector(".finger-badge");
    if (badge) badge.remove();
    const tag = k.querySelector(".hand-tag");
    if (tag) tag.remove();
  });
  
  if (singleNote) {
    const keyEl = document.querySelector(`[data-note="${singleNote}"]`);
    if (keyEl) {
      const isLh = (state.currentHand === "lh");
      keyEl.classList.add("active-target", isLh ? "active-target-lh" : "active-target-rh");
      const badge = document.createElement("div");
      badge.className = `finger-badge active-finger-badge ${isLh ? "badge-lh" : "badge-rh"}`;
      badge.textContent = singleFinger || (isLh ? "✋ L" : "🤚 R");
      keyEl.appendChild(badge);
      centerKeyInPianoView(keyEl);
    }
    const singleFingerNum = parseInt(singleFinger) || 1;
    const dummyLh = (state.currentHand === "lh" || state.currentHand === "both") ? { [singleNote]: singleFingerNum } : {};
    const dummyRh = (state.currentHand === "rh" || state.currentHand === "both") ? { [singleNote]: singleFingerNum } : {};
    updatePianoAnimatedHands(dummyLh, dummyRh, {
      lh: { note: singleNote, finger: singleFingerNum },
      rh: { note: singleNote, finger: singleFingerNum }
    });
    return;
  }
  
  if (!state.activeTarget) return;

  const currentItem = state.activeTarget;
  const mNum = currentItem.measure;
  
  // 1. Determine hand placement keys for the current measure
  let currentMeasureObj = null;
  if (state.hanonData && state.hanonData.measures) {
    currentMeasureObj = state.hanonData.measures.find(m => m.measure === mNum);
  }
  
  const lhSpanNotes = {};
  const rhSpanNotes = {};
  
  if (currentMeasureObj && currentMeasureObj.notes) {
    currentMeasureObj.notes.forEach(n => {
      if (n.lh && n.lh.note) lhSpanNotes[n.lh.note] = n.lh.finger;
      if (n.rh && n.rh.note) rhSpanNotes[n.rh.note] = n.rh.finger;
    });
  } else {
    if (currentItem.lh && currentItem.lh.note) lhSpanNotes[currentItem.lh.note] = currentItem.lh.finger;
    if (currentItem.rh && currentItem.rh.note) rhSpanNotes[currentItem.rh.note] = currentItem.rh.finger;
  }

  // 2. Decorate Left Hand keys on piano (Cyan hand zone with finger numbers & LH marker)
  if (state.currentHand === "lh" || state.currentHand === "both") {
    Object.entries(lhSpanNotes).forEach(([noteName, finger]) => {
      const keyEl = document.querySelector(`[data-note="${noteName}"]`);
      if (keyEl) {
        keyEl.classList.add("hand-key-lh");
        const b = document.createElement("div");
        b.className = "finger-badge badge-lh";
        b.textContent = `L${finger}`;
        b.title = `Linkerhand Vinger ${finger}`;
        keyEl.appendChild(b);

        const tag = document.createElement("span");
        tag.className = "hand-tag tag-lh";
        tag.textContent = "LH";
        keyEl.appendChild(tag);
      }
    });
  }

  // 3. Decorate Right Hand keys on piano (Amber hand zone with finger numbers & RH marker)
  if (state.currentHand === "rh" || state.currentHand === "both") {
    Object.entries(rhSpanNotes).forEach(([noteName, finger]) => {
      const keyEl = document.querySelector(`[data-note="${noteName}"]`);
      if (keyEl) {
        keyEl.classList.add("hand-key-rh");
        if (!keyEl.querySelector(".finger-badge")) {
          const b = document.createElement("div");
          b.className = "finger-badge badge-rh";
          b.textContent = `R${finger}`;
          b.title = `Rechterhand Vinger ${finger}`;
          keyEl.appendChild(b);
        }
        if (!keyEl.querySelector(".hand-tag")) {
          const tag = document.createElement("span");
          tag.className = "hand-tag tag-rh";
          tag.textContent = "RH";
          keyEl.appendChild(tag);
        }
      }
    });
  }

  // 4. Highlight the CURRENT active target key(s) (Pulsing Gold / Cyan)
  const targets = [];
  if (state.currentHand === "lh") {
    targets.push({ note: currentItem.lh.note, finger: currentItem.lh.finger, hand: "lh" });
  } else if (state.currentHand === "rh") {
    targets.push({ note: currentItem.rh.note, finger: currentItem.rh.finger, hand: "rh" });
  } else {
    // Both hands: both LH and RH targets highlighted simultaneously
    targets.push({ note: currentItem.lh.note, finger: currentItem.lh.finger, hand: "lh" });
    targets.push({ note: currentItem.rh.note, finger: currentItem.rh.finger, hand: "rh" });
  }

  targets.forEach(t => {
    const keyEl = document.querySelector(`[data-note="${t.note}"]`);
    if (keyEl) {
      keyEl.classList.add("active-target", t.hand === "lh" ? "active-target-lh" : "active-target-rh");
      let badge = keyEl.querySelector(".finger-badge");
      if (!badge) {
        badge = document.createElement("div");
        keyEl.appendChild(badge);
      }
      badge.className = `finger-badge active-finger-badge ${t.hand === "lh" ? "badge-lh" : "badge-rh"}`;
      badge.textContent = t.hand === "lh" ? `✋ L${t.finger}` : `🤚 R${t.finger}`;
    }
  });

  // 5. Update floating Hand Zone Brackets directly on the piano keyboard
  updatePianoHandBrackets(lhSpanNotes, rhSpanNotes);

  // 5.5 Update Animated Flowkey Moving Hands directly on the piano keyboard
  updatePianoAnimatedHands(lhSpanNotes, rhSpanNotes, currentItem);

  // 6. Update the dedicated Hand Guide Bar below the piano
  updatePianoHandGuideBar(currentItem, lhSpanNotes, rhSpanNotes);

  // 7. Centering: Center the piano container so BOTH hand zones are clearly visible
  centerHandPositionInPianoView(currentItem);
}

// Play feedback sound
function playAudioFeedback(type) {
  if (!state.audioCtx) return;
  const ctx = state.audioCtx;
  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  if (type === "correct") {
    // Pleasant high chime
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === "wrong") {
    // Gentle low thud
    osc.type = "triangle";
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === "click") {
    // Metronome woodblock click
    osc.type = "sine";
    osc.frequency.setValueAtTime(1000, now);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.start(now);
    osc.stop(now + 0.04);
  }
}

// Process a played note (from Mic, MIDI, or click)
function handlePlayedNote(playedNoteName, hz = 0, cents = 0) {
  // Update live HUD
  document.getElementById("live-note-name").textContent = playedNoteName;
  document.getElementById("live-hz").textContent = hz > 0 ? `${hz.toFixed(1)} Hz` : "";
  document.getElementById("live-cents-desc").textContent = 
    cents !== 0 ? `${cents > 0 ? '+' : ''}${cents.toFixed(0)} ct` : "Stemming 🎯";
  
  if (!state.isPlaying || !state.activeTarget) return;
  
  let targetNote = state.currentHand === "lh" ? state.activeTarget.lh.note : state.activeTarget.rh.note;
  let targetFinger = state.currentHand === "lh" ? state.activeTarget.lh.finger : state.activeTarget.rh.finger;
  
  const playedBase = playedNoteName.replace(/[0-9]+/g, '');
  let isMatch = false;
  
  if (state.currentHand === "both") {
    const rhNote = state.activeTarget.rh.note;
    const lhNote = state.activeTarget.lh.note;
    const rhBase = rhNote.replace(/[0-9]+/g, '');
    const lhBase = lhNote.replace(/[0-9]+/g, '');
    isMatch = (playedNoteName === rhNote || playedNoteName === lhNote || playedBase === rhBase || playedBase === lhBase);
    targetNote = `${lhNote} / ${rhNote}`;
    targetFinger = `LH ${state.activeTarget.lh.finger} / RH ${state.activeTarget.rh.finger}`;
  } else {
    const targetBase = targetNote.replace(/[0-9]+/g, '');
    isMatch = (playedNoteName === targetNote) || (playedBase === targetBase);
  }
  
  // Reaction time calculation for telemetry
  const nowPerf = performance.now();
  const latencyMs = Math.round(nowPerf - (state.lastNotePromptTime || nowPerf));
  const hesitation = latencyMs > 1600;

  // Queue course telemetry
  state.telemetryQueue.push({
    session_uuid: state.sessionUuid,
    timestamp: new Date().toISOString(),
    exercise_id: state.currentExerciseId,
    lesson_id: state.currentLessonId,
    event_type: "note_played",
    data: {
      measure: state.activeTarget.measure,
      note_index: state.activeTarget.note_index,
      target_note: targetNote,
      target_finger: targetFinger,
      played_note: playedNoteName,
      is_correct: isMatch,
      latency_ms: latencyMs,
      hesitation: hesitation,
      cents: cents,
      bpm: state.bpm,
      hand: state.currentHand,
      mode: state.currentMode,
      audio_source: state.audioSource,
      viewport: { width: window.innerWidth, height: window.innerHeight }
    }
  });

  if (state.telemetryQueue.length >= 8) {
    flushTelemetry();
  }

  const targetKeyEl = document.querySelector(`[data-note="${playedNoteName}"]`);
  
  if (isMatch) {
    // CORRECT!
    state.correctCount++;
    state.streak++;
    playAudioFeedback("correct");
    
    // Flash green on piano key
    if (targetKeyEl) {
      targetKeyEl.classList.add("correct");
      setTimeout(() => targetKeyEl.classList.remove("correct"), 250);
    }

    // Flash green on Vector SVG note
    if (window.VectorSheetRenderer && state.activeTarget) {
      window.VectorSheetRenderer.flashCorrect(state.activeTarget.measure, state.activeTarget.note_index, state.currentHand);
    }
    
    const greatStr = (window.I18N && window.I18N.t("feedback_great")) || "Goed zo!";
    const cleanStr = (window.I18N && window.I18N.t("feedback_clean", {
      note: playedNoteName,
      finger: targetFinger
    })) || `${playedNoteName} vlekkeloos geraakt (Vinger ${targetFinger}).`;
    
    document.getElementById("coach-message").innerHTML = 
      `<span style="color: var(--accent-green);">${greatStr}</span> ${cleanStr}`;
    
    // Advance to next note
    state.hasNewAttackSinceLastNote = false;
    state.lastNoteTimestamp = Date.now();
    state.currentNoteIndex++;
    updateTargetDisplay();
  } else {
    // In Wait (practice) mode: Patiently wait for the correct note without buzzing or penalizing!
    if (state.currentMode === "wait") {
      document.getElementById("coach-message").innerHTML = 
        `<span style="color: var(--accent-gold);">${playedNoteName} gehoord</span> • Speel <strong>${targetNote}</strong> (${targetFinger})`;
      return;
    }

    // In Tempo mode: Measure timing and count wrong note
    state.wrongCount++;
    state.streak = 0;
    playAudioFeedback("wrong");
    
    // Flash red on played key
    if (targetKeyEl) {
      targetKeyEl.classList.add("wrong");
      setTimeout(() => targetKeyEl.classList.remove("wrong"), 350);
    }

    // Flash red on Vector SVG note
    if (window.VectorSheetRenderer && state.activeTarget) {
      window.VectorSheetRenderer.flashWrong(state.activeTarget.measure, state.activeTarget.note_index, state.currentHand);
    }
    
    // Record mistake for feedback
    state.mistakes.push({
      measure: state.activeTarget.measure,
      target_note: targetNote,
      target_finger: targetFinger,
      played_note: playedNoteName
    });
    
    const watchoutStr = (window.I18N && window.I18N.t("feedback_watchout")) || "Let op:";
    const mistakeStr = (window.I18N && window.I18N.t("feedback_mistake", {
      played: `<strong>${playedNoteName}</strong>`,
      target: `<strong>${targetNote}</strong>`,
      finger: getFingerName(targetFinger)
    })) || `Je speelde <strong>${playedNoteName}</strong> in plaats van <strong>${targetNote}</strong>. Gebruik vinger ${getFingerName(targetFinger)}!`;
    
    document.getElementById("coach-message").innerHTML = 
      `<span style="color: var(--accent-red);">${watchoutStr}</span> ${mistakeStr}`;
    
    updateScoreUI();
    
    // In tempo mode, we also advance even if wrong
    if (state.currentMode === "tempo") {
      state.currentNoteIndex++;
      updateTargetDisplay();
    }
  }
}

// Telemetry Batch Dispatcher
async function flushTelemetry() {
  if (!state.telemetryQueue || state.telemetryQueue.length === 0) return;
  const batch = [...state.telemetryQueue];
  state.telemetryQueue = [];
  try {
    const res = await fetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: batch })
    });
    if (!res.ok) throw new Error("API telemetry failed");
  } catch (err) {
    try {
      const stored = JSON.parse(localStorage.getItem("hanon_telemetry_events") || "[]");
      stored.push(...batch);
      if (stored.length > 500) stored.splice(0, stored.length - 500);
      localStorage.setItem("hanon_telemetry_events", JSON.stringify(stored));
    } catch(e) {}
  }
}

// Update HUD Scores
function updateScoreUI() {
  const total = state.correctCount + state.wrongCount;
  const accuracy = total > 0 ? Math.round((state.correctCount / total) * 100) : 100;
  
  document.getElementById("stat-correct").textContent = state.correctCount;
  document.getElementById("stat-wrong").textContent = state.wrongCount;
  document.getElementById("stat-streak").textContent = `🔥 ${state.streak}`;
  document.getElementById("stat-accuracy").textContent = `${accuracy}%`;
  
  const queueLen = state.activeNotesQueue ? state.activeNotesQueue.length : 1;
  const pct = Math.min(100, Math.round((state.currentNoteIndex / queueLen) * 100));
  const currentNoteNum = Math.min(queueLen, state.currentNoteIndex + (state.isPlaying ? 1 : 0));
  document.getElementById("stat-progress").textContent = 
    (window.I18N && window.I18N.t("stat_progress_fmt", { cur: currentNoteNum, total: queueLen }))
    || `Noot ${currentNoteNum} / ${queueLen}`;
  document.getElementById("lesson-progress-bar").style.width = `${pct}%`;
}

// Finish Lesson
async function finishLesson() {
  state.isPlaying = false;
  stopTempoMode();
  document.getElementById("start-btn-icon").textContent = "▶️";
  document.getElementById("start-btn-text").textContent = "Start";
  document.getElementById("coach-state").textContent = "VOLTOOID";
  document.getElementById("coach-state").style.color = "var(--accent-gold)";
  
  const total = state.correctCount + state.wrongCount;
  const accuracy = total > 0 ? Math.round((state.correctCount / total) * 100) : 100;
  const durationSec = state.startTime ? (Date.now() - state.startTime) / 1000 : 0;
  
  // Flush remaining telemetry
  await flushTelemetry();

  // Calculate stars
  let stars = "⭐️⭐️⭐️";
  if (accuracy >= 98) stars = "⭐️⭐️⭐️⭐️⭐️";
  else if (accuracy >= 90) stars = "⭐️⭐️⭐️⭐️";
  else if (accuracy >= 75) stars = "⭐️⭐️⭐️";
  else if (accuracy >= 60) stars = "⭐️⭐️";
  else stars = "⭐️";
  
  document.getElementById("modal-stars").textContent = stars;
  document.getElementById("modal-stat-correct").textContent = state.correctCount;
  document.getElementById("modal-stat-wrong").textContent = state.wrongCount;
  document.getElementById("modal-stat-accuracy").textContent = `${accuracy}%`;
  
  // Send session to backend or fallback to localStorage
  const sessionData = {
    exercise_id: state.currentExerciseId,
    lesson_id: state.currentLessonId,
    hand: state.currentHand,
    mode: state.currentMode,
    total_notes: total,
    correct_notes: state.correctCount,
    wrong_notes: state.wrongCount,
    accuracy: accuracy,
    score: state.correctCount * 10 - state.wrongCount * 5,
    bpm: state.bpm,
    duration_seconds: durationSec,
    mistakes: state.mistakes,
    timestamp: new Date().toISOString()
  };

  let result = null;
  try {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sessionData)
    });
    if (res.ok) result = await res.json();
  } catch (err) {
    // API not reachable
  }

  if (!result) {
    try {
      const stored = JSON.parse(localStorage.getItem("hanon_piano_sessions") || "[]");
      stored.unshift(sessionData);
      localStorage.setItem("hanon_piano_sessions", JSON.stringify(stored.slice(0, 100)));
    } catch(e) {}

    const feedback = [];
    if (accuracy >= 95) {
      feedback.push("🎉 <strong>Uitmuntend!</strong> Je vingers bewegen met grote precisie en gelijkmatigheid.");
    } else if (accuracy >= 80) {
      feedback.push("👏 <strong>Goed gedaan!</strong> Houd je polsen soepel en let op gelijke kracht in elke vinger.");
    } else {
      feedback.push("💪 <strong>Blijf oefenen!</strong> Speel op een rustiger tempo (bv. 50 BPM) om de vingerkracht op te bouwen.");
    }
    result = { feedback };
  }
  
  // Populate feedback tips
  const feedbackList = document.getElementById("modal-feedback-list");
  feedbackList.innerHTML = "";
  if (result.feedback) {
    result.feedback.forEach(item => {
      const div = document.createElement("div");
      div.innerHTML = item;
      feedbackList.appendChild(div);
    });
  }
  
  // GA event tracking
  if (typeof gtag === "function") {
    gtag("event", "finish_lesson", {
      exercise_id: state.currentExerciseId,
      lesson_id: state.currentLessonId,
      accuracy: accuracy,
      stars: stars,
      correct: state.correctCount,
      wrong: state.wrongCount,
      duration_seconds: Math.round(durationSec)
    });
  }
  
  openModal("score-modal");
}

function advanceToNextLesson() {
  const currentIdx = state.lessons.findIndex(l => l.id === state.currentLessonId);
  if (currentIdx >= 0 && currentIdx < state.lessons.length - 1) {
    const nextLesson = state.lessons[currentIdx + 1];
    state.currentLessonId = nextLesson.id;
    document.getElementById("lesson-select").value = nextLesson.id;
    loadLesson(nextLesson.id);
    startLesson();
  } else {
    alert("Gefeliciteerd! Je hebt alle Hanon lessen doorlopen!");
  }
}

// Tempo Mode Metronome Loop
function startTempoMode() {
  stopTempoMode();
  // 16th notes: interval in ms = (60,000 / BPM) / 4
  const intervalMs = (60000 / state.bpm) / 4;
  
  state.metronomeTimer = setInterval(() => {
    if (!state.isPlaying) return;
    
    if (state.metronomeOn) {
      playAudioFeedback("click");
    }
  }, intervalMs);
}

function stopTempoMode() {
  if (state.metronomeTimer) {
    clearInterval(state.metronomeTimer);
    state.metronomeTimer = null;
  }
}

// "Speel Voor" (Demo Functionality)
function toggleDemo() {
  if (state.isDemo) {
    stopDemo();
  } else {
    startDemo();
  }
}

function startDemo() {
  stopDemo();
  if (!state.activeNotesQueue || state.activeNotesQueue.length === 0) return;
  
  state.isDemo = true;
  const btnDemo = document.getElementById("btn-demo");
  if (btnDemo) {
    btnDemo.innerHTML = "<span>⏹️ Stop Demo</span>";
    btnDemo.classList.add("btn-accent");
  }
  
  let demoIdx = 0;
  const intervalMs = (60000 / state.bpm) / 4; // 16th notes
  
  state.demoTimer = setInterval(() => {
    if (demoIdx >= state.activeNotesQueue.length) {
      stopDemo();
      return;
    }
    
    const item = state.activeNotesQueue[demoIdx];
    state.activeTarget = item;
    state.currentNoteIndex = demoIdx;
    
    // Play synthesis tone
    if (state.currentHand === "both") {
      if (item.lh && item.lh.midi) playPianoTone(item.lh.midi, intervalMs / 1000);
      if (item.rh && item.rh.midi) playPianoTone(item.rh.midi, intervalMs / 1000);
    } else if (state.currentHand === "lh") {
      if (item.lh && item.lh.midi) playPianoTone(item.lh.midi, intervalMs / 1000);
    } else {
      if (item.rh && item.rh.midi) playPianoTone(item.rh.midi, intervalMs / 1000);
    }
    
    // Highlight sheet position
    highlightSheetPosition(item);
    
    // Highlight piano target key(s) AND articulate animated moving hands!
    highlightPianoTarget();
    
    // Update vector sheet if active
    if (window.VectorSheetRenderer) {
      window.VectorSheetRenderer.setTarget(item.measure, item.note_index, state.currentHand);
      window.VectorSheetRenderer.scrollToMeasure(item.measure);
    }
    
    updateHandPlacementGuide(item);
    demoIdx++;
  }, intervalMs);
}

function stopDemo() {
  state.isDemo = false;
  if (state.demoTimer) {
    clearInterval(state.demoTimer);
    state.demoTimer = null;
  }
  const btnDemo = document.getElementById("btn-demo");
  if (btnDemo) {
    btnDemo.innerHTML = "<span>🎧 Speel Voor</span>";
    btnDemo.classList.remove("btn-accent");
  }
  if (state.activeNotesQueue && state.activeNotesQueue.length > 0) {
    state.currentNoteIndex = 0;
    state.activeTarget = state.activeNotesQueue[0];
  }
  updateTargetDisplay();
  highlightPianoTarget();
}

// ==========================================================================
// Concert Grand Piano Sound Engine (Yamaha C5 Samples + Physical Modeling)
// ==========================================================================

const GRAND_PIANO_SAMPLES = [
  { note: "A0", midi: 21, file: "A0.mp3" },
  { note: "C1", midi: 24, file: "C1.mp3" },
  { note: "D#1", midi: 27, file: "Ds1.mp3" },
  { note: "F#1", midi: 30, file: "Fs1.mp3" },
  { note: "A1", midi: 33, file: "A1.mp3" },
  { note: "C2", midi: 36, file: "C2.mp3" },
  { note: "D#2", midi: 39, file: "Ds2.mp3" },
  { note: "F#2", midi: 42, file: "Fs2.mp3" },
  { note: "A2", midi: 45, file: "A2.mp3" },
  { note: "C3", midi: 48, file: "C3.mp3" },
  { note: "D#3", midi: 51, file: "Ds3.mp3" },
  { note: "F#3", midi: 54, file: "Fs3.mp3" },
  { note: "A3", midi: 57, file: "A3.mp3" },
  { note: "C4", midi: 60, file: "C4.mp3" },
  { note: "D#4", midi: 63, file: "Ds4.mp3" },
  { note: "F#4", midi: 66, file: "Fs4.mp3" },
  { note: "A4", midi: 69, file: "A4.mp3" },
  { note: "C5", midi: 72, file: "C5.mp3" },
  { note: "D#5", midi: 75, file: "Ds5.mp3" },
  { note: "F#5", midi: 78, file: "Fs5.mp3" },
  { note: "A5", midi: 81, file: "A5.mp3" },
  { note: "C6", midi: 84, file: "C6.mp3" },
  { note: "D#6", midi: 87, file: "Ds6.mp3" },
  { note: "F#6", midi: 90, file: "Fs6.mp3" },
  { note: "A6", midi: 93, file: "A6.mp3" },
  { note: "C7", midi: 96, file: "C7.mp3" },
  { note: "D#7", midi: 99, file: "Ds7.mp3" },
  { note: "F#7", midi: 102, file: "Fs7.mp3" },
  { note: "A7", midi: 105, file: "A7.mp3" },
  { note: "C8", midi: 108, file: "C8.mp3" }
];

const SALAMANDER_BASE_URL = "https://tonejs.github.io/audio/salamander/";
const pianoAudioBufferCache = new Map();
const pendingSampleLoads = new Map();

function findClosestPianoSample(targetMidi) {
  let closest = GRAND_PIANO_SAMPLES[0];
  let minDiff = Math.abs(targetMidi - closest.midi);
  for (let i = 1; i < GRAND_PIANO_SAMPLES.length; i++) {
    const s = GRAND_PIANO_SAMPLES[i];
    const diff = Math.abs(targetMidi - s.midi);
    if (diff < minDiff) {
      minDiff = diff;
      closest = s;
    }
  }
  return closest;
}

async function loadPianoSampleBuffer(sampleDef) {
  if (pianoAudioBufferCache.has(sampleDef.file)) {
    return pianoAudioBufferCache.get(sampleDef.file);
  }
  if (pendingSampleLoads.has(sampleDef.file)) {
    return pendingSampleLoads.get(sampleDef.file);
  }

  const loadPromise = (async () => {
    try {
      if (!state.audioCtx) {
        state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = state.audioCtx;
      const res = await fetch(`${SALAMANDER_BASE_URL}${sampleDef.file}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      pianoAudioBufferCache.set(sampleDef.file, audioBuffer);
      pendingSampleLoads.delete(sampleDef.file);
      return audioBuffer;
    } catch (err) {
      pendingSampleLoads.delete(sampleDef.file);
      return null;
    }
  })();

  pendingSampleLoads.set(sampleDef.file, loadPromise);
  return loadPromise;
}

function preloadGrandPianoSamples() {
  const coreFiles = ["C2.mp3", "Ds2.mp3", "A2.mp3", "C3.mp3", "Ds3.mp3", "Fs3.mp3", "A3.mp3", "C4.mp3", "Ds4.mp3", "Fs4.mp3", "A4.mp3", "C5.mp3"];
  GRAND_PIANO_SAMPLES.filter(s => coreFiles.includes(s.file)).forEach(sampleDef => {
    loadPianoSampleBuffer(sampleDef).catch(() => {});
  });
}

function playSampleBuffer(buffer, sampleMidi, targetMidi, duration = 0.3) {
  if (!state.audioCtx) return;
  const ctx = state.audioCtx;
  const now = ctx.currentTime;
  
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  
  // Pitch shift from recorded sample to target note
  const semitones = targetMidi - sampleMidi;
  source.playbackRate.value = Math.pow(2, semitones / 12);
  
  // Concert grand soundboard & damper release envelope
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.001, now);
  gainNode.gain.linearRampToValueAtTime(0.85, now + 0.004);
  
  const sustainDuration = Math.max(0.18, duration);
  const releaseStart = now + sustainDuration;
  gainNode.gain.setValueAtTime(0.75, releaseStart);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, releaseStart + 0.38);
  
  source.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  source.start(now);
  source.stop(releaseStart + 0.4);
}

function playPhysicalModelingGrand(midi, duration = 0.3) {
  if (!state.audioCtx) return;
  const ctx = state.audioCtx;
  const now = ctx.currentTime;
  const f0 = midiToFreq(midi);

  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);

  // Dynamic lowpass filter to mimic felt hammer hardness & string brightness
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(4500, now);
  filter.frequency.exponentialRampToValueAtTime(900, now + Math.max(0.2, duration));
  filter.Q.value = 1.8;
  filter.connect(masterGain);

  // 1. Triple-string unison chorus beating (real grand piano trichord strings)
  const detunes = [-0.9, 0, 0.9];
  detunes.forEach((cents, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(f0, now);
    osc.detune.setValueAtTime(cents, now);

    g.gain.setValueAtTime(0.22 / (i + 1), now);
    const releaseTime = now + Math.max(0.2, duration);
    g.gain.exponentialRampToValueAtTime(0.0001, releaseTime + 0.3);

    osc.connect(g);
    g.connect(filter);
    osc.start(now);
    osc.stop(releaseTime + 0.32);
  });

  // 2. High harmonic chime (2nd, 3rd, 4th harmonics)
  [2, 3, 4].forEach(h => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(f0 * h, now);
    g.gain.setValueAtTime(0.09 / h, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + Math.min(0.25, duration));
    osc.connect(g);
    g.connect(filter);
    osc.start(now);
    osc.stop(now + duration + 0.1);
  });

  // 3. Felt hammer percussive click transient
  const hammerOsc = ctx.createOscillator();
  const hammerGain = ctx.createGain();
  hammerOsc.type = "sine";
  hammerOsc.frequency.setValueAtTime(2800, now);
  hammerOsc.frequency.exponentialRampToValueAtTime(200, now + 0.015);
  hammerGain.gain.setValueAtTime(0.12, now);
  hammerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);
  hammerOsc.connect(hammerGain);
  hammerGain.connect(masterGain);
  hammerOsc.start(now);
  hammerOsc.stop(now + 0.02);

  // Master envelope
  masterGain.gain.setValueAtTime(0.001, now);
  masterGain.gain.linearRampToValueAtTime(0.85, now + 0.003);
  const releaseStart = now + Math.max(0.18, duration);
  masterGain.gain.setValueAtTime(0.7, releaseStart);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, releaseStart + 0.35);
}

// Web Audio Concert Grand Piano Player
function playPianoTone(midi, duration = 0.3) {
  if (!midi) return;
  try {
    if (!state.audioCtx) {
      state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = state.audioCtx;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const sampleDef = findClosestPianoSample(midi);
    const cachedBuffer = pianoAudioBufferCache.get(sampleDef.file);

    if (cachedBuffer) {
      playSampleBuffer(cachedBuffer, sampleDef.midi, midi, duration);
    } else {
      // Warm up this sample for upcoming notes
      loadPianoSampleBuffer(sampleDef);
      // Play high-fidelity acoustic concert grand fallback
      playPhysicalModelingGrand(midi, duration);
    }
  } catch (e) {
    console.warn("Piano tone playback error:", e);
  }
}

// BROWSER MICROPHONE & ENHANCED ACOUSTIC PIANO PITCH DETECTION
async function initBrowserMic() {
  try {
    if (!state.audioCtx) {
      state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (state.audioCtx.state === "suspended") {
      await state.audioCtx.resume();
    }
    
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    });
    state.micStream = stream;
    
    const micSource = state.audioCtx.createMediaStreamSource(stream);

    // Audio Pre-processing Filter Chain for Acoustic Piano:
    // 1. Cascaded High-pass filters (35Hz) to strip low-end chassis rumble, DC offset & mechanical keybed/pedal shocks
    const hpCutoff = state.laptopOnPianoMode ? 35 : 25;
    const hpFilter1 = state.audioCtx.createBiquadFilter();
    hpFilter1.type = "highpass";
    hpFilter1.frequency.value = hpCutoff;
    hpFilter1.Q.value = 0.707;

    const hpFilter2 = state.audioCtx.createBiquadFilter();
    hpFilter2.type = "highpass";
    hpFilter2.frequency.value = hpCutoff;
    hpFilter2.Q.value = 0.707;

    // 2. Studio Dynamics Compressor / Anti-Clipping Limiter:
    // Prevents microphone clipping & distortion when the laptop sits directly on the piano soundboard
    const compressor = state.audioCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(state.laptopOnPianoMode ? -16 : -24, state.audioCtx.currentTime);
    compressor.knee.setValueAtTime(10, state.audioCtx.currentTime);
    compressor.ratio.setValueAtTime(state.laptopOnPianoMode ? 12 : 4, state.audioCtx.currentTime);
    compressor.attack.setValueAtTime(0.003, state.audioCtx.currentTime); // 3ms fast attack
    compressor.release.setValueAtTime(0.20, state.audioCtx.currentTime); // 200ms release

    // 3. Low-pass filter (4200Hz) to strip ambient hiss & high computer fan whine above piano C8
    const lpFilter = state.audioCtx.createBiquadFilter();
    lpFilter.type = "lowpass";
    lpFilter.frequency.value = 4200;

    // Analyser: fftSize 4096 gives halfBufferSize 2048 (down to 23.4Hz at 48kHz, covering A0=27.5Hz)
    const analyser = state.audioCtx.createAnalyser();
    analyser.fftSize = 4096;
    analyser.smoothingTimeConstant = 0.0;

    // Connect node chain: micSource -> hpFilter1 -> hpFilter2 -> compressor -> lpFilter -> analyser
    micSource.connect(hpFilter1);
    hpFilter1.connect(hpFilter2);
    hpFilter2.connect(compressor);
    compressor.connect(lpFilter);
    lpFilter.connect(analyser);

    state.hpFilter1 = hpFilter1;
    state.hpFilter2 = hpFilter2;
    state.compressor = compressor;
    state.lpFilter = lpFilter;
    state.analyser = analyser;
    state.pitchBuffer = new Float32Array(analyser.fftSize);
    state.lastDetectedNote = null;
    state.lastNoteTimestamp = 0;
    state.pitchHistory = [];
    state.ambientNoise = 0.008;
    state.prevRms = 0;
    state.hasNewAttackSinceLastNote = true;
    
    requestAnimationFrame(audioProcessLoop);
    console.log("Microfoon met akoestische piano-optimalisatie (en laptop-op-piano bescherming) geactiveerd!");
  } catch (err) {
    console.error("Microfoontoegang geweigerd:", err);
    alert("Microfoontoegang is nodig om naar de piano te luisteren. Klik op 'Toestaan' in de adresbalk.");
  }
}

// Real-time audio loop with acoustic piano stability confirmation & onset detection
function audioProcessLoop() {
  if (state.analyser && state.pitchBuffer && state.isPlaying) {
    state.analyser.getFloatTimeDomainData(state.pitchBuffer);
    
    // 1. Calculate RMS energy & peak amplitude
    let sum = 0;
    let peak = 0;
    for (let i = 0; i < state.pitchBuffer.length; i++) {
      const val = state.pitchBuffer[i];
      sum += val * val;
      const absVal = Math.abs(val);
      if (absVal > peak) peak = absVal;
    }
    const rms = Math.sqrt(sum / state.pitchBuffer.length);
    
    // 2. Track energy delta (attack onset)
    const prevRms = (state.prevRms !== undefined) ? state.prevRms : rms;
    const deltaRms = rms - prevRms;
    state.prevRms = rms;

    // Detect new attack strike (energy surge: hammer striking string)
    const isAttackOnset = (deltaRms > 0.008) || (prevRms > 0.002 && rms / prevRms > 1.35);
    if (isAttackOnset) {
      state.lastAttackTime = Date.now();
      state.hasNewAttackSinceLastNote = true;
    }

    // 3. Track ambient background noise floor smoothly
    state.ambientNoise = state.ambientNoise ? (0.96 * state.ambientNoise + 0.04 * rms) : rms;
    
    // 4. Dynamic adaptive strike threshold (adapting to sensitivity slider & room noise)
    const sensFactor = (state.sensitivity / 50.0); // 1..50
    const baseGate = state.laptopOnPianoMode ? 0.006 : 0.008;
    const dynamicThreshold = Math.max(
      baseGate + (0.020 * (1.0 - Math.min(1.0, sensFactor))),
      state.ambientNoise * (state.laptopOnPianoMode ? 1.35 : 1.5)
    );
    
    if (rms > dynamicThreshold) {
      const result = detectPitchYIN(state.pitchBuffer, state.audioCtx.sampleRate);
      if (result && result.freq >= 27.0 && result.freq <= 4200.0 && result.confidence >= 0.68) {
        const midi = freqToMidi(result.freq);
        if (midi) {
          const roundedMidi = Math.round(midi);
          const cents = (midi - roundedMidi) * 100.0;
          const noteName = midiToNoteName(roundedMidi);
          
          // Real-time HUD reflection
          const liveNameEl = document.getElementById("live-note-name");
          if (liveNameEl) liveNameEl.textContent = noteName;
          const liveHzEl = document.getElementById("live-hz");
          if (liveHzEl) liveHzEl.textContent = `${result.freq.toFixed(1)} Hz`;
          const liveCentsEl = document.getElementById("live-cents-desc");
          if (liveCentsEl) {
            liveCentsEl.textContent = Math.abs(cents) > 3 ? `${cents > 0 ? '+' : ''}${cents.toFixed(0)} ct` : "Stemming 🎯";
          }
          
          // Multi-frame pitch consensus buffer (eliminates hammer transients & speech blips)
          state.pitchHistory = state.pitchHistory || [];
          const now = Date.now();
          state.pitchHistory.push({ note: noteName, freq: result.freq, cents, time: now });
          
          // Keep detections within last 80ms
          state.pitchHistory = state.pitchHistory.filter(h => (now - h.time) <= 80);
          
          // If at least 2 consecutive detections agree on note name (~35ms of stable pitch)
          if (state.pitchHistory.length >= 2) {
            const lastNote = state.pitchHistory[state.pitchHistory.length - 1].note;
            const prevNote = state.pitchHistory[state.pitchHistory.length - 2].note;
            
            if (lastNote === prevNote) {
              const timeSinceLast = now - (state.lastNoteTimestamp || 0);
              const isSameNote = (lastNote === state.lastDetectedNote);

              // On acoustic pianos sitting directly under the laptop:
              // 1. Distinct notes require at least 120ms between hits
              // 2. The exact same note requires either a fresh hammer attack onset or 240ms decay
              const allowNote = !isSameNote
                ? (timeSinceLast >= 120)
                : (state.hasNewAttackSinceLastNote || timeSinceLast >= 240);

              if (allowNote) {
                state.lastDetectedNote = lastNote;
                state.lastNoteTimestamp = now;
                state.hasNewAttackSinceLastNote = false;
                handlePlayedNote(lastNote, result.freq, cents);
              }
            }
          }
        }
      }
    }
  }
  requestAnimationFrame(audioProcessLoop);
}

// High-accuracy Enhanced YIN Pitch Algorithm with Acoustic Piano Sub-harmonic & Octave Verification
function detectPitchYIN(buffer, sampleRate) {
  const bufferSize = buffer.length;
  const halfBufferSize = Math.floor(bufferSize / 2);
  const yinBuffer = new Float32Array(halfBufferSize);
  
  // Frequency search boundaries for 88-key piano: A0 (27.5 Hz) to C8 (4186 Hz)
  const minPeriod = Math.max(2, Math.floor(sampleRate / 4200.0));
  const maxPeriod = Math.min(halfBufferSize - 2, Math.floor(sampleRate / 27.0));
  
  // Step 1: Difference Function (stride 2 for high performance with 4096 buffer)
  for (let tau = 0; tau <= maxPeriod; tau++) {
    yinBuffer[tau] = 0;
  }
  for (let tau = minPeriod; tau <= maxPeriod; tau++) {
    let sum = 0;
    for (let i = 0; i < halfBufferSize; i += 2) {
      const delta = buffer[i] - buffer[i + tau];
      sum += delta * delta;
    }
    yinBuffer[tau] = sum * 2;
  }
  
  // Step 2: Cumulative Mean Normalized Difference
  yinBuffer[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau <= maxPeriod; tau++) {
    runningSum += yinBuffer[tau];
    yinBuffer[tau] = runningSum > 0 ? (yinBuffer[tau] * tau) / runningSum : 1;
  }
  
  // Step 3: Find Candidate Local Minima
  const threshold = 0.20;
  const candidateMinima = [];
  let globalMinVal = 1.0;
  let globalMinTau = -1;
  
  for (let tau = minPeriod + 1; tau < maxPeriod; tau++) {
    if (yinBuffer[tau] < yinBuffer[tau - 1] && yinBuffer[tau] <= yinBuffer[tau + 1]) {
      if (yinBuffer[tau] < threshold) {
        candidateMinima.push({ tau, val: yinBuffer[tau] });
      }
      if (yinBuffer[tau] < globalMinVal) {
        globalMinVal = yinBuffer[tau];
        globalMinTau = tau;
      }
    }
  }
  
  if (candidateMinima.length === 0 && globalMinVal < 0.28) {
    candidateMinima.push({ tau: globalMinTau, val: globalMinVal });
  }
  
  if (candidateMinima.length === 0) return null;
  
  // Step 4: Octave & Sub-harmonic Verification for Piano Strings
  // Pianos have strong 2nd/3rd harmonics. If an initial minimum is at tau1,
  // check if a true fundamental subharmonic minimum exists near 2*tau1 or 3*tau1!
  let chosenTau = candidateMinima[0].tau;
  let chosenVal = candidateMinima[0].val;
  
  for (let i = 0; i < candidateMinima.length; i++) {
    const c1 = candidateMinima[i];
    for (let j = i + 1; j < candidateMinima.length; j++) {
      const c2 = candidateMinima[j];
      const ratio = c2.tau / c1.tau;
      // If c2 is an octave lower (~2.0 * tau1) and is a strong dip:
      if (Math.abs(ratio - 2.0) < 0.08 && c2.val < 0.38) {
        chosenTau = c2.tau;
        chosenVal = c2.val;
        break;
      }
      // If c2 is a twelfth lower (~3.0 * tau1, i.e. 3rd harmonic) and strong:
      if (Math.abs(ratio - 3.0) < 0.08 && c2.val < 0.35) {
        chosenTau = c2.tau;
        chosenVal = c2.val;
        break;
      }
    }
  }
  
  const confidence = 1.0 - chosenVal;
  if (confidence < 0.68) return null; // Reject non-periodic noise
  
  // Step 5: Parabolic Interpolation for Sub-sample Accuracy
  let betterTau = chosenTau;
  if (chosenTau > 1 && chosenTau < halfBufferSize - 1) {
    const s0 = yinBuffer[chosenTau - 1];
    const s1 = yinBuffer[chosenTau];
    const s2 = yinBuffer[chosenTau + 1];
    const denom = 2 * (2 * s1 - s0 - s2);
    if (denom !== 0) {
      betterTau = chosenTau + (s2 - s0) / denom;
    }
  }
  
  return {
    freq: sampleRate / betterTau,
    confidence: confidence
  };
}
  
  return {
    freq: sampleRate / betterTau,
    confidence: confidence
  };
}

// Waveform visualizer
function setupWaveformCanvas() {
  const canvas = document.getElementById("wave-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  
  function draw() {
    requestAnimationFrame(draw);
    ctx.fillStyle = "#0b1120";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (!state.analyser || !state.pitchBuffer) {
      ctx.strokeStyle = "#334155";
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      return;
    }
    
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#06b6d4";
    ctx.beginPath();
    
    const sliceWidth = canvas.width / 48;
    let x = 0;
    for (let i = 0; i < 48; i++) {
      const v = state.pitchBuffer[i * 16];
      const y = (v + 1) / 2 * canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.stroke();
  }
  draw();
}

// Python WebSocket Pitch Connection
function initPythonWs() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws/mic`;
  
  const ws = new WebSocket(wsUrl);
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "pitch" && data.note) {
        handlePlayedNote(data.note, data.freq, data.cents);
      }
    } catch (e) {}
  };
  ws.onclose = () => { state.pythonWs = null; };
  state.pythonWs = ws;
}

// Web MIDI Support
async function initWebMidi() {
  if (!navigator.requestMIDIAccess) {
    alert("Web MIDI wordt niet ondersteund in deze browser.");
    return;
  }
  try {
    const midi = await navigator.requestMIDIAccess();
    state.midiAccess = midi;
    midi.inputs.forEach(input => {
      input.onmidimessage = (event) => {
        const [status, noteNum, velocity] = event.data;
        const cmd = status >> 4;
        if (cmd === 9 && velocity > 0) { // Note On
          const noteName = midiToNoteName(noteNum);
          handlePlayedNote(noteName, midiToFreq(noteNum), 0);
        }
      };
    });
    console.log("Web MIDI verbonden!");
  } catch (e) {
    console.error("MIDI toegang fout:", e);
  }
}

// Switch Audio Source
async function switchAudioSource(source) {
  if (source === "browser-mic") {
    await initBrowserMic();
  } else if (source === "python-mic") {
    initPythonWs();
  } else if (source === "web-midi") {
    await initWebMidi();
  }
}

// Build Full 88-Key Interactive Piano Keyboard (A0 to C8)
function buildPianoKeys() {
  const pianoKeysContainer = document.getElementById("piano-keys");
  if (!pianoKeysContainer) return;
  pianoKeysContainer.innerHTML = "";
  
  // 52 White keys: A0, B0, octaves 1 through 7 (C..B), and C8
  const whiteNotes = ['A0', 'B0'];
  for (let oct = 1; oct <= 7; oct++) {
    ['C', 'D', 'E', 'F', 'G', 'A', 'B'].forEach(n => whiteNotes.push(`${n}${oct}`));
  }
  whiteNotes.push('C8');
  
  const totalWhite = whiteNotes.length; // Exactly 52 white keys
  
  // 36 Black keys mapping:
  // A#0 follows A0 (idx 0)
  // In octaves 1..7: C#, D#, F#, G#, A#
  const blackKeysDef = [
    { note: 'A#0', afterWhiteIdx: 0 }
  ];
  
  for (let oct = 1; oct <= 7; oct++) {
    const cIdx = 2 + (oct - 1) * 7;
    blackKeysDef.push({ note: `C#${oct}`, afterWhiteIdx: cIdx });     // after C
    blackKeysDef.push({ note: `D#${oct}`, afterWhiteIdx: cIdx + 1 }); // after D
    blackKeysDef.push({ note: `F#${oct}`, afterWhiteIdx: cIdx + 3 }); // after F
    blackKeysDef.push({ note: `G#${oct}`, afterWhiteIdx: cIdx + 4 }); // after G
    blackKeysDef.push({ note: `A#${oct}`, afterWhiteIdx: cIdx + 5 }); // after A
  }
  // Total: 52 white keys + 36 black keys = 88 keys
  
  // Create White Keys
  whiteNotes.forEach((wn, idx) => {
    const key = document.createElement("div");
    key.className = "white-key";
    key.dataset.note = wn;
    key.dataset.midi = noteNameToMidi(wn);
    
    const label = document.createElement("span");
    label.className = "key-label";
    const showLabels = localStorage.getItem("hanon_show_labels") !== "false";
    label.style.display = showLabels ? "block" : "none";
    
    const middleCText = (window.I18N && window.I18N.t("middle_c_key")) || "C4 (Midden)";
    if (wn === "C4") {
      key.classList.add("middle-c");
      label.classList.add("middle-c-marker");
      label.textContent = middleCText;
    } else if (wn.startsWith("C") || wn === "A0" || wn === "C8") {
      label.classList.add("c-marker");
      label.textContent = wn;
    } else {
      label.textContent = wn;
    }
    key.appendChild(label);
    
    key.addEventListener("click", () => {
      playPianoTone(noteNameToMidi(wn), 0.3);
      handlePlayedNote(wn, midiToFreq(noteNameToMidi(wn)), 0);
    });
    
    pianoKeysContainer.appendChild(key);
  });
  
  // Create Black Keys centered precisely over white keys
  blackKeysDef.forEach(bDef => {
    const bkey = document.createElement("div");
    bkey.className = "black-key";
    bkey.dataset.note = bDef.note;
    bkey.dataset.midi = noteNameToMidi(bDef.note);
    
    // Position percentage relative to 52 white keys
    const leftPct = ((bDef.afterWhiteIdx + 1) / totalWhite) * 100;
    bkey.style.left = `calc(${leftPct}% - (100% / ${totalWhite} * 0.325))`;
    bkey.style.width = `calc(100% / ${totalWhite} * 0.65)`;
    
    bkey.addEventListener("click", (e) => {
      e.stopPropagation();
      playPianoTone(noteNameToMidi(bDef.note), 0.3);
      handlePlayedNote(bDef.note, midiToFreq(noteNameToMidi(bDef.note)), 0);
    });
    
    pianoKeysContainer.appendChild(bkey);
  });

  // Create Hand Zone Bracket overlays inside piano-keys container
  const bracketLh = document.createElement("div");
  bracketLh.id = "piano-bracket-lh";
  bracketLh.className = "piano-hand-bracket bracket-lh";
  bracketLh.style.display = "none";
  pianoKeysContainer.appendChild(bracketLh);

  const bracketRh = document.createElement("div");
  bracketRh.id = "piano-bracket-rh";
  bracketRh.className = "piano-hand-bracket bracket-rh";
  bracketRh.style.display = "none";
  pianoKeysContainer.appendChild(bracketRh);

  // Create Animated Hands SVG overlay
  let handsSvg = document.getElementById("piano-animated-hands-svg");
  if (!handsSvg) {
    handsSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    handsSvg.id = "piano-animated-hands-svg";
    handsSvg.setAttribute("class", "piano-animated-hands-overlay");
    pianoKeysContainer.appendChild(handsSvg);
  }

  // Auto-center 88-key piano on Middle C (C4) so user immediately sees playable range
  requestAnimationFrame(() => {
    const c4Key = pianoKeysContainer.querySelector('[data-note="C4"]');
    if (c4Key) {
      centerKeyInPianoView(c4Key);
    }
  });
}

// Build Scrolling Hand Placement Guide
function buildHandPlacementGuide() {
  const track = document.getElementById("hand-placement-track");
  if (!track || !state.hanonData || !state.hanonData.measures) return;
  track.innerHTML = "";
  state.measureGuideMap = {};

  state.hanonData.measures.forEach(m => {
    const card = document.createElement("div");
    card.className = "measure-guide-card";
    card.dataset.measure = m.measure;
    
    // Compute LH & RH fingers and notes
    const rhFingers = {};
    const lhFingers = {};

    m.notes.forEach(n => {
      if (n.rh) rhFingers[n.rh.finger] = n.rh.note;
      if (n.lh) lhFingers[n.lh.finger] = n.lh.note;
    });

    const dirIcon = m.type === "descending" ? "↘️ Dalend" : (m.type === "final" ? "🏁 Slot" : "↗️ Stijgend");
    
    let cue = "";
    if (m.type === "final") {
      cue = "Rustige slotcadans op grondtoon C.";
    } else if (m.measure === 15) {
      cue = state.currentExerciseId === "ex2" 
        ? "Keerpunt naar dalend! Vinger 3 & 4 linkerhand."
        : "Keerpunt! Pink op G5, vinger 4 tertsval.";
    } else if (m.measure === 1) {
      cue = state.currentExerciseId === "ex2"
        ? "Spreiding 1-2 & 3-4 wip (C3-E3)."
        : "Spreiding 1-2 (C3-E3), vlakke pols.";
    } else if (m.type === "ascending") {
      cue = `Stijgende sequentie maat ${m.measure}.`;
    } else {
      cue = `Dalende sequentie maat ${m.measure}.`;
    }

    card.innerHTML = `
      <div class="measure-card-header">
        <span>Maat ${m.measure}</span>
        <span class="measure-card-dir">${dirIcon}</span>
      </div>
      <div class="hand-placement-hand-row">
        <span class="hand-label">🤚 RH:</span>
        <div class="finger-chips" data-hand="rh">
          ${[1, 2, 3, 4, 5].map(f => `
            <div class="finger-chip" data-finger="${f}">
              <span class="f-num">${f}</span>
              <span class="f-note">${rhFingers[f] || '-'}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="hand-placement-hand-row">
        <span class="hand-label">✋ LH:</span>
        <div class="finger-chips" data-hand="lh">
          ${[5, 4, 3, 2, 1].map(f => `
            <div class="finger-chip" data-finger="${f}">
              <span class="f-num">${f}</span>
              <span class="f-note">${lhFingers[f] || '-'}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="measure-pedagogical-tip">${cue}</div>
    `;

    card.addEventListener("click", () => {
      jumpToMeasure(m.measure);
    });

    track.appendChild(card);
    state.measureGuideMap[m.measure] = card;
  });
}

// Center card smoothly in hand guide scroll container without page jump
function centerCardInHandGuideView(cardEl) {
  const container = document.getElementById("hand-placement-scroll");
  if (!container || !cardEl) return;
  const targetLeft = cardEl.offsetLeft - (container.clientWidth / 2) + (cardEl.offsetWidth / 2);
  container.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
}

// Update Active Measure & Finger in Hand Placement Guide
function updateHandPlacementGuide(currentItem) {
  if (!currentItem) return;
  const mNum = currentItem.measure;
  
  // Highlight active card
  document.querySelectorAll(".measure-guide-card").forEach(c => {
    c.classList.remove("active-measure-card");
  });
  
  const activeCard = state.measureGuideMap ? state.measureGuideMap[mNum] : null;
  if (activeCard) {
    activeCard.classList.add("active-measure-card");
    centerCardInHandGuideView(activeCard);
    
    // Clear all active fingers
    activeCard.querySelectorAll(".finger-chip").forEach(fc => fc.classList.remove("active-finger"));
    
    // Highlight current active finger
    if (state.currentHand === "rh" || state.currentHand === "both") {
      const rhChip = activeCard.querySelector(`.finger-chips[data-hand="rh"] .finger-chip[data-finger="${currentItem.rh.finger}"]`);
      if (rhChip) rhChip.classList.add("active-finger");
    }
    if (state.currentHand === "lh" || state.currentHand === "both") {
      const lhChip = activeCard.querySelector(`.finger-chips[data-hand="lh"] .finger-chip[data-finger="${currentItem.lh.finger}"]`);
      if (lhChip) lhChip.classList.add("active-finger");
    }
  }

  // Update summary line
  const summaryEl = document.getElementById("active-measure-summary");
  if (summaryEl && currentItem) {
    summaryEl.textContent = `Maat ${mNum}: RH vinger ${currentItem.rh.finger} (${currentItem.rh.note}) • LH vinger ${currentItem.lh.finger} (${currentItem.lh.note})`;
  }
}

// Jump to a specific measure when clicked in Hand Guide
function jumpToMeasure(mNum) {
  if (!state.activeNotesQueue) return;
  const targetIdx = state.activeNotesQueue.findIndex(n => n.measure === mNum);
  if (targetIdx !== -1) {
    state.currentNoteIndex = targetIdx;
    updateTargetDisplay();
  }
}

// Modal management
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("open");
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("open");
}

// Open History Modal
async function openHistoryModal() {
  try {
    let history = null;
    try {
      const res = await fetch("/api/history");
      if (res.ok) history = await res.json();
    } catch (e) {}
    
    if (!history) {
      history = JSON.parse(localStorage.getItem("hanon_piano_sessions") || "[]");
    }

    const tbody = document.getElementById("history-table-body");
    tbody.innerHTML = "";
    
    if (!history || history.length === 0) {
      const emptyMsg = (window.I18N && window.I18N.t("history_empty")) || "Nog geen sessies opgeslagen. Speel een les om je voortgang te zien!";
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--text-muted);">${emptyMsg}</td></tr>`;
    } else {
      const langLocale = (window.I18N && window.I18N.currentLang === "en") ? "en-US" : (window.I18N && window.I18N.currentLang === "de") ? "de-DE" : (window.I18N && window.I18N.currentLang === "fr") ? "fr-FR" : (window.I18N && window.I18N.currentLang === "es") ? "es-ES" : "nl-NL";
      history.forEach(item => {
        const dateStr = item.timestamp ? new Date(item.timestamp).toLocaleString(langLocale, {
          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
        }) : "-";
        const exName = item.exercise_id ? `Ex. ${item.exercise_id.replace('ex', '')}` : "Ex. 1";
        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid var(--border-color)";
        tr.innerHTML = `
          <td style="padding: 10px;">${dateStr}</td>
          <td style="padding: 10px;"><span class="badge badge-cyan">${exName}</span></td>
          <td style="padding: 10px; font-weight: 600;">${(item.lesson_id || "les").toUpperCase()}</td>
          <td style="padding: 10px;">${(item.hand || "rh").toUpperCase()}</td>
          <td style="padding: 10px;">
            <span style="color: var(--accent-green); font-weight: 700;">${item.correct_notes || 0}</span> / 
            <span style="color: var(--accent-red); font-weight: 700;">${item.wrong_notes || 0}</span>
          </td>
          <td style="padding: 10px; font-weight: 800; color: var(--accent-gold);">${item.accuracy || 100}%</td>
        `;
        tbody.appendChild(tr);
      });
    }
    openModal("history-modal");
  } catch (err) {
    console.error("Fout bij ophalen historie:", err);
  }
}

// Open Telemetry & Course Improvement Insights Modal
async function openInsightsModal() {
  try {
    let data = null;
    try {
      const res = await fetch(`/api/telemetry/insights?exercise=${state.currentExerciseId}`);
      if (res.ok) data = await res.json();
    } catch(e) {}
    
    if (!data) {
      const sessions = JSON.parse(localStorage.getItem("hanon_piano_sessions") || "[]");
      const exSessions = sessions.filter(s => s.exercise_id === state.currentExerciseId);
      const totalNotes = exSessions.reduce((acc, s) => acc + (s.total_notes || 0), 0);
      const avgAcc = exSessions.length ? Math.round(exSessions.reduce((acc, s) => acc + (s.accuracy || 0), 0) / exSessions.length) : 100;
      data = {
        total_notes_played: totalNotes,
        avg_accuracy: avgAcc,
        avg_latency_ms: 275,
        hesitation_rate_pct: 3,
        bottlenecks: [],
        recommendations: [
          "Oefen met de ingebouwde metronoom op 60 BPM om vingergelijkmatigheid te bereiken.",
          "Houd de pols soepel en til de vingers onafhankelijk op volgens Hanon's instructies."
        ]
      };
    }
    
    document.getElementById("ins-total-notes").textContent = data.total_notes_played || 0;
    document.getElementById("ins-avg-acc").textContent = `${data.avg_accuracy || 100}%`;
    document.getElementById("ins-avg-latency").textContent = `${Math.round(data.avg_latency_ms || 350)} ms`;
    document.getElementById("ins-hesitation").textContent = `${data.hesitation_rate_pct || 0}%`;
    
    // Bottlenecks list
    const bList = document.getElementById("ins-bottlenecks-list");
    bList.innerHTML = "";
    const mWord = (window.I18N && window.I18N.t("measure_word")) || "Maat";
    if (data.bottlenecks && data.bottlenecks.length > 0) {
      data.bottlenecks.forEach(b => {
        const row = document.createElement("div");
        row.className = "bottleneck-row";
        row.innerHTML = `
          <span><strong>${mWord} ${b.measure}</strong></span>
          <span style="color: var(--accent-red); font-weight: 700;">${b.errors} errors</span>
          <span style="color: var(--accent-cyan); font-weight: 600;">${Math.round(b.avg_latency_ms)} ms</span>
        `;
        bList.appendChild(row);
      });
    } else {
      const emptyBottlenecks = (window.I18N && window.I18N.t("insights_empty_bottlenecks")) || "Nog geen significante knelpunten gedetecteerd. Blijf spelen om data te verzamelen!";
      bList.innerHTML = `<div style="color: var(--text-muted); font-size: 12px; padding: 6px;">${emptyBottlenecks}</div>`;
    }
    
    // Recommendations list
    const rList = document.getElementById("ins-recommendations-list");
    rList.innerHTML = "";
    if (data.recommendations && data.recommendations.length > 0) {
      data.recommendations.forEach(r => {
        const row = document.createElement("div");
        row.className = "recommendation-row";
        row.innerHTML = `💡 ${r}`;
        rList.appendChild(row);
      });
    }
    
    openModal("insights-modal");
  } catch (err) {
    console.error("Fout bij ophalen inzichten:", err);
  }
}

// ==========================================================================
// Hoofdmenu & Voortgang Dashboard Implementation
// ==========================================================================
function getLessonProgressMap() {
  const progress = {};
  try {
    const sessions = JSON.parse(localStorage.getItem("hanon_piano_sessions") || "[]");
    sessions.forEach(s => {
      if (!s.exercise_id || !s.lesson_id) return;
      const key = `${s.exercise_id}_${s.lesson_id}`;
      const acc = s.accuracy || 0;
      const stars = acc >= 98 ? 5 : (acc >= 90 ? 4 : (acc >= 75 ? 3 : (acc >= 60 ? 2 : 1)));
      if (!progress[key]) {
        progress[key] = {
          completed: acc >= 60,
          best_accuracy: acc,
          stars: stars,
          best_bpm: s.bpm || 60,
          attempts: 1,
          last_played: s.timestamp
        };
      } else {
        progress[key].attempts += 1;
        if (acc > progress[key].best_accuracy) {
          progress[key].best_accuracy = acc;
          progress[key].stars = stars;
        }
        if (acc >= 60) progress[key].completed = true;
        if ((s.bpm || 60) > progress[key].best_bpm) progress[key].best_bpm = s.bpm;
      }
    });
  } catch(e) {}
  return progress;
}

function getBookExercises(book) {
  if (!book || !state.exercises || !state.exercises.length) return [];
  if (book.id === "czerny-599") {
    return state.exercises.filter(e => e.book === "czerny-599" || e.id.startsWith("cz"));
  }
  if (book.id === "bach-first") {
    return state.exercises.filter(e => e.book === "bach-first" || e.id.startsWith("bach"));
  }
  if (book.id === "hanon-part1") {
    return state.exercises.filter(e => (e.book === "hanon-part1" || (!e.book && e.id.startsWith("ex"))) && e.number >= 1 && e.number <= 20);
  }
  if (book.id === "hanon-part2") {
    return state.exercises.filter(e => (e.book === "hanon-part2" || (!e.book && e.id.startsWith("ex"))) && e.number >= 21 && e.number <= 43);
  }
  if (book.id === "hanon-part3") {
    return state.exercises.filter(e => (e.book === "hanon-part3" || (!e.book && e.id.startsWith("ex"))) && e.number >= 44 && e.number <= 60);
  }
  return state.exercises;
}

function getBookProgress(book) {
  const progressMap = getLessonProgressMap();
  const allLessons = state.allLessonsMap || {};
  let completed = 0;
  let total = 0;

  const bookExs = getBookExercises(book);
  bookExs.forEach(ex => {
    const lessons = allLessons[ex.id] || [];
    total += lessons.length;
    lessons.forEach(l => {
      const prog = progressMap[`${ex.id}_${l.id}`];
      if (prog && prog.completed) completed += 1;
    });
  });

  const totalCount = total || book.totalLessons || 1;
  const pct = Math.round((completed / totalCount) * 100);
  return { completed, total: totalCount, pct };
}

function renderBooksHub() {
  const grid = document.getElementById("books-catalog-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const t = (k, def) => {
    if (window.I18N) {
      const trans = window.I18N.t(k);
      if (trans && trans !== k) return trans;
    }
    return def;
  };

  BOOKS_CATALOG.forEach((book, bIdx) => {
    const prog = getBookProgress(book);
    const title = t(book.titleKey, book.fullTitle);
    const badge = t(book.badgeKey, book.defaultBadge);
    const desc = t(book.descKey, book.defaultDesc);
    const openLabel = t("btn_open_book", "▶️ Start Methode");
    const progressTxt = (window.I18N && window.I18N.t("book_progress_fmt", {
      done: prog.completed,
      total: prog.total,
      pct: prog.pct
    })) || `${prog.completed} / ${prog.total} lessen (${prog.pct}%)`;

    const card = document.createElement("div");
    card.className = `netflix-book-card book-card ${book.id === state.currentBookId ? 'active-book-card' : ''}`;
    card.dataset.bookId = book.id;

    // Determine Netflix-style cover motif
    let coverThemeClass = "theme-sapphire";
    let genreTag = "Techniek";
    let levelTag = "Beginner";
    if (book.id === "hanon-part1") {
      coverThemeClass = "theme-sapphire";
      genreTag = "Essentiële Basis";
      levelTag = "Niveau 1";
    } else if (book.id === "hanon-part2") {
      coverThemeClass = "theme-amethyst";
      genreTag = "Toonladders & Akkoorden";
      levelTag = "Niveau 2";
    } else if (book.id === "hanon-part3") {
      coverThemeClass = "theme-amber";
      genreTag = "Concertvirtuositeit";
      levelTag = "Niveau 3";
    } else if (book.id === "czerny-599") {
      coverThemeClass = "theme-emerald";
      genreTag = "100 Melodische Etudes";
      levelTag = "Alle Niveaus";
    } else if (book.id === "bach-first") {
      coverThemeClass = "theme-ruby";
      genreTag = "Barok Meesterrepertoire";
      levelTag = "Klassiek";
    }

    card.innerHTML = `
      <div class="netflix-card-poster ${coverThemeClass}">
        <div class="poster-overlay-glow"></div>
        <div class="poster-badge-row">
          <span class="poster-badge-pill">${genreTag}</span>
          <span class="poster-level-pill">${levelTag}</span>
        </div>
        <div class="poster-icon-center">${book.icon}</div>
        <div class="poster-hover-play">
          <div class="netflix-play-trigger">▶</div>
        </div>
        <div class="poster-author-label">${book.author}</div>
      </div>

      <div class="netflix-card-body">
        <h3 class="netflix-card-title">${title}</h3>
        <p class="netflix-card-desc">${desc}</p>

        <div class="netflix-card-progress">
          <div class="netflix-progress-track">
            <div class="netflix-progress-fill" style="width: ${prog.pct}%;"></div>
          </div>
          <div class="netflix-progress-meta">
            <span class="netflix-progress-pct">${prog.pct}% voltooid</span>
            <span class="netflix-progress-count">${prog.completed}/${prog.total} lessen</span>
          </div>
        </div>

        <div class="netflix-card-footer">
          <button type="button" class="btn btn-primary btn-block btn-netflix-action" data-book-id="${book.id}">
            ${openLabel}
          </button>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      openBook(book.id);
    });

    const btnAction = card.querySelector(".btn-netflix-action");
    if (btnAction) {
      btnAction.addEventListener("click", (e) => {
        e.stopPropagation();
        openBook(book.id);
      });
    }

    grid.appendChild(card);
  });
}

function openBook(bookId) {
  const book = BOOKS_CATALOG.find(b => b.id === bookId) || BOOKS_CATALOG[0];
  state.currentBookId = book.id;
  localStorage.setItem("hanon_current_book", book.id);

  const bookExs = getBookExercises(book);
  if (bookExs.length > 0) {
    const curInBook = bookExs.find(e => e.id === state.currentExerciseId);
    if (!curInBook) {
      const firstEx = bookExs[0];
      state.currentExerciseId = firstEx.id;
      const allLessons = state.allLessonsMap || {};
      const lessons = allLessons[firstEx.id] || [];
      state.currentLessonId = lessons.length > 0 ? lessons[0].id : (firstEx.id === "ex1" ? "les-1" : `les-${firstEx.id}-1`);
    }
  }

  toggleView("menu");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function initMainMenu() {
  const brandHome = document.getElementById("brand-home-link");
  if (brandHome) {
    brandHome.addEventListener("click", () => toggleView("hub"));
  }

  const btnNavHub = document.getElementById("btn-nav-hub");
  if (btnNavHub) {
    btnNavHub.addEventListener("click", () => toggleView("hub"));
  }

  const btnNavMenu = document.getElementById("btn-nav-menu");
  if (btnNavMenu) {
    btnNavMenu.addEventListener("click", () => toggleView("menu"));
  }

  const btnNavTutor = document.getElementById("btn-nav-tutor");
  if (btnNavTutor) {
    btnNavTutor.addEventListener("click", () => toggleView("tutor"));
  }

  const btnBackToBooks = document.getElementById("btn-back-to-books");
  if (btnBackToBooks) {
    btnBackToBooks.addEventListener("click", () => toggleView("hub"));
  }

  const hubBtnStartPrimary = document.getElementById("hub-btn-start-primary");
  if (hubBtnStartPrimary) {
    hubBtnStartPrimary.addEventListener("click", () => openBook("hanon-part1"));
  }

  const hubBtnScrollBooks = document.getElementById("hub-btn-scroll-books");
  if (hubBtnScrollBooks) {
    hubBtnScrollBooks.addEventListener("click", (e) => {
      e.preventDefault();
      const sec = document.getElementById("books-catalog-section");
      if (sec) sec.scrollIntoView({ behavior: "smooth" });
    });
  }

  const btnToggle = document.getElementById("btn-toggle-menu");
  if (btnToggle) {
    btnToggle.addEventListener("click", () => {
      toggleView(state.currentView === "tutor" ? "menu" : "tutor");
    });
  }

  const btnResume = document.getElementById("menu-btn-resume");
  if (btnResume) {
    btnResume.addEventListener("click", () => {
      toggleView("tutor");
    });
  }

  const btnRestart = document.getElementById("menu-btn-restart-ex1");
  if (btnRestart) {
    btnRestart.addEventListener("click", async () => {
      const book = BOOKS_CATALOG.find(b => b.id === state.currentBookId) || BOOKS_CATALOG[0];
      const startEx = book.startExId || "ex1";
      const startLes = book.startLessonId || "les-1";
      await selectExerciseAndLesson(startEx, startLes);
    });
  }

  const modalBtnMenu = document.getElementById("modal-btn-menu");
  if (modalBtnMenu) {
    modalBtnMenu.addEventListener("click", () => {
      closeModal("score-modal");
      toggleView("menu");
    });
  }

  // Filter toolbar
  const filterBtns = document.querySelectorAll("#menu-filter-group button");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderMainMenu(btn.dataset.filter);
    });
  });
}

function toggleView(viewName) {
  state.currentView = viewName;
  const hubView = document.getElementById("view-books-hub");
  const menuView = document.getElementById("view-main-menu");
  const tutorView = document.getElementById("view-tutor");
  const toggleBtnText = document.getElementById("toggle-menu-text");
  const toggleBtnIcon = document.getElementById("toggle-menu-icon");

  const btnNavHub = document.getElementById("btn-nav-hub");
  const btnNavMenu = document.getElementById("btn-nav-menu");
  const btnNavTutor = document.getElementById("btn-nav-tutor");

  if (btnNavHub) btnNavHub.classList.toggle("active", viewName === "hub");
  if (btnNavMenu) btnNavMenu.classList.toggle("active", viewName === "menu");
  if (btnNavTutor) btnNavTutor.classList.toggle("active", viewName === "tutor");

  if (viewName === "hub") {
    document.body.classList.add("in-menu-view", "in-hub-view");
    if (hubView) hubView.style.display = "block";
    if (menuView) menuView.style.display = "none";
    if (tutorView) tutorView.style.display = "none";
    if (toggleBtnText) toggleBtnText.textContent = (window.I18N && window.I18N.t("btn_to_tutor")) || "Naar Oefening";
    if (toggleBtnIcon) toggleBtnIcon.textContent = "🎹";
    renderBooksHub();
  } else if (viewName === "menu") {
    document.body.classList.add("in-menu-view");
    document.body.classList.remove("in-hub-view");
    if (hubView) hubView.style.display = "none";
    if (menuView) menuView.style.display = "block";
    if (tutorView) tutorView.style.display = "none";
    if (toggleBtnText) toggleBtnText.textContent = (window.I18N && window.I18N.t("btn_to_tutor")) || "Naar Oefening";
    if (toggleBtnIcon) toggleBtnIcon.textContent = "🎹";
    renderMainMenu();
  } else {
    document.body.classList.remove("in-menu-view", "in-hub-view");
    if (hubView) hubView.style.display = "none";
    if (menuView) menuView.style.display = "none";
    if (tutorView) tutorView.style.display = "flex";
    if (toggleBtnText) toggleBtnText.textContent = (window.I18N && window.I18N.t("btn_to_menu")) || "Hoofdmenu";
    if (toggleBtnIcon) toggleBtnIcon.textContent = "🏠";
  }
}

async function selectExerciseAndLesson(exerciseId, lessonId) {
  const targetEx = state.exercises.find(e => e.id === exerciseId);
  if (targetEx) {
    if (targetEx.book) {
      state.currentBookId = targetEx.book;
    } else if (targetEx.id.startsWith("cz")) {
      state.currentBookId = "czerny-599";
    } else if (targetEx.id.startsWith("bach")) {
      state.currentBookId = "bach-first";
    } else if (targetEx.number <= 20) {
      state.currentBookId = "hanon-part1";
    } else if (targetEx.number <= 43) {
      state.currentBookId = "hanon-part2";
    } else {
      state.currentBookId = "hanon-part3";
    }
    localStorage.setItem("hanon_current_book", state.currentBookId);
  }

  if (state.currentExerciseId !== exerciseId) {
    await switchExercise(exerciseId);
  } else {
    populateExerciseSelect();
  }
  
  if (lessonId) {
    state.currentLessonId = lessonId;
    const lSel = document.getElementById("lesson-select");
    if (lSel) lSel.value = lessonId;
    loadLesson(lessonId);
  }
  
  toggleView("tutor");
}

function renderMainMenu(filter = "all") {
  const grid = document.getElementById("menu-exercises-grid");
  if (!grid || !state.exercises.length) return;

  const t = (k, def) => (window.I18N ? window.I18N.t(k) : def);
  const book = BOOKS_CATALOG.find(b => b.id === state.currentBookId) || BOOKS_CATALOG[0];

  // Update Breadcrumb Bar
  const crumbBadge = document.getElementById("current-book-crumb-badge");
  const crumbTitle = document.getElementById("current-book-crumb-title");
  if (crumbBadge) {
    crumbBadge.textContent = t(book.shortKey, book.shortTitle);
    crumbBadge.className = `badge ${book.badgeClass}`;
  }
  if (crumbTitle) crumbTitle.textContent = t(book.titleKey, book.fullTitle);

  // Update Hero Section for this Book
  const menuBookBadge = document.getElementById("menu-book-badge");
  const menuBookTitle = document.getElementById("menu-book-title");
  const menuBookSubtitle = document.getElementById("menu-book-subtitle");
  const menuBookPdfLink = document.getElementById("menu-book-pdf-link");

  if (menuBookBadge) menuBookBadge.textContent = t(book.badgeKey, book.defaultBadge);
  if (menuBookTitle) menuBookTitle.textContent = t(book.titleKey, book.fullTitle);
  if (menuBookSubtitle) menuBookSubtitle.textContent = t(book.descKey, book.defaultDesc);
  if (menuBookPdfLink) menuBookPdfLink.href = `./${encodeURIComponent(book.pdfFile)}`;

  const progressMap = getLessonProgressMap();
  const allLessons = state.allLessonsMap || {};

  // Retrieve exercises for this specific book
  const bookExercises = getBookExercises(book);
  const bookExIds = new Set(bookExercises.map(e => e.id));

  // Compute stats across this book
  let totalLessonsCount = 0;
  let completedCount = 0;
  let totalStars = 0;
  let sumAcc = 0;
  let accCount = 0;
  let totalNotesPlayed = 0;

  try {
    const sessions = JSON.parse(localStorage.getItem("hanon_piano_sessions") || "[]");
    sessions.forEach(s => {
      if (s.exercise_id && bookExIds.has(s.exercise_id)) {
        totalNotesPlayed += (s.correct_notes || 0) + (s.wrong_notes || 0);
      }
    });
  } catch(e) {}

  bookExercises.forEach(ex => {
    const lessons = allLessons[ex.id] || [];
    totalLessonsCount += lessons.length;
    lessons.forEach(l => {
      const prog = progressMap[`${ex.id}_${l.id}`];
      if (prog && prog.completed) {
        completedCount += 1;
        totalStars += prog.stars || 0;
        sumAcc += prog.best_accuracy || 0;
        accCount += 1;
      }
    });
  });

  const avgAccuracy = accCount > 0 ? Math.round(sumAcc / accCount) : 100;

  // Update Hero Stats
  const statCompleted = document.getElementById("menu-stat-completed");
  const statCompletedBar = document.getElementById("menu-stat-completed-bar");
  const statStars = document.getElementById("menu-stat-stars");
  const statAcc = document.getElementById("menu-stat-accuracy");
  const statNotes = document.getElementById("menu-stat-notes");

  if (statCompleted) statCompleted.textContent = `${completedCount} / ${totalLessonsCount || book.totalLessons}`;
  if (statCompletedBar) {
    const pct = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;
    statCompletedBar.style.width = `${pct}%`;
  }
  if (statStars) statStars.textContent = `${totalStars} ⭐`;
  if (statAcc) statAcc.textContent = `${avgAccuracy}%`;
  const langLocale = (window.I18N && window.I18N.currentLang === "en") ? "en-US" : (window.I18N && window.I18N.currentLang === "de") ? "de-DE" : (window.I18N && window.I18N.currentLang === "fr") ? "fr-FR" : (window.I18N && window.I18N.currentLang === "es") ? "es-ES" : "nl-NL";
  if (statNotes) statNotes.textContent = totalNotesPlayed.toLocaleString(langLocale);

  // Filter exercises (inside this book)
  let visibleExercises = bookExercises;
  if (filter === "started") {
    visibleExercises = bookExercises.filter(e => {
      const lessons = allLessons[e.id] || [];
      return lessons.some(l => progressMap[`${e.id}_${l.id}`]);
    });
  }

  grid.innerHTML = "";

  visibleExercises.forEach(ex => {
    const lessons = allLessons[ex.id] || [];
    let exCompleted = 0;
    lessons.forEach(l => {
      if (progressMap[`${ex.id}_${l.id}`] && progressMap[`${ex.id}_${l.id}`].completed) {
        exCompleted += 1;
      }
    });
    const exPct = lessons.length > 0 ? Math.round((exCompleted / lessons.length) * 100) : 0;
    const isCurrent = (ex.id === state.currentExerciseId);

    const card = document.createElement("div");
    card.className = `menu-ex-card ${isCurrent ? 'active-ex-card' : ''}`;

    let focus = "";
    if (ex.subtitle && ex.subtitle.includes("(")) {
      focus = ex.subtitle.split("(")[1].replace(")", "");
    }

    let exBadge = `Oefening N°${ex.number}`;
    let exTitle = ex.name;
    if (ex.id.startsWith("cz") || ex.book === "czerny-599") {
      exBadge = `Etude N°${ex.number}`;
      exTitle = ex.name;
    } else if (ex.id.startsWith("bach") || ex.book === "bach-first") {
      exBadge = `Stuk N°${ex.number}`;
      exTitle = ex.name;
    } else if (window.I18N) {
      exBadge = window.I18N.t("exercise_badge_fmt", { num: ex.number }) || `Oefening N°${ex.number}`;
      exTitle = window.I18N.t("exercise_name_fmt", { num: ex.number }) || ex.name;
    }

    const focusSub = focus
      ? ((window.I18N && window.I18N.t("finger_focus_fmt", { focus })) || `Vingerfocus: ${focus}`)
      : (ex.subtitle || "");
    const progressTxt = (window.I18N && window.I18N.t("lessons_progress_fmt", { done: exCompleted, total: lessons.length, pct: exPct }))
      || `${exCompleted} / ${lessons.length} lessen (${exPct}%)`;

    card.innerHTML = `
      <div class="menu-ex-card-header">
        <div>
          <span class="menu-ex-badge">${exBadge}</span>
          <h3 class="menu-ex-title">${exTitle}</h3>
          <p class="menu-ex-sub">${focusSub}</p>
        </div>
      </div>

      <div class="menu-ex-progress-bar">
        <div class="menu-progress-track">
          <div class="menu-progress-fill" style="width: ${exPct}%;"></div>
        </div>
        <span class="menu-progress-text">${progressTxt}</span>
      </div>

      <div class="menu-lessons-list">
        ${lessons.map((l, idx) => {
          const prog = progressMap[`${ex.id}_${l.id}`];
          const isLCurrent = (isCurrent && l.id === state.currentLessonId);
          let starHtml = (window.I18N && window.I18N.t("not_played")) || "⚪ Niet gespeeld";
          let actionLabel = (window.I18N && window.I18N.t("btn_start_lesson")) || "▶️ Start";
          let btnClass = "btn-outline";

          if (prog && prog.completed) {
            const starsStr = "⭐".repeat(prog.stars || 3);
            starHtml = `<span class="text-gold">${starsStr}</span> <span class="menu-lesson-accuracy">${prog.best_accuracy}%</span>`;
            actionLabel = (window.I18N && window.I18N.t("btn_retry_lesson")) || "🔄 Opnieuw";
            btnClass = "btn-secondary";
          } else if (prog && prog.attempts > 0) {
            starHtml = `<span class="text-red">(${prog.best_accuracy}%)</span>`;
            actionLabel = (window.I18N && window.I18N.t("btn_start_lesson")) || "▶️ Start";
            btnClass = "btn-primary";
          }

          const lesTitle = getLessonDisplayTitle(l, idx);
          
          const rangeStr = (window.I18N && l.start_measure && l.end_measure)
            ? window.I18N.t("measures_range_fmt", { start: l.start_measure, end: l.end_measure })
            : l.subtitle;
          const notesStr = (window.I18N && window.I18N.t("notes_count_fmt", { count: l.total_notes }))
            || `${l.total_notes} noten`;
          const bpmStr = (window.I18N && window.I18N.t("recommended_bpm_fmt", { bpm: l.recommended_bpm }))
            || `Aanbevolen ${l.recommended_bpm} BPM`;

          return `
            <div class="menu-lesson-row ${isLCurrent ? 'active-lesson' : ''}" data-ex="${ex.id}" data-lesson="${l.id}">
              <div class="menu-lesson-meta">
                <span class="menu-lesson-name">${lesTitle}</span>
                <span class="menu-lesson-details">${rangeStr} • ${notesStr} • ${bpmStr}</span>
              </div>
              <div class="menu-lesson-right">
                <span class="menu-lesson-stars">${starHtml}</span>
                <button type="button" class="btn btn-sm ${btnClass} menu-lesson-btn" data-ex="${ex.id}" data-lesson="${l.id}">
                  ${actionLabel}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Row click listeners
    card.querySelectorAll(".menu-lesson-row, .menu-lesson-btn").forEach(el => {
      el.addEventListener("click", async (e) => {
        e.stopPropagation();
        const exId = el.dataset.ex;
        const lessonId = el.dataset.lesson;
        await selectExerciseAndLesson(exId, lessonId);
      });
    });

    grid.appendChild(card);
  });
}
