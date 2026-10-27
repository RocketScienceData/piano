"""
FastAPI application for Hanon Piano Tutor.
Supports Hanon Exercise 1, Exercise 2, and the complete Hanon Virtuoso Pianist PDF.
"""

import os
import json
import asyncio
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from core.lessons import LESSONS, get_lesson, get_exercises, get_exercise_lessons
from core.database import init_db, save_session, get_history, save_telemetry_batch, get_telemetry_insights
from core.pitch_detector import MicPitchDetector

app = FastAPI(title="Hanon Piano Tutor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB
init_db()

# Load Hanon Exercises data
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


EXERCISE_DATA: Dict[str, Any] = {}
for i in range(1, 61):
    ex_file = os.path.join(DATA_DIR, f"hanon_ex{i}.json")
    if os.path.exists(ex_file):
        with open(ex_file, "r") as f:
            EXERCISE_DATA[f"ex{i}"] = json.load(f)

HANON_EX1 = EXERCISE_DATA.get("ex1", {})
HANON_EX2 = EXERCISE_DATA.get("ex2", {})


# Mount static and data files
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/data", StaticFiles(directory="data"), name="data")

@app.get("/")
def get_index():
    return FileResponse("static/index.html")

# PDF endpoints so user can view / download original PDFs directly in browser
@app.get("/Exercise N°1 in C.pdf")
@app.get("/pdf/ex1")
def get_pdf_ex1():
    path = "Exercise N°1 in C.pdf"
    if os.path.exists(path):
        return FileResponse(path, media_type="application/pdf", filename="Exercise N°1 in C.pdf")
    return JSONResponse(status_code=404, content={"error": "PDF niet gevonden"})

@app.get("/Exercise N°2 in C.pdf")
@app.get("/pdf/ex2")
def get_pdf_ex2():
    path = "Exercise N°2 in C.pdf"
    if os.path.exists(path):
        return FileResponse(path, media_type="application/pdf", filename="Exercise N°2 in C.pdf")
    return JSONResponse(status_code=404, content={"error": "PDF niet gevonden"})

@app.get("/IMSLP91547-PMLP03129-Hanon_Final.pdf")
@app.get("/pdf/hanon-full")
def get_pdf_full():
    path = "IMSLP91547-PMLP03129-Hanon_Final.pdf"
    if os.path.exists(path):
        return FileResponse(path, media_type="application/pdf", filename="IMSLP91547-PMLP03129-Hanon_Final.pdf")
    return JSONResponse(status_code=404, content={"error": "PDF niet gevonden"})

@app.get("/Czerny-599.pdf")
@app.get("/pdf/czerny")
def get_pdf_czerny():
    path = "Czerny-599.pdf"
    if not os.path.exists(path):
        path = "IMSLP86518-PMLP177048-CZERNY_Practical_Method_for_Beginners_on_the_Pianoforte_Op._599.pdf"
    if os.path.exists(path):
        return FileResponse(path, media_type="application/pdf", filename="Czerny-Op599.pdf")
    return JSONResponse(status_code=404, content={"error": "Czerny PDF niet gevonden"})

@app.get("/IMSLP86518-PMLP177048-CZERNY_Practical_Method_for_Beginners_on_the_Pianoforte_Op._599.pdf")
def get_pdf_czerny_imslp():
    path = "IMSLP86518-PMLP177048-CZERNY_Practical_Method_for_Beginners_on_the_Pianoforte_Op._599.pdf"
    if not os.path.exists(path):
        path = "Czerny-599.pdf"
    if os.path.exists(path):
        return FileResponse(path, media_type="application/pdf", filename=os.path.basename(path))
    return JSONResponse(status_code=404, content={"error": "Czerny PDF niet gevonden"})

@app.get("/IMSLP302296-PMLP489228-BACH-Carroll_First_Lessons_in_Bach_PF.pdf")
@app.get("/pdf/bach")
def get_pdf_bach():
    path = "IMSLP302296-PMLP489228-BACH-Carroll_First_Lessons_in_Bach_PF.pdf"
    if os.path.exists(path):
        return FileResponse(path, media_type="application/pdf", filename="First_Lessons_in_Bach.pdf")
    return JSONResponse(status_code=404, content={"error": "Bach PDF niet gevonden"})

@app.get("/api/exercises")
def get_exercises_list(all: bool = False):
    if all:
        return JSONResponse(content=get_exercises())
    return JSONResponse(content=get_exercises()[:2])

@app.get("/api/exercises/all")
def get_all_exercises_list():
    return JSONResponse(content=get_exercises())


@app.get("/api/hanon")
def get_hanon_data(exercise: str = Query("ex1")):
    data = EXERCISE_DATA.get(exercise, HANON_EX1)
    return JSONResponse(content=data)

@app.get("/api/hanon/{exercise_id}")
def get_single_hanon_data(exercise_id: str):
    if exercise_id in EXERCISE_DATA:
        return JSONResponse(content=EXERCISE_DATA[exercise_id])
    return JSONResponse(content={"error": f"Oefening '{exercise_id}' niet gevonden"}, status_code=404)

@app.get("/api/lessons")
def get_lessons(exercise: str = Query("ex1")):
    return JSONResponse(content=get_exercise_lessons(exercise))

@app.get("/api/lessons/all")
def get_all_lessons_map():
    lessons_path = os.path.join(DATA_DIR, "all_lessons.json")
    if os.path.exists(lessons_path):
        with open(lessons_path, "r", encoding="utf-8") as f:
            return JSONResponse(content=json.load(f))
    from core.lessons import ALL_LESSONS_MAP
    return JSONResponse(content=ALL_LESSONS_MAP)

@app.get("/api/lessons/{lesson_id}")
def get_single_lesson(lesson_id: str, exercise: Optional[str] = None):
    lesson = get_lesson(lesson_id, exercise)
    if not lesson:
        return JSONResponse(content={"error": "Les niet gevonden"}, status_code=404)
    return JSONResponse(content=lesson)

@app.get("/api/history")
def get_practice_history(limit: int = 20):
    return JSONResponse(content=get_history(limit=limit))

@app.post("/api/telemetry")
async def record_telemetry(payload: Dict[str, Any]):
    """Record batch or individual telemetry events for pedagogical course refinement."""
    events = payload.get("events")
    if events is None:
        events = [payload] if "event_type" in payload else []
    count = save_telemetry_batch(events)
    return JSONResponse(content={"status": "success", "recorded_events": count})

@app.get("/api/telemetry/insights")
def get_insights(exercise: Optional[str] = Query(None)):
    """Return aggregated pedagogical insights and course improvement metrics."""
    return JSONResponse(content=get_telemetry_insights(exercise_id=exercise))

@app.post("/api/sessions")
async def record_session(payload: Dict[str, Any]):
    exercise_id = payload.get("exercise_id", "ex1")
    session_id = save_session(payload)
    
    # Generate intelligent intuitive coaching feedback
    correct = payload.get("correct_notes", 0)
    wrong = payload.get("wrong_notes", 0)
    total = payload.get("total_notes", 1)
    accuracy = payload.get("accuracy", 0.0)
    mistakes = payload.get("mistakes", [])
    hand = payload.get("hand", "rh")
    
    # Analyze mistakes by finger and measure
    finger_mistakes = {}
    measure_mistakes = {}
    for m in mistakes:
        f = m.get("target_finger", "?")
        finger_mistakes[f] = finger_mistakes.get(f, 0) + 1
        ms = m.get("measure", "?")
        measure_mistakes[ms] = measure_mistakes.get(ms, 0) + 1
        
    feedback_points = []
    
    if accuracy >= 95:
        feedback_points.append("🌟 Uitmuntend! Je vingeronafhankelijkheid en trefzekerheid zijn van hoog niveau.")
        feedback_points.append("Klaar om het tempo met 5 à 10 BPM te verhogen voor nog meer souplesse.")
    elif accuracy >= 80:
        feedback_points.append("👍 Goed gespeeld! De beweging zit al goed in je spiergeheugen.")
    elif accuracy >= 60:
        feedback_points.append("💪 Goede oefening. Neem een rustiger tempo zodat je vingers de tijd krijgen om zich voor te bereiden.")
    else:
        feedback_points.append("💡 Tip: Probeer de oefenmodus ('Wacht op noot') en speel maat voor maat op een laag tempo.")

    # Tailored pedagogical feedback based on Exercise
    if exercise_id == "ex2":
        f3_f4_errors = finger_mistakes.get(3, 0) + finger_mistakes.get(4, 0)
        if f3_f4_errors > 1:
            feedback_points.append(
                f"🎯 Oefening 2 Focus: {f3_f4_errors} fouten bij vingers 3 & 4 (middel- en ringvinger). "
                "Dit is exact de fysiologische uitdaging van Oefening 2. "
                "Hef vinger 3 en 4 hoog en onafhankelijk op zonder je pols mee te laten wiebelen."
            )
        f5_errors = finger_mistakes.get(5, 0)
        if f5_errors > 1:
            feedback_points.append(
                "🎹 Pink (vinger 5): Let op de grote sprong naar de top van de frase; houd de pink stevig gebogen."
            )
    else:
        # Exercise 1 advice
        f4_f5_errors = finger_mistakes.get(4, 0) + finger_mistakes.get(5, 0)
        if f4_f5_errors > 2:
            feedback_points.append(
                f"🎯 Aandachtspunt: {f4_f5_errors} fouten bij vinger 4 & 5 (ringvinger/pink). "
                "Dit is precies de anatomische uitdaging die Hanon wilde oplossen. "
                "Til vinger 4 bewust op zonder dat de hele hand meedraait."
            )

    # Hand specific advice
    if hand == "lh":
        feedback_points.append("✋ Linkerhand tip: Let op dat de pink (vinger 5) bij het stijgen niet te slap op de toets valt.")
    elif hand == "rh":
        feedback_points.append("🤚 Rechterhand tip: Houd de duim licht en ontspannen bij het begin van elke maat.")
    elif hand == "both":
        feedback_points.append("🤝 Tweehandig tip: Zorg dat beide handen synchroon aanslaan zonder flam (tegelijkertijd!).")

    return JSONResponse(content={
        "status": "success",
        "session_id": session_id,
        "exercise_id": exercise_id,
        "feedback": feedback_points,
        "finger_mistakes": finger_mistakes,
        "measure_mistakes": measure_mistakes
    })

# WebSocket for streaming pitch from Python sounddevice
active_websockets: List[WebSocket] = []
pitch_detector_instance: MicPitchDetector = None

@app.websocket("/ws/mic")
async def websocket_mic_endpoint(websocket: WebSocket):
    global pitch_detector_instance
    await websocket.accept()
    active_websockets.append(websocket)
    
    loop = asyncio.get_event_loop()
    
    def on_pitch(pitch_info):
        for ws in list(active_websockets):
            try:
                loop.call_soon_threadsafe(
                    asyncio.create_task,
                    ws.send_json(pitch_info)
                )
            except Exception:
                pass

    if pitch_detector_instance is None:
        try:
            pitch_detector_instance = MicPitchDetector(on_pitch_callback=on_pitch)
            pitch_detector_instance.start()
        except Exception as e:
            await websocket.send_json({"type": "error", "message": f"Microfoon fout: {str(e)}"})

    try:
        while True:
            # Keep connection alive / receive client messages
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in active_websockets:
            active_websockets.remove(websocket)
        if len(active_websockets) == 0 and pitch_detector_instance:
            pitch_detector_instance.stop()
            pitch_detector_instance = None
