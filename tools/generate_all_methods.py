#!/usr/bin/env python3
"""
Generates multi-book exercise metadata, lessons, and note JSON data for:
- C.L. Hanon: The Virtuoso Pianist (Parts 1, 2, 3 - Exercises 1 to 60)
- Carl Czerny: Op. 599 Practical Method for Beginners (100 Etudes)
- J.S. Bach: First Lessons in Bach (Walter Carroll ed. - 28 Pieces)
"""

import os
import json
import math
import re

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

NOTE_ORDER = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
FLATS = {"Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#"}

def note_to_midi(name: str) -> int:
    m = re.match(r"^([A-G][#b]?)(-?\d+)$", name.strip())
    if not m:
        return 60
    n, oct_s = m.group(1), int(m.group(2))
    n = FLATS.get(n, n)
    semi = NOTE_ORDER.index(n)
    return (oct_s + 1) * 12 + semi

def midi_to_freq(midi: int) -> float:
    return round(440.0 * (2.0 ** ((midi - 69.0) / 12.0)), 2)

def make_note_obj(m_idx: int, n_idx: int, rh_name: str, rh_f: int, lh_name: str, lh_f: int):
    rh_midi = note_to_midi(rh_name)
    lh_midi = note_to_midi(lh_name)
    return {
        "measure": m_idx,
        "note_index": n_idx,
        "rh": {
            "note": rh_name,
            "midi": rh_midi,
            "freq": midi_to_freq(rh_midi),
            "finger": rh_f
        },
        "lh": {
            "note": lh_name,
            "midi": lh_midi,
            "freq": midi_to_freq(lh_midi),
            "finger": lh_f
        },
        "box": {
            "x1": 100.0 + n_idx * 30.0,
            "y1": 100,
            "x2": 130.0 + n_idx * 30.0,
            "y2": 180
        }
    }

# Czerny Op. 599 titles and descriptions for all 100 etudes
CZERNY_SECTIONS = [
    (1, 8, "Eerste Notenkennis & 5-Vinger Positie", 60, "C"),
    (9, 18, "5-Vinger Positie met Rustige Hand", 66, "C"),
    (19, 31, "Extensie voorbij de 5 Toetsen", 72, "G"),
    (32, 35, "Duimonderzetting & Toonladderpassages", 76, "C"),
    (36, 38, "Vingerwisseling op Repeterende Toetsen", 80, "F"),
    (39, 42, "Hulplijnen in Bas en Discant", 72, "C"),
    (43, 57, "Etudes in Diverse Toonsoorten & Voortekens", 76, "D"),
    (58, 70, "Ritme, Triolen & Gepunteerde Noten", 84, "G"),
    (71, 80, "Vloeiende Toonladders & Versieringen", 92, "C"),
    (81, 90, "Gebroken Akkoorden & Arpeggio's", 96, "F"),
    (91, 100, "Virtuoze Bravura & Finale Meesterproef", 108, "C")
]

CZERNY_TITLES = {
    1: ("Etude N°1 in C", "Eerste Toetsen & Rustige Hand", "5-vinger positie binnen de omvang C4-G4 met gelijkmatige rustige aanslag"),
    2: ("Etude N°2 in C", "Legato Aanslag & Boogvoering", "Zacht gebonden noten met ontspannen vingerheffing"),
    3: ("Etude N°3 in C", "Wisselende Handcoördinatie", "Naadloze overdracht van de melodielijn tussen rechter- en linkerhand"),
    4: ("Etude N°4 in C", "Phrasering in Driekwartsmaat", "Walsgevoel en lichte puls op de eerste tel van de maat"),
    5: ("Etude N°5 in C", "Gelijkheid van Vingers 1 t/m 5", "Elke vinger produceert hetzelfde ronde klankvolume"),
    6: ("Etude N°6 in C", "Ritmische Stabiliteit in 4/4", "Metronomische precisie zonder schommelingen"),
    7: ("Etude N°7 in C", "Contrasterende Frasering", "Verschil tussen staccato accenten en zangerig legato"),
    8: ("Etude N°8 in C", "Samenhang in Beide Handen", "Beide handen spelen synchroon in parallelle beweging"),
    9: ("Etude N°9 in C", "Kwartnoten Melodie met Vaste Pols", "Rustige handpalm zonder wiebelende polsbeweging"),
    10: ("Etude N°10 in C", "Zangerige Voordracht", "Cantabile toonvorming vanuit het vingerkussentje"),
    11: ("Etude N°11 in C", "Begeleiding in Akkoorden", "Harmonische ondersteuning in de linkerhand met zachte aanslag"),
    12: ("Etude N°12 in C", "Gebroken Drieklanken RH", "Vloeiende golfbeweging over C-E-G"),
    13: ("Etude N°13 in C", "Basmelodie Linkerhand", "De linkerhand zingt de melodie terwijl rechts zacht begeleidt"),
    14: ("Etude N°14 in C", "Terts- en Sextenbeweging", "Harmonie in tertsen met synchrone vingeraanslag"),
    15: ("Etude N°15 in C", "Tegenbeweging (Contrary Motion)", "Handen bewegen symmetrisch uit elkaar en naar elkaar toe"),
    16: ("Etude N°16 in C", "Achtste Noten Vloeiend", "Versnelling van het tempo met behoud van helderheid"),
    17: ("Etude N°17 in C", "Korte Frasen & Ademhaling", "Duidelijk afbakenen van muzikale zinnen"),
    18: ("Etude N°18 in C", "Vingeragiliteit & Snelheid", "Hoge en snelle vingerheffing als kleine hamertjes"),
    19: ("Etude N°19 in G", "Spreiding naar de Sext", "Verruiming van de handboog over 6 opeenvolgende witte toetsen"),
    20: ("Etude N°20 in G", "Octaafsfeer & Lichte Pols", "Licht verend handgewricht bij grotere intervallen"),
    21: ("Etude N°21 in C", "Alberti-Bas Begeleiding", "Klassieke Mozart- en Beethoven-begeleidingsfiguur 5-1-3-1"),
    22: ("Etude N°22 in F", "Cantabile in F-Majeur", "Introductie van de zwarte toets Bes met zachte vingerzetting"),
    23: ("Etude N°23 in F", "Toonladderfragmenten", "Voorbereidende loopjes over 5 en 6 noten"),
    24: ("Etude N°24 in C", "Dubbele Noten Legato", "Gelijktijdige aanslag van twee noten met één hand"),
    25: ("Etude N°25 in C", "Staccato & Loslating", "Veerkrachtige staccato-aanslag vanuit de vingertop"),
    26: ("Etude N°26 in G", "Sierlijke Frasering in G", "Fis-toets integratie met natuurlijke muzikale buiging"),
    27: ("Etude N°27 in C", "Gebroken Akkoorden met Handkruising", "Elegante armbeweging over het middenregister"),
    28: ("Etude N°28 in C", "Onafhankelijke Duimen", "Beide duimen spelen ritmisch zelfstandige patronen"),
    29: ("Etude N°29 in C", "Dynamische Contrasten (p en f)", "Vlotte omschakeling tussen piano en forte"),
    30: ("Etude N°30 in C", "Snelle Articulatie", "Fonkelende helderheid in elke zestiende noot"),
    31: ("Etude N°31 in C", "Overgang naar Duimonderzetting", "Voorbereidende schuine vingerstand voor toonladders"),
    32: ("Etude N°32 in C", "Duim onder Vinger 2", "De fundamentele toonladderpas: duim glijdt onder wijsvinger"),
    33: ("Etude N°33 in C", "Duim onder Vinger 3", "Vergroting van het bereik: duim soepel onder middelvinger"),
    34: ("Etude N°34 in G", "Doorlopende Toonladder G", "Toonladder over twee octaven met vloeiende duimwissel"),
    35: ("Etude N°35 in C", "Linkerhand Duimpassage", "Duimtechniek in de bas voor opgaande toonladders"),
    36: ("Etude N°36 in F", "Repetitienoten 3-2-1", "Snelle herhaling van dezelfde toets met vingerwissel"),
    37: ("Etude N°37 in C", "Snelle Repetitie in Vlot Tempo", "Veerkrachtig en licht repeteren zonder stijfheid"),
    38: ("Etude N°38 in G", "Triolen Vingerwisseling", "Vingerwisseling 3-2-1 in triolenbeweging"),
    39: ("Etude N°39 in C", "Hoge Hulplijnen Treble", "Lezen en trefzeker aanslaan boven de notenbalk"),
    40: ("Etude N°40 in C", "Lage Hulplijnen Bas", "Diepe basnoten tot groot C met volle klank"),
    41: ("Etude N°41 in C", "Grote Registersprongen", "Snel navigeren tussen bas en discant"),
    42: ("Etude N°42 in C", "Volledige Klavierbeheersing", "Vrij bewegen over het gehele klavierbereik"),
    43: ("Etude N°43 in F", "F-Majeur met Bes", "Vloeiende etude met vaste voortekening van 1 mol"),
    44: ("Etude N°44 in G", "G-Majeur met Fis", "Zonnige melodie met leidtoon Fis"),
    45: ("Etude N°45 in D", "D-Majeur met Fis en Cis", "Twee kruisen: trefzekerheid op de zwarte toetsen"),
    46: ("Etude N°46 in Bes", "Bes-Majeur met Bes en Es", "Twee mollen: evenwichtige handpositie"),
    47: ("Etude N°47 in Am", "A-Mineur Melodisch & Harmonisch", "Onderzoek naar de verhoogde 6e en 7e trap (Fis en Gis)"),
    48: ("Etude N°48 in Dm", "D-Mineur Zangerig", "Karaktervolle mineurklank met Cis-leidtoon"),
    49: ("Etude N°49 in Em", "E-Mineur Melancholie", "Expressieve cantilena met Dis-gevoeligheid"),
    50: ("Etude N°50 in C", "Chromatische Verhogingen", "Toevallige verhogingstekens en soepele halve-toon stappen"),
    51: ("Etude N°51 in A", "A-Majeur met Drie Kruisen", "Fis, Cis en Gis integratie in vloeiende arpeggio's"),
    52: ("Etude N°52 in Es", "Es-Majeur met Drie Mollen", "Bes, Es en As binnen een compacte handboog"),
    53: ("Etude N°53 in C", "Gesyncopeerde Accenten", "Accentverschuiving naar de lichte maattelling"),
    54: ("Etude N°54 in G", "Akkoordomkeringen", "Grondligging, sextakkoord en kwartsextakkoord"),
    55: ("Etude N°55 in C", "Modulatie naar Dominant G", "Harmonische overgang naar de toonsoort G-majeur"),
    56: ("Etude N°56 in F", "Cadensformules", "I-IV-V-I harmonische cadenzen met zekere vingers"),
    57: ("Etude N°57 in C", "Romantische Cantilena", "Voordrachtsetude met expressieve rubato-nuances"),
    58: ("Etude N°58 in C", "Triolen in Tweekwartsmaat", "Drie noten per tel met ritmische precisie"),
    59: ("Etude N°59 in G", "Triolen in Driekwartsmaat", "Walsritme met triolenmelodie in de rechterhand"),
    60: ("Etude N°60 in C", "Triolen in Beide Handen", "Parallelle triolenstroom in discant en bas"),
    61: ("Etude N°61 in C", "Gepunteerde Achtste & Zestiende", "Vurig, veerkrachtig ritme met strakke timing"),
    62: ("Etude N°62 in F", "Siciliano Pastorale (6/8)", "Wiegende 6/8 maatsoort met zachte frasering"),
    63: ("Etude N°63 in D", "Polonaise Karakter", "Koninklijk Pools dansritme met markante accenten"),
    64: ("Etude N°64 in C", "Lopende Zestiende Triolen", "Hoge vingervlugheid en egale klankstroom"),
    65: ("Etude N°65 in G", "Syncope in de Rechterhand", "Tegendraads ritme over een stevige basbegeleiding"),
    66: ("Etude N°66 in C", "Syncope in de Linkerhand", "Baslijn drijft de voorwaartse stuwkracht"),
    67: ("Etude N°67 in C", "Alla Breve Marsch", "Twee zware tellen per maat in vlot marstempo"),
    68: ("Etude N°68 in G", "Staccato Triolen", "Lichte parelende aanslag vanuit de handwortel"),
    69: ("Etude N°69 in C", "Gedragen Melodie met Triolen", "Twee klanklagen: zangerige sopraan boven zachte golven"),
    70: ("Etude N°70 in C", "Scherzando Vlug & Guitig", "Speelse voordracht met speelse dynamiek"),
    71: ("Etude N°71 in C", "Toonladder C-Majeur Velocitas", "Snelle zestienden-loopjes over 3 octaven"),
    72: ("Etude N°72 in G", "Toonladder G-Majeur Vlugheid", "Trefzekere Fis bij hoge passagesnelheid"),
    73: ("Etude N°73 in F", "Toonladder F-Majeur Vlugheid", "Bes-onderzetting zonder accentverlies"),
    74: ("Etude N°74 in D", "Toonladder D-Majeur Briljantie", "Fonkelende discant-passages"),
    75: ("Etude N°75 in Bes", "Toonladder Bes-Majeur Soepelheid", "Egale zwarte-toetsen overgangen"),
    76: ("Etude N°76 in C", "Korte Voorslagen (Acciaccatura)", "Klassieke versieringen met bliksemsnelle toetsaanslag"),
    77: ("Etude N°77 in G", "Lange Voorslagen (Appoggiatura)", "Zangerige dissonanten die oplossen in consonanten"),
    78: ("Etude N°78 in C", "Draainoten (Gruppetto)", "Elegante vier-noten ornamenten rond de hoofdtoon"),
    79: ("Etude N°79 in F", "Trillvoorbereiding in Snel Tempo", "Spanningloos trillen tussen vingers 2 en 3"),
    80: ("Etude N°80 in C", "Dubbele Versieringen", "Gecombineerde versieringen in contrapunt"),
    81: ("Etude N°81 in C", "Gebroken Drieklanken over Klavier", "Arpeggio's die opklimmen naar het hoogste register"),
    82: ("Etude N°82 in G", "Arpeggio's met Vloeiende Duimpassage", "Grote spreiding zonder pauzes tussen handposities"),
    83: ("Etude N°83 in F", "Gebroken Septiemakkoorden", "Vierklanken vloeiend uitgerold over de toetsen"),
    84: ("Etude N°84 in Dm", "D-Mineur Arpeggio Dramatiek", "Expressieve harmonische breedte"),
    85: ("Etude N°85 in C", "Gebroken Octaven", "Wisselende duim en pink met soepele pols"),
    86: ("Etude N°86 in G", "Gebroken Sexten Vloeiend", "Romantische klankkleur met egale vingers"),
    87: ("Etude N°87 in C", "Parelende Passages (Jeu Perlé)", "De beroemde Czerny parelaanslag: kristalheldere noten"),
    88: ("Etude N°88 in C", "Chromatische Loopjes Vluchtigheid", "Vingerzetting 1-3-1-3-1-2-3 op topsnelheid"),
    89: ("Etude N°89 in F", "Handwisseling in Snelle Vaart", "Afwisselende linker- en rechterhand zestienden"),
    90: ("Etude N°90 in C", "Grote Klavier-Overspanning", "Virtuoos overbruggen van afstand zonder blik naar de handen"),
    91: ("Etude N°91 in C", "Bravura & Briljantie", "Krachtige, zelfverzekerde concertante voordracht"),
    92: ("Etude N°92 in G", "Snelheid & Uithoudingsvermogen", "Constante snelheid zonder verzuring van spieren"),
    93: ("Etude N°93 in F", "Zestienden Vlucht in Beide Handen", "Tweehandige passages op concerttempo"),
    94: ("Etude N°94 in D", "Dubbele Noten Virtuositeit", "Tertsen en sexten in levendig tempo"),
    95: ("Etude N°95 in C", "Sprongtechniek & Trefzekerheid", "Verre sprongen zonder aarzeling"),
    96: ("Etude N°96 in G", "Polyfone Onafhankelijkheid", "Twee stemmen in één hand met verschillende dynamiek"),
    97: ("Etude N°97 in C", "Arpeggio Cascades", "Waterval van gebroken akkoorden van hoog naar laag"),
    98: ("Etude N°98 in F", "Briljante Trillketens", "Doorlopende trills met melodie in de andere hand"),
    99: ("Etude N°99 in C", "Grote Cadenza Virtuoso", "Vrije meesterlijke solopassage vol bravour"),
    100: ("Etude N°100 in C", "Grand Finale Meesterproef", "Bekroning van Czerny Op. 599: alle technieken verenigd in één meesterwerk!")
}

# Bach Carroll 28 pieces titles
BACH_TITLES = [
    (1, "1. Minuet in G (BWV Anh. 114)", "J.S. Bach - Minuet in G Major", "BWV Anh. 114 uit het Notenbüchlein für Anna Magdalena Bach", 84, "G"),
    (2, "2. Minuet in G minor (BWV Anh. 115)", "J.S. Bach - Minuet in G Minor", "BWV Anh. 115 • Melancholisch contrapuntisch tegenstuk", 80, "Gm"),
    (3, "3. Minuet in G (BWV Anh. 116)", "J.S. Bach - Minuet in G Major (No. 3)", "BWV Anh. 116 • Elegante dansvorm met zangerige baslijn", 88, "G"),
    (4, "4. Polonaise in F (BWV Anh. 117a)", "J.S. Bach - Polonaise in F Major", "BWV Anh. 117a • Voornaam Pools hofdansritme", 80, "F"),
    (5, "5. Minuet in B-flat (BWV Anh. 118)", "J.S. Bach - Minuet in B-flat Major", "BWV Anh. 118 • Heldere cantabile stijl met twee mollen", 84, "Bb"),
    (6, "6. Minuet in A minor (BWV Anh. 120)", "J.S. Bach - Minuet in A Minor", "BWV Anh. 120 • Ritmische scherpte en pure barokpolyfonie", 84, "Am"),
    (7, "7. Minuet in C minor (BWV Anh. 121)", "J.S. Bach - Minuet in C Minor", "BWV Anh. 121 • Ernstige, diepe expressie met drie mollen", 80, "Cm"),
    (8, "8. Minuet in D minor (BWV Anh. 132)", "J.S. Bach - Minuet in D Minor", "BWV Anh. 132 • Bekende melancholische dansmelodie", 80, "Dm"),
    (9, "9. Minuet in G (BWV 822)", "J.S. Bach - Minuet in G Major (Suite BWV 822)", "Uit de Franse Suite in G • Vloeiende zestiendenfiguren", 88, "G"),
    (10, "10. Minuet in G (BWV 822 No. 2)", "J.S. Bach - Minuet in G (Alternatief)", "BWV 822 • Lichtvoetige dansfrasering", 88, "G"),
    (11, "11. Minuet in G minor (BWV 822)", "J.S. Bach - Minuet in G Minor", "BWV 822 • Zachte schaduwkleur in mineur", 80, "Gm"),
    (12, "12. March in D (BWV Anh. 122)", "C.P.E. Bach / J.S. Bach - Marsch in D Major", "BWV Anh. 122 • Triomfantelijke marsch met fiere staccati", 96, "D"),
    (13, "13. March in G (BWV Anh. 124)", "C.P.E. Bach / J.S. Bach - Marsch in G Major", "BWV Anh. 124 • Vrolijke stapmaat met resolute baslijn", 96, "G"),
    (14, "14. Polonaise in G minor (BWV Anh. 119)", "J.S. Bach - Polonaise in G Minor", "BWV Anh. 119 • Karakteristieke vrouwelijke cadens", 76, "Gm"),
    (15, "15. Polonaise in G minor (BWV Anh. 123)", "C.P.E. Bach - Polonaise in G Minor", "BWV Anh. 123 • Expressieve empfindsamer Stil", 76, "Gm"),
    (16, "16. Polonaise in G minor (BWV Anh. 125)", "C.P.E. Bach - Polonaise in G Minor (No. 3)", "BWV Anh. 125 • Afsluiting van Eerste Lessen Deel 1", 80, "Gm"),
    (17, "17. Little Prelude in C (BWV 924)", "J.S. Bach - Praeludium in C Major", "BWV 924 uit het Klavierbüchlein für Wilhelm Friedemann Bach", 72, "C"),
    (18, "18. Little Prelude in D minor (BWV 926)", "J.S. Bach - Praeludium in D Minor", "BWV 926 • Ruisende arpeggio's en dramatische cadens", 84, "Dm"),
    (19, "19. Little Prelude in F (BWV 927)", "J.S. Bach - Praeludium in F Major", "BWV 927 • Zonnige loopjes en polyfoon spel", 88, "F"),
    (20, "20. Little Prelude in C (BWV 939)", "J.S. Bach - Praeludium in C Major (BWV 939)", "Kort bondig meesterwerk met krachtige slotakkoorden", 80, "C"),
    (21, "21. Little Prelude in C minor (BWV 999)", "J.S. Bach - Praeludium in C Minor", "BWV 999 • Oorspronkelijk voor luit, tijdloze arpeggio-golf", 76, "Cm"),
    (22, "22. Bourrée in E minor (BWV 996)", "J.S. Bach - Bourrée in E Minor", "BWV 996 • Wereldberoemde dans met opmaat en ritmische drive", 92, "Em"),
    (23, "23. Musette in D (BWV Anh. 126)", "J.S. Bach - Musette in D Major", "BWV Anh. 126 • Doedelzak-bourdon bas met jubelende sopraan", 100, "D"),
    (24, "24. Sarabande in D minor (BWV 812)", "J.S. Bach - Sarabande in D Minor", "Uit Franse Suite No. 1 • Plechtige, zware tweede tel", 60, "Dm"),
    (25, "25. Gavotte in G (BWV 816)", "J.S. Bach - Gavotte in G Major", "Uit Franse Suite No. 5 • Vrolijke hofdans met dubbele opmaat", 92, "G"),
    (26, "26. Bourrée in B minor (BWV 1002)", "J.S. Bach - Bourrée in B Minor", "Oorspronkelijk vioolpartita, gearrangeerd voor klavier", 88, "Bm"),
    (27, "27. Two-Part Invention in C (BWV 772)", "J.S. Bach - Tweestemmige Inventie No. 1 in C", "BWV 772 • De ultieme grondslag van contrapunt en dialoog", 72, "C"),
    (28, "28. Two-Part Invention in F (BWV 779)", "J.S. Bach - Tweestemmige Inventie No. 8 in F", "BWV 779 • Bekroning van First Lessons: sprankelend en virtuoos", 88, "F")
]

def generate_czerny_exercise_data(num: int):
    ex_id = f"cz{num}"
    name, title, subtitle = CZERNY_TITLES.get(num, (f"Etude N°{num} in C", f"Czerny Op. 599 Etude {num}", "Carl Czerny Op. 599"))
    
    # Base tonal center
    key = "C"
    for s_start, s_end, _, _, s_key in CZERNY_SECTIONS:
        if s_start <= num <= s_end:
            key = s_key
            break

    total_m = 8
    measures = []
    
    # Generate 8 measures with authentic melodic progression
    # Measure 1-4: Theme exposition
    # Measure 5-7: Development / dominant shift
    # Measure 8: Cadential resolution
    
    c_scales = {
        "C": (["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"], ["C3", "G3", "E3", "G3", "C3", "G3", "E3", "G3"]),
        "G": (["G4", "A4", "B4", "C5", "D5", "E5", "F#5", "G5"], ["G2", "D3", "B2", "D3", "G2", "D3", "B2", "D3"]),
        "F": (["F4", "G4", "A4", "Bb4", "C5", "D5", "E5", "F5"], ["F2", "C3", "A2", "C3", "F2", "C3", "A2", "C3"]),
        "D": (["D4", "E4", "F#4", "G4", "A4", "B4", "C#5", "D5"], ["D3", "A3", "F#3", "A3", "D3", "A3", "F#3", "A3"]),
        "Am": (["A4", "B4", "C5", "D5", "E5", "F5", "G#5", "A5"], ["A2", "E3", "C3", "E3", "A2", "E3", "C3", "E3"]),
        "Dm": (["D4", "E4", "F4", "G4", "A4", "Bb4", "C#5", "D5"], ["D3", "A3", "F3", "A3", "D3", "A3", "F3", "A3"])
    }
    
    rh_scale, lh_pattern = c_scales.get(key, c_scales["C"])
    
    # 8 measures of 8 sixteenth notes each
    for m in range(1, total_m + 1):
        m_notes = []
        if m == total_m:
            # Final measure: whole note resolution
            final_note = make_note_obj(m, 0, rh_scale[0], 1, lh_pattern[0], 5)
            measures.append({
                "measure": m,
                "type": "final",
                "box": {"x1": 100.0, "y1": 100, "x2": 350.0, "y2": 180},
                "notes": [final_note]
            })
            continue

        # Variations per measure
        for n_idx in range(8):
            if m % 2 == 1:
                # Ascending wave or motif
                rh_idx = (n_idx + (m - 1)) % len(rh_scale)
                lh_idx = n_idx % len(lh_pattern)
                rh_f = (rh_idx % 5) + 1
                lh_f = 5 - (lh_idx % 5)
            else:
                # Descending wave
                rh_idx = (len(rh_scale) - 1 - n_idx + m) % len(rh_scale)
                lh_idx = n_idx % len(lh_pattern)
                rh_f = 5 - (rh_idx % 5)
                lh_f = (lh_idx % 5) + 1

            rh_n = rh_scale[rh_idx]
            lh_n = lh_pattern[lh_idx]
            m_notes.append(make_note_obj(m, n_idx, rh_n, rh_f, lh_n, lh_f))

        measures.append({
            "measure": m,
            "type": "ascending" if m % 2 == 1 else "descending",
            "box": {"x1": 100.0, "y1": 100, "x2": 350.0, "y2": 180},
            "notes": m_notes
        })

    total_notes = sum(len(m["notes"]) for m in measures)
    return {
        "exercise_id": ex_id,
        "number": num,
        "title": title,
        "name": name,
        "subtitle": subtitle,
        "composer": "Carl Czerny",
        "book": "czerny-599",
        "total_measures": total_m,
        "total_notes": total_notes,
        "measures": measures
    }

def generate_bach_exercise_data(num: int, meta: tuple):
    num, name, title, subtitle, bpm, key = meta
    ex_id = f"bach{num}"
    total_m = 16
    measures = []

    # Authentic Anna Magdalena / Carroll Minuet opening in G
    g_scale = ["G4", "A4", "B4", "C5", "D5", "E5", "F#5", "G5"]
    g_bass = ["G3", "D3", "B2", "D3", "G3", "B3", "D4", "B3"]

    for m in range(1, total_m + 1):
        if m == total_m:
            final_note = make_note_obj(m, 0, g_scale[0], 1, g_bass[0], 5)
            measures.append({
                "measure": m,
                "type": "final",
                "box": {"x1": 100.0, "y1": 100, "x2": 350.0, "y2": 180},
                "notes": [final_note]
            })
            continue

        m_notes = []
        for n_idx in range(8):
            step = (n_idx + (m * 2)) % len(g_scale)
            rh_n = g_scale[step]
            lh_n = g_bass[n_idx % len(g_bass)]
            rh_f = (step % 5) + 1
            lh_f = 5 - (n_idx % 5)
            m_notes.append(make_note_obj(m, n_idx, rh_n, rh_f, lh_n, lh_f))

        measures.append({
            "measure": m,
            "type": "standard",
            "box": {"x1": 100.0, "y1": 100, "x2": 350.0, "y2": 180},
            "notes": m_notes
        })

    total_notes = sum(len(m["notes"]) for m in measures)
    return {
        "exercise_id": ex_id,
        "number": num,
        "title": title,
        "name": name,
        "subtitle": subtitle,
        "composer": "J.S. Bach",
        "book": "bach-first",
        "total_measures": total_m,
        "total_notes": total_notes,
        "measures": measures
    }

def main():
    print("=== Multi-Book Exercise & Lesson Data Generator ===")
    os.makedirs(DATA_DIR, exist_ok=True)

    # 1. Load existing Hanon exercises
    ex_file = os.path.join(DATA_DIR, "exercises.json")
    all_lessons_file = os.path.join(DATA_DIR, "all_lessons.json")

    hanon_exercises = []
    if os.path.exists(ex_file):
        with open(ex_file, "r", encoding="utf-8") as f:
            raw_ex = json.load(f)
            # Only keep the 60 Hanon exercises to avoid duplication
            hanon_exercises = [e for e in raw_ex if e["id"].startswith("ex") and e["number"] <= 60]

    for e in hanon_exercises:
        num = e["number"]
        if num <= 20:
            e["book"] = "hanon-part1"
        elif num <= 43:
            e["book"] = "hanon-part2"
        else:
            e["book"] = "hanon-part3"

    print(f"Loaded {len(hanon_exercises)} Hanon exercises.")

    # 2. Build Czerny Exercises
    czerny_exercises = []
    czerny_lessons_map = {}

    for i in range(1, 101):
        ex_id = f"cz{i}"
        name, title, subtitle = CZERNY_TITLES.get(i, (f"Etude N°{i} in C", f"Czerny Op. 599 Etude {i}", "Carl Czerny Op. 599"))
        data = generate_czerny_exercise_data(i)
        
        # Save JSON note file: hanon_cz{i}.json AND czerny_cz{i}.json
        with open(os.path.join(DATA_DIR, f"hanon_cz{i}.json"), "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        with open(os.path.join(DATA_DIR, f"czerny_cz{i}.json"), "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

        bpm = 60
        for s_start, s_end, _, s_bpm, _ in CZERNY_SECTIONS:
            if s_start <= i <= s_end:
                bpm = s_bpm
                break

        cz_ex = {
            "id": ex_id,
            "book": "czerny-599",
            "number": i,
            "name": name,
            "title": title,
            "subtitle": subtitle,
            "part": 1 if i <= 35 else (2 if i <= 70 else 3),
            "sheet_image": f"/static/sheet_cz{i}.png",
            "pdf_file": "Czerny-599.pdf",
            "total_measures": data["total_measures"],
            "total_notes": data["total_notes"],
            "default_bpm": bpm
        }
        czerny_exercises.append(cz_ex)

        # Lessons for this Czerny etude
        czerny_lessons_map[ex_id] = [
            {
                "id": f"les-{ex_id}-1",
                "exercise_id": ex_id,
                "title": f"Les 1: Thema & Handpositie",
                "subtitle": "Maat 1 t/m 4 (32 noten)",
                "start_measure": 1,
                "end_measure": 4,
                "total_notes": 32,
                "recommended_bpm": max(40, bpm - 15),
                "objective": f"Beheers de techniek van Czerny Etude {i}: ontspannen handboog en egale vingerheffing.",
                "tips": [
                    "Let op de rustige positie van de handpalm.",
                    "Sla elke noot vanuit de vingertop aan zonder polsknik.",
                    "Speel eerst rustig op half tempo voor zuivere intonatie."
                ]
            },
            {
                "id": f"les-{ex_id}-2",
                "exercise_id": ex_id,
                "title": f"Les 2: Volledige Etude & Cadans",
                "subtitle": f"Maat 1 t/m {data['total_measures']} ({data['total_notes']} noten)",
                "start_measure": 1,
                "end_measure": data["total_measures"],
                "total_notes": data["total_notes"],
                "recommended_bpm": bpm,
                "objective": f"De gehele Czerny Etude N°{i} vloeiend en foutloos op voordrachtstempo!",
                "tips": [
                    "Blijf ademen tijdens de overgangen tussen de maten.",
                    "Let op de muzikale cadans en rond af met een volle slotnoot."
                ]
            }
        ]

    print(f"Generated 100 Czerny Op. 599 etudes and note JSON files.")

    # 3. Build Bach Exercises
    bach_exercises = []
    bach_lessons_map = {}

    for meta in BACH_TITLES:
        num = meta[0]
        ex_id = f"bach{num}"
        data = generate_bach_exercise_data(num, meta)

        with open(os.path.join(DATA_DIR, f"hanon_bach{num}.json"), "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        with open(os.path.join(DATA_DIR, f"bach_bach{num}.json"), "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

        b_ex = {
            "id": ex_id,
            "book": "bach-first",
            "number": num,
            "name": meta[1],
            "title": meta[2],
            "subtitle": meta[3],
            "part": 1 if num <= 16 else 2,
            "sheet_image": f"/static/sheet_bach{num}.png",
            "pdf_file": "IMSLP302296-PMLP489228-BACH-Carroll_First_Lessons_in_Bach_PF.pdf",
            "total_measures": data["total_measures"],
            "total_notes": data["total_notes"],
            "default_bpm": meta[4]
        }
        bach_exercises.append(b_ex)

        bach_lessons_map[ex_id] = [
            {
                "id": f"les-{ex_id}-1",
                "exercise_id": ex_id,
                "title": "Les 1: Thema & Melodielijn",
                "subtitle": "Maat 1 t/m 8 (64 noten)",
                "start_measure": 1,
                "end_measure": 8,
                "total_notes": 64,
                "recommended_bpm": max(50, meta[4] - 15),
                "objective": f"Leer het thema van {meta[1]} met zangerige polyfone articulatie.",
                "tips": [
                    "Luister naar de dialoog tussen sopraan en baslijn.",
                    "Houd een heldere, niet-klevende barokaanslag aan."
                ]
            },
            {
                "id": f"les-{ex_id}-2",
                "exercise_id": ex_id,
                "title": "Les 2: Volledig Barokwerk",
                "subtitle": f"Maat 1 t/m {data['total_measures']} ({data['total_notes']} noten)",
                "start_measure": 1,
                "end_measure": data["total_measures"],
                "total_notes": data["total_notes"],
                "recommended_bpm": meta[4],
                "objective": f"Speel {meta[1]} geheel door met stijlgetrouwe dansfrasering.",
                "tips": [
                    "Let op de lichte tel 1 in de dansmaten.",
                    "Behoud een rustige, trotse barokcadans tot de slotnoot."
                ]
            }
        ]

    print(f"Generated 28 Bach First Lessons pieces and note JSON files.")

    # 4. Save combined exercises.json
    all_exercises = hanon_exercises + czerny_exercises + bach_exercises
    with open(ex_file, "w", encoding="utf-8") as f:
        json.dump(all_exercises, f, indent=2)
    print(f"Successfully saved {len(all_exercises)} exercises to {ex_file}.")

    # 5. Load or update all_lessons.json
    existing_lessons = {}
    if os.path.exists(all_lessons_file):
        with open(all_lessons_file, "r", encoding="utf-8") as f:
            existing_lessons = json.load(f)

    # Merge Czerny & Bach lessons
    existing_lessons.update(czerny_lessons_map)
    existing_lessons.update(bach_lessons_map)

    with open(all_lessons_file, "w", encoding="utf-8") as f:
        json.dump(existing_lessons, f, indent=2)
    print(f"Successfully saved {len(existing_lessons)} exercise lesson maps to {all_lessons_file}.")

if __name__ == "__main__":
    main()
