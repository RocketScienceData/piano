"""
Python real-time pitch detector using sounddevice, numpy, and YIN / autocorrelation.
"""

import math
import numpy as np
from typing import Optional, Tuple, Callable

# Note name mappings
NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

def hz_to_midi(freq_hz: float) -> Optional[float]:
    if freq_hz is None or freq_hz < 20.0 or freq_hz > 5000.0:
        return None
    return 69.0 + 12.0 * math.log2(freq_hz / 440.0)

def midi_to_note_name(midi_val: float) -> Tuple[str, int, float]:
    """Returns (note_name, octave, cents_offset)"""
    rounded = round(midi_val)
    cents = (midi_val - rounded) * 100.0
    note_idx = rounded % 12
    octave = (rounded // 12) - 1
    return f"{NOTE_NAMES[note_idx]}{octave}", rounded, cents

def autocorrelation_pitch(buffer: np.ndarray, sample_rate: int = 44100, min_freq: float = 27.0, max_freq: float = 4200.0) -> Optional[float]:
    """
    Normalized Square Difference / Autocorrelation pitch detector.
    Optimized for full 88-key acoustic piano fundamental frequencies (A0 to C8).
    """
    n = len(buffer)
    if n < 256:
        return None

    # Calculate signal RMS energy
    rms = np.sqrt(np.mean(buffer ** 2))
    if rms < 0.008:  # silence gate
        return None

    min_period = int(sample_rate / max_freq)
    max_period = int(sample_rate / min_freq)
    if max_period >= n:
        max_period = n - 1

    # Autocorrelation via FFT for speed
    f = np.fft.rfft(buffer, n=2 * n)
    r = np.fft.irfft(f * np.conjugate(f))[:n]

    # Normalize
    if r[0] <= 1e-9:
        return None

    r_norm = r / r[0]

    # Find the first prominent peak after the initial drop
    # First find where autocorrelation drops below threshold (e.g., 0.3)
    drop_idx = min_period
    while drop_idx < max_period and r_norm[drop_idx] > 0.4:
        drop_idx += 1

    if drop_idx >= max_period:
        return None

    # Find local maximum in [drop_idx, max_period]
    search_region = r_norm[drop_idx:max_period]
    if len(search_region) == 0:
        return None

    peak_sub_idx = np.argmax(search_region)
    peak_idx = drop_idx + peak_sub_idx
    peak_val = r_norm[peak_idx]

    if peak_val < 0.4:  # not periodic enough
        return None

    # Parabolic interpolation for sub-sample accuracy
    if 0 < peak_idx < n - 1:
        alpha = r_norm[peak_idx - 1]
        beta = r_norm[peak_idx]
        gamma = r_norm[peak_idx + 1]
        denom = 2 * (2 * beta - alpha - gamma)
        if denom != 0:
            delta = (gamma - alpha) / denom
            refined_period = peak_idx + delta
        else:
            refined_period = float(peak_idx)
    else:
        refined_period = float(peak_idx)

    freq = sample_rate / refined_period
    if min_freq <= freq <= max_freq:
        return freq

    return None


class MicPitchDetector:
    def __init__(self, sample_rate: int = 44100, buffer_size: int = 4096, on_pitch_callback: Optional[Callable] = None):
        self.sample_rate = sample_rate
        self.buffer_size = buffer_size
        self.on_pitch_callback = on_pitch_callback
        self.is_running = False
        self.stream = None
        self.last_detected_note = None
        self.stable_count = 0

    def start(self):
        import sounddevice as sd
        self.is_running = True

        def audio_callback(indata, frames, time_info, status):
            if not self.is_running:
                return
            audio_data = indata[:, 0]  # mono
            freq = autocorrelation_pitch(audio_data, self.sample_rate)
            rms = float(np.sqrt(np.mean(audio_data ** 2)))

            if freq:
                midi = hz_to_midi(freq)
                if midi:
                    note_name, midi_int, cents = midi_to_note_name(midi)
                    if self.on_pitch_callback:
                        self.on_pitch_callback({
                            "type": "pitch",
                            "note": note_name,
                            "midi": midi_int,
                            "freq": round(freq, 1),
                            "cents": round(cents, 1),
                            "volume": round(rms, 3)
                        })

        self.stream = sd.InputStream(
            channels=1,
            samplerate=self.sample_rate,
            blocksize=self.buffer_size,
            callback=audio_callback
        )
        self.stream.start()

    def stop(self):
        self.is_running = False
        if self.stream:
            self.stream.stop()
            self.stream.close()
            self.stream = None
