/**
 * Hanon Piano Tutor - Dynamic Vector Sheet Music Renderer (SVG)
 * 
 * Renders high-resolution, pixel-perfect Grand Staff musical notation
 * for all Hanon exercises in crisp SVG vector format.
 * Features:
 *  - 5-line Treble (G clef) & 5-line Bass (F clef) with grand staff brace & bracket
 *  - 2/4 time signature and measure bar lines (including turnaround and final bars)
 *  - 16th note beams (groups of 4), stems, note heads, and automatic ledger lines
 *  - Explicit fingering annotations (1-5) for RH (above) and LH (below)
 *  - Interactive states: target note glows gold, correct flashes green, error flashes red
 *  - Responsive smooth auto-scrolling to active measure
 */

(function(window) {
  'use strict';

  // Diatonic pitch mapping: Middle C (C4) = 0
  const DIATONIC_BASE = { 'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6 };

  function noteToDiatonicStep(noteName) {
    if (!noteName) return 0;
    const match = noteName.match(/^([A-G])(#|b)?(\d)$/);
    if (!match) return 0;
    const letter = match[1].toUpperCase();
    const octave = parseInt(match[3], 10);
    return (octave - 4) * 7 + DIATONIC_BASE[letter];
  }

  // Authentic SVG paths for musical symbols
  const CLEF_PATHS = {
    // Elegant Treble Clef (G-clef) path normalized for 60px height
    treble: "M16.5 54.2c-0.8-0.2-1.8-0.7-2.3-1.2-1.2-1.2-1.4-2.8-0.6-4.3 0.6-1.1 1.7-1.9 3-2.1 1.6-0.3 3.3 0.5 4 1.9 0.4 0.7 0.5 1.7 0.4 2.5-0.3 2-1.7 3.4-3.5 3.5-0.4 0-0.8-0.1-1-0.3zm0.8-7.5c-2.4-0.4-4.6-2.2-5.4-4.5-0.5-1.4-0.5-3.3 0-4.7 0.9-2.5 3-4.4 5.6-5.1 1.2-0.3 2.7-0.3 3.9 0.1 0.4 0.1 0.7 0.3 0.7 0.4 0 0.1-0.2 1.4-0.5 2.9-0.5 2.3-0.7 3.4-1.1 5.3-0.5 2.5-1.1 4.5-1.7 5.3-0.4 0.5-1 0.7-1.5 0.6zm2.2-16.1c0.1-0.5 0.4-2.7 0.7-4.8 0.5-3.6 0.9-5.3 1.6-6.6 1.1-2 2.8-2.9 4.8-2.6 1.4 0.2 2.6 1.2 3.1 2.5 0.5 1.3 0.3 2.9-0.5 4.3-1 1.8-2.9 3.6-5.6 5.3-1.6 1-3.2 1.8-4.1 1.9zm2.7-19c-0.7-1.1-1.7-1.6-3-1.6-1.5 0-2.8 0.8-3.5 2.1-0.6 1.1-0.8 2.6-0.4 3.9 0.3 0.9 0.9 1.7 1.8 2.3 0.5 0.3 0.8 0.3 1.1 0.1 0.3-0.2 0.5-0.7 0.5-1.3 0-1.1 0.4-2.3 1.1-3 0.7-0.7 1.6-1 2.5-0.8 0.4 0.1 0.7 0 0.8-0.2 0.1-0.2 0-0.9-0.9-1.5z",
    
    // Authentic Bass Clef (F-clef) path normalized for 36px height
    bass: "M6.5 10.5c-0.2-1.5 0.3-3.1 1.3-4.3 1.3-1.5 3.3-2.3 5.4-2.1 2.7 0.2 5.1 1.7 6.4 4.1 1.1 2 1.4 4.4 1 6.7-0.7 3.8-3.1 7.2-6.5 9.3-1.9 1.2-4.1 2.1-6.4 2.6-0.6 0.1-0.8 0-0.8-0.4 0-0.4 0.4-0.6 1.3-0.9 3.2-1.1 5.7-3.3 7-6.2 0.7-1.7 1-3.6 0.7-5.5-0.4-2.3-1.9-4.2-4-4.9-1.5-0.5-3.2-0.3-4.4 0.6-0.9 0.7-1.4 1.7-1.5 2.9-0.1 0.9 0.1 1.6 0.6 2.1 0.5 0.5 1.3 0.7 2 0.5 0.7-0.2 1.3-0.7 1.5-1.4 0.2-0.8-0.1-1.6-0.7-2-0.3-0.2-0.4-0.4-0.4-0.6 0-0.3 0.3-0.6 0.7-0.7 0.4-0.1 1 0.1 1.3 0.4 0.5 0.5 0.6 1.3 0.4 2-0.3 1.2-1.4 2-2.7 2-1.1 0-2.1-0.6-2.6-1.6-0.4-0.8-0.4-1.9-0.1-2.7z M23 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0z M23 15a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"
  };

  class VectorSheetRenderer {
    constructor() {
      this.currentData = null;
      this.activeNoteKey = null;
      this.activeMeasure = 1;
      this.container = null;
      this.svg = null;
      
      // Layout geometry constants
      this.config = {
        viewWidth: 980,
        marginSide: 18,
        measuresPerSystem: 2,
        systemHeight: 185,
        systemGap: 38,
        systemTopPad: 24,
        
        // Treble staff lines (5 lines)
        trebleTopLineY: 28, // Top line 5 (F5)
        lineSpacing: 10,    // 10px between lines
        // Bottom line 1 (E4) is at trebleTopLineY + 4 * lineSpacing = 68px
        
        // Bass staff lines (5 lines)
        interStaffGap: 52, // Space between Treble Line 1 (68px) and Bass Line 5 (120px)
        bassTopLineY: 120, // Top line 5 (A3)
        // Bottom line 1 (G2) is at bassTopLineY + 4 * lineSpacing = 160px
        
        noteHeadRx: 5.8,
        noteHeadRy: 4.2,
        stemLength: 32,
        beamThickness: 3.2,
        beamGap: 3.2,
        ledgerLineExtra: 6.5
      };
    }

    /**
     * Main Entry: Render the complete exercise into the DOM container.
     */
    render(hanonData, containerElement) {
      if (!hanonData || !containerElement) return;
      this.currentData = hanonData;
      this.container = containerElement;
      this.container.innerHTML = "";

      const measures = hanonData.measures || [];
      const totalMeasures = measures.length;
      if (totalMeasures === 0) return;

      const measuresPerSystem = this.config.measuresPerSystem;
      const totalSystems = Math.ceil(totalMeasures / measuresPerSystem);
      const totalHeight = this.config.systemTopPad + totalSystems * (this.config.systemHeight + this.config.systemGap);

      // Create main SVG element
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("viewBox", `0 0 ${this.config.viewWidth} ${totalHeight}`);
      svg.setAttribute("class", "vector-sheet-svg");
      svg.setAttribute("id", "vector-sheet-svg");

      // Background rect for crisp contrast
      const bgRect = document.createElementNS(svgNS, "rect");
      bgRect.setAttribute("width", "100%");
      bgRect.setAttribute("height", "100%");
      bgRect.setAttribute("class", "vector-sheet-bg");
      svg.appendChild(bgRect);

      // Render systems
      for (let sIdx = 0; sIdx < totalSystems; sIdx++) {
        const sysTop = this.config.systemTopPad + sIdx * (this.config.systemHeight + this.config.systemGap);
        const startMeasureIdx = sIdx * measuresPerSystem;
        const endMeasureIdx = Math.min(startMeasureIdx + measuresPerSystem, totalMeasures);
        const systemMeasures = measures.slice(startMeasureIdx, endMeasureIdx);
        const isFirstSystem = (sIdx === 0);

        this.renderSystem(svg, sIdx, sysTop, systemMeasures, isFirstSystem);
      }

      this.container.appendChild(svg);
      this.svg = svg;

      // Re-apply active target note if one exists
      if (this.activeNoteKey) {
        this.highlightNote(this.activeNoteKey);
      }
    }

    /**
     * Render a single 2-measure Grand Staff system.
     */
    renderSystem(svg, systemIndex, sysTop, systemMeasures, isFirstSystem) {
      const svgNS = "http://www.w3.org/2000/svg";
      const cfg = this.config;
      const sysGroup = document.createElementNS(svgNS, "g");
      sysGroup.setAttribute("class", `sheet-system system-${systemIndex}`);
      sysGroup.setAttribute("id", `vector-system-${systemIndex}`);

      const leftX = cfg.marginSide;
      const rightX = cfg.viewWidth - cfg.marginSide;

      const trebleLine1Y = sysTop + cfg.trebleTopLineY + 4 * cfg.lineSpacing; // 68px rel
      const trebleLine5Y = sysTop + cfg.trebleTopLineY; // 28px rel
      const bassLine1Y = sysTop + cfg.bassTopLineY + 4 * cfg.lineSpacing; // 160px rel
      const bassLine5Y = sysTop + cfg.bassTopLineY; // 120px rel

      // 1. Draw Grand Staff Lines (5 Treble lines, 5 Bass lines)
      const staffLinesGroup = document.createElementNS(svgNS, "g");
      staffLinesGroup.setAttribute("class", "staff-lines-group");

      // Treble 5 lines
      for (let l = 0; l < 5; l++) {
        const ly = trebleLine5Y + l * cfg.lineSpacing;
        staffLinesGroup.appendChild(this.createLine(leftX, ly, rightX, ly, "staff-line"));
      }

      // Bass 5 lines
      for (let l = 0; l < 5; l++) {
        const ly = bassLine5Y + l * cfg.lineSpacing;
        staffLinesGroup.appendChild(this.createLine(leftX, ly, rightX, ly, "staff-line"));
      }
      sysGroup.appendChild(staffLinesGroup);

      // 2. Leftmost vertical line connecting treble top to bass bottom
      sysGroup.appendChild(this.createLine(leftX, trebleLine5Y, leftX, bassLine1Y, "system-start-bar", 2.2));

      // 3. Grand staff bracket / curly brace on left
      const bracePath = document.createElementNS(svgNS, "path");
      const braceMidY = (trebleLine5Y + bassLine1Y) / 2;
      const braceX = leftX - 6;
      bracePath.setAttribute("d", 
        `M ${braceX} ${trebleLine5Y} ` +
        `C ${braceX - 7} ${trebleLine5Y + 18}, ${braceX - 7} ${braceMidY - 14}, ${braceX - 12} ${braceMidY} ` +
        `C ${braceX - 7} ${braceMidY + 14}, ${braceX - 7} ${bassLine1Y - 18}, ${braceX} ${bassLine1Y}`
      );
      bracePath.setAttribute("class", "staff-brace");
      bracePath.setAttribute("fill", "none");
      bracePath.setAttribute("stroke-width", "2.5");
      sysGroup.appendChild(bracePath);

      // 4. Clefs
      const clefX = leftX + 10;
      
      // Treble Clef (G-clef)
      const tClef = document.createElementNS(svgNS, "path");
      tClef.setAttribute("d", CLEF_PATHS.treble);
      tClef.setAttribute("class", "clef-symbol treble-clef");
      tClef.setAttribute("transform", `translate(${clefX}, ${trebleLine5Y - 12}) scale(0.95)`);
      sysGroup.appendChild(tClef);

      // Bass Clef (F-clef)
      const bClef = document.createElementNS(svgNS, "path");
      bClef.setAttribute("d", CLEF_PATHS.bass);
      bClef.setAttribute("class", "clef-symbol bass-clef");
      bClef.setAttribute("transform", `translate(${clefX + 1}, ${bassLine5Y + 2}) scale(1.1)`);
      sysGroup.appendChild(bClef);

      // 5. Time signature (2/4) on first system
      let headerWidth = 48; // room for clefs
      if (isFirstSystem) {
        const timeSigX = clefX + 32;
        headerWidth += 36;
        
        // Treble 2/4
        sysGroup.appendChild(this.createText(timeSigX, trebleLine5Y + 16, "2", "time-sig"));
        sysGroup.appendChild(this.createText(timeSigX, trebleLine5Y + 36, "4", "time-sig"));

        // Bass 2/4
        sysGroup.appendChild(this.createText(timeSigX, bassLine5Y + 16, "2", "time-sig"));
        sysGroup.appendChild(this.createText(timeSigX, bassLine5Y + 36, "4", "time-sig"));
      }

      // 6. Measures layout
      const contentStartX = leftX + headerWidth;
      const contentWidth = rightX - contentStartX;
      const mCount = systemMeasures.length;
      const measureWidth = contentWidth / mCount;

      for (let mIdx = 0; mIdx < mCount; mIdx++) {
        const measure = systemMeasures[mIdx];
        const mX = contentStartX + mIdx * measureWidth;
        const mRightX = mX + measureWidth;
        const isTurnaround = (measure.type === "descending" && measure.measure === 15);
        const isFinalMeasure = (measure.type === "final" || measure.measure === this.currentData.total_measures);

        // Measure focus rect (highlights active measure)
        const mFocusRect = document.createElementNS(svgNS, "rect");
        mFocusRect.setAttribute("x", mX);
        mFocusRect.setAttribute("y", trebleLine5Y - 14);
        mFocusRect.setAttribute("width", measureWidth);
        mFocusRect.setAttribute("height", (bassLine1Y - trebleLine5Y) + 28);
        mFocusRect.setAttribute("rx", "6");
        mFocusRect.setAttribute("class", "vmeasure-focus-box");
        mFocusRect.setAttribute("id", `vmeasure-${measure.measure}`);
        sysGroup.appendChild(mFocusRect);

        // Measure number badge
        const mNumText = this.createText(mX + 6, trebleLine5Y - 6, `M${measure.measure}`, "measure-number");
        sysGroup.appendChild(mNumText);

        // Render notes inside this measure
        this.renderMeasureNotes(sysGroup, measure, mX, measureWidth, trebleLine1Y, bassLine1Y);

        // Bar line at end of measure
        if (isFinalMeasure) {
          // Final double barline: thin bar + thick bar
          sysGroup.appendChild(this.createLine(mRightX - 6, trebleLine5Y, mRightX - 6, trebleLine1Y, "bar-line", 1.5));
          sysGroup.appendChild(this.createLine(mRightX - 6, bassLine5Y, mRightX - 6, bassLine1Y, "bar-line", 1.5));
          sysGroup.appendChild(this.createLine(mRightX, trebleLine5Y, mRightX, bassLine1Y, "bar-line-thick", 4.0));
        } else if (isTurnaround) {
          // Double barline at turnaround
          sysGroup.appendChild(this.createLine(mRightX - 4, trebleLine5Y, mRightX - 4, trebleLine1Y, "bar-line", 1.5));
          sysGroup.appendChild(this.createLine(mRightX - 4, bassLine5Y, mRightX - 4, bassLine1Y, "bar-line", 1.5));
          sysGroup.appendChild(this.createLine(mRightX, trebleLine5Y, mRightX, trebleLine1Y, "bar-line", 1.5));
          sysGroup.appendChild(this.createLine(mRightX, bassLine5Y, mRightX, bassLine1Y, "bar-line", 1.5));
        } else {
          // Standard single barline across Treble and Bass staves
          sysGroup.appendChild(this.createLine(mRightX, trebleLine5Y, mRightX, trebleLine1Y, "bar-line", 1.5));
          sysGroup.appendChild(this.createLine(mRightX, bassLine5Y, mRightX, bassLine1Y, "bar-line", 1.5));
        }
      }

      svg.appendChild(sysGroup);
    }

    /**
     * Render the notes (Treble & Bass), stems, beams, ledger lines, and fingering numbers.
     */
    renderMeasureNotes(group, measure, mX, mWidth, trebleLine1Y, bassLine1Y) {
      const svgNS = "http://www.w3.org/2000/svg";
      const cfg = this.config;
      const notes = measure.notes || [];
      const noteCount = notes.length;
      if (noteCount === 0) return;

      // Special case: Single final whole / half note
      if (noteCount === 1) {
        const singleNote = notes[0];
        const cx = mX + mWidth / 2;
        const rhStep = noteToDiatonicStep(singleNote.rh.note);
        const lhStep = noteToDiatonicStep(singleNote.lh.note);

        const rhY = trebleLine1Y - (rhStep - 2) * (cfg.lineSpacing / 2);
        const lhY = bassLine1Y - (lhStep + 10) * (cfg.lineSpacing / 2);

        this.renderLedgerLines(group, cx, rhStep, "treble", trebleLine1Y);
        this.renderLedgerLines(group, cx, lhStep, "bass", bassLine1Y);

        this.renderNoteHead(group, cx, rhY, singleNote, "rh", true);
        this.renderNoteHead(group, cx, lhY, singleNote, "lh", true);

        // Fingering
        group.appendChild(this.createText(cx, rhY - 14, `${singleNote.rh.finger || 1}`, "fingering-number fingering-rh"));
        group.appendChild(this.createText(cx, lhY + 20, `${singleNote.lh.finger || 5}`, "fingering-number fingering-lh"));
        return;
      }

      // Standard measure: 8 sixteenth notes in two beamed groups of 4 (Beat 1 & Beat 2)
      const notePad = 24;
      const availableWidth = mWidth - notePad * 2;
      const noteSpacing = availableWidth / (noteCount - 1);

      // Precalculate positions
      const positions = [];
      for (let i = 0; i < noteCount; i++) {
        const n = notes[i];
        const cx = mX + notePad + i * noteSpacing;
        const rhStep = noteToDiatonicStep(n.rh.note);
        const lhStep = noteToDiatonicStep(n.lh.note);

        const rhY = trebleLine1Y - (rhStep - 2) * (cfg.lineSpacing / 2);
        const lhY = bassLine1Y - (lhStep + 10) * (cfg.lineSpacing / 2);

        positions.push({ cx, rhY, lhY, rhStep, lhStep, note: n, index: i });
      }

      // Group into beats: [0..3] and [4..7]
      const beatGroups = [
        positions.slice(0, 4),
        positions.slice(4, 8)
      ];

      beatGroups.forEach(beat => {
        if (beat.length === 0) return;

        // Treble stems UP: stems extend upward from noteheads
        // Find highest note in beat to set beam height
        let minRhY = 9999;
        beat.forEach(p => { if (p.rhY < minRhY) minRhY = p.rhY; });
        const rhBeamY = Math.min(minRhY - cfg.stemLength, trebleLine1Y - 48);

        // Bass stems DOWN: stems extend downward from noteheads
        let maxLhY = -9999;
        beat.forEach(p => { if (p.lhY > maxLhY) maxLhY = p.lhY; });
        const lhBeamY = Math.max(maxLhY + cfg.stemLength, bassLine1Y + 18);

        // Render double beams for Treble (RH)
        const rhStartX = beat[0].cx + 5.2;
        const rhEndX = beat[beat.length - 1].cx + 5.2;
        group.appendChild(this.createLine(rhStartX, rhBeamY, rhEndX, rhBeamY, "note-beam", cfg.beamThickness));
        group.appendChild(this.createLine(rhStartX, rhBeamY + cfg.beamThickness + cfg.beamGap, rhEndX, rhBeamY + cfg.beamThickness + cfg.beamGap, "note-beam", cfg.beamThickness));

        // Render double beams for Bass (LH)
        const lhStartX = beat[0].cx - 5.2;
        const lhEndX = beat[beat.length - 1].cx - 5.2;
        group.appendChild(this.createLine(lhStartX, lhBeamY, lhEndX, lhBeamY, "note-beam", cfg.beamThickness));
        group.appendChild(this.createLine(lhStartX, lhBeamY - (cfg.beamThickness + cfg.beamGap), lhEndX, lhBeamY - (cfg.beamThickness + cfg.beamGap), "note-beam", cfg.beamThickness));

        // Render stems, ledger lines, note heads, and fingering
        beat.forEach(p => {
          // Stems
          // RH stem: connects from (cx + 5.2, rhY) up to rhBeamY
          group.appendChild(this.createLine(p.cx + 5.2, p.rhY, p.cx + 5.2, rhBeamY + cfg.beamThickness + cfg.beamGap, "note-stem", 1.4));
          // LH stem: connects from (cx - 5.2, lhY) down to lhBeamY
          group.appendChild(this.createLine(p.cx - 5.2, p.lhY, p.cx - 5.2, lhBeamY - (cfg.beamThickness + cfg.beamGap), "note-stem", 1.4));

          // Ledger lines
          this.renderLedgerLines(group, p.cx, p.rhStep, "treble", trebleLine1Y);
          this.renderLedgerLines(group, p.cx, p.lhStep, "bass", bassLine1Y);

          // Note heads
          this.renderNoteHead(group, p.cx, p.rhY, p.note, "rh", false);
          this.renderNoteHead(group, p.cx, p.lhY, p.note, "lh", false);

          // Fingering numbers
          // RH above beam
          const rhFingY = rhBeamY - 8;
          group.appendChild(this.createText(p.cx, rhFingY, `${p.note.rh.finger}`, "fingering-number fingering-rh"));

          // LH below beam
          const lhFingY = lhBeamY + 16;
          group.appendChild(this.createText(p.cx, lhFingY, `${p.note.lh.finger}`, "fingering-number fingering-lh"));
        });
      });
    }

    /**
     * Render ledger lines for notes beyond standard staff lines.
     */
    renderLedgerLines(group, cx, step, staffType, staffLine1Y) {
      const cfg = this.config;
      const stepH = cfg.lineSpacing / 2;
      const w = cfg.noteHeadRx + cfg.ledgerLineExtra;

      if (staffType === "treble") {
        // Line 1 is E4 (step 2). Middle C (C4) is step 0 (1 line below).
        // Ledger lines below treble staff: step 0, -2, -4, etc.
        if (step <= 0) {
          for (let s = 0; s >= step; s -= 2) {
            const ly = staffLine1Y - (s - 2) * stepH;
            group.appendChild(this.createLine(cx - w, ly, cx + w, ly, "ledger-line", 1.5));
          }
        }
        // Top line 5 is F5 (step 10).
        // Ledger lines above treble staff: step 12 (A5), step 14 (C6), step 16 (E6), step 18 (G6).
        if (step >= 12) {
          const maxLineStep = (step % 2 === 0) ? step : step - 1;
          for (let s = 12; s <= maxLineStep; s += 2) {
            const ly = staffLine1Y - (s - 2) * stepH;
            group.appendChild(this.createLine(cx - w, ly, cx + w, ly, "ledger-line", 1.5));
          }
        }
      } else if (staffType === "bass") {
        // Line 5 is A3 (step -2). Line 1 is G2 (step -10).
        // Ledger lines above bass staff: step 0 (Middle C), 2 (E4), etc.
        if (step >= 0) {
          const maxLineStep = (step % 2 === 0) ? step : step - 1;
          for (let s = 0; s <= maxLineStep; s += 2) {
            const ly = staffLine1Y - (s + 10) * stepH;
            group.appendChild(this.createLine(cx - w, ly, cx + w, ly, "ledger-line", 1.5));
          }
        }
        // Ledger lines below bass staff: step -12 (E2), step -14 (C2), etc.
        if (step <= -12) {
          for (let s = -12; s >= step; s -= 2) {
            const ly = staffLine1Y - (s + 10) * stepH;
            group.appendChild(this.createLine(cx - w, ly, cx + w, ly, "ledger-line", 1.5));
          }
        }
      }
    }

    /**
     * Render an authentic tilted musical note head with interactive attributes.
     */
    renderNoteHead(group, cx, cy, noteItem, hand, isWholeNote = false) {
      const svgNS = "http://www.w3.org/2000/svg";
      const cfg = this.config;

      const noteG = document.createElementNS(svgNS, "g");
      const noteId = `vnote-${hand}-${noteItem.measure}-${noteItem.note_index}`;
      noteG.setAttribute("id", noteId);
      noteG.setAttribute("class", `vnote-element vnote-${hand}`);
      noteG.setAttribute("data-measure", noteItem.measure);
      noteG.setAttribute("data-index", noteItem.note_index);
      noteG.setAttribute("data-hand", hand);
      noteG.setAttribute("data-note", hand === "rh" ? noteItem.rh.note : noteItem.lh.note);

      // Glowing aura circle (hidden until target/active)
      const aura = document.createElementNS(svgNS, "circle");
      aura.setAttribute("cx", cx);
      aura.setAttribute("cy", cy);
      aura.setAttribute("r", cfg.noteHeadRx * 2.2);
      aura.setAttribute("class", "vnote-aura");
      noteG.appendChild(aura);

      // Notehead ellipse (tilted at -20 degrees)
      const ellipse = document.createElementNS(svgNS, "ellipse");
      ellipse.setAttribute("cx", cx);
      ellipse.setAttribute("cy", cy);
      ellipse.setAttribute("rx", cfg.noteHeadRx);
      ellipse.setAttribute("ry", cfg.noteHeadRy);
      ellipse.setAttribute("transform", `rotate(-20 ${cx} ${cy})`);
      ellipse.setAttribute("class", isWholeNote ? "note-head note-head-open" : "note-head note-head-filled");
      noteG.appendChild(ellipse);

      // Click to jump to note
      noteG.style.cursor = "pointer";
      noteG.addEventListener("click", () => {
        if (window.jumpToMeasureAndNote) {
          window.jumpToMeasureAndNote(noteItem.measure, noteItem.note_index);
        }
      });

      group.appendChild(noteG);
    }

    /**
     * Set active target note highlight (Gold Glow) and highlight active measure.
     */
    setTarget(measure, noteIndex, hand = "both") {
      this.activeMeasure = measure;
      this.activeNoteKey = { measure, noteIndex, hand };

      if (!this.svg) return;

      // 1. Remove previous note glows
      const prevAuras = this.svg.querySelectorAll(".vnote-target");
      prevAuras.forEach(el => el.classList.remove("vnote-target"));

      // 2. Add target glow to current active notes
      const targetIds = [];
      if (hand === "rh" || hand === "both") {
        targetIds.push(`vnote-rh-${measure}-${noteIndex}`);
      }
      if (hand === "lh" || hand === "both") {
        targetIds.push(`vnote-lh-${measure}-${noteIndex}`);
      }

      targetIds.forEach(id => {
        const el = this.svg.getElementById(id);
        if (el) {
          el.classList.add("vnote-target");
        }
      });

      // 3. Highlight active measure focus box
      const prevMeasureBoxes = this.svg.querySelectorAll(".vmeasure-active");
      prevMeasureBoxes.forEach(b => b.classList.remove("vmeasure-active"));

      const mBox = this.svg.getElementById(`vmeasure-${measure}`);
      if (mBox) {
        mBox.classList.add("vmeasure-active");
      }

      // 4. Smooth auto-scroll to keep active measure in view
      this.scrollToMeasure(measure);
    }

    /**
     * Flash note Green on correct hit.
     */
    flashCorrect(measure, noteIndex, hand = "both") {
      if (!this.svg) return;
      const ids = [];
      if (hand === "rh" || hand === "both") ids.push(`vnote-rh-${measure}-${noteIndex}`);
      if (hand === "lh" || hand === "both") ids.push(`vnote-lh-${measure}-${noteIndex}`);

      ids.forEach(id => {
        const el = this.svg.getElementById(id);
        if (el) {
          el.classList.add("vnote-flash-correct");
          setTimeout(() => el.classList.remove("vnote-flash-correct"), 350);
        }
      });
    }

    /**
     * Flash note Red on wrong hit.
     */
    flashWrong(measure, noteIndex, hand = "both") {
      if (!this.svg) return;
      const ids = [];
      if (hand === "rh" || hand === "both") ids.push(`vnote-rh-${measure}-${noteIndex}`);
      if (hand === "lh" || hand === "both") ids.push(`vnote-lh-${measure}-${noteIndex}`);

      ids.forEach(id => {
        const el = this.svg.getElementById(id);
        if (el) {
          el.classList.add("vnote-flash-wrong");
          setTimeout(() => el.classList.remove("vnote-flash-wrong"), 450);
        }
      });
    }

    /**
     * Smoothly auto-scroll sheet-scroll-area to center the active measure system.
     */
    scrollToMeasure(measureNumber) {
      const scrollArea = document.getElementById("sheet-scroll-area");
      if (!scrollArea || !this.svg) return;

      const measuresPerSystem = this.config.measuresPerSystem;
      const systemIndex = Math.floor((measureNumber - 1) / measuresPerSystem);
      const systemTop = this.config.systemTopPad + systemIndex * (this.config.systemHeight + this.config.systemGap);

      // SVG view-box scaling factor to client pixels
      const svgRect = this.svg.getBoundingClientRect();
      const scaleY = svgRect.height / (this.svg.viewBox.baseVal.height || 1);

      const targetScrollTop = (systemTop * scaleY) - (scrollArea.clientHeight / 2) + 60;
      scrollArea.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: "smooth"
      });
    }

    // Helper SVG generators
    createLine(x1, y1, x2, y2, className = "", strokeWidth = null) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      if (className) line.setAttribute("class", className);
      if (strokeWidth) line.setAttribute("stroke-width", strokeWidth);
      return line;
    }

    createText(x, y, textContent, className = "") {
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", x);
      text.setAttribute("y", y);
      text.textContent = textContent;
      if (className) text.setAttribute("class", className);
      return text;
    }
  }

  // Export singleton instance
  window.VectorSheetRenderer = new VectorSheetRenderer();

})(window);
