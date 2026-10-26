"""
Unit and integration tests for Hanon Piano Tutor.
Tests exercise data integrity, lessons, database persistence, and FastAPI endpoints.
"""

import os
import json
import unittest
import asyncio

from core.lessons import get_exercises, get_exercise_lessons, get_lesson, LESSONS_EX1, LESSONS_EX2
from core.database import init_db, save_session, get_history, save_telemetry_batch, get_telemetry_insights
import app as main_app

class TestHanonExerciseData(unittest.TestCase):
    def setUp(self):
        self.data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
        
    def test_hanon_ex1_data(self):
        file_path = os.path.join(self.data_dir, "hanon_ex1.json")
        self.assertTrue(os.path.exists(file_path), "hanon_ex1.json must exist")
        with open(file_path, "r") as f:
            data = json.load(f)
        self.assertEqual(data["total_measures"], 30)
        self.assertEqual(data["total_notes"], 233)
        self.assertEqual(len(data["measures"]), 30)
        
        # Verify measure 1
        m1 = data["measures"][0]
        self.assertEqual(m1["measure"], 1)
        self.assertEqual(len(m1["notes"]), 8)
        self.assertEqual(m1["notes"][0]["rh"]["note"], "C3")
        self.assertEqual(m1["notes"][0]["rh"]["finger"], 1)
        self.assertEqual(m1["notes"][0]["lh"]["note"], "C2")
        self.assertEqual(m1["notes"][0]["lh"]["finger"], 5)

    def test_hanon_ex2_data(self):
        file_path = os.path.join(self.data_dir, "hanon_ex2.json")
        self.assertTrue(os.path.exists(file_path), "hanon_ex2.json must exist")
        with open(file_path, "r") as f:
            data = json.load(f)
        self.assertEqual(data["total_measures"], 29)
        self.assertEqual(data["total_notes"], 225)
        self.assertEqual(len(data["measures"]), 29)
        
        # Measure 1: C3 E3 A3 G3 F3 G3 F3 E3
        m1 = data["measures"][0]
        self.assertEqual(m1["measure"], 1)
        self.assertEqual(len(m1["notes"]), 8)
        rh_notes = [n["rh"]["note"] for n in m1["notes"]]
        self.assertEqual(rh_notes, ["C3", "E3", "A3", "G3", "F3", "G3", "F3", "E3"])
        rh_fingers = [n["rh"]["finger"] for n in m1["notes"]]
        self.assertEqual(rh_fingers, [1, 2, 5, 4, 3, 4, 3, 2])
        lh_fingers = [n["lh"]["finger"] for n in m1["notes"]]
        self.assertEqual(lh_fingers, [5, 3, 1, 2, 3, 2, 3, 4])
        
        # Measure 14: Ascending peak on B4
        m14 = data["measures"][13]
        self.assertEqual(m14["notes"][0]["rh"]["note"], "B4")
        
        # Measure 15: Descending turnaround starting on G5
        m15 = data["measures"][14]
        self.assertEqual(m15["type"], "descending")
        rh15_notes = [n["rh"]["note"] for n in m15["notes"]]
        self.assertEqual(rh15_notes, ["G5", "D5", "B4", "C5", "D5", "C5", "D5", "E5"])
        
        # Measure 28: Final descending measure before resolution
        m28 = data["measures"][27]
        rh28_notes = [n["rh"]["note"] for n in m28["notes"]]
        self.assertEqual(rh28_notes, ["A3", "E3", "C3", "D3", "E3", "D3", "E3", "F3"])
        
        # Measure 29: Final whole note C3 (RH) and C2 (LH)
        m29 = data["measures"][28]
        self.assertEqual(m29["type"], "final")
        self.assertEqual(len(m29["notes"]), 1)
        self.assertEqual(m29["notes"][0]["rh"]["note"], "C3")
        self.assertEqual(m29["notes"][0]["lh"]["note"], "C2")


class TestHanonLessons(unittest.TestCase):
    def test_exercise_list(self):
        exs = get_exercises()
        self.assertGreaterEqual(len(exs), 2)
        ex_ids = [e["id"] for e in exs]
        self.assertIn("ex1", ex_ids)
        self.assertIn("ex2", ex_ids)

    def test_exercise_lessons(self):
        ex1_lessons = get_exercise_lessons("ex1")
        self.assertEqual(len(ex1_lessons), 6)
        ex2_lessons = get_exercise_lessons("ex2")
        self.assertEqual(len(ex2_lessons), 6)
        
        # Check Ex 2 lesson 1
        l2_1 = get_lesson("les2-1", "ex2")
        self.assertIsNotNone(l2_1)
        self.assertIn("Vinger", l2_1["title"])
        self.assertEqual(l2_1["start_measure"], 1)
        self.assertEqual(l2_1["end_measure"], 4)

    def test_backward_compatibility(self):
        # Existing lessons should still be retrievable by ID without exercise specified
        l1 = get_lesson("les-1")
        self.assertIsNotNone(l1)
        self.assertEqual(l1["id"], "les-1")


class TestDatabase(unittest.TestCase):
    def setUp(self):
        init_db()

    def test_save_and_retrieve_session(self):
        test_session = {
            "exercise_id": "ex2",
            "lesson_id": "les2-1",
            "hand": "rh",
            "mode": "wait",
            "total_notes": 32,
            "correct_notes": 30,
            "wrong_notes": 2,
            "accuracy": 93.8,
            "score": 290,
            "bpm": 55,
            "duration_seconds": 24.5,
            "mistakes": [{"target": "G4", "played": "F4", "target_finger": 4, "measure": 2}]
        }
        session_id = save_session(test_session)
        self.assertIsInstance(session_id, int)
        
        history = get_history(limit=5)
        self.assertGreater(len(history), 0)
        latest = history[0]
        self.assertEqual(latest["id"], session_id)
        self.assertEqual(latest["exercise_id"], "ex2")
        self.assertEqual(latest["lesson_id"], "les2-1")
        self.assertEqual(latest["accuracy"], 93.8)


class TestAppEndpoints(unittest.TestCase):
    def test_get_exercises_endpoint(self):
        resp = main_app.get_exercises_list()
        body = json.loads(resp.body.decode("utf-8"))
        self.assertIsInstance(body, list)
        self.assertEqual(len(body), 2)
        self.assertEqual(body[0]["id"], "ex1")
        self.assertEqual(body[1]["id"], "ex2")

    def test_get_hanon_endpoint(self):
        # Ex 1 default
        resp1 = main_app.get_hanon_data(exercise="ex1")
        body1 = json.loads(resp1.body.decode("utf-8"))
        self.assertEqual(body1["total_measures"], 30)
        
        # Ex 2
        resp2 = main_app.get_hanon_data(exercise="ex2")
        body2 = json.loads(resp2.body.decode("utf-8"))
        self.assertEqual(body2["total_measures"], 29)
        self.assertEqual(body2["total_notes"], 225)

    def test_get_single_hanon_endpoint(self):
        resp = main_app.get_single_hanon_data("ex2")
        self.assertEqual(resp.status_code, 200)
        body = json.loads(resp.body.decode("utf-8"))
        self.assertEqual(body["exercise_id"], "ex2")
        
        # Non-existing
        resp_404 = main_app.get_single_hanon_data("non_existing")
        self.assertEqual(resp_404.status_code, 404)

    def test_get_lessons_endpoint(self):
        resp = main_app.get_lessons(exercise="ex2")
        body = json.loads(resp.body.decode("utf-8"))
        self.assertEqual(len(body), 6)
        self.assertEqual(body[0]["id"], "les2-1")

    def test_record_session_coaching_feedback(self):
        payload = {
            "exercise_id": "ex2",
            "lesson_id": "les2-1",
            "hand": "rh",
            "mode": "wait",
            "total_notes": 32,
            "correct_notes": 25,
            "wrong_notes": 7,
            "accuracy": 78.1,
            "score": 215,
            "bpm": 50,
            "duration_seconds": 30.0,
            "mistakes": [
                {"target_finger": 3, "measure": 1},
                {"target_finger": 4, "measure": 1},
                {"target_finger": 4, "measure": 2}
            ]
        }
        resp = asyncio.run(main_app.record_session(payload))
        self.assertEqual(resp.status_code, 200)
        body = json.loads(resp.body.decode("utf-8"))
        self.assertEqual(body["status"], "success")
        self.assertEqual(body["exercise_id"], "ex2")
        # Check that Exercise 2 finger 3/4 feedback is returned
        fb_text = " ".join(body["feedback"])
        self.assertIn("Oefening 2 Focus", fb_text)
        self.assertIn("3 & 4", fb_text)

    def test_record_session_both_hands_coaching(self):
        payload = {
            "exercise_id": "ex2",
            "lesson_id": "les2-1",
            "hand": "both",
            "mode": "wait",
            "total_notes": 32,
            "correct_notes": 30,
            "wrong_notes": 2,
            "accuracy": 93.8,
            "score": 290,
            "bpm": 50,
            "duration_seconds": 25.0,
            "mistakes": []
        }
        resp = asyncio.run(main_app.record_session(payload))
        self.assertEqual(resp.status_code, 200)
        body = json.loads(resp.body.decode("utf-8"))
        fb_text = " ".join(body["feedback"])
        self.assertIn("Tweehandig tip", fb_text)


class TestPdfAssets(unittest.TestCase):
    def test_pdf_files_exist(self):
        self.assertTrue(os.path.exists("Exercise N°1 in C.pdf"), "Exercise N°1 in C.pdf must exist")
        self.assertTrue(os.path.exists("Exercise N°2 in C.pdf"), "Exercise N°2 in C.pdf must exist")
        self.assertTrue(os.path.exists("IMSLP91547-PMLP03129-Hanon_Final.pdf"), "Hanon Final PDF must exist")
        self.assertTrue(os.path.exists("static/sheet_ex1.png"), "sheet_ex1.png must exist")
        self.assertTrue(os.path.exists("static/sheet_ex2.png"), "sheet_ex2.png must exist")

    def test_pdf_endpoint_responses(self):
        resp_ex1 = main_app.get_pdf_ex1()
        self.assertEqual(resp_ex1.status_code, 200)
        self.assertEqual(resp_ex1.media_type, "application/pdf")
        
        resp_ex2 = main_app.get_pdf_ex2()
        self.assertEqual(resp_ex2.status_code, 200)
        self.assertEqual(resp_ex2.media_type, "application/pdf")
        
        resp_full = main_app.get_pdf_full()
        self.assertEqual(resp_full.status_code, 200)
        self.assertEqual(resp_full.media_type, "application/pdf")

    def test_hanon_ex2_all_ascending_lh_fingering(self):
        file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "hanon_ex2.json")
        with open(file_path, "r") as f:
            data = json.load(f)
        for m in data["measures"]:
            if m["type"] == "ascending":
                lh_fingers = [n["lh"]["finger"] for n in m["notes"]]
                self.assertEqual(lh_fingers, [5, 3, 1, 2, 3, 2, 3, 4], f"Measure {m['measure']} LH fingering mismatch")


class TestTelemetry(unittest.TestCase):
    def setUp(self):
        init_db()

    def test_save_and_retrieve_telemetry(self):
        events = [
            {
                "session_uuid": "test-uuid-1",
                "exercise_id": "ex1",
                "lesson_id": "les-1",
                "event_type": "note_played",
                "data": {
                    "measure": 1,
                    "target_note": "C4",
                    "played_note": "C4",
                    "latency_ms": 220,
                    "hesitation": False,
                    "viewport": {"width": 1366, "height": 768}
                }
            },
            {
                "session_uuid": "test-uuid-1",
                "exercise_id": "ex1",
                "lesson_id": "les-1",
                "event_type": "note_played",
                "data": {
                    "measure": 1,
                    "target_note": "E4",
                    "played_note": "D4",
                    "latency_ms": 750,
                    "hesitation": True,
                    "viewport": {"width": 1366, "height": 768}
                }
            }
        ]
        count = save_telemetry_batch(events)
        self.assertEqual(count, 2)

        insights = get_telemetry_insights("ex1")
        self.assertIn("avg_latency_ms", insights)
        self.assertIn("bottlenecks", insights)
        self.assertIn("recommendations", insights)
        self.assertIn("1366x768", insights["viewports"])

    def test_telemetry_endpoints(self):
        # Test POST /api/telemetry
        payload = {
            "events": [
                {
                    "session_uuid": "test-uuid-2",
                    "exercise_id": "ex2",
                    "lesson_id": "les2-1",
                    "event_type": "note_played",
                    "data": {"measure": 15, "latency_ms": 400}
                }
            ]
        }
        post_resp = asyncio.run(main_app.record_telemetry(payload))
        self.assertEqual(post_resp.status_code, 200)
        post_body = json.loads(post_resp.body.decode("utf-8"))
        self.assertEqual(post_body["status"], "success")
        self.assertEqual(post_body["recorded_events"], 1)

        # Test GET /api/telemetry/insights
        get_resp = main_app.get_insights(exercise="ex2")
        self.assertEqual(get_resp.status_code, 200)
        get_body = json.loads(get_resp.body.decode("utf-8"))
        self.assertEqual(get_body["exercise_id"], "ex2")
        self.assertIn("avg_accuracy", get_body)

    def test_telemetry_edge_cases(self):
        # Empty batch
        count = save_telemetry_batch([])
        self.assertEqual(count, 0)

        # Single event payload directly to endpoint
        single_payload = {
            "session_uuid": "single-uuid",
            "exercise_id": "ex1",
            "lesson_id": "les-1",
            "event_type": "note_played",
            "data": {"measure": 1, "latency_ms": 150}
        }
        resp = asyncio.run(main_app.record_telemetry(single_payload))
        self.assertEqual(resp.status_code, 200)
        body = json.loads(resp.body.decode("utf-8"))
        self.assertEqual(body["recorded_events"], 1)

        # Empty payload
        resp_empty = asyncio.run(main_app.record_telemetry({}))
        self.assertEqual(resp_empty.status_code, 200)
        body_empty = json.loads(resp_empty.body.decode("utf-8"))
        self.assertEqual(body_empty["recorded_events"], 0)


class TestCompactUIAndKeyboard(unittest.TestCase):
    def test_index_html_contains_required_elements(self):
        index_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "index.html")
        with open(index_path, "r") as f:
            html = f.read()
        
        # Compact top layout
        self.assertIn('class="app-header"', html)
        self.assertIn('class="score-hud-compact"', html)
        self.assertIn('id="hud-target-card"', html)
        self.assertIn('id="hud-live-card"', html)
        self.assertIn('id="coach-banner"', html)

        # 88-key piano keyboard wrapper
        self.assertIn('id="piano-keys"', html)
        self.assertIn('88-toetsen', html.lower())
        self.assertIn('id="piano-container"', html)

        # Scrolling hand placement guide under keyboard
        self.assertIn('id="hand-placement-wrapper"', html)
        self.assertIn('id="hand-placement-track"', html)
        self.assertIn('id="hand-placement-scroll"', html)
        self.assertIn('id="active-measure-summary"', html)

        # Telemetry insights modal
        self.assertIn('id="insights-modal"', html)
        self.assertIn('id="btn-insights"', html)

        # Main menu dashboard & lesson progress
        self.assertIn('id="btn-toggle-menu"', html)
        self.assertIn('id="view-main-menu"', html)
        self.assertIn('id="menu-stat-completed"', html)
        self.assertIn('id="menu-exercises-grid"', html)

        # Real-time hand guide bar and default two hands mode
        self.assertIn('id="piano-hand-guide-bar"', html)
        self.assertIn('id="lh-fingers-container"', html)
        self.assertIn('id="rh-fingers-container"', html)
        self.assertIn('class="active" data-hand="both"', html)
        self.assertIn('pill-lh', html)
        self.assertIn('pill-rh', html)

    def test_88_key_piano_specifications(self):
        # 52 white keys from A0 to C8
        white_notes = ['A0', 'B0']
        for oct_num in range(1, 8):
            for letter in ['C', 'D', 'E', 'F', 'G', 'A', 'B']:
                white_notes.append(f"{letter}{oct_num}")
        white_notes.append('C8')
        self.assertEqual(len(white_notes), 52)
        self.assertEqual(white_notes[0], 'A0')
        self.assertEqual(white_notes[-1], 'C8')
        self.assertIn('C4', white_notes)

        # 36 black keys
        black_keys = ['A#0']
    def test_css_selector_validity_and_compact_rules(self):
        css_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "styles.css")
        with open(css_path, "r") as f:
            css = f.read()
        
        # Verify no invalid unescaped digit class selector like .88-keys
        self.assertNotIn(".88-keys", css, "CSS class selectors cannot start with unescaped digit like .88-keys")
        self.assertIn("piano-88-keys", css, "CSS must define piano-88-keys class")
        self.assertIn("min-height: 0", css, "tutor-main must have min-height: 0 to prevent flex overflow on laptop viewports")
        self.assertIn("@media (max-height: 800px)", css)
        self.assertIn("@media (max-height: 680px)", css)

    def test_header_compactness_structure(self):
        index_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "index.html")
        with open(index_path, "r") as f:
            html = f.read()

        # Both the primary navigation/controls and the score HUD must be inside the header
        header_end = html.find("</header>")
        self.assertGreater(header_end, 0)
        hud_pos = html.find('class="score-hud-compact"')
        self.assertLess(hud_pos, header_end, "score-hud-compact should be integrated into header to maximize sheet vertical space")
        coach_pos = html.find('id="coach-banner"')
        self.assertLess(coach_pos, header_end, "coach-banner should be integrated into header to prevent vertical stacking")

    def test_js_scrolling_and_telemetry_listeners(self):
        js_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "app.js")
        with open(js_path, "r") as f:
            js = f.read()
        
        # Safe container-only scrolling & hand markers
        self.assertIn("centerKeyInPianoView", js)
        self.assertIn("centerCardInHandGuideView", js)
        self.assertIn("updatePianoHandBrackets", js)
        self.assertIn('currentHand: "both"', js)
        self.assertIn("beforeunload", js)


if __name__ == "__main__":
    unittest.main()


