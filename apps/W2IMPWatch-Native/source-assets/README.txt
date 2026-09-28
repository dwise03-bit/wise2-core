W² IMP WATCH FACE HANDOFF PACK

Included Files
--------------
assets/00_original_imp_sprite_sheet.png
  Original exact IMP sprite sheet / expression reference.

assets/01_master_clean_face.png
  Clean master watch-face background. No watch bezel, no fake clock, no UI baked in.
  Use this as the core wallpaper/background anchor.

assets/02_idle_state.png
  Idle state reference.

assets/03_wake_state.png
  Wake / activation state reference.

assets/04_charging_state.png
  Charging state reference.

assets/05_notification_state.png
  Notification / alert state reference.

assets/06_night_mode.png
  Night / sleep mode reference.

assets/07_always_on_mode.png
  Minimal OLED-friendly always-on version.

boards/08_wake_loop_storyboard.png
  Motion handoff board for the 6-step wake loop.

boards/09_asset_system_concept_board.png
  Higher-level concept/asset overview board.

Recommended Build Workflow
--------------------------
1) Use 00_original_imp_sprite_sheet.png as the locked character identity reference.
2) Use 01_master_clean_face.png as the base visual environment.
3) Derive app/watch states from the state images 02-07.
4) Use 08_wake_loop_storyboard.png as the motion roadmap.
5) Keep the IMP consistent:
   - porcelain-white body
   - fine gold crackle veining
   - gold horn/limb/tail bands
   - glowing electric-blue eyes
   - W² chest mark
6) Keep the environment consistent:
   - dark black / midnight / obsidian base
   - electric blue and restrained gold lighting
   - W² logo behind the IMP
   - circular pedestal and reflective floor
   - no crown imagery

Suggested Motion Sequence
-------------------------
Idle -> Power On -> Eyes Wake -> Blink/Tail Twitch -> Full Wake -> Reset

Suggested Export Set
--------------------
- Apple Watch wallpaper/background
- Apple Watch always-on variant
- Charging screen variant
- Notification variant
- Night mode variant
- Motion loop / promo render
- Optional UI overlay / widget previews

Notes
-----
These are handoff-ready reference assets for further animation, watch mockups, or UI integration.
