# Bridge setup

1. Copy `services/reaper-bridge/.env.example` to a workstation-only environment file and generate a long random token.
2. Run the bridge on the Mac running REAPER, bound to `127.0.0.1`.
3. Configure Discord with the same URL/token through `WISE2_REAPER_BRIDGE_URL` and `WISE2_REAPER_BRIDGE_TOKEN`.
4. Add the native ReaScript adapter before using a real project; the checked-in bridge currently proves the API with a mock adapter.
