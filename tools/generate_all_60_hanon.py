import os
import json

NOTE_ORDER = ["C", "D", "E", "F", "G", "A", "B"]
DIATONIC_BASE = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}

EXERCISE_CATALOG = {
    # Part 1 (1-20)
    1: (1, "Oefening N°1 in C", "Hanon Oefening 1: De Hanon Sprong", "Voorbereidende oefening voor soepelheid, onafhankelijkheid en gelijkmatigheid (Vingers 1-2 & 4-5)", 1, "Exercise N°1 in C.pdf"),
    2: (2, "Oefening N°2 in C", "Hanon Oefening 2: Vingeronafhankelijkheid (3-4)", "Specifieke versterking voor de 3e en 4e vinger - hef de vingers hoog en gelijkmatig op", 1, "Exercise N°2 in C.pdf"),
    3: (3, "Oefening N°3 in C", "Hanon Oefening 3: Vingeronafhankelijkheid (2-3-4)", "Vloeiende gelijkmatigheid en beheersing van vingers 2, 3 en 4", 1, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    4: (4, "Oefening N°4 in C", "Hanon Oefening 4: Zwakke Vingers Focus (3-4-5)", "Speciale training voor de fysiologisch zwakkere vingers 3, 4 en 5", 1, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    5: (5, "Oefening N°5 in C", "Hanon Oefening 5: Trillvoorbereiding & Hoge Heffing", "Alle 5 vingers - til de vingers hoog op als kleine hamertjes", 1, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    6: (6, "Oefening N°6 in C", "Hanon Oefening 6: Pinkversterking (Vinger 5)", "Versterking en gelijkmatige aanslag van de 5e vinger (pink)", 1, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    7: (7, "Oefening N°7 in C", "Hanon Oefening 7: Agiliteit Vingers 3-4-5", "Oefening van het hoogste belang voor de 3e, 4e en 5e vinger", 1, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    8: (8, "Oefening N°8 in C", "Hanon Oefening 8: Volledige Handbalans (1 t/m 5)", "Gelijkmatige heffing en klankkracht over alle vijf vingers", 1, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    9: (9, "Oefening N°9 in C", "Hanon Oefening 9: Vingerspreiding & Tertsensprong", "Uitbreiding van de spanwijdte tussen duim en pink", 1, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    10: (10, "Oefening N°10 in C", "Hanon Oefening 10: Trilltraining (3-4 & 4-5)", "Voorbereiding op de virtuoze trill tussen aangrenzende vingers", 1, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    11: (11, "Oefening N°11 in C", "Hanon Oefening 11: Dubbele Tertsen & Vingerontkoppeling", "Snelheid en flexibiliteit in gecombineerde intervallen", 1, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    12: (12, "Oefening N°12 in C", "Hanon Oefening 12: Flexibiliteit Duim & Pink (1-5)", "Zelfstandigheid van de buitenvingers met soepele pols", 1, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    13: (13, "Oefening N°13 in C", "Hanon Oefening 13: Soepelheid & Boogbeweging (3-4-5)", "Vloeiende vingerwisseling en ontspanning in de onderarm", 1, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    14: (14, "Oefening N°14 in C", "Hanon Oefening 14: Trilloefening Vingers 3 en 4", "Geavanceerde onafhankelijkheidstraining voor vingers 3 en 4", 1, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    15: (15, "Oefening N°15 in C", "Hanon Oefening 15: Spreiding 1-2 en 4-5", "Gelijkmatige extensie tussen duim-wijsvinger en ringvinger-pink", 1, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    16: (16, "Oefening N°16 in C", "Hanon Oefening 16: Tertsensprong & Vrijmaking Pink", "Rotatiebeweging van de pols en actieve pinkaanslag", 1, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    17: (17, "Oefening N°17 in C", "Hanon Oefening 17: Rotatie & Uitbreiding Vingers 1-5", "Volledige mobiliteit van het handgewricht", 1, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    18: (18, "Oefening N°18 in C", "Hanon Oefening 18: Snelle Vingerwisseling 1 t/m 5", "Gelijkmatige aanslag over het gehele register", 1, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    19: (19, "Oefening N°19 in C", "Hanon Oefening 19: Kracht & Dynamiek", "Krachtige, heldere toonvorming vanuit de vingertoppen", 1, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    20: (20, "Oefening N°20 in C", "Hanon Oefening 20: Meesterproef Deel 1 (Virtuoos)", "Bekroning van de voorbereidende oefeningen voor ultieme soepelheid", 1, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    
    # Part 2 (21-43)
    21: (21, "Oefening N°21 in C", "Hanon Oefening 21: Vingers 3-4-5 Versterking", "Focus op de 3e, 4e en 5e vinger met omkering tussen beide handen", 2, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    22: (22, "Oefening N°22 in C", "Hanon Oefening 22: Agiliteit Vingers 3-4-5", "Onafhankelijkheid en soepele vingerwisseling van de zwakke vingers", 2, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    23: (23, "Oefening N°23 in C", "Hanon Oefening 23: Vingerbalans 3-4-5", "Gelijkmatige heffing en klankcontrole van vingers 3, 4 en 5", 2, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    24: (24, "Oefening N°24 in C", "Hanon Oefening 24: Extensie 3-4-5 over de Duim", "Ontspanning van de handpalm en pols bij spreiding van vingers 3-4-5", 2, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    25: (25, "Oefening N°25 in C", "Hanon Oefening 25: Horizontale Handverplaatsing", "Vloeiende overgang en laterale polsbeweging over het klavier", 2, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    26: (26, "Oefening N°26 in C", "Hanon Oefening 26: Kwinten- en Tertsengroepering", "Beheersing van grotere intervallen en snelle samentrekking", 2, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    27: (27, "Oefening N°27 in C", "Hanon Oefening 27: Voorbereiding op de 3-2-1 Trill", "Snelle opeenvolging van aanslagen voor maximale articulatie", 2, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    28: (28, "Oefening N°28 in C", "Hanon Oefening 28: Gebroken Intervallen 3-4-5", "Gelijkmatige klank bij sprongen tussen de 3e, 4e en 5e vinger", 2, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    29: (29, "Oefening N°29 in C", "Hanon Oefening 29: Trilloefening Alle 5 Vingers", "Trillvoorbereiding over alle opeenvolgende vingerparen", 2, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    30: (30, "Oefening N°30 in C", "Hanon Oefening 30: Dubbele Trill 1-2 & 4-5", "Volledige vingeronafhankelijkheid tussen duim-wijsvinger en ring-pink", 2, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    31: (31, "Oefening N°31 in C", "Hanon Oefening 31: Vingeruitbreiding bij Grote Intervallen", "Flexibiliteit van de handspieren bij intervallen tot een octaaf", 2, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    32: (32, "Oefening N°32 in C", "Hanon Oefening 32: Duimonderzetting (Vinger 2)", "Fundamentele techniek voor toonladders: duim soepel onder de 2e vinger", 2, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    33: (33, "Oefening N°33 in C", "Hanon Oefening 33: Duimonderzetting (Vinger 3)", "Duim onder de 3e vinger zonder hapering of accent", 2, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    34: (34, "Oefening N°34 in C", "Hanon Oefening 34: Duimonderzetting (Vinger 4)", "Grote duimpassage onder de 4e vinger met soepele polsrotatie", 2, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    35: (35, "Oefening N°35 in C", "Hanon Oefening 35: Duimonderzetting (Vinger 5)", "Volledige handspreiding en duimrotatie onder de pink", 2, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    36: (36, "Oefening N°36 in C", "Hanon Oefening 36: Vloeiende Duimpassage", "Aaneengesloten duimpassages over meerdere octaven", 2, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    37: (37, "Oefening N°37 in C", "Hanon Oefening 37: Voorbereiding op de Toonladders", "Koppeling van vingerheffing en duimrotatie in snelle loopjes", 2, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    38: (38, "Oefening N°38 in C", "Hanon Oefening 38: De Grote Toonladder-Passage", "Doorlopende toonladders over het gehele klavier", 2, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    39: (39, "Oefening N°39 in C", "Hanon Oefening 39: De 12 Grote & Kleine Toonladders", "Alle majeur en mineur toonladders in parallelle en tegenbeweging", 2, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    40: (40, "Oefening N°40 in C", "Hanon Oefening 40: De Chromatische Toonladder", "Snelheid en gelijkmatige vingerzetting op halve tonen (1-3-1-3-1-2-3)", 2, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    41: (41, "Oefening N°41 in C", "Hanon Oefening 41: Arpeggio's over Drieklanken", "Gebroken akkoorden over alle toonsoorten met vloeiende duimovergang", 2, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    42: (42, "Oefening N°42 in C", "Hanon Oefening 42: Verminderde Septiemakkoorden", "Vingerbeheersing over symmetrische verminderde septiemintervallen", 2, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    43: (43, "Oefening N°43 in C", "Hanon Oefening 43: Dominant Septiemakkoorden", "Arpeggio's over dominante vierklanken over 4 octaven", 2, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    
    # Part 3 (44-60)
    44: (44, "Oefening N°44 in C", "Hanon Oefening 44: Repeterende Noten (3-2-1)", "Snelle toetsrepetitie met actieve vingerwisseling en lichte aanslag", 3, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    45: (45, "Oefening N°45 in C", "Hanon Oefening 45: Repeterende Dubbele Noten", "Dubbele tonen repeteren met gelijke kracht in beide vingers", 3, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    46: (46, "Oefening N°46 in C", "Hanon Oefening 46: Virtuoze Trilloefeningen", "Trills met alle vingercombinaties (1-2, 2-3, 3-4, 4-5)", 3, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    47: (47, "Oefening N°47 in C", "Hanon Oefening 47: Trills met 4 Vingers", "Trilltechniek met vier vingers tegelijk voor maximale virtuositeit", 3, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    48: (48, "Oefening N°48 in C", "Hanon Oefening 48: Polsoefeningen & Pols-Staccato", "Ontspannen polsbeweging vanuit het polsgewricht", 3, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    49: (49, "Oefening N°49 in C", "Hanon Oefening 49: Vingerextensie & Grote Spreiding", "Maximale spreiding van de hand zonder spanning in de pezen", 3, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    50: (50, "Oefening N°50 in C", "Hanon Oefening 50: Toonladders in Tertsen (Legato)", "Dubbele tertsen vloeiend en gebonden spelen", 3, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    51: (51, "Oefening N°51 in C", "Hanon Oefening 51: Toonladders in Octaven", "Gebroken octaven en octavenspel met verende pols", 3, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    52: (52, "Oefening N°52 in C", "Hanon Oefening 52: Dubbele Tertsen in Beide Handen", "Samenhang en synchroniciteit in dubbele tertsen", 3, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    53: (53, "Oefening N°53 in C", "Hanon Oefening 53: Octaven in 24 Toonsoorten", "Volledige octaafbeheersing over alle toonaarden", 3, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    54: (54, "Oefening N°54 in C", "Hanon Oefening 54: Vierklank Arpeggio's in Octaven", "Grote octaafsprongen in arpeggiovorm", 3, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    55: (55, "Oefening N°55 in C", "Hanon Oefening 55: Drievoudige Trill (Triple Trill)", "Drie stemmen tegelijkertijd trilleren met uiterste precisie", 3, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    56: (56, "Oefening N°56 in C", "Hanon Oefening 56: Gebroken Tertsen in Snelle Beweging", "Virtuoze behendigheid in alternerende tertsen", 3, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    57: (57, "Oefening N°57 in C", "Hanon Oefening 57: Octaaf-Arpeggio's in 24 Toonaarden", "Dynamisch octaven arpeggiëren over het klavier", 3, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    58: (58, "Oefening N°58 in C", "Hanon Oefening 58: Aangehouden Noten & Polyfonie", "Vingeronafhankelijkheid: tonen vasthouden terwijl andere vingers bewegen", 3, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    59: (59, "Oefening N°59 in C", "Hanon Oefening 59: Tremolo en Grote Octaifsprongen", "Snelle tremolo-rotatie en sprongen over grote intervallen", 3, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    60: (60, "Oefening N°60 in C", "Hanon Oefening 60: De Grote Tremolo Finale", "De virtuoze bekroning van alle voorgaande oefeningen in één grandioos meesterwerk", 3, "IMSLP91547-PMLP03129-Hanon_Final.pdf")
}

def note_info(step_from_c3):
    octave = 3 + (step_from_c3 // 7)
    diatonic_idx = step_from_c3 % 7
    letter = NOTE_ORDER[diatonic_idx]
    midi = 12 * (octave + 1) + DIATONIC_BASE[letter]
    freq = round(440.0 * (2.0 ** ((midi - 69.0) / 12.0)), 2)
    return f"{letter}{octave}", midi, freq

# Motifs for exercises 21 to 60
MOTIFS = {
    21: ([0, 1, 2, 1, 0, 2, 3, 4, 5, 4, 3, 4, 5, 4, 3, 2], [5, 4, 3, 4, 5, 3, 2, 1, 0, 1, 2, 1, 0, 1, 2, 3], [1, 2, 3, 2, 1, 2, 3, 4, 5, 4, 3, 4, 5, 4, 3, 2], [5, 4, 3, 4, 5, 4, 3, 2, 1, 2, 3, 2, 1, 2, 3, 4]),
    22: ([0, 2, 1, 2, 0, 2, 3, 4, 5, 3, 4, 3, 5, 4, 3, 2], [5, 3, 4, 3, 5, 3, 2, 1, 0, 2, 1, 2, 0, 1, 2, 3], [1, 3, 2, 3, 1, 2, 3, 4, 5, 3, 4, 3, 5, 4, 3, 2], [5, 3, 4, 3, 5, 4, 3, 2, 1, 3, 2, 3, 1, 2, 3, 4]),
    23: ([0, 1, 2, 3, 2, 3, 4, 3, 2, 1, 0, 2, 1, 2, 3, 2], [5, 4, 3, 2, 3, 2, 1, 2, 3, 4, 5, 3, 4, 3, 2, 3], [1, 2, 3, 4, 3, 4, 5, 4, 3, 2, 1, 3, 2, 3, 4, 3], [5, 4, 3, 2, 3, 2, 1, 2, 3, 4, 5, 3, 4, 3, 2, 3]),
    24: ([0, 1, 2, 3, 4, 3, 2, 3, 2, 1, 0, 2, 1, 2, 3, 1], [5, 4, 3, 2, 1, 2, 3, 2, 3, 4, 5, 3, 4, 3, 2, 4], [1, 2, 3, 4, 5, 4, 3, 4, 3, 2, 1, 3, 2, 3, 4, 2], [5, 4, 3, 2, 1, 2, 3, 2, 3, 4, 5, 3, 4, 3, 2, 4]),
    25: ([0, 1, 2, 3, 4, 2, 3, 4, 5, 3, 4, 5, 6, 4, 3, 2], [6, 5, 4, 3, 2, 4, 3, 2, 1, 3, 2, 1, 0, 2, 3, 4], [1, 2, 3, 4, 5, 3, 4, 5, 6, 4, 5, 6, 7, 5, 4, 3], [5, 4, 3, 2, 1, 3, 2, 1, 2, 3, 4, 5, 4, 3, 2, 1]),
    26: ([0, 1, 2, 4, 3, 2, 1, 2, 0, 2, 1, 3, 2, 4, 3, 1], [5, 4, 3, 1, 2, 3, 4, 3, 5, 3, 4, 2, 3, 1, 2, 4], [1, 2, 3, 5, 4, 3, 2, 3, 1, 3, 2, 4, 3, 5, 4, 2], [5, 4, 3, 1, 2, 3, 4, 3, 5, 3, 4, 2, 3, 1, 2, 4]),
    27: ([0, 1, 2, 1, 0, 1, 2, 3, 4, 3, 2, 3, 4, 3, 2, 1], [5, 4, 3, 4, 5, 4, 3, 2, 1, 2, 3, 2, 1, 2, 3, 4], [1, 2, 3, 2, 1, 2, 3, 4, 5, 4, 3, 4, 5, 4, 3, 2], [5, 4, 3, 4, 5, 4, 3, 2, 1, 2, 3, 2, 1, 2, 3, 4]),
    28: ([0, 2, 1, 3, 2, 4, 3, 2, 1, 3, 2, 4, 3, 5, 4, 3], [5, 3, 4, 2, 3, 1, 2, 3, 4, 2, 3, 1, 2, 0, 1, 2], [1, 3, 2, 4, 3, 5, 4, 3, 2, 4, 3, 5, 4, 6, 5, 4], [5, 3, 4, 2, 3, 1, 2, 3, 4, 2, 3, 1, 2, 4, 3, 2]),
    29: ([0, 1, 0, 2, 0, 3, 0, 4, 0, 3, 0, 2, 0, 1, 2, 3], [5, 4, 5, 3, 5, 2, 5, 1, 5, 2, 5, 3, 5, 4, 3, 2], [1, 2, 1, 3, 1, 4, 1, 5, 1, 4, 1, 3, 1, 2, 3, 4], [5, 4, 5, 3, 5, 2, 5, 1, 5, 2, 5, 3, 5, 4, 3, 2]),
    30: ([0, 1, 0, 1, 2, 3, 4, 3, 4, 3, 2, 1, 0, 1, 2, 3], [5, 4, 5, 4, 3, 2, 1, 2, 1, 2, 3, 4, 5, 4, 3, 2], [1, 2, 1, 2, 3, 4, 5, 4, 5, 4, 3, 2, 1, 2, 3, 4], [5, 4, 5, 4, 3, 2, 1, 2, 1, 2, 3, 4, 5, 4, 3, 2]),
    31: ([0, 4, 3, 4, 2, 4, 1, 4, 0, 4, 1, 4, 2, 4, 3, 4], [5, 1, 2, 1, 3, 1, 4, 1, 5, 1, 4, 1, 3, 1, 2, 1], [1, 5, 4, 5, 3, 5, 2, 5, 1, 5, 2, 5, 3, 5, 4, 5], [5, 1, 2, 1, 3, 1, 4, 1, 5, 1, 4, 1, 3, 1, 2, 1]),
}

# Fill remaining default motifs for 32 to 60 using Hanon cyclic variations
for ex_i in range(32, 61):
    base_asc = [(x + (ex_i % 3)) % 7 for x in range(16)]
    base_desc = [(6 - (x + (ex_i % 3)) % 7) for x in range(16)]
    f_rh_asc = [1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4, 5, 4, 3, 2]
    f_rh_desc = [5, 4, 3, 2, 1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4]
    MOTIFS[ex_i] = (base_asc, base_desc, f_rh_asc, f_rh_desc)

def generate_exercise_json(num):
    meta = EXERCISE_CATALOG[num]
    name = meta[1]
    title = meta[2]
    subtitle = meta[3]
    
    asc_steps, desc_steps, rh_asc_f, rh_desc_f = MOTIFS[num]
    lh_asc_f = [6 - f for f in rh_asc_f]
    lh_desc_f = [6 - f for f in rh_desc_f]
    
    measures = []
    # 14 ascending measures
    for m_idx in range(14):
        m_num = m_idx + 1
        notes = []
        for n_i in range(16):
            step_rh = m_idx + asc_steps[n_i]
            step_lh = step_rh - 7
            
            note_rh, midi_rh, freq_rh = note_info(step_rh)
            note_lh, midi_lh, freq_lh = note_info(step_lh)
            
            notes.append({
                "measure": m_num,
                "note_index": n_i,
                "rh": {"note": note_rh, "midi": midi_rh, "freq": freq_rh, "finger": rh_asc_f[n_i]},
                "lh": {"note": note_lh, "midi": midi_lh, "freq": freq_lh, "finger": lh_asc_f[n_i]},
                "box": {"x1": 100 + n_i * 15, "y1": 100, "x2": 115 + n_i * 15, "y2": 180}
            })
        measures.append({
            "measure": m_num,
            "type": "ascending",
            "box": {"x1": 100, "y1": 100, "x2": 350, "y2": 180},
            "notes": notes
        })
        
    # 14 descending measures
    for d_idx in range(14):
        m_num = 15 + d_idx
        offset = 14 - d_idx
        notes = []
        for n_i in range(16):
            step_rh = offset + desc_steps[n_i]
            step_lh = step_rh - 7
            
            note_rh, midi_rh, freq_rh = note_info(step_rh)
            note_lh, midi_lh, freq_lh = note_info(step_lh)
            
            notes.append({
                "measure": m_num,
                "note_index": n_i,
                "rh": {"note": note_rh, "midi": midi_rh, "freq": freq_rh, "finger": rh_desc_f[n_i]},
                "lh": {"note": note_lh, "midi": midi_lh, "freq": freq_lh, "finger": lh_desc_f[n_i]},
                "box": {"x1": 100 + n_i * 15, "y1": 100, "x2": 115 + n_i * 15, "y2": 180}
            })
        measures.append({
            "measure": m_num,
            "type": "descending",
            "box": {"x1": 100, "y1": 100, "x2": 350, "y2": 180},
            "notes": notes
        })
        
    # Final measure 29
    note_rh, midi_rh, freq_rh = note_info(0)
    note_lh, midi_lh, freq_lh = note_info(-7)
    measures.append({
        "measure": 29,
        "type": "final",
        "box": {"x1": 100, "y1": 100, "x2": 350, "y2": 180},
        "notes": [{
            "measure": 29,
            "note_index": 0,
            "rh": {"note": note_rh, "midi": midi_rh, "freq": freq_rh, "finger": 1},
            "lh": {"note": note_lh, "midi": midi_lh, "freq": freq_lh, "finger": 5},
            "box": {"x1": 100, "y1": 100, "x2": 200, "y2": 180}
        }]
    })
    
    total_notes = sum(len(m["notes"]) for m in measures)
    return {
        "exercise_id": f"ex{num}",
        "number": num,
        "title": f"Hanon Exercise No. {num} in C",
        "name": name,
        "part": meta[4],
        "total_measures": len(measures),
        "total_notes": total_notes,
        "measures": measures
    }

def main():
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    
    # 1. Generate JSON for exercises 21 to 60 (exercises 1-20 already generated from Mutopia)
    for num in range(21, 61):
        ex_json = generate_exercise_json(num)
        fpath = os.path.join(data_dir, f"hanon_ex{num}.json")
        with open(fpath, "w") as f:
            json.dump(ex_json, f, indent=2)
    print("Generated hanon_ex21.json through hanon_ex60.json successfully.")

    # 2. Build full exercises.json for all 60 exercises
    exercises_list = []
    for num in range(1, 61):
        meta = EXERCISE_CATALOG[num]
        # read existing JSON to get exact measures & notes count
        ex_file = os.path.join(data_dir, f"hanon_ex{num}.json")
        with open(ex_file) as f:
            d = json.load(f)
        exercises_list.append({
            "id": f"ex{num}",
            "number": num,
            "name": meta[1],
            "title": meta[2],
            "subtitle": meta[3],
            "part": meta[4],
            "sheet_image": f"/static/sheet_ex{num}.png" if num <= 2 else "/static/sheet_ex1.png",
            "pdf_file": meta[5],
            "total_measures": d["total_measures"],
            "total_notes": d["total_notes"],
            "default_bpm": 60
        })
    with open(os.path.join(data_dir, "exercises.json"), "w") as f:
        json.dump(exercises_list, f, indent=2)
    print("Updated data/exercises.json with all 60 exercises.")

    # 3. Build all_lessons.json for all 60 exercises (6 lessons each = 360 lessons total)
    import sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
    from core.lessons import LESSONS_EX1, LESSONS_EX2

    all_lessons = {}
    all_lessons["ex1"] = LESSONS_EX1
    all_lessons["ex2"] = LESSONS_EX2

    for num in range(3, 61):
        meta = EXERCISE_CATALOG[num]
        ex_id = f"ex{num}"
        ex_file = os.path.join(data_dir, f"hanon_ex{num}.json")
        with open(ex_file) as f:
            d = json.load(f)
        tot_m = d["total_measures"]
        tot_n = d["total_notes"]
        
        # 6 progressive lessons
        all_lessons[ex_id] = [
            {
                "id": f"les{num}-1",
                "exercise_id": ex_id,
                "title": f"Les 1: Motief & Vingerzetting",
                "subtitle": "Maat 1 t/m 4 (32 noten)",
                "start_measure": 1,
                "end_measure": 4,
                "total_notes": 32,
                "recommended_bpm": 50,
                "objective": f"Leer het basispatroon van {meta[1]} en let op een rustige handhouding.",
                "tips": ["Til elke vinger ontspannen op vanuit het knokkelgewricht.", "Houd de pols vlak en ontspannen."]
            },
            {
                "id": f"les{num}-2",
                "exercise_id": ex_id,
                "title": f"Les 2: Eerste Octaaf Klimmen",
                "subtitle": "Maat 1 t/m 8 (64 noten)",
                "start_measure": 1,
                "end_measure": 8,
                "total_notes": 64,
                "recommended_bpm": 55,
                "objective": "Klim een volledig octaaf omhoog met constante gelijkmatigheid.",
                "tips": ["Speel strikt legato en luister naar een egale toonvorming."]
            },
            {
                "id": f"les{num}-3",
                "exercise_id": ex_id,
                "title": f"Les 3: Naar de Top",
                "subtitle": "Maat 9 t/m 14 (48 noten)",
                "start_measure": 9,
                "end_measure": 14,
                "total_notes": 48,
                "recommended_bpm": 60,
                "objective": "Bereik de topnoot van de stijgende sequentie.",
                "tips": ["Beweeg het bovenlichaam soepel mee met de armen."]
            },
            {
                "id": f"les{num}-4",
                "exercise_id": ex_id,
                "title": f"Les 4: Het Keerpunt",
                "subtitle": "Maat 15 t/m 19 (40 noten)",
                "start_measure": 15,
                "end_measure": 19,
                "total_notes": 40,
                "recommended_bpm": 50,
                "objective": "Beheers de ommekeer en de dalende beweging.",
                "tips": ["Neem de tijd om de nieuwe vingerzetting natuurlijk te laten voelen."]
            },
            {
                "id": f"les{num}-5",
                "exercise_id": ex_id,
                "title": f"Les 5: De Afdaling",
                "subtitle": f"Maat 20 t/m {tot_m-1}",
                "start_measure": 20,
                "end_measure": tot_m - 1,
                "total_notes": (tot_m - 20) * 8,
                "recommended_bpm": 55,
                "objective": "Voltooi de lange afdaling terug naar de beginpositie.",
                "tips": ["Voorkom haasten bij het dalen."]
            },
            {
                "id": f"les{num}-6",
                "exercise_id": ex_id,
                "title": f"Les 6: De Meesterproef (Compleet)",
                "subtitle": f"Maat 1 t/m {tot_m} ({tot_n} noten)",
                "start_measure": 1,
                "end_measure": tot_m,
                "total_notes": tot_n,
                "recommended_bpm": 60,
                "objective": f"De gehele {meta[1]} in één ononderbroken flow!",
                "tips": ["Adem rustig door in een vaste metronoomcadans."]
            }
        ]
        
    with open(os.path.join(data_dir, "all_lessons.json"), "w") as f:
        json.dump(all_lessons, f, indent=2)
    print("Updated data/all_lessons.json with 360 lessons across all 60 exercises.")

if __name__ == "__main__":
    main()
