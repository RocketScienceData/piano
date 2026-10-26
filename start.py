#!/usr/bin/env python3
"""
Hanon Piano Tutor Starter Script.
Starts FastAPI backend and opens the browser.
"""

import os
import sys
import webbrowser
import threading
import time
import uvicorn

def open_browser():
    time.sleep(1.2)
    url = "http://127.0.0.1:8000"
    print(f"\n🚀 Hanon Piano Tutor geopend in je browser: {url}\n")
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"Kon browser niet automatisch openen: {e}")

if __name__ == "__main__":
    print("==================================================")
    print("🎹 Hanon Piano Tutor - De Virtuoze Pianist")
    print("==================================================")
    print("Tip: Zet je laptop op de piano, selecteer je les,")
    print("en begin met spelen. De laptop luistert direct mee!")
    print("--------------------------------------------------")

    # Start browser opener thread
    threading.Thread(target=open_browser, daemon=True).start()

    # Start Uvicorn webserver
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=False, log_level="info")
