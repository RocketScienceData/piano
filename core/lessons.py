"""
Hanon Piano Tutor - Lesson Definitions and Pedagogical Guidance.
Supports Exercise 1, Exercise 2, and future Hanon exercises.
"""

from typing import List, Dict, Any, Optional

LESSONS_EX1 = [
    {
        "id": "les-1",
        "exercise_id": "ex1",
        "title": "Les 1: De Hanon Sprong",
        "subtitle": "Maat 1 t/m 4 (32 noten)",
        "start_measure": 1,
        "end_measure": 4,
        "total_notes": 32,
        "recommended_bpm": 50,
        "objective": "Leer de basisbeweging: duim naar wijsvinger sprong (C naar E) en de activering van vinger 4 en 5.",
        "tips": [
            "Til elke vinger hoog en duidelijk op als een hamertje.",
            "Let op de sprong: vinger 1 speelt C, slaat D over, en vinger 2 landt soepel op E.",
            "Houd je pols ontspannen; forceer niet bij vinger 4 (ringvinger)."
        ]
    },
    {
        "id": "les-2",
        "exercise_id": "ex1",
        "title": "Les 2: Eerste Octaaf Klimmen",
        "subtitle": "Maat 1 t/m 8 (64 noten)",
        "start_measure": 1,
        "end_measure": 8,
        "total_notes": 64,
        "recommended_bpm": 60,
        "objective": "Klim een volledig octaaf omhoog van C4 naar C5 met constante gelijkmatigheid.",
        "tips": [
            "Let op een strakke overgang tussen de maten.",
            "Zorg dat de duim op tel 1 niet luider klinkt dan de andere noten (geen onbedoelde accenten).",
            "Speel strikt 'legato': elke noot zingt totdat de volgende wordt aangeslagen."
        ]
    },
    {
        "id": "les-3",
        "exercise_id": "ex1",
        "title": "Les 3: Naar de Top",
        "subtitle": "Maat 9 t/m 14 (48 noten)",
        "start_measure": 9,
        "end_measure": 14,
        "total_notes": 48,
        "recommended_bpm": 60,
        "objective": "Klim door naar het hoogste register tot aan de hoge B5 en G6.",
        "tips": [
            "Beweeg je bovenlichaam lichtjes mee naar rechts op de pianobank.",
            "Houd je schouders laag en ontspannen.",
            "Focus op vinger 5 (pink) bij het bereiken van de topnoot."
        ]
    },
    {
        "id": "les-4",
        "exercise_id": "ex1",
        "title": "Les 4: De Grote Ommekeer",
        "subtitle": "Maat 15 t/m 19 (40 noten)",
        "start_measure": 15,
        "end_measure": 19,
        "total_notes": 40,
        "recommended_bpm": 50,
        "objective": "Beheers de ommekeer en de dalende Hanon-beweging.",
        "tips": [
            "Bij de afdaling begint vinger 5 (pink) en maakt vinger 4 direct de sprong (terts omlaag).",
            "Dit voelt anders dan stijgen: neem de tijd om de vingerzetting natuurlijk te laten voelen.",
            "Controleer of vinger 1 (duim) soepel onderaan de boog meebeweegt."
        ]
    },
    {
        "id": "les-5",
        "exercise_id": "ex1",
        "title": "Les 5: De Afdaling Afronden",
        "subtitle": "Maat 20 t/m 29 (80 noten)",
        "start_measure": 20,
        "end_measure": 29,
        "total_notes": 80,
        "recommended_bpm": 60,
        "objective": "Voltooi de lange afdaling terug naar het centrale register.",
        "tips": [
            "Voorkom de verleiding om sneller te spelen bij het dalen.",
            "Let op vermoeidheid in de onderarm: schud je handen even los als je spanning voelt.",
            "Houd de afstanden tussen de vingers stabiel."
        ]
    },
    {
        "id": "les-6",
        "exercise_id": "ex1",
        "title": "Les 6: De Meesterproef (Compleet)",
        "subtitle": "Maat 1 t/m 30 (233 noten)",
        "start_measure": 1,
        "end_measure": 30,
        "total_notes": 233,
        "recommended_bpm": 60,
        "objective": "De gehele Hanon Oefening 1 in één ononderbroken, foutloze flow!",
        "tips": [
            "Adem rustig door tijdens het spelen.",
            "Behoud een vloeiend tempo over de overgang in maat 15.",
            "Rond af met een krachtige, heldere slotnoot C!"
        ]
    }
]

LESSONS_EX2 = [
    {
        "id": "les2-1",
        "exercise_id": "ex2",
        "title": "Les 1: De 3e & 4e Vinger Wip",
        "subtitle": "Maat 1 t/m 4 (32 noten)",
        "start_measure": 1,
        "end_measure": 4,
        "total_notes": 32,
        "recommended_bpm": 50,
        "objective": "Focus op de afwisseling tussen vinger 3 en 4 (de zwakste vingers) met een rustige, ontspannen pols.",
        "tips": [
            "Houd de handboog stabiel; laat vingers 3 en 4 vanuit het knokkelgewricht bewegen.",
            "RH sprong: vinger 1 speelt C, vinger 2 E, en vinger 5 reikt naar A; LH: vinger 5 speelt C, vinger 3 E, en vinger 1 reikt naar A.",
            "Bij noten 5-6-7 wisselen de vingers soepel af (RH vingers 4-3-4; LH vingers 2-3-2) zonder dat de pols wiebelt."
        ]
    },
    {
        "id": "les2-2",
        "exercise_id": "ex2",
        "title": "Les 2: Stijgen door het Middenregister",
        "subtitle": "Maat 1 t/m 8 (64 noten)",
        "start_measure": 1,
        "end_measure": 8,
        "total_notes": 64,
        "recommended_bpm": 55,
        "objective": "Klim gelijkmatig door het middenregister met gelijke klanksterkte op elke noot.",
        "tips": [
            "Zorg dat vingers 3 en 4 niet zachter klinken dan duim en wijsvinger.",
            "Speel strikt legato: bind de zestienden vloeiend aan elkaar.",
            "Controleer of je schouders ontspannen laag blijven."
        ]
    },
    {
        "id": "les2-3",
        "exercise_id": "ex2",
        "title": "Les 3: Naar het Hoge Register",
        "subtitle": "Maat 9 t/m 14 (48 noten)",
        "start_measure": 9,
        "end_measure": 14,
        "total_notes": 48,
        "recommended_bpm": 60,
        "objective": "Doorklimmen naar de top (tot G6 in de rechterhand) zonder spanning.",
        "tips": [
            "Leun op de pianobank subtiel naar rechts om je rechterarm ruimte te geven.",
            "Blijf de vingers hoog optillen als kleine hamertjes.",
            "Let op maat 14: de voorbereiding op de hoogste wending."
        ]
    },
    {
        "id": "les2-4",
        "exercise_id": "ex2",
        "title": "Les 4: De Afdaling & Linkerhand Focus",
        "subtitle": "Maat 15 t/m 19 (40 noten)",
        "start_measure": 15,
        "end_measure": 19,
        "total_notes": 40,
        "recommended_bpm": 50,
        "objective": "De ommekeer vanaf de hoge G6: nu traint de linkerhand intensief vingers 3 & 4!",
        "tips": [
            "In de afdaling speelt RH met vinger 5-2-1-2-3-2-3-4 en LH met 1-3-5-4-3-4-3-2.",
            "De linkerhand draagt nu de zwaarste training van vinger 3 en 4.",
            "Speel langzaam en geconcentreerd zodat beide handen synchroon landen."
        ]
    },
    {
        "id": "les2-5",
        "exercise_id": "ex2",
        "title": "Les 5: Afdaling Afronden",
        "subtitle": "Maat 20 t/m 28 (72 noten)",
        "start_measure": 20,
        "end_measure": 28,
        "total_notes": 72,
        "recommended_bpm": 55,
        "objective": "Vloeiend afdalen terug naar de centrale positie.",
        "tips": [
            "Voorkom haasten bij het dalen; houd de metronoompuls strak vast.",
            "Laat de onderarmen ontspannen meebewegen naar het midden.",
            "Let op maat 28: de vingerzetting bereidt de landing voor op slotnoot C."
        ]
    },
    {
        "id": "les2-6",
        "exercise_id": "ex2",
        "title": "Les 6: De Meesterproef Ex. 2 (Compleet)",
        "subtitle": "Maat 1 t/m 29 (225 noten)",
        "start_measure": 1,
        "end_measure": 29,
        "total_notes": 225,
        "recommended_bpm": 60,
        "objective": "De volledige Hanon Oefening 2 in één vloeiende, gelijkmatige meesterlijke run!",
        "tips": [
            "Adem rustig in een constante cadans.",
            "Voel hoe je vingers 3 en 4 sterker en zelfstandiger zijn geworden.",
            "Rond af met een volle, zelfverzekerde slotnoot C!"
        ]
    }
]

EXERCISE_METADATA = [
    (1, "Oefening N°1 in C", "Hanon Oefening 1: De Hanon Sprong", "Voorbereidende oefening voor soepelheid, onafhankelijkheid en gelijkmatigheid (Vingers 1-2 & 4-5)", 30, 233, "Exercise N°1 in C.pdf"),
    (2, "Oefening N°2 in C", "Hanon Oefening 2: Vingeronafhankelijkheid (3-4)", "Specifieke versterking voor de 3e en 4e vinger - hef de vingers hoog en gelijkmatig op", 29, 225, "Exercise N°2 in C.pdf"),
    (3, "Oefening N°3 in C", "Hanon Oefening 3: Vingeronafhankelijkheid (2-3-4)", "Vloeiende gelijkmatigheid en beheersing van vingers 2, 3 en 4", 29, 225, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    (4, "Oefening N°4 in C", "Hanon Oefening 4: Zwakke Vingers Focus (3-4-5)", "Speciale training voor de fysiologisch zwakkere vingers 3, 4 en 5", 29, 225, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    (5, "Oefening N°5 in C", "Hanon Oefening 5: Trillvoorbereiding & Hoge Heffing", "Alle 5 vingers - til de vingers hoog op als kleine hamertjes", 29, 225, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    (6, "Oefening N°6 in C", "Hanon Oefening 6: Pinkversterking (Vinger 5)", "Versterking en gelijkmatige aanslag van de 5e vinger (pink)", 29, 225, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    (7, "Oefening N°7 in C", "Hanon Oefening 7: Agiliteit Vingers 3-4-5", "Oefening van het hoogste belang voor de 3e, 4e en 5e vinger", 29, 225, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    (8, "Oefening N°8 in C", "Hanon Oefening 8: Volledige Handbalans (1 t/m 5)", "Gelijkmatige heffing en klankkracht over alle vijf vingers", 29, 225, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    (9, "Oefening N°9 in C", "Hanon Oefening 9: Vingerspreiding & Tertsensprong", "Uitbreiding van de spanwijdte tussen duim en pink", 29, 225, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    (10, "Oefening N°10 in C", "Hanon Oefening 10: Trilltraining (3-4 & 4-5)", "Voorbereiding op de virtuoze trill tussen aangrenzende vingers", 29, 225, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    (11, "Oefening N°11 in C", "Hanon Oefening 11: Dubbele Tertsen & Vingerontkoppeling", "Snelheid en flexibiliteit in gecombineerde intervallen", 29, 225, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    (12, "Oefening N°12 in C", "Hanon Oefening 12: Flexibiliteit Duim & Pink (1-5)", "Zelfstandigheid van de buitenvingers met soepele pols", 30, 233, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    (13, "Oefening N°13 in C", "Hanon Oefening 13: Soepelheid & Boogbeweging (3-4-5)", "Vloeiende vingerwisseling en ontspanning in de onderarm", 29, 225, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    (14, "Oefening N°14 in C", "Hanon Oefening 14: Trilloefening Vingers 3 en 4", "Geavanceerde onafhankelijkheidstraining voor vingers 3 en 4", 29, 225, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    (15, "Oefening N°15 in C", "Hanon Oefening 15: Spreiding 1-2 en 4-5", "Gelijkmatige extensie tussen duim-wijsvinger en ringvinger-pink", 29, 225, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    (16, "Oefening N°16 in C", "Hanon Oefening 16: Tertsensprong & Vrijmaking Pink", "Rotatiebeweging van de pols en actieve pinkaanslag", 29, 225, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    (17, "Oefening N°17 in C", "Hanon Oefening 17: Rotatie & Uitbreiding Vingers 1-5", "Volledige mobiliteit van het handgewricht", 28, 217, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    (18, "Oefening N°18 in C", "Hanon Oefening 18: Snelle Vingerwisseling 1 t/m 5", "Gelijkmatige aanslag over het gehele register", 29, 225, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    (19, "Oefening N°19 in C", "Hanon Oefening 19: Kracht & Dynamiek", "Krachtige, heldere toonvorming vanuit de vingertoppen", 29, 225, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
    (20, "Oefening N°20 in C", "Hanon Oefening 20: Meesterproef Deel 1 (Virtuoos)", "Bekroning van de voorbereidende oefeningen voor ultieme soepelheid", 31, 242, "IMSLP91547-PMLP03129-Hanon_Final.pdf"),
]

EXERCISES = [
    {
        "id": f"ex{num}",
        "number": num,
        "name": name,
        "title": title,
        "subtitle": subtitle,
        "sheet_image": f"/static/sheet_ex{num}.png" if num <= 2 else "/static/sheet_ex1.png",
        "pdf_file": pdf,
        "total_measures": total_m,
        "total_notes": total_n,
        "default_bpm": 60
    }
    for num, name, title, subtitle, total_m, total_n, pdf in EXERCISE_METADATA
]

def _generate_lessons_for_exercise(ex_meta: tuple) -> List[Dict[str, Any]]:
    num, name, title, subtitle, total_m, total_n, _ = ex_meta
    ex_id = f"ex{num}"
    return [
        {
            "id": f"les{num}-1",
            "exercise_id": ex_id,
            "title": f"Les 1: De Hanon Motiefstart",
            "subtitle": f"Maat 1 t/m 4 (32 noten)",
            "start_measure": 1,
            "end_measure": 4,
            "total_notes": 32,
            "recommended_bpm": 50,
            "objective": f"Leer de specifieke vingerbeweging van Oefening {num}: beheers het patroon en houd de pols rustig.",
            "tips": [
                "Til elke vinger hoog en ontspannen op vanuit het knokkelgewricht.",
                "Let op een gelijkmatige toonhoogte en klanksterkte.",
                "Houd je schouders laag en vermijd onnodige spanning."
            ]
        },
        {
            "id": f"les{num}-2",
            "exercise_id": ex_id,
            "title": f"Les 2: Eerste Octaaf Klimmen",
            "subtitle": f"Maat 1 t/m 8 (64 noten)",
            "start_measure": 1,
            "end_measure": 8,
            "total_notes": 64,
            "recommended_bpm": 55,
            "objective": f"Klim een volledig octaaf omhoog door het middenregister met gelijke dynamiek.",
            "tips": [
                "Zorg voor een strakke overgang tussen de maten.",
                "Speel strikt legato en luister naar de gelijkmatigheid van elke noot.",
                "Controleer of de duim niet te zwaar klinkt op de eerste tel."
            ]
        },
        {
            "id": f"les{num}-3",
            "exercise_id": ex_id,
            "title": f"Les 3: Naar de Top",
            "subtitle": f"Maat 9 t/m 14 (48 noten)",
            "start_measure": 9,
            "end_measure": 14,
            "total_notes": 48,
            "recommended_bpm": 60,
            "objective": "Doorklimmen naar het hoogste register (tot aan maat 14) zonder spanning.",
            "tips": [
                "Leun op de pianobank subtiel mee naar rechts voor optimale armruimte.",
                "Houd je vingers alert bij het bereiken van de piek in maat 14.",
                "Bereid je mentaal voor op de komende ommekeer."
            ]
        },
        {
            "id": f"les{num}-4",
            "exercise_id": ex_id,
            "title": f"Les 4: De Grote Ommekeer",
            "subtitle": f"Maat 15 t/m 19 (40 noten)",
            "start_measure": 15,
            "end_measure": 19,
            "total_notes": 40,
            "recommended_bpm": 50,
            "objective": "Beheers de ommekeer en de dalende Hanon-beweging.",
            "tips": [
                "Bij het dalen voelt de beweging anders aan: let goed op de vingerzetting.",
                "Neem de tijd om de vingerwisselingen vloeiend te laten verlopen.",
                "Laat beide handen precies gelijktijdig de toetsen aanslaan."
            ]
        },
        {
            "id": f"les{num}-5",
            "exercise_id": ex_id,
            "title": f"Les 5: De Afdaling Afronden",
            "subtitle": f"Maat 20 t/m {total_m - 1} ({(total_m - 20) * 8} noten)",
            "start_measure": 20,
            "end_measure": total_m - 1,
            "total_notes": (total_m - 20) * 8,
            "recommended_bpm": 55,
            "objective": "Voltooi de lange afdaling terug naar de centrale positie.",
            "tips": [
                "Voorkom haasten tijdens de afdaling; blijf synchroon met de cadans.",
                "Schud je armen los als je vermoeidheid voelt.",
                "Let op de voorbereiding op de slotmaat."
            ]
        },
        {
            "id": f"les{num}-6",
            "exercise_id": ex_id,
            "title": f"Les 6: De Meesterproef (Compleet)",
            "subtitle": f"Maat 1 t/m {total_m} ({total_n} noten)",
            "start_measure": 1,
            "end_measure": total_m,
            "total_notes": total_n,
            "recommended_bpm": 60,
            "objective": f"De gehele Hanon {name} in één vloeiende, gelijkmatige en foutloze stroom!",
            "tips": [
                "Adem rustig en behoud een ontspannen vingerboog.",
                "Houd een constant tempo van maat 1 tot de slotnoot.",
                "Rond af met een volle, zelfverzekerde slotnoot C!"
            ]
        }
    ]

ALL_LESSONS_MAP: Dict[str, List[Dict[str, Any]]] = {
    "ex1": LESSONS_EX1,
    "ex2": LESSONS_EX2
}

for meta in EXERCISE_METADATA:
    num = meta[0]
    ex_id = f"ex{num}"
    if ex_id not in ALL_LESSONS_MAP:
        ALL_LESSONS_MAP[ex_id] = _generate_lessons_for_exercise(meta)

LESSONS: List[Dict[str, Any]] = []
for ex_id, l_list in ALL_LESSONS_MAP.items():
    LESSONS.extend(l_list)

def get_exercises() -> List[Dict[str, Any]]:
    return EXERCISES

def get_exercise_lessons(exercise_id: str = "ex1") -> List[Dict[str, Any]]:
    return ALL_LESSONS_MAP.get(exercise_id, LESSONS_EX1)

def get_lesson(lesson_id: str, exercise_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    for l in LESSONS:
        if l["id"] == lesson_id:
            if exercise_id is None or l.get("exercise_id") == exercise_id:
                return l
    return None

