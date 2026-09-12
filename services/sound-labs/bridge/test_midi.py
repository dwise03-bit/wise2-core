#!/usr/bin/env python3
"""MASCHINE MIKRO MK3 Pad Test"""

import mido
import time

PORT = "Maschine Mikro MK3"
pads_pressed = set()

print(f"🎧 Testing {PORT}")
print("Press all 16 pads (15 second timeout)...\n")

try:
    with mido.open_input(PORT) as inp:
        start = time.time()
        while time.time() - start < 15:
            msg = inp.poll()
            if msg and msg.type == 'note_on' and msg.velocity > 0:
                pad = msg.note
                pads_pressed.add(pad)
                print(f"  Pad {pad:2d} pressed (velocity: {msg.velocity})")
            time.sleep(0.01)
except KeyboardInterrupt:
    print("\n⏸️  Stopped")
except Exception as e:
    print(f"❌ Error: {e}")

print(f"\n✅ Pads pressed: {sorted(pads_pressed)}")
print(f"Total: {len(pads_pressed)}/16")
if len(pads_pressed) == 16:
    print("🎉 ALL PADS WORKING!")
elif pads_pressed:
    print(f"⚠️  Missing pads: {set(range(16)) - pads_pressed}")
else:
    print("❌ No pads detected")
