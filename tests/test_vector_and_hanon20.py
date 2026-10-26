"""
Tests for Hanon Part 1 (Exercises 1 through 20), Vector Sheet Renderer support,
and static bundle generation.
"""

import os
import json
import unittest

from core.lessons import get_exercises, get_exercise_lessons, get_lesson, EXERCISES, LESSONS
import app as main_app

class TestHanon20Part1(unittest.TestCase):
    def setUp(self):
        self.data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

    def test_all_20_exercise_files_exist_and_valid(self):
        for num in range(1, 21):
            ex_id = f"ex{num}"
            file_path = os.path.join(self.data_dir, f"hanon_{ex_id}.json")
            self.assertTrue(os.path.exists(file_path), f"File {file_path} must exist")
            with open(file_path, "r") as f:
                data = json.load(f)
            self.assertGreaterEqual(data["total_measures"], 28, f"Ex {num} should have at least 28 measures")
            self.assertGreaterEqual(data["total_notes"], 200, f"Ex {num} should have at least 200 notes")
            self.assertEqual(len(data["measures"]), data["total_measures"])
            
            # Verify measure 1 structure & octave alignment
            m1 = data["measures"][0]
            self.assertEqual(m1["measure"], 1)
            self.assertEqual(len(m1["notes"]), 8)
            for note in m1["notes"]:
                self.assertIn("rh", note)
                self.assertIn("lh", note)
                self.assertIn("note", note["rh"])
                self.assertIn("midi", note["rh"])
                self.assertIn("finger", note["rh"])
                self.assertIn("note", note["lh"])
                self.assertIn("midi", note["lh"])
                self.assertIn("finger", note["lh"])
                # Right Hand is always exactly 1 octave (12 semitones) above Left Hand
                self.assertEqual(note["rh"]["midi"] - note["lh"]["midi"], 12)
            
            # Exercises starting on C start on C3 (48) for RH and C2 (36) for LH in bass clef
            if num in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 18, 19]:
                self.assertEqual(m1["notes"][0]["rh"]["midi"], 48)
                self.assertEqual(m1["notes"][0]["lh"]["midi"], 36)

    def test_all_20_exercises_lessons(self):
        for num in range(1, 21):
            ex_id = f"ex{num}"
            lessons = get_exercise_lessons(ex_id)
            self.assertEqual(len(lessons), 6, f"Exercise {ex_id} should have exactly 6 lessons")
            self.assertEqual(lessons[0]["start_measure"], 1)
            self.assertEqual(lessons[0]["end_measure"], 4)
            # Final lesson covers whole exercise
            final_l = lessons[-1]
            self.assertEqual(final_l["start_measure"], 1)
            self.assertGreaterEqual(final_l["end_measure"], 28)

    def test_api_endpoints_for_all_20(self):
        resp_all = main_app.get_all_exercises_list()
        body_all = json.loads(resp_all.body.decode("utf-8"))
        self.assertEqual(len(body_all), 20)
        
        # Test individual hanon endpoints for 1-20
        for num in range(1, 21):
            ex_id = f"ex{num}"
            resp = main_app.get_single_hanon_data(ex_id)
            self.assertEqual(resp.status_code, 200, f"Endpoint for {ex_id} should return 200")
            body = json.loads(resp.body.decode("utf-8"))
            self.assertIn("total_measures", body)
            self.assertIn("measures", body)

if __name__ == "__main__":
    unittest.main()
