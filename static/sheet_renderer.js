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

  // Authentic, standard-engraved SVG vector paths for Treble (G) and Bass (F) clefs
  const CLEF_PATHS = {
    // Official standard G-clef (Treble clef) vector outline
    treble: "M104.549 111.639c-2.589.845-4.7286 2.271-6.419 4.279-1.6906 2.007-2.7207 4.2-3.0905 6.577-.3698 2.377-.066 4.728.9113 7.052.9773 2.325 2.8131 4.2 5.5072 5.627.634 0 1.03.264 1.189.792.158.528-.08.792-.713.792-2.589-.528-4.8606-1.611-6.8152-3.248-3.6452-3.012-5.6526-6.894-6.0224-11.649-.2113-2.377.0132-4.675.6736-6.894.6603-2.219 1.5716-4.253 2.7338-6.102 1.4263-1.954 3.1168-3.645 5.0715-5.071.1056-.106.4094-.343.9112-.713.5019-.37.9905-.713 1.466-1.03.4755-.317 1.1885-.819 2.1395-1.506L99.1601 86.44c-2.5886 2.166-5.1507 4.556-7.6864 7.171-2.5358 2.615-4.8338 5.376-6.8941 8.281-2.0602 2.906-3.7111 5.983-4.9526 9.232-1.2414 3.249-1.8621 6.669-1.8621 10.262 0 3.328.6999 6.458 2.0999 9.39 1.3999 2.932 3.2621 5.481 5.5865 7.646 2.3244 2.166 5.0054 3.87 8.043 5.112 3.0376 1.241 6.1148 1.862 9.2317 1.862.106 0 .594-.053 1.466-.159.872-.105 1.796-.237 2.773-.396.978-.158 1.876-.33 2.695-.515.818-.185 1.228-.383 1.228-.594l-.476-2.219c-2.06-10.407-4.015-20.365-5.863-29.874zm2.773-.317 6.498 31.459c3.751-1.427 6.286-3.87 7.607-7.33 1.321-3.46 1.624-6.973.911-10.539-.713-3.566-2.39-6.723-5.032-9.47-2.641-2.747-5.969-4.12-9.984-4.12zm-8.3204-42.394c1.6374-.846 3.1564-2.113 4.5564-3.804 1.4-1.69 2.694-3.5 3.883-5.428 1.188-1.928 2.219-3.896 3.09-5.904.872-2.007 1.572-3.829 2.1-5.467.581-1.743.977-3.698 1.189-5.864.211-2.166-.132-3.988-1.03-5.468-.634-1.32-1.466-2.086-2.496-2.298-1.031-.211-2.061-.132-3.091.238-1.03.37-2.007.964-2.932 1.783-.924.819-1.598 1.545-2.02 2.179-1.163 2.06-2.18 4.358-3.0513 6.894-.8717 2.536-1.466 5.164-1.7829 7.885-.317 2.72-.3566 5.335-.1189 7.845.2377 2.509.8056 4.979 1.7037 7.409zm-2.3772 2.456c-.8981-3.486-1.6905-6.907-2.3773-10.262-.6868-3.354-1.0301-6.801-1.0301-10.341 0-2.588.1849-5.428.5547-8.518.3697-3.09 1.0433-6.102 2.0206-9.034.9773-2.932 2.3244-5.56 4.0413-7.884 1.7174-2.325 4.0014-4.015 6.8544-5.072.264-.105.528-.158.792-.158.37 0 .806.211 1.308.634.502.422 1.03 1.043 1.585 1.862.554.819 1.043 1.664 1.466 2.536.422.871.739 1.466.951 1.783 1.426 2.694 2.469 5.56 3.13 8.597.66 3.038 1.043 6.062 1.149 9.073.211 4.544-.04 9.034-.753 13.472-.713 4.437-2.153 8.769-4.319 12.995-.739 1.268-1.492 2.549-2.258 3.843-.766 1.295-1.677 2.549-2.734 3.764-.211.212-.594.595-1.149 1.149l-1.704 1.704c-.581.581-1.096 1.123-1.545 1.624-.449.502-.673.806-.673.912l3.248 15.848c.021.104 1.625 0 1.625 0 3.1.039 6.382.541 9.232 1.664 2.747 1.268 5.111 3.011 7.092 5.23 1.981 2.219 3.565 4.715 4.754 7.488 1.189 2.774 1.783 5.587 1.783 8.44 0 2.852-.423 5.758-1.268 8.716-2.166 5.6-5.626 9.747-10.38 12.441-.529.317-1.282.674-2.259 1.07-.977.396-1.36 1.017-1.149 1.862 1.268 5.756 2.126 9.716 2.576 11.886.449 2.17.779 4.97.99 8.4.211 3.28-.357 6.23-1.704 8.87-1.347 2.65-3.156 4.8-5.428 6.46-2.271 1.67-4.345 2.64-6.22 2.94-1.876.29-3.157.43-3.843.43-2.3776 0-4.702-.45-6.9736-1.35-2.7999-1.05-5.1507-2.66-7.0525-4.83-1.9018-2.17-2.8527-4.81-2.8527-7.92 0-1.96.5679-3.97 1.7037-6.03 1.1358-2.06 2.6282-3.54 4.4771-4.43 2.0603-1.06 3.9225-1.35 5.5866-.88 1.664.48 3.0375 1.38 4.1205 2.7 1.0829 1.32 1.8359 2.92 2.2589 4.79.422 1.88.396 3.63-.08 5.27-.475 1.64-1.439 3.03-2.892 4.16-1.4528 1.14-3.4735 1.65-6.062 1.55 1.0565 1.9 2.5357 3.1 4.4375 3.6 1.9018.51 3.8565.54 5.8635.12 2.008-.42 3.896-1.2 5.666-2.34 1.77-1.13 3.157-2.36 4.16-3.68.634-.95 1.11-2.19 1.427-3.72.317-1.54.502-3.13.554-4.8.053-1.66 0-2.96-.158-3.88-.159-.93-.423-2.37-.793-4.32-1.584-6.39-2.588-10.41-3.011-12.05-.211-.523-.779-.695-1.703-.51-.925.185-1.704.357-2.338.51-4.543.59-8.3468.32-11.4108-.787-4.7545-1.268-8.9411-3.527-12.5598-6.776-3.6187-3.248-6.5242-7.184-8.7166-11.807-2.1923-4.622-3.2885-8.135-3.2885-10.539v-4.556c0-4.279.7396-8.294 2.2188-12.045 2.7998-5.864 6.1148-11.252 9.9448-16.165 3.83-4.913 8.2015-9.483 13.1145-13.709z",
    
    // Official standard F-clef (Bass clef) vector outline including dots
    bass: "M 1239,8245 C 1397,8138 1515,8057 1591,8001 C 1667,7946 1747,7877 1829,7795 C 1911,7713 1980,7620 2036,7517 C 2080,7441 2118,7353 2149,7253 C 2180,7154 2196,7058 2199,6967 C 2199,6882 2188,6801 2165,6725 C 2143,6648 2105,6585 2051,6534 C 1997,6484 1927,6459 1840,6459 C 1756,6459 1677,6476 1603,6509 C 1530,6543 1478,6597 1449,6673 C 1449,6680 1445,6689 1439,6702 C 1441,6718 1449,6730 1464,6739 C 1479,6748 1492,6752 1504,6752 C 1510,6752 1527,6749 1553,6743 C 1580,6737 1602,6733 1620,6733 C 1673,6733 1720,6752 1763,6789 C 1805,6826 1826,6871 1826,6924 C 1826,6962 1815,6998 1794,7031 C 1773,7064 1744,7091 1707,7110 C 1670,7130 1629,7139 1585,7139 C 1505,7139 1437,7115 1381,7066 C 1326,7016 1298,6953 1298,6874 C 1298,6773 1329,6686 1390,6612 C 1452,6538 1530,6483 1626,6446 C 1721,6408 1817,6390 1915,6390 C 2022,6390 2124,6417 2219,6472 C 2315,6526 2390,6601 2446,6694 C 2502,6788 2531,6888 2531,6996 C 2531,7188 2467,7366 2339,7531 C 2211,7696 2053,7839 1864,7961 C 1738,8044 1534,8156 1253,8297 L 1239,8245 z M 2628,6698 C 2628,6662 2641,6632 2667,6608 C 2692,6583 2723,6571 2760,6571 C 2792,6571 2822,6585 2849,6612 C 2876,6638 2889,6669 2889,6703 C 2889,6739 2875,6770 2849,6795 C 2821,6819 2790,6831 2755,6831 C 2718,6831 2688,6819 2664,6792 C 2640,6766 2628,6735 2628,6698 z M 2628,7222 C 2628,7186 2641,7155 2665,7131 C 2690,7106 2721,7094 2760,7094 C 2792,7094 2821,7107 2849,7134 C 2875,7161 2889,7190 2889,7222 C 2889,7261 2876,7292 2851,7317 C 2825,7342 2795,7355 2760,7355 C 2721,7355 2690,7342 2665,7318 C 2641,7294 2628,7262 2628,7222 z"
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

      // 4. Clefs (Standard classical music engraving alignment)
      const clefX = leftX + 10;
      
      // Treble Clef (G-clef: perfectly anchored around G4 on line 2)
      const tClef = document.createElementNS(svgNS, "path");
      tClef.setAttribute("d", CLEF_PATHS.treble);
      tClef.setAttribute("class", "clef-symbol treble-clef");
      const tScale = 0.416667;
      const tTransX = clefX - 30.3;
      const tTransY = trebleLine5Y - 21.5;
      tClef.setAttribute("transform", `translate(${tTransX}, ${tTransY}) scale(${tScale})`);
      sysGroup.appendChild(tClef);

      // Bass Clef (F-clef: head and dots perfectly straddle F3 on line 4)
      const bClef = document.createElementNS(svgNS, "path");
      bClef.setAttribute("d", CLEF_PATHS.bass);
      bClef.setAttribute("class", "clef-symbol bass-clef");
      const bScale = 0.016935;
      const bTransX = clefX - 21.0;
      const bTransY = bassLine5Y - 108.0;
      bClef.setAttribute("transform", `translate(${bTransX}, ${bTransY}) scale(${bScale})`);
      sysGroup.appendChild(bClef);

      // 5. Time signature (2/4) on first system
      let headerWidth = 46; // room for clefs
      if (isFirstSystem) {
        const timeSigX = clefX + 36;
        headerWidth += 34;
        
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
