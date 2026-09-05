# WISE² Phone AI Architecture

```text
Caller → Telnyx number → Paige AI Assistant → signed Telnyx events
                                      ↓
                         WISE² API / AI Phone module
                           ↓       ↓       ↓
                         Session  CRM   follow-up systems
```

The API is the system of record for call identity and lifecycle. Telnyx remains the telephony/real-time voice provider, while the provider-neutral `packages/ai-phone` package owns sessions, tools, and model abstraction.
