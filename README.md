# 🎹 Hanon Piano Tutor - De Virtuoze Pianist

Een interactieve, AI-gestuurde pianotutor die je helpt de **Hanon methode** (*Le Pianiste Virtuose* van C. L. Hanon) onder de knie te krijgen.

Zet je laptop op de lessenaar van je piano of keyboard. De applicatie luistert via de microfoon naar de gespeelde akoestische toonhoogte óf ontvangt directe MIDI-signalen via een USB-kabel. De tutor volgt de bladmuziek realtime, toont dynamische handplaatsing, telt je aanslagen en geeft na elke les intuïtieve coaching-tips voor verbetering.

---

## 🌐 Live op GitHub Pages

Deze applicatie kan zowel 100% statisch (serverless) op **GitHub Pages** worden gehost als lokaal met de bijgeleverde Python FastAPI backend:

- **GitHub Pages activatie**:
  1. Ga naar je repository op GitHub: `https://github.com/RocketScienceData/piano`
  2. Klik op **Settings** ➔ **Pages**
  3. Kies bij **Build and deployment** onder Branch: `main` en folder: `/ (root)`
  4. Klik op **Save**. Binnen ~1 minuut is de tutor wereldwijd bereikbaar op:
     `https://rocketsciencedata.github.io/piano/`

---

## 🚀 Lokaal Starten

De Python omgeving (`venv`) is reeds geconfigureerd met alle benodigde dependencies.

Start de applicatie met:

```bash
./run.sh
```

*(Of handmatig via: `./venv/bin/python start.py`)*

De tutor start direct een lokale FastAPI-server en opent automatisch je browser op **http://localhost:8000**.

---

## 🎼 Ondersteunde Hanon Oefeningen & Lessen

De applicatie bevat het volledige **Deel I van Hanon (Oefeningen 1 t/m 20)**, met meer dan 4.500 individueel geanalyseerde noten:

1. **Oefening 1**: De Hanon Sprong (Vingers 1-2 & 4-5 stretch)
2. **Oefening 2**: Vingeronafhankelijkheid (Vingers 3-4 wip)
3. **Oefening 3**: Vloeiende gelijkmatigheid (Vingers 2-3-4)
4. **Oefening 4**: Pinkbeheersing (Vingers 3-4-5)
5. **Oefeningen 5 t/m 20**: Alle klassieke vingeronafhankelijkheids- en coördinatie-oefeningen uit Deel I.
6. **Volledig Hanon Boek (`IMSLP91547-PMLP03129-Hanon_Final.pdf`)**: 116 pagina's Schirmer-editie met alle 60 virtuoze oefeningen.

Elke oefening is opgedeeld in **6 progressieve lessen**:
- *Les 1*: Eerste Motief (Grondpatroon & handvorm)
- *Les 2*: Stijgende Lijn (Eerste octaaf)
- *Les 3*: Naar het Hoogste Register
- *Les 4*: De Grote Ommekeer (Topwending naar de daling)
- *Les 5*: De Afdaling (Controle en ontspanning)
- *Les 6*: De Meesterproef (Volledige oefening van C2 tot G6)

---

## 🎯 Belangrijkste Functies

### 1. 🎼 Twee Notenbalk-weergaven (Vector SVG & PDF Scan)
- **Dynamische Vector Notenbalk (SVG)**: Haarscherp getekende grand staff (viool- en bassleutel) met 16e notenbalken, maatstrepen, vingerzettingen (1-5) en interactieve klikondersteuning. Klik op een willekeurige noot om direct vanaf die noot te oefenen!
- **Originele PDF Scans**: Schakel met één klik over naar de authentieke Schirmer-partituur met automatische scroll-volging.

### 2. 🎹 Volledig 88-Toetsen Pianoklavier (A0 t/m C8)
- 52 witte toetsen en 36 zwarte toetsen (1:1 met een concertvleugel).
- Toont de actieve doelnoot in goud met het exacte vingernummer (1=duim, 2=wijsvinger, 3=middelvinger, 4=ringvinger, 5=pink).
- Flitst **groen** bij een juiste aanslag en **rood** bij een misgreep.

### 3. 🖐️ Meescrollende Handpositiestrip
- Gelegen direct onder het 88-toetsen klavier.
- Toont de actieve 5-vingerspanning van de hand en accentueert welke vinger op het punt staat de toets aan te slaan.
- Scrolt automatisch horizontaal mee naarmate de oefening stijgt naar het diskant of daalt naar de bas.

### 4. 🎹 USB MIDI Plug-and-Play (Stil Oefenen)
- Sluit je digitale keyboard of synthesizer aan via een USB-kabel.
- Selecteer **"🎹 MIDI"** in het invoerbronmenu.
- 100% stille oefensessies met een koptelefoon zonder pianolawaai voor je omgeving.

### 5. 🎙️ Akoestische Pitch Detectie (Voor Akoestische Piano's)
- Geavanceerd sub-sample YIN & autocorrelatie-algoritme speciaal afgestemd op de boventonen van een akoestische piano.
- Ruisdrempel en realtime audiogolf-monitor direct in de bovenbalk.

### 6. 📈 Telemetrie & Cursusverbeteringsanalyse
- Meet per vinger en per maat de reactietijd (latentie in milliseconden) en foutpercentages.
- Identificeert automatisch knelpunten in de oefeningen (zoals de ommekeer of pinkstrekking) en formuleert pedagogische aanbevelingen om de cursus te verbeteren.
- Werkt lokaal met SQLite (`progress.db`) én op GitHub Pages via `localStorage`.

### 7. ⏱️ Twee Oefenmodi
- **🎯 Oefenmodus (Wacht op noot)**: De tutor wacht rustig tot je de juiste toets aanslaat en geeft je de tijd om je vingerpositie te voelen.
- **⏱️ Tempo Modus**: De metronoom tikt mee op je gekozen tempo (40 - 140 BPM) om je ritmische gelijkmatigheid te trainen.

### 8. 🎧 "Speel Voor" (Computer Demo)
- Laat de computer de gekozen les voorspelen met pianoklanken terwijl de notenbalk en toetsen oplichten.

---

## 🧪 Tests Uitvoeren

Het project bevat een uitgebreide testsuite voor alle 20 oefeningen, vingerzettingsconsistentie, toonladderfrequenties en de vector renderer:

```bash
./venv/bin/python -m unittest discover tests
```

*(26 unit tests slagen in <0.05s)*
