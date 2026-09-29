# UI architecture

The browser route provides the authenticated product shell and project workflow. The dedicated Sound Labs UI provides the low-latency controller surface with `SoundLabsDashboard`, `StudioControlDeck`, `VirtualMaschine`, and `StatusPanel`. Controls use the bridge for transport and pad events; unavailable integrations must remain visibly unavailable.
