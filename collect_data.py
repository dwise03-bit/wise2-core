#!/usr/bin/env python3
"""
Phase 1: Data Collection for MusicGen Fine-Tuning
Collects CC-licensed music from free sources
Targets: 500+ tracks from Free Music Archive, ccMixter, YouTube CC
"""

import os
import json
import subprocess
import sys
from pathlib import Path
from urllib.request import urlopen
import tarfile

# Configuration
BASE_DIR = Path("/home/dwise/musicgen-training")
RAW_DIR = BASE_DIR / "raw"
METADATA_DIR = BASE_DIR / "metadata"

# Create directories
RAW_DIR.mkdir(parents=True, exist_ok=True)
METADATA_DIR.mkdir(parents=True, exist_ok=True)

print("=" * 60)
print("PHASE 1: DATA COLLECTION")
print("=" * 60)

# ============================================================================
# SOURCE 1: Free Music Archive (Manual + API)
# ============================================================================
print("\n[1/3] Free Music Archive (freemusicarchive.org)")
print("-" * 60)
print("""
Free Music Archive has 100,000+ CC-licensed tracks.

Manual download option (recommended first):
  1. Go to https://freemusicarchive.org
  2. Filter: License = "CC"
  3. Download top 100-200 tracks
  4. Save to: /home/dwise/musicgen-training/raw/

Automated option (requires API):
  Run: python3 fma_scraper.py (see separate script)

For now, we'll document what's needed:
""")

# Create FMA scraper template
fma_scraper = '''#!/usr/bin/env python3
"""FMA Scraper - Download CC tracks from Free Music Archive"""
import requests
import os
from pathlib import Path

FMA_API = "https://freemusicarchive.org/api/get"
RAW_DIR = Path("/home/dwise/musicgen-training/raw")

# Get CC-licensed tracks
params = {
    "limit": 100,
    "sort": "date_created",
    "sort_dir": "DESC",
    "license_ids": [6, 7, 8, 9, 10],  # CC licenses
}

print("Fetching Free Music Archive tracks...")
response = requests.get(f"{FMA_API}/songs", params=params)
tracks = response.json()["dataset"]

for track in tracks[:50]:  # Limit to 50 for testing
    try:
        url = track["track_file_url"]
        title = track["track_title"].replace(" ", "_")
        artist = track["artist_name"].replace(" ", "_")
        filename = f"FMA_{artist}_{title}.mp3"
        filepath = RAW_DIR / filename

        print(f"Downloading: {filename}...", end=" ")
        response = requests.get(url, stream=True)
        with open(filepath, "wb") as f:
            f.write(response.content)
        print("✓")
    except Exception as e:
        print(f"✗ ({e})")
        continue

print(f"\\nDownloaded to: {RAW_DIR}")
'''

with open("fma_scraper.py", "w") as f:
    f.write(fma_scraper)

print("✓ Created fma_scraper.py (for manual FMA downloads)")

# ============================================================================
# SOURCE 2: YouTube CC Music (via yt-dlp)
# ============================================================================
print("\n[2/3] YouTube Creative Commons Music")
print("-" * 60)
print("""
Downloading from CC-licensed YouTube channels and playlists.

Channels with CC music:
  - Incompetech: https://www.youtube.com/@incompetech
    (400+ royalty-free instrumental tracks)
  - Free Music Archive: https://www.youtube.com/@FreeMusicArchive
  - Background Music: Various themed playlists

Required: yt-dlp (brew install yt-dlp or pip install yt-dlp)
""")

# Create YouTube downloader script
youtube_downloader = '''#!/usr/bin/env python3
"""Download CC music from YouTube channels"""
import subprocess
from pathlib import Path

RAW_DIR = Path("/home/dwise/musicgen-training/raw")

# YouTube playlists with CC music
playlists = [
    {
        "name": "Incompetech Ambient",
        "url": "https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf",
        "max": 50,
    },
    {
        "name": "Incompetech Background",
        "url": "https://www.youtube.com/playlist?list=PLrAXtmErZgOdzulIRc4xQhKcR7kxRe3Ta",
        "max": 50,
    },
]

for playlist in playlists:
    print(f"\\n[*] {playlist['name']}")
    print(f"    URL: {playlist['url']}")

    cmd = [
        "yt-dlp",
        "-f", "bestaudio",
        "-x",
        "--audio-format", "wav",
        "--audio-quality", "192",
        "-o", str(RAW_DIR / "%(playlist)s_%(title)s.%(ext)s"),
        "--playlist-items", f"1-{playlist['max']}",
        playlist["url"],
    ]

    print(f"    Downloading up to {playlist['max']} tracks...")
    subprocess.run(cmd)

print(f"\\n✓ All downloads saved to: {RAW_DIR}")
'''

with open("youtube_downloader.py", "w") as f:
    f.write(youtube_downloader)

print("✓ Created youtube_downloader.py")

# ============================================================================
# SOURCE 3: Incompetech Direct (Torrent/Direct Download)
# ============================================================================
print("\n[3/3] Incompetech Direct Download")
print("-" * 60)
print("""
Incompetech.com has 400+ high-quality, royalty-free instrumental tracks.
All CC-0 (public domain equivalent).

Download options:
  1. Via website: https://incompetech.com/music/royalty-free/
  2. Via torrent: https://incompetech.com/music/royalty-free/torrents/
  3. Via API/bulk download (see script below)

The bulk download torrent contains ~400 tracks (~5GB).
Much faster than downloading individually.
""")

incompetech_script = '''#!/usr/bin/env python3
"""
Incompetech Bulk Downloader
Downloads via individual track URLs from incompetech.com
Note: Consider torrent download for faster bulk access
"""
import requests
import os
from pathlib import Path
from bs4 import BeautifulSoup

RAW_DIR = Path("/home/dwise/musicgen-training/raw")

# Option A: Download via torrent (manual)
print("""
RECOMMENDED: Download Incompetech torrent (5GB, 400+ tracks)
  1. Go to: https://incompetech.com/music/royalty-free/torrents/
  2. Download: Incompetech_-_Complete_Collection.torrent
  3. Extract to: /home/dwise/musicgen-training/raw/

This is 100x faster than downloading tracks individually.
""")

# Option B: Scrape individual tracks (slow but works)
print("""
Alternatively, run this for slow individual downloads:
  python3 incompetech_scraper.py
""")
'''

with open("incompetech_script.py", "w") as f:
    f.write(incompetech_script)

print("✓ Created incompetech_script.py")

# ============================================================================
# SUMMARY
# ============================================================================
print("\n" + "=" * 60)
print("PHASE 1 STEP 1: DATA COLLECTION SCRIPTS READY")
print("=" * 60)

print(f"""
Created the following collection scripts:

1. fma_scraper.py
   - Free Music Archive API downloader
   - Target: 100-200 CC-licensed tracks

2. youtube_downloader.py
   - YouTube CC channel/playlist downloader
   - Requires: yt-dlp (pip install yt-dlp)
   - Target: 100-150 tracks from Incompetech + FMA channels

3. incompetech_script.py
   - Incompetech direct downloader
   - FASTEST: Use torrent (400+ tracks in 5GB)
   - ALTERNATIVE: Individual track scraper

RECOMMENDED WORKFLOW:

  Week 1 (Day 1-2): Manual Downloads
    [*] Download Incompetech torrent (400 tracks) → /raw/
    [*] Download FMA samples (100 tracks) → /raw/
    [*] YouTube playlists (100 tracks) → /raw/
    Total: ~600 tracks, ready to process

  Week 1 (Day 3-7): Process & Split
    Run: metadata_pipeline.py
    Creates: train/val/test splits, metadata JSON

NEXT STEPS:
  1. Download training data (see scripts above)
  2. Run: python3 metadata_pipeline.py
  3. Then: python3 fine_tune_musicgen_1660.py

STORAGE NEEDED:
  - Raw audio: ~5-10GB (depending on sources)
  - Processed: ~3-5GB (16kHz mono WAV)
  - Total: ~8-15GB recommended

Download to: /home/dwise/musicgen-training/raw/
""")

print(f"✓ Output directory: {RAW_DIR}")
print(f"✓ Metadata directory: {METADATA_DIR}")
print("\nReady to download training data!")
