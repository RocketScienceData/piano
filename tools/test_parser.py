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

def parse_relative_line(tokens, current_octave, current_letter):
    notes = []
    for tok in tokens:
        if not tok:
            continue
        tok = tok.replace("<", "").replace(">", "").replace("^", "").replace("_", "")
        tok = re.sub(r"\\\w+", "", tok)
        tok = re.sub(r'".*?"', "", tok)
        f_match = re.search(r"-([1-5])", tok)
        finger = int(f_match.group(1)) if f_match else None
        tok = re.sub(r"-[1-5]", "", tok)
        tok = re.sub(r"\d+", "", tok)
        pitch_str = tok.strip()
        if not pitch_str or pitch_str[0].lower() not in NOTE_ORDER:
            continue
        
        target_letter = pitch_str[0].lower()
        quotes_up = pitch_str.count("'")
        quotes_down = pitch_str.count(",")
        
        # Determine relative step
        curr_idx = NOTE_ORDER.index(current_letter)
        target_idx = NOTE_ORDER.index(target_letter)
        diff = target_idx - curr_idx
        
        # Closest pitch is within interval of 3 steps
        if diff > 3:
            octave = current_octave - 1
        elif diff < -3:
            octave = current_octave + 1
        else:
            octave = current_octave
            
        octave += quotes_up - quotes_down
        current_octave = octave
        current_letter = target_letter
        
        midi = note_str_to_midi(target_letter, octave)
        note_name = midi_to_note_name(midi)
        notes.append((note_name, midi, finger))
        
    return notes, current_octave, current_letter


def test_all_20():
    for num in range(1, 21):
        fname = f"tools/mutopia_lys/virtuoso-pianist-pt1-lys/hanon{num:02d}.ily"
        with open(fname) as f:
            content = f.read()
        lines = content.splitlines()
        print(f"Hanon {num} total lines: {len(lines)}")

test_all_20()

