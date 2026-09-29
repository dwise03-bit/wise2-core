"""
Discord Soundboard API Routes
Endpoints for soundboard control and management
"""

import logging
from fastapi import FastAPI, HTTPException, Query
from typing import Optional
from discord_soundboard import DiscordSoundboard, SoundboardMidiMapper

logger = logging.getLogger(__name__)


def register_soundboard_routes(app: FastAPI, soundboard: DiscordSoundboard, midi_mapper: SoundboardMidiMapper):
    """Register soundboard endpoints to FastAPI app"""

    @app.get("/soundboard/library")
    async def get_soundboard_library():
        """Get complete soundboard library"""
        return {
            "library": soundboard.get_library(),
            "categories": list(set(
                s.get("category") for s in soundboard.get_library().values()
            ))
        }

    @app.get("/soundboard/library/category/{category}")
    async def get_sounds_by_category(category: str):
        """Get sounds filtered by category"""
        sounds = soundboard.get_library_by_category(category)
        if not sounds:
            raise HTTPException(status_code=404, detail=f"No sounds found for category: {category}")
        return {"category": category, "sounds": sounds}

    @app.get("/soundboard/state")
    async def get_soundboard_state():
        """Get soundboard state (library size, active sounds, queue)"""
        return soundboard.get_soundboard_state()

    @app.post("/soundboard/play/{sound_id}")
    async def play_sound(sound_id: str, voice_channel_id: Optional[str] = Query(None)):
        """Play sound by ID"""
        success = await soundboard.play_sound(sound_id, voice_channel_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Sound not found: {sound_id}")
        return {"status": "queued", "sound_id": sound_id}

    @app.post("/soundboard/stop/{sound_id}")
    async def stop_sound(sound_id: str):
        """Stop playing sound"""
        success = await soundboard.stop_sound(sound_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Sound not found or not playing: {sound_id}")
        return {"status": "stopped", "sound_id": sound_id}

    @app.post("/soundboard/stop-all")
    async def stop_all_sounds():
        """Stop all playing sounds"""
        await soundboard.stop_all_sounds()
        return {"status": "all_stopped"}

    @app.get("/soundboard/active")
    async def get_active_sounds():
        """Get currently playing sounds"""
        return {"active": soundboard.get_active_sounds()}

    @app.get("/soundboard/mappings")
    async def get_pad_mappings():
        """Get MIDI pad-to-sound mappings"""
        return {"mappings": midi_mapper.get_mappings()}

    @app.post("/soundboard/map/{pad_index}/{sound_id}")
    async def map_pad_to_sound(pad_index: int, sound_id: str):
        """Map MIDI pad to soundboard sound"""
        if pad_index < 0 or pad_index >= 16:
            raise HTTPException(status_code=400, detail="Pad index must be 0-15")

        success = midi_mapper.map_pad(pad_index, sound_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Sound not found: {sound_id}")
        return {"status": "mapped", "pad": pad_index, "sound": sound_id}

    @app.post("/soundboard/unmap/{pad_index}")
    async def unmap_pad(pad_index: int):
        """Remove pad mapping"""
        if pad_index < 0 or pad_index >= 16:
            raise HTTPException(status_code=400, detail="Pad index must be 0-15")

        success = midi_mapper.unmap_pad(pad_index)
        if not success:
            raise HTTPException(status_code=404, detail=f"Pad not mapped: {pad_index}")
        return {"status": "unmapped", "pad": pad_index}

    @app.post("/soundboard/trigger-pad/{pad_index}")
    async def trigger_pad(pad_index: int, voice_channel_id: Optional[str] = Query(None)):
        """Trigger soundboard sound from MIDI pad (for testing)"""
        if pad_index < 0 or pad_index >= 16:
            raise HTTPException(status_code=400, detail="Pad index must be 0-15")

        success = await midi_mapper.trigger_pad(pad_index, voice_channel_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Pad {pad_index} not mapped to soundboard")
        return {"status": "triggered", "pad": pad_index}

    @app.post("/soundboard/add-sound")
    async def add_sound(
        sound_id: str = Query(...),
        name: str = Query(...),
        file: str = Query(...),
        category: str = Query(...),
        duration: float = Query(...),
        description: str = Query("")
    ):
        """Add new sound to soundboard library"""
        soundboard.library.add_sound(sound_id, name, file, category, duration, description)
        return {"status": "added", "sound_id": sound_id}

    @app.delete("/soundboard/remove-sound/{sound_id}")
    async def remove_sound(sound_id: str):
        """Remove sound from soundboard library"""
        success = soundboard.library.remove_sound(sound_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Sound not found: {sound_id}")
        return {"status": "removed", "sound_id": sound_id}

    logger.info("✅ Soundboard routes registered")
