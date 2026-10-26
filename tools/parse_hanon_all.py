import re
import os
import json

NOTE_ORDER = ["c", "d", "e", "f", "g", "a", "b"]
NOTE_SEMITONES = {"c": 0, "d": 2, "e": 4, "f": 5, "g": 7, "a": 9, "b": 11}

def note_str_to_midi(letter, octave):
    return (octave + 1) * 12 + NOTE_SEMITONES[letter.lower()]

def midi_to_note_name(midi):
    names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    octave = (midi // 12) - 1
    name = names[midi % 12]
    return f"{name}{octave}"

def midi_to_freq(midi):
    return round(440.0 * (2.0 ** ((midi - 69.0) / 12.0)), 2)

def extract_block(text, block_name):
    # Find block_name = { ... } or block_name = \relative ... { ... }
    pattern = rf"{block_name}\s*=\s*(?:\\relative\s+([a-g][,\x27]*)\s*)?\{{"
    m = re.search(pattern, text)
    if not m:
        return None, None
    rel_pitch = m.group(1) # None if absolute
    start = m.end()
    depth = 1
    i = start
    while i < len(text) and depth > 0:
        if text[i] == '{':
            depth += 1
        elif text[i] == '}':
            depth -= 1
        i += 1
    block_body = text[start:i-1]
    return rel_pitch, block_body

def tokenize_line(line):
    # Remove comments
    line = re.sub(r"%.*$", "", line)
    # Remove markups, stems, beams, bar lines
    line = re.sub(r'\\bar\s+"[^"]+"', "", line)
    line = re.sub(r'\\bar\s+[^\s]+', "", line)
    line = re.sub(r'\\markup\s*\{[^}]*\}', "", line)
    line = re.sub(r'\\markup\s+"[^"]*"', "", line)
    line = re.sub(r'\\markup\s+[^\s]+', "", line)
    line = re.sub(r'\\repeat\s+[^\s]+\s+\d+', "", line)
    line = re.sub(r'\\tempo\s+[^\s]+', "", line)
    line = re.sub(r'\^"[^"]*"', "", line)
    line = re.sub(r'_"[^"]*"', "", line)
    line = re.sub(r'\^[^\s]+', "", line)
    line = re.sub(r'_[^\s]+', "", line)
    # Remove general backslash commands
    line = re.sub(r'\\[a-zA-Z]+', "", line)
    # Remove < and >
    line = line.replace("<", " ").replace(">", " ")
    
    # Extract tokens
    raw_tokens = line.strip().split()
    tokens = []
    for t in raw_tokens:
        t = t.strip()
        if not t:
            continue
        # Check if contains a note letter
        if re.search(r"[a-gA-G]", t):
            tokens.append(t)
    return tokens

def parse_measure_tokens(tokens, is_relative, current_ref):
    # tokens are e.g. ["c16-1", "e-2", ...] or ["c", "16-1", "a", "-5"]
    # We must pair note pitch with finger if finger is separated
    notes = []
    
    # Normalize tokens: sometimes pitch and "-1" or "16-1" are separate tokens:
    # e.g. ["c", "16-1", "a", "-5"] or ["c16-1", "e-2"]
    i = 0
    normalized = []
    while i < len(tokens):
        tok = tokens[i]
        # Does tok have a note letter?
        m_note = re.search(r"([a-gA-G][,\x27]*)", tok)
        if m_note:
            pitch_part = m_note.group(1)
            f_match = re.search(r"-([1-5])", tok)
            finger = int(f_match.group(1)) if f_match else None
            # Check if next token is a duration/finger like "16-1" or "-5"
            if finger is None and i + 1 < len(tokens):
                next_tok = tokens[i+1]
                next_f = re.search(r"-([1-5])", next_tok)
                if next_f and not re.search(r"[a-gA-G]", next_tok):
                    finger = int(next_f.group(1))
                    i += 1
                elif re.match(r"^[1-5]$", next_tok):
                    finger = int(next_tok)
                    i += 1
            normalized.append((pitch_part, finger))
        i += 1
        
    for pitch_part, finger in normalized:
        letter = pitch_part[0].lower()
        quotes_up = pitch_part.count("'")
        quotes_down = pitch_part.count(",")
        
        if is_relative:
            curr_oct, curr_letter = current_ref
            curr_idx = NOTE_ORDER.index(curr_letter)
            target_idx = NOTE_ORDER.index(letter)
            diff = target_idx - curr_idx
            if diff > 3:
                octave = curr_oct - 1
            elif diff < -3:
                octave = curr_oct + 1
            else:
                octave = curr_oct
            octave += quotes_up - quotes_down
            current_ref = (octave, letter)
        else:
            # Absolute pitch
            # In LilyPond absolute:
            # c = C4, c' = C5, c'' = C6, c''' = C7
            # c, = C3, c,, = C2
            octave = 4 + quotes_up - quotes_down
            current_ref = (octave, letter)
            
        midi = note_str_to_midi(letter, octave)
        note_name = midi_to_note_name(midi)
        notes.append({"note": note_name, "midi": midi, "freq": midi_to_freq(midi), "finger": finger})
        
    return notes, current_ref

def parse_exercise(num):
    fname = f"tools/mutopia_lys/virtuoso-pianist-pt1-lys/hanon{num:02d}.ily"
    with open(fname) as f:
        text = f.read()
        
    rh_rel, rh_block = extract_block(text, "RH")
    lh_rel, lh_block = extract_block(text, "LH")
    
    is_rh_rel = rh_rel is not None
    is_lh_rel = lh_rel is not None
    
    # Reference pitches:
    # In lilypond: \relative c starts with c3 as reference; \relative e starts with e4
    # For treble: \relative e -> (4, 'e'), \relative c -> (3, 'c') or (4, 'c')
    # Let's inspect based on num:
    if is_rh_rel:
        if rh_rel == "c":
            rh_ref = (3, "c")
        elif rh_rel == "e":
            rh_ref = (4, "e")
        else:
            rh_ref = (4, rh_rel[0])
    else:
        rh_ref = (4, "c")
        
    if is_lh_rel:
        if lh_rel == "c,":
            lh_ref = (2, "c")
        elif lh_rel == "e,":
            lh_ref = (3, "e")
        else:
            lh_ref = (2, lh_rel[0])
    else:
        lh_ref = (3, "c")
        
    # Split blocks by lines
    rh_lines = rh_block.splitlines()
    lh_lines = lh_block.splitlines()
    
    rh_measures = []
    for line in rh_lines:
        toks = tokenize_line(line)
        if not toks:
            continue
        m_notes, rh_ref = parse_measure_tokens(toks, is_rh_rel, rh_ref)
        if m_notes:
            rh_measures.append(m_notes)
            
    lh_measures = []
    for line in lh_lines:
        toks = tokenize_line(line)
        if not toks:
            continue
        m_notes, lh_ref = parse_measure_tokens(toks, is_lh_rel, lh_ref)
        if m_notes:
            lh_measures.append(m_notes)
            
    return rh_measures, lh_measures

for n in [1, 2, 3, 4, 5, 10, 15, 20]:
    rh_m, lh_m = parse_exercise(n)
    print(f"Ex {n}: RH measures={len(rh_m)}, LH measures={len(lh_m)}")
    if rh_m and lh_m:
        print(f"  M1 RH: {[x['note'] for x in rh_m[0]]}")
        print(f"  M1 LH: {[x['note'] for x in lh_m[0]]}")
        print(f"  Final RH: {[x['note'] for x in rh_m[-1]]}")
