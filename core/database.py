"""
SQLite database storage for Hanon practice sessions and progress tracking.
"""

import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = "progress.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS practice_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            lesson_id TEXT NOT NULL,
            hand TEXT NOT NULL,
            mode TEXT NOT NULL,
            total_notes INTEGER NOT NULL,
            correct_notes INTEGER NOT NULL,
            wrong_notes INTEGER NOT NULL,
            accuracy REAL NOT NULL,
            score INTEGER NOT NULL,
            bpm INTEGER NOT NULL,
            duration_seconds REAL NOT NULL,
            mistakes_json TEXT,
            exercise_id TEXT DEFAULT 'ex1'
        )
    """)
    # Check if exercise_id column exists for already initialized DB
    cur.execute("PRAGMA table_info(practice_sessions)")
    cols = [col[1] for col in cur.fetchall()]
    if "exercise_id" not in cols:
        cur.execute("ALTER TABLE practice_sessions ADD COLUMN exercise_id TEXT DEFAULT 'ex1'")

    # Telemetry events table for continuous course and pedagogical improvement
    cur.execute("""
        CREATE TABLE IF NOT EXISTS telemetry_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            session_uuid TEXT,
            exercise_id TEXT DEFAULT 'ex1',
            lesson_id TEXT,
            event_type TEXT NOT NULL,
            data_json TEXT
        )
    """)
    conn.commit()
    conn.close()

def save_session(data: Dict[str, Any]) -> int:
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO practice_sessions (
            timestamp, lesson_id, hand, mode, total_notes,
            correct_notes, wrong_notes, accuracy, score, bpm, duration_seconds, mistakes_json, exercise_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        datetime.now().isoformat(),
        data.get("lesson_id", "vrij"),
        data.get("hand", "rh"),
        data.get("mode", "wait"),
        data.get("total_notes", 0),
        data.get("correct_notes", 0),
        data.get("wrong_notes", 0),
        round(data.get("accuracy", 0.0), 1),
        data.get("score", 0),
        data.get("bpm", 60),
        round(data.get("duration_seconds", 0.0), 1),
        json.dumps(data.get("mistakes", [])),
        data.get("exercise_id", "ex1")
    ))
    session_id = cur.lastrowid
    conn.commit()
    conn.close()
    return session_id

def get_history(limit: int = 20) -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        SELECT id, timestamp, lesson_id, hand, mode, total_notes,
               correct_notes, wrong_notes, accuracy, score, bpm, duration_seconds, mistakes_json, exercise_id
        FROM practice_sessions
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))
    rows = cur.fetchall()
    conn.close()

    history = []
    for r in rows:
        history.append({
            "id": r[0],
            "timestamp": r[1],
            "lesson_id": r[2],
            "hand": r[3],
            "mode": r[4],
            "total_notes": r[5],
            "correct_notes": r[6],
            "wrong_notes": r[7],
            "accuracy": r[8],
            "score": r[9],
            "bpm": r[10],
            "duration_seconds": r[11],
            "mistakes": json.loads(r[12]) if r[12] else [],
            "exercise_id": r[13] if len(r) > 13 and r[13] else "ex1"
        })
    return history

def save_telemetry_batch(events: List[Dict[str, Any]]) -> int:
    """Save a batch of telemetry events for course analytics."""
    if not events:
        return 0
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    inserted = 0
    now_iso = datetime.now().isoformat()
    for ev in events:
        cur.execute("""
            INSERT INTO telemetry_events (timestamp, session_uuid, exercise_id, lesson_id, event_type, data_json)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            ev.get("timestamp", now_iso),
            ev.get("session_uuid", ""),
            ev.get("exercise_id", "ex1"),
            ev.get("lesson_id", ""),
            ev.get("event_type", "note"),
            json.dumps(ev.get("data", ev))
        ))
        inserted += 1
    conn.commit()
    conn.close()
    return inserted

def get_telemetry_insights(exercise_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Compute pedagogical insights and course improvement metrics from telemetry
    and practice history.
    """
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    # Filter clause
    where_clause = "WHERE exercise_id = ?" if exercise_id else ""
    params = (exercise_id,) if exercise_id else ()
    
    # 1. Total sessions and summary stats
    cur.execute(f"""
        SELECT COUNT(*), AVG(accuracy), AVG(bpm), SUM(total_notes), SUM(correct_notes), SUM(wrong_notes)
        FROM practice_sessions {where_clause}
    """, params)
    sess_row = cur.fetchone()
    total_sessions = sess_row[0] or 0
    avg_accuracy = round(sess_row[1] or 0.0, 1)
    avg_bpm = round(sess_row[2] or 60.0, 1)
    total_notes_played = sess_row[3] or 0
    total_correct = sess_row[4] or 0
    total_wrong = sess_row[5] or 0

    # 2. Extract mistake patterns from practice_sessions
    cur.execute(f"SELECT mistakes_json FROM practice_sessions {where_clause}", params)
    mistake_rows = cur.fetchall()
    
    measure_errors: Dict[int, int] = {}
    finger_errors: Dict[Any, int] = {}
    
    for (m_json,) in mistake_rows:
        if not m_json:
            continue
        try:
            m_list = json.loads(m_json)
            for m in m_list:
                m_num = m.get("measure")
                if m_num is not None:
                    try:
                        m_num = int(m_num)
                        measure_errors[m_num] = measure_errors.get(m_num, 0) + 1
                    except (ValueError, TypeError):
                        pass
                f_num = m.get("target_finger")
                if f_num is not None:
                    finger_errors[str(f_num)] = finger_errors.get(str(f_num), 0) + 1
        except Exception:
            pass

    # 3. Analyze telemetry events for latency and hesitation
    cur.execute(f"""
        SELECT event_type, data_json FROM telemetry_events
        {where_clause}
        ORDER BY id DESC LIMIT 2000
    """, params)
    telem_rows = cur.fetchall()
    conn.close()

    total_events = len(telem_rows)
    latencies: List[float] = []
    viewports: Dict[str, int] = {}
    measure_latencies: Dict[int, List[float]] = {}
    hesitation_count = 0

    for ev_type, d_json in telem_rows:
        if not d_json:
            continue
        try:
            d = json.loads(d_json)
            # Latency tracking
            lat = d.get("latency_ms")
            m_num = d.get("measure")
            if lat is not None and isinstance(lat, (int, float)) and 50 <= lat <= 8000:
                latencies.append(lat)
                if m_num:
                    measure_latencies.setdefault(int(m_num), []).append(lat)
            if d.get("hesitation"):
                hesitation_count += 1
            # Viewport dimensions
            vp = d.get("viewport")
            if vp and isinstance(vp, dict):
                w = vp.get("width", 0)
                h = vp.get("height", 0)
                if w and h:
                    category = f"{w}x{h}"
                    viewports[category] = viewports.get(category, 0) + 1
        except Exception:
            pass

    avg_latency = round(sum(latencies) / len(latencies), 1) if latencies else 350.0

    # Bottleneck measures sorted by error count
    bottlenecks = []
    for m, cnt in sorted(measure_errors.items(), key=lambda item: item[1], reverse=True)[:5]:
        m_lats = measure_latencies.get(m, [avg_latency])
        m_avg = round(sum(m_lats) / max(len(m_lats), 1), 1)
        bottlenecks.append({"measure": m, "errors": cnt, "avg_latency_ms": m_avg})

    # Pedagogical suggestions for course improvement based on real data
    recommendations = []
    if finger_errors.get("4", 0) + finger_errors.get("5", 0) > finger_errors.get("1", 0) + finger_errors.get("2", 0):
        recommendations.append("Verhoog oefentijd op vingers 4 & 5 met extra vooroefeningen voor vingerheffing.")
    if 15 in measure_errors:
        recommendations.append("Maat 15 (omslagpunt) is een consistent knelpunt; bied hier gerichte vertraging aan.")
    if avg_latency > 600:
        recommendations.append("Gemiddelde reactietijd is hoog; adviseer studenten vaker te beginnen in de 'Wacht op noot' modus.")
    if not recommendations:
        recommendations.append("Goede algehele balans tussen stijgende en dalende maten.")

    return {
        "exercise_id": exercise_id or "all",
        "total_sessions": total_sessions,
        "total_notes_played": total_notes_played,
        "total_correct": total_correct,
        "total_wrong": total_wrong,
        "avg_accuracy": avg_accuracy,
        "avg_bpm": avg_bpm,
        "avg_latency_ms": avg_latency,
        "hesitation_rate_pct": round((hesitation_count / max(total_events, 1)) * 100, 1),
        "bottlenecks": bottlenecks,
        "finger_errors": finger_errors,
        "recommendations": recommendations,
        "viewports": viewports
    }

