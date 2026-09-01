# WISE² REAPER × Discord Studio

Discord `ReaperBot` calls the canonical `StudioService`; the service calls a typed `ReaperAdapter`. The default adapter uses `WISE2_REAPER_BRIDGE_URL` and bearer authentication, while tests use `MockReaperAdapter`. The bridge is local/private and REAPER is never exposed directly to Discord or the public internet.

Existing `BotFramework`, `BotOrchestrator`, `VoiceBot`, and live-studio services remain the integration boundaries. Voice and future dashboard clients should call `StudioService` rather than duplicating REAPER logic.
