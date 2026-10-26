/**
 * Hanon Piano Tutor - Full Frontend Engine
 * Real-time audio pitch detection, sheet music follower, 88-key virtual piano,
 * scrolling hand placement guide, and continuous course improvement telemetry.
 */

// Global App State
const state = {
  currentExerciseId: "ex1",
  exercises: [],
  hanonData: null,
  lessons: [],
  currentLessonId: "les-1",
  currentHand: "rh", // 'rh', 'lh', 'both'
  currentMode: "wait", // 'wait', 'tempo'
  bpm: 60,
  metronomeOn: true,
  audioSource: "browser-mic", // 'browser-mic', 'python-mic', 'web-midi', 'virtual'
  sensitivity: 12,
  currentView: "menu", // 'menu', 'tutor'
  
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

// Finger name translation (Dutch)
function getFingerName(fingerNum) {
  switch (fingerNum) {
    case 1: return "1 (Duim)";
    case 2: return "2 (Wijsvinger)";
    case 3: return "3 (Middelvinger)";
    case 4: return "4 (Ringvinger)";
    case 5: return "5 (Pink)";
    default: return `${fingerNum}`;
  }
}

// Initialize Application
document.addEventListener("DOMContentLoaded", async () => {
  setupUIEventListeners();
  buildPianoKeys();
  await loadData();
  setupWaveformCanvas();
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
    });
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
    populateExerciseSelect();
    
    // Preload all lessons for Main Menu Dashboard
    const allLessons = await safeFetchJson("/api/lessons/all", "./data/all_lessons.json");
    state.allLessonsMap = allLessons || {};

    await loadExerciseData(state.currentExerciseId);
    initMainMenu();

    if (window.location.hash === "#tutor") {
      toggleView("tutor");
    } else {
      toggleView("menu");
    }
  } catch (err) {
    console.error("Fout bij inladen data:", err);
  }
}

function populateExerciseSelect() {
  const sel = document.getElementById("exercise-select");
  if (!sel || !state.exercises.length) return;
  sel.innerHTML = "";

  const groupPart1 = document.createElement("optgroup");
  groupPart1.label = "Deel 1: Voorbereidende Oefeningen (1 t/m 20)";
  const groupPart2 = document.createElement("optgroup");
  groupPart2.label = "Deel 2: Gevorderde Techniek & Toonladders (21 t/m 43)";
  const groupPart3 = document.createElement("optgroup");
  groupPart3.label = "Deel 3: Virtuoze Oefeningen (44 t/m 60)";

  state.exercises.forEach(ex => {
    const opt = document.createElement("option");
    opt.value = ex.id;
    let focus = "";
    if (ex.subtitle && ex.subtitle.includes("(")) {
      focus = ` (${ex.subtitle.split("(")[1].replace(")", "")})`;
    } else if (ex.title) {
      const parts = ex.title.split(":");
      focus = parts.length > 1 ? ` (${parts[1].trim()})` : "";
    }
    opt.textContent = `🎹 ${ex.name}${focus}`;
    if (ex.id === state.currentExerciseId) opt.selected = true;

    if (ex.number <= 20) {
      groupPart1.appendChild(opt);
    } else if (ex.number <= 43) {
      groupPart2.appendChild(opt);
    } else {
      groupPart3.appendChild(opt);
    }
  });

  if (groupPart1.children.length) sel.appendChild(groupPart1);
  if (groupPart2.children.length) sel.appendChild(groupPart2);
  if (groupPart3.children.length) sel.appendChild(groupPart3);
}

async function switchExercise(exerciseId) {
  state.currentExerciseId = exerciseId;
  if (typeof gtag === "function") {
    gtag("event", "select_exercise", { exercise_id: exerciseId });
  }
  await loadExerciseData(exerciseId);
}

async function loadExerciseData(exerciseId) {
  try {
    stopDemo();
    pauseLesson();
    
    const hanonData = await safeFetchJson(`/api/hanon?exercise=${exerciseId}`, `./data/hanon_${exerciseId}.json`);
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
    
    // Update sheet title
    const sheetTitle = document.getElementById("sheet-title");
    if (sheetTitle && currentEx) {
      sheetTitle.textContent = `🎼 C. L. Hanon - The Virtuoso Pianist • ${currentEx.name}`;
    }
    
    // Update PDF link
    const pdfLink = document.getElementById("sheet-pdf-link");
    if (pdfLink && currentEx) {
      pdfLink.href = `./${encodeURIComponent(currentEx.pdf_file)}`;
    }

    // Render Dynamic Vector Sheet Music (SVG)
    const vectorWrapper = document.getElementById("sheet-vector-wrapper");
    if (vectorWrapper && window.VectorSheetRenderer && state.hanonData) {
      window.VectorSheetRenderer.render(state.hanonData, vectorWrapper);
    }
    
    // Populate lesson selector
    populateLessonSelect();
    
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
  sel.innerHTML = "";
  state.lessons.forEach((l, idx) => {
    const opt = document.createElement("option");
    opt.value = l.id;
    opt.textContent = `${l.title} (${l.subtitle})`;
    if (idx === 0) opt.selected = true;
    sel.appendChild(opt);
  });
  // Add custom option
  const customOpt = document.createElement("option");
  customOpt.value = "custom";
  customOpt.textContent = "⚙️ Vrije Selectie (Kies maten)";
  sel.appendChild(customOpt);
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
          `<strong>${lesson.title}:</strong> ${lesson.tips[0]}`;
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
  document.getElementById("start-btn-text").textContent = "Pauze";
  document.getElementById("coach-state").textContent = "AAN HET SPELEN";
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
  document.getElementById("start-btn-text").textContent = "Hervat";
  document.getElementById("coach-state").textContent = "GEPAUZEERD";
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
  let handName = "Rechterhand";
  
  if (state.currentHand === "lh") {
    targetNote = currentItem.lh.note;
    targetMidi = currentItem.lh.midi;
    targetFinger = currentItem.lh.finger;
    handIcon = "✋";
    handName = "Linkerhand";
  } else if (state.currentHand === "both") {
    targetNote = `${currentItem.lh.note} + ${currentItem.rh.note}`;
    targetMidi = currentItem.rh.midi; // primary check
    targetFinger = `LH ${currentItem.lh.finger} | RH ${currentItem.rh.finger}`;
    handIcon = "🤝";
    handName = "Beide Handen";
  }
  
  // Update HUD
  document.getElementById("target-note-name").textContent = targetNote;
  document.getElementById("target-hand-icon").textContent = handIcon;
  document.getElementById("target-finger-desc").textContent = 
    `Vinger ${getFingerName(targetFinger)} • Maat ${currentItem.measure} (Noot ${currentItem.note_index + 1}/8)`;
  
  const maxMeasures = state.hanonData ? state.hanonData.total_measures : 30;
  document.getElementById("sheet-measure-indicator").textContent = `Maat ${currentItem.measure} / ${maxMeasures}`;
  
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

  if (lhPosText) {
    const keys = Object.keys(lhSpanNotes);
    const lhMin = keys[0] || (currentItem.lh ? currentItem.lh.note : "C2");
    const lhMax = keys[keys.length - 1] || (currentItem.lh ? currentItem.lh.note : "A2");
    lhPosText.textContent = `Positie: ${lhMin} t/m ${lhMax}`;
  }
  if (rhPosText) {
    const keys = Object.keys(rhSpanNotes);
    const rhMin = keys[0] || (currentItem.rh ? currentItem.rh.note : "C3");
    const rhMax = keys[keys.length - 1] || (currentItem.rh ? currentItem.rh.note : "A3");
    rhPosText.textContent = `Positie: ${rhMin} t/m ${rhMax}`;
  }

  if (postureHint) {
    if (currentItem.measure === 1) {
      postureHint.textContent = "Beide handen in basbalk • 1 octaaf parallel • Vlakke polsen";
    } else if (currentItem.measure === 6) {
      postureHint.textContent = "Rechterhand kruist naar vioolsleutel! Linkerhand blijft in bas";
    } else if (currentItem.measure === 15) {
      postureHint.textContent = "Keerpunt naar de afdaling! Vinger 5 & 4 sprong omlaag";
    } else {
      postureHint.textContent = "Ontspannen polsen • Til elke vinger hoog op als een hamertje";
    }
  }
}

// Highlight piano target key(s) on 88-key piano, showing exact hand positions for both hands
function highlightPianoTarget(singleNote = null, singleFinger = null) {
  // Clear existing active target keys and hand zone keys
  document.querySelectorAll(".white-key, .black-key").forEach(k => {
    k.classList.remove("active-target", "hand-key-lh", "hand-key-rh");
    const badge = k.querySelector(".finger-badge");
    if (badge) badge.remove();
  });
  
  if (singleNote) {
    const keyEl = document.querySelector(`[data-note="${singleNote}"]`);
    if (keyEl) {
      keyEl.classList.add("active-target");
      const badge = document.createElement("div");
      badge.className = "finger-badge";
      badge.textContent = singleFinger || (state.currentHand === "lh" ? "L" : "R");
      keyEl.appendChild(badge);
      centerKeyInPianoView(keyEl);
    }
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

  // 2. Decorate Left Hand keys on piano (Cyan hand zone)
  if (state.currentHand === "lh" || state.currentHand === "both") {
    Object.entries(lhSpanNotes).forEach(([noteName, finger]) => {
      const keyEl = document.querySelector(`[data-note="${noteName}"]`);
      if (keyEl) {
        keyEl.classList.add("hand-key-lh");
        const b = document.createElement("div");
        b.className = "finger-badge badge-lh";
        b.textContent = finger;
        keyEl.appendChild(b);
      }
    });
  }

  // 3. Decorate Right Hand keys on piano (Amber hand zone)
  if (state.currentHand === "rh" || state.currentHand === "both") {
    Object.entries(rhSpanNotes).forEach(([noteName, finger]) => {
      const keyEl = document.querySelector(`[data-note="${noteName}"]`);
      if (keyEl) {
        keyEl.classList.add("hand-key-rh");
        if (!keyEl.querySelector(".finger-badge")) {
          const b = document.createElement("div");
          b.className = "finger-badge badge-rh";
          b.textContent = finger;
          keyEl.appendChild(b);
        }
      }
    });
  }

  // 4. Highlight the CURRENT active target key(s) (Pulsing Gold)
  const targets = [];
  if (state.currentHand === "lh") {
    targets.push({ note: currentItem.lh.note, finger: currentItem.lh.finger, hand: "lh" });
  } else if (state.currentHand === "rh") {
    targets.push({ note: currentItem.rh.note, finger: currentItem.rh.finger, hand: "rh" });
  } else {
    // Both hands
    targets.push({ note: currentItem.lh.note, finger: currentItem.lh.finger, hand: "lh" });
    targets.push({ note: currentItem.rh.note, finger: currentItem.rh.finger, hand: "rh" });
  }

  targets.forEach(t => {
    const keyEl = document.querySelector(`[data-note="${t.note}"]`);
    if (keyEl) {
      keyEl.classList.add("active-target");
      let badge = keyEl.querySelector(".finger-badge");
      if (!badge) {
        badge = document.createElement("div");
        keyEl.appendChild(badge);
      }
      badge.className = `finger-badge active-finger-badge ${t.hand === "lh" ? "badge-lh" : "badge-rh"}`;
      badge.textContent = t.finger;
    }
  });

  // 5. Update the dedicated Hand Guide Bar above the piano
  updatePianoHandGuideBar(currentItem, lhSpanNotes, rhSpanNotes);

  // 6. Centering: Center the piano container so BOTH hand zones are clearly visible
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
    
    document.getElementById("coach-message").innerHTML = 
      `<span style="color: var(--accent-green);">Goed zo!</span> ${playedNoteName} vlekkeloos geraakt (Vinger ${targetFinger}).`;
    
    // Advance to next note
    state.currentNoteIndex++;
    updateTargetDisplay();
  } else {
    // WRONG!
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
    
    document.getElementById("coach-message").innerHTML = 
      `<span style="color: var(--accent-red);">Let op:</span> Je speelde <strong>${playedNoteName}</strong> in plaats van <strong>${targetNote}</strong>. Gebruik vinger ${getFingerName(targetFinger)}!`;
    
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
  document.getElementById("stat-progress").textContent = `Noot ${currentNoteNum} / ${queueLen}`;
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
  document.getElementById("btn-demo").innerHTML = "<span>⏹️ Stop Demo</span>";
  document.getElementById("btn-demo").classList.add("btn-accent");
  
  let demoIdx = 0;
  const intervalMs = (60000 / state.bpm) / 4; // 16th notes
  
  state.demoTimer = setInterval(() => {
    if (demoIdx >= state.activeNotesQueue.length) {
      stopDemo();
      return;
    }
    
    const item = state.activeNotesQueue[demoIdx];
    
    // Play synthesis tone
    if (state.currentHand === "both") {
      playPianoTone(item.lh.midi, intervalMs / 1000);
      playPianoTone(item.rh.midi, intervalMs / 1000);
    } else if (state.currentHand === "lh") {
      playPianoTone(item.lh.midi, intervalMs / 1000);
    } else {
      playPianoTone(item.rh.midi, intervalMs / 1000);
    }
    
    // Highlight sheet position
    highlightSheetPosition(item);
    
    // Highlight piano target key(s)
    if (state.currentHand === "both") {
      document.querySelectorAll(".white-key, .black-key").forEach(k => {
        k.classList.remove("active-target");
        const badge = k.querySelector(".finger-badge");
        if (badge) badge.remove();
      });
      [
        { note: item.lh.note, finger: item.lh.finger },
        { note: item.rh.note, finger: item.rh.finger }
      ].forEach(t => {
        const kEl = document.querySelector(`[data-note="${t.note}"]`);
        if (kEl) {
          kEl.classList.add("active-target");
          const b = document.createElement("div");
          b.className = "finger-badge";
          b.textContent = t.finger;
          kEl.appendChild(b);
        }
      });
    } else {
      const noteName = state.currentHand === "lh" ? item.lh.note : item.rh.note;
      const finger = state.currentHand === "lh" ? item.lh.finger : item.rh.finger;
      highlightPianoTarget(noteName, finger);
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
  document.getElementById("btn-demo").innerHTML = "<span>🎧 Speel Voor</span>";
  document.getElementById("btn-demo").classList.remove("btn-accent");
  updateTargetDisplay();
}

// Web Audio Piano Tone Synthesis
function playPianoTone(midi, duration = 0.3) {
  if (!state.audioCtx) return;
  const ctx = state.audioCtx;
  const now = ctx.currentTime;
  const freq = midiToFreq(midi);
  
  // 3-harmonic piano oscillator
  [1, 2, 3].forEach((harmonic, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = idx === 0 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(freq * harmonic, now);
    
    const amp = (0.2 / (idx + 1));
    gain.gain.setValueAtTime(amp, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + duration);
  });
}

// BROWSER MICROPHONE & YIN PITCH DETECTION
async function initBrowserMic() {
  try {
    if (!state.audioCtx) {
      state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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
    const analyser = state.audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    micSource.connect(analyser);
    state.analyser = analyser;
    state.pitchBuffer = new Float32Array(analyser.fftSize);
    
    requestAnimationFrame(audioProcessLoop);
    console.log("Microfoon succesvol geactiveerd!");
  } catch (err) {
    console.error("Microfoontoegang geweigerd:", err);
    alert("Microfoontoegang is nodig om naar de piano te luisteren. Klik op 'Toestaan' in de adresbalk.");
  }
}

// Real-time audio loop
function audioProcessLoop() {
  if (state.analyser && state.pitchBuffer) {
    state.analyser.getFloatTimeDomainData(state.pitchBuffer);
    
    // Calculate RMS energy
    let sum = 0;
    for (let i = 0; i < state.pitchBuffer.length; i++) {
      sum += state.pitchBuffer[i] * state.pitchBuffer[i];
    }
    const rms = Math.sqrt(sum / state.pitchBuffer.length);
    
    // Noise threshold from slider (scaled)
    const threshold = (state.sensitivity / 1000.0) * 0.8;
    
    if (rms > threshold) {
      const pitch = detectPitchYIN(state.pitchBuffer, state.audioCtx.sampleRate);
      if (pitch && pitch >= 27.5 && pitch <= 4200) {
        const midi = freqToMidi(pitch);
        if (midi) {
          const roundedMidi = Math.round(midi);
          const cents = (midi - roundedMidi) * 100.0;
          const noteName = midiToNoteName(roundedMidi);
          
          const now = Date.now();
          // Debounce: prevent triggering same note more than once per 120ms
          if (noteName !== state.lastDetectedNote || (now - state.lastNoteTimestamp) > 130) {
            state.lastDetectedNote = noteName;
            state.lastNoteTimestamp = now;
            handlePlayedNote(noteName, pitch, cents);
          }
        }
      }
    }
  }
  requestAnimationFrame(audioProcessLoop);
}

// High-accuracy YIN Pitch Algorithm
function detectPitchYIN(buffer, sampleRate) {
  const bufferSize = buffer.length;
  const halfBufferSize = Math.floor(bufferSize / 2);
  const yinBuffer = new Float32Array(halfBufferSize);
  
  // Step 1: Difference Function
  for (let tau = 0; tau < halfBufferSize; tau++) {
    yinBuffer[tau] = 0;
  }
  for (let tau = 1; tau < halfBufferSize; tau++) {
    for (let i = 0; i < halfBufferSize; i++) {
      const delta = buffer[i] - buffer[i + tau];
      yinBuffer[tau] += delta * delta;
    }
  }
  
  // Step 2: Cumulative Mean Normalized Difference
  yinBuffer[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau < halfBufferSize; tau++) {
    runningSum += yinBuffer[tau];
    yinBuffer[tau] = runningSum > 0 ? (yinBuffer[tau] * tau) / runningSum : 1;
  }
  
  // Step 3: Absolute Threshold
  const threshold = 0.15;
  let tauEstimate = -1;
  for (let tau = 2; tau < halfBufferSize; tau++) {
    if (yinBuffer[tau] < threshold) {
      while (tau + 1 < halfBufferSize && yinBuffer[tau + 1] < yinBuffer[tau]) {
        tau++;
      }
      tauEstimate = tau;
      break;
    }
  }
  
  if (tauEstimate === -1) return null;
  
  // Step 4: Parabolic Interpolation for Sub-sample Accuracy
  let betterTau = tauEstimate;
  if (tauEstimate > 0 && tauEstimate < halfBufferSize - 1) {
    const s0 = yinBuffer[tauEstimate - 1];
    const s1 = yinBuffer[tauEstimate];
    const s2 = yinBuffer[tauEstimate + 1];
    const denom = 2 * (2 * s1 - s0 - s2);
    if (denom !== 0) {
      betterTau = tauEstimate + (s2 - s0) / denom;
    }
  }
  
  return sampleRate / betterTau;
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
    
    const label = document.createElement("span");
    label.className = "key-label";
    
    if (wn === "C4") {
      key.classList.add("middle-c");
      label.classList.add("middle-c-marker");
      label.textContent = "C4 (Midden)";
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
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--text-muted);">Nog geen sessies opgeslagen. Speel een les om je voortgang te zien!</td></tr>`;
    } else {
      history.forEach(item => {
        const dateStr = item.timestamp ? new Date(item.timestamp).toLocaleString("nl-NL", {
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
    if (data.bottlenecks && data.bottlenecks.length > 0) {
      data.bottlenecks.forEach(b => {
        const row = document.createElement("div");
        row.className = "bottleneck-row";
        row.innerHTML = `
          <span><strong>Maat ${b.measure}</strong> (Knelpunt)</span>
          <span style="color: var(--accent-red); font-weight: 700;">${b.errors} fouten</span>
          <span style="color: var(--accent-cyan); font-weight: 600;">${Math.round(b.avg_latency_ms)} ms reactie</span>
        `;
        bList.appendChild(row);
      });
    } else {
      bList.innerHTML = `<div style="color: var(--text-muted); font-size: 12px; padding: 6px;">Nog geen significante knelpunten gedetecteerd. Blijf spelen om data te verzamelen!</div>`;
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

function initMainMenu() {
  const btnToggle = document.getElementById("btn-toggle-menu");
  if (btnToggle) {
    btnToggle.addEventListener("click", () => {
      toggleView(state.currentView === "menu" ? "tutor" : "menu");
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
      await selectExerciseAndLesson("ex1", "les-1");
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
  const menuView = document.getElementById("view-main-menu");
  const tutorView = document.getElementById("view-tutor");
  const toggleBtnText = document.getElementById("toggle-menu-text");
  const toggleBtnIcon = document.getElementById("toggle-menu-icon");

  if (viewName === "menu") {
    document.body.classList.add("in-menu-view");
    if (menuView) menuView.style.display = "block";
    if (tutorView) tutorView.style.display = "none";
    if (toggleBtnText) toggleBtnText.textContent = "Naar Oefening";
    if (toggleBtnIcon) toggleBtnIcon.textContent = "🎹";
    renderMainMenu();
  } else {
    document.body.classList.remove("in-menu-view");
    if (menuView) menuView.style.display = "none";
    if (tutorView) tutorView.style.display = "flex";
    if (toggleBtnText) toggleBtnText.textContent = "Hoofdmenu";
    if (toggleBtnIcon) toggleBtnIcon.textContent = "🏠";
  }
}

async function selectExerciseAndLesson(exerciseId, lessonId) {
  if (state.currentExerciseId !== exerciseId) {
    await switchExercise(exerciseId);
    const sel = document.getElementById("exercise-select");
    if (sel) sel.value = exerciseId;
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

  const progressMap = getLessonProgressMap();
  const allLessons = state.allLessonsMap || {};

  // Compute stats across all exercises
  let totalLessonsCount = 0;
  let completedCount = 0;
  let totalStars = 0;
  let sumAcc = 0;
  let accCount = 0;
  let totalNotesPlayed = 0;

  try {
    const sessions = JSON.parse(localStorage.getItem("hanon_piano_sessions") || "[]");
    sessions.forEach(s => {
      totalNotesPlayed += (s.correct_notes || 0) + (s.wrong_notes || 0);
    });
  } catch(e) {}

  state.exercises.forEach(ex => {
    const lessons = allLessons[ex.id] || [];
    lessons.forEach(l => {
      totalLessonsCount += 1;
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

  if (statCompleted) statCompleted.textContent = `${completedCount} / ${totalLessonsCount || 360}`;
  if (statCompletedBar) {
    const pct = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;
    statCompletedBar.style.width = `${pct}%`;
  }
  if (statStars) statStars.textContent = `${totalStars} ⭐`;
  if (statAcc) statAcc.textContent = `${avgAccuracy}%`;
  if (statNotes) statNotes.textContent = totalNotesPlayed.toLocaleString("nl-NL");

  // Filter exercises
  let visibleExercises = state.exercises;
  if (filter === "part1") {
    visibleExercises = state.exercises.filter(e => e.number <= 20);
  } else if (filter === "part2") {
    visibleExercises = state.exercises.filter(e => e.number >= 21 && e.number <= 43);
  } else if (filter === "part3") {
    visibleExercises = state.exercises.filter(e => e.number >= 44 && e.number <= 60);
  } else if (filter === "started") {
    visibleExercises = state.exercises.filter(e => {
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

    card.innerHTML = `
      <div class="menu-ex-card-header">
        <div>
          <span class="menu-ex-badge">Oefening N°${ex.number}</span>
          <h3 class="menu-ex-title">${ex.name}</h3>
          <p class="menu-ex-sub">${focus ? `Vingerfocus: ${focus}` : ex.subtitle || ''}</p>
        </div>
        <a href="${ex.pdf_file ? `./${encodeURIComponent(ex.pdf_file)}` : './Exercise%20N%C2%B01%20in%20C.pdf'}" target="_blank" class="badge badge-cyan" title="Open originele partituur PDF">
          📄 PDF
        </a>
      </div>

      <div class="menu-ex-progress-bar">
        <div class="menu-progress-track">
          <div class="menu-progress-fill" style="width: ${exPct}%;"></div>
        </div>
        <span class="menu-progress-text">${exCompleted} / ${lessons.length} lessen (${exPct}%)</span>
      </div>

      <div class="menu-lessons-list">
        ${lessons.map(l => {
          const prog = progressMap[`${ex.id}_${l.id}`];
          const isLCurrent = (isCurrent && l.id === state.currentLessonId);
          let starHtml = "⚪ Niet gespeeld";
          let actionLabel = "▶️ Start";
          let btnClass = "btn-outline";

          if (prog && prog.completed) {
            const starsStr = "⭐".repeat(prog.stars || 3);
            starHtml = `<span class="text-gold">${starsStr}</span> <span class="menu-lesson-accuracy">${prog.best_accuracy}%</span>`;
            actionLabel = "🔄 Oefen";
            btnClass = "btn-secondary";
          } else if (prog && prog.attempts > 0) {
            starHtml = `<span class="text-red">Nog oefenen (${prog.best_accuracy}%)</span>`;
            actionLabel = "▶️ Hervat";
            btnClass = "btn-primary";
          }

          return `
            <div class="menu-lesson-row ${isLCurrent ? 'active-lesson' : ''}" data-ex="${ex.id}" data-lesson="${l.id}">
              <div class="menu-lesson-meta">
                <span class="menu-lesson-name">${l.title}</span>
                <span class="menu-lesson-details">${l.subtitle} • ${l.total_notes} noten • Aanbevolen ${l.recommended_bpm} BPM</span>
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
