import re
import os
import json

NOTE_ORDER = ["c", "d", "e", "f", "g", "a", "b"]
NOTE_SEMITONES = {"c": 0, "d": 2, "e": 4, "f": 5, "g": 7, "a": 9, "b": 11}

EXERCISE_TITLES = {
    1: ("Oefening N°1 in C", "Hanon Oefening 1: De Hanon Sprong", "Voorbereidende oefening voor soepelheid, onafhankelijkheid en gelijkmatigheid (Vingers 1-2 & 4-5)"),
    2: ("Oefening N°2 in C", "Hanon Oefening 2: Vingeronafhankelijkheid (3-4)", "Specifieke versterking voor de 3e en 4e vinger - hef de vingers hoog en gelijkmatig op"),
    3: ("Oefening N°3 in C", "Hanon Oefening 3: Vingeronafhankelijkheid (2-3-4)", "Vloeiende gelijkmatigheid en beheersing van vingers 2, 3 en 4"),
    4: ("Oefening N°4 in C", "Hanon Oefening 4: Zwakke Vingers Focus (3-4-5)", "Speciale training voor de fysiologisch zwakkere vingers 3, 4 en 5"),
    5: ("Oefening N°5 in C", "Hanon Oefening 5: Trillvoorbereiding & Hoge Heffing", "Alle 5 vingers - til de vingers hoog op als kleine hamertjes"),
    6: ("Oefening N°6 in C", "Hanon Oefening 6: Pinkversterking (Vinger 5)", "Versterking en gelijkmatige aanslag van de 5e vinger (pink)"),
    7: ("Oefening N°7 in C", "Hanon Oefening 7: Agiliteit Vingers 3-4-5", "Oefening van het hoogste belang voor de 3e, 4e en 5e vinger"),
    8: ("Oefening N°8 in C", "Hanon Oefening 8: Volledige Handbalans (1 t/m 5)", "Gelijkmatige heffing en klankkracht over alle vijf vingers"),
    9: ("Oefening N°9 in C", "Hanon Oefening 9: Vingerspreiding & Tertsensprong", "Uitbreiding van de spanwijdte tussen duim en pink"),
    10: ("Oefening N°10 in C", "Hanon Oefening 10: Trilltraining (3-4 & 4-5)", "Voorbereiding op de virtuoze trill tussen aangrenzende vingers"),
    11: ("Oefening N°11 in C", "Hanon Oefening 11: Dubbele Tertsen & Vingerontkoppeling", "Snelheid en flexibiliteit in gecombineerde intervallen"),
    12: ("Oefening N°12 in C", "Hanon Oefening 12: Flexibiliteit Duim & Pink (1-5)", "Zelfstandigheid van de buitenvingers met soepele pols"),
    13: ("Oefening N°13 in C", "Hanon Oefening 13: Soepelheid & Boogbeweging (3-4-5)", "Vloeiende vingerwisseling en ontspanning in de onderarm"),
    14: ("Oefening N°14 in C", "Hanon Oefening 14: Trilloefening Vingers 3 en 4", "Geavanceerde onafhankelijkheidstraining voor vingers 3 en 4"),
    15: ("Oefening N°15 in C", "Hanon Oefening 15: Spreiding 1-2 en 4-5", "Gelijkmatige extensie tussen duim-wijsvinger en ringvinger-pink"),
    16: ("Oefening N°16 in C", "Hanon Oefening 16: Tertsensprong & Vrijmaking Pink", "Rotatiebeweging van de pols en actieve pinkaanslag"),
    17: ("Oefening N°17 in C", "Hanon Oefening 17: Rotatie & Uitbreiding Vingers 1-5", "Volledige mobiliteit van het handgewricht"),
    18: ("Oefening N°18 in C", "Hanon Oefening 18: Snelle Vingerwisseling 1 t/m 5", "Gelijkmatige aanslag over het gehele register"),
    19: ("Oefening N°19 in C", "Hanon Oefening 19: Kracht & Dynamiek", "Krachtige, heldere toonvorming vanuit de vingertoppen"),
    20: ("Oefening N°20 in C", "Hanon Oefening 20: Meesterproef Deel 1 (Virtuoos)", "Bekroning van de voorbereidende oefeningen voor ultieme soepelheid")
}

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
    pattern = rf"{block_name}\s*=\s*(?:\\relative\s+([a-g][,\x27]*)\s*)?\{{"
    m = re.search(pattern, text)
    if not m:
        return None, None
    rel_pitch = m.group(1)
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
    line = re.sub(r"%.*$", "", line)
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
    line = re.sub(r'\\[a-zA-Z]+', "", line)
    line = line.replace("<", " ").replace(">", " ")
    
    raw_tokens = line.strip().split()
    tokens = []
    for t in raw_tokens:
        t = t.strip()
        if not t:
            continue
        if re.search(r"[a-gA-G]", t):
            tokens.append(t)
    return tokens

def parse_measure_tokens(tokens, is_relative, current_ref):
    notes = []
    i = 0
    normalized = []
    while i < len(tokens):
        tok = tokens[i]
        m_note = re.search(r"([a-gA-G][,\x27]*)", tok)
        if m_note:
            pitch_part = m_note.group(1)
            f_match = re.search(r"-([1-5])", tok)
            finger = int(f_match.group(1)) if f_match else None
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
            octave = 4 + quotes_up - quotes_down
            current_ref = (octave, letter)
            
        midi = note_str_to_midi(letter, octave)
        note_name = midi_to_note_name(midi)
        notes.append({"note": note_name, "midi": midi, "freq": midi_to_freq(midi), "finger": finger})
        
    return notes, current_ref

def parse_lily_exercise(num):
    fname = f"tools/mutopia_lys/virtuoso-pianist-pt1-lys/hanon{num:02d}.ily"
    with open(fname) as f:
        text = f.read()
        
    rh_rel, rh_block = extract_block(text, "RH")
    lh_rel, lh_block = extract_block(text, "LH")
    
    is_rh_rel = rh_rel is not None
    is_lh_rel = lh_rel is not None
    
    if is_rh_rel:
        if rh_rel == "c":
            rh_ref = (4, "c")
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

def propagate_fingering(measures, fallback_fingers):
    for m in measures:
        for idx, n in enumerate(m):
            if n["finger"] is None:
                if idx < len(fallback_fingers):
                    n["finger"] = fallback_fingers[idx]
                else:
                    n["finger"] = 1

def build_exercise_json(num, rh_measures, lh_measures):
    name, title, subtitle = EXERCISE_TITLES[num]
    
    # Extract ascending and descending motifs for fingering propagation
    rh_asc_fingers = [n["finger"] for n in rh_measures[0] if n["finger"] is not None]
    if len(rh_asc_fingers) < 8 and len(rh_measures) > 1:
        rh_asc_fingers = [n["finger"] for n in rh_measures[1] if n["finger"] is not None]
        
    lh_asc_fingers = [n["finger"] for n in lh_measures[0] if n["finger"] is not None]
    if len(lh_asc_fingers) < 8 and len(lh_measures) > 1:
        lh_asc_fingers = [n["finger"] for n in lh_measures[1] if n["finger"] is not None]
        
    # Find turnaround measure (descending starts)
    # Typically measure 15 (index 14)
    desc_start_idx = 14
    rh_desc_fingers = []
    lh_desc_fingers = []
    if len(rh_measures) > desc_start_idx:
        rh_desc_fingers = [n["finger"] for n in rh_measures[desc_start_idx] if n["finger"] is not None]
    if len(lh_measures) > desc_start_idx:
        lh_desc_fingers = [n["finger"] for n in lh_measures[desc_start_idx] if n["finger"] is not None]
        
    # Default fallbacks if LilyPond had omissions
    if len(rh_asc_fingers) < 8:
        rh_asc_fingers = [1, 2, 3, 4, 5, 4, 3, 2]
    if len(lh_asc_fingers) < 8:
        lh_asc_fingers = [5, 4, 3, 2, 1, 2, 3, 4]
    if len(rh_desc_fingers) < 8:
        rh_desc_fingers = [5, 4, 3, 2, 1, 2, 3, 4]
    if len(lh_desc_fingers) < 8:
        lh_desc_fingers = [1, 2, 3, 4, 5, 4, 3, 2]
        
    total_m = min(len(rh_measures), len(lh_measures))
    measures_data = []
    total_notes = 0
    
    for m_idx in range(total_m):
        m_num = m_idx + 1
        rh_notes = rh_measures[m_idx]
        lh_notes = lh_measures[m_idx]
        
        is_final = (m_idx == total_m - 1)
        is_desc = (m_idx >= desc_start_idx and not is_final)
        m_type = "final" if is_final else ("descending" if is_desc else "ascending")
        
        # Propagate fingers
        target_rh_f = rh_desc_fingers if is_desc else rh_asc_fingers
        target_lh_f = lh_desc_fingers if is_desc else lh_asc_fingers
        
        n_count = min(len(rh_notes), len(lh_notes))
        notes_list = []
        for n_i in range(n_count):
            rh_n = rh_notes[n_i]
            lh_n = lh_notes[n_i]
            
            f_rh = rh_n["finger"] if rh_n["finger"] is not None else target_rh_f[n_i % len(target_rh_f)]
            f_lh = lh_n["finger"] if lh_n["finger"] is not None else target_lh_f[n_i % len(target_lh_f)]
            if is_final:
                f_rh = 1
                f_lh = 5
                
            box_fake = {
                "x1": 100.0 + n_i * 30.0,
                "y1": 100 + (m_idx % 4) * 80,
                "x2": 130.0 + n_i * 30.0,
                "y2": 180 + (m_idx % 4) * 80
            }
            
            notes_list.append({
                "measure": m_num,
                "note_index": n_i,
                "rh": {
                    "note": rh_n["note"],
                    "midi": rh_n["midi"],
                    "freq": rh_n["freq"],
                    "finger": f_rh
                },
                "lh": {
                    "note": lh_n["note"],
                    "midi": lh_n["midi"],
                    "freq": lh_n["freq"],
                    "finger": f_lh
                },
                "box": box_fake
            })
            total_notes += 1
            
        m_box_fake = {
            "x1": 100.0,
            "y1": 100 + (m_idx % 4) * 80,
            "x2": 350.0,
            "y2": 180 + (m_idx % 4) * 80
        }
        
        measures_data.append({
            "measure": m_num,
            "type": m_type,
            "box": m_box_fake,
            "notes": notes_list
        })
        
    return {
        "exercise_id": f"ex{num}",
        "number": num,
        "title": f"Hanon Exercise No. {num} in C",
        "name": name,
        "total_measures": total_m,
        "total_notes": total_notes,
        "measures": measures_data
    }

def generate_all():
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    for num in range(3, 21):
        rh_m, lh_m = parse_lily_exercise(num)
        ex_json = build_exercise_json(num, rh_m, lh_m)
        out_file = os.path.join(data_dir, f"hanon_ex{num}.json")
        with open(out_file, "w") as f:
            json.dump(ex_json, f, indent=2)
        print(f"Generated hanon_ex{num}.json: {ex_json['total_measures']} measures, {ex_json['total_notes']} notes.")

if __name__ == "__main__":
    generate_all()
