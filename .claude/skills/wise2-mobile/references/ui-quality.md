# Mobile UI Quality

## WISE2 visual baseline

Default WISE2 product UI to premium cinematic dark surfaces with intentional hierarchy, metallic/chrome identity, electric blue/cyan glow, restrained neon-green success states, and red/orange alerts. Preserve project-specific canonical visuals when they exist; they override generic WISE2 defaults.

Do not create a generic AI dashboard aesthetic when a canonical visual has been supplied.

## Required states

Every production screen should deliberately handle:
- normal;
- loading;
- empty;
- offline/degraded;
- validation failure;
- recoverable error;
- destructive confirmation when relevant.

## Mobile quality checklist

- Strong top-level hierarchy visible within seconds.
- Touch targets sized for mobile use.
- Readable contrast and typography.
- No clipped content at common phone sizes.
- Safe-area/system-inset handling.
- Keyboard does not trap or hide primary actions.
- Motion is purposeful, short and performant.
- Haptics are used sparingly for meaningful state changes.
- Icons are consistent and not a mixture of unrelated sets.
- Avoid placeholder gradients/cards that do not communicate function.

## App icons

Treat icon work as a release asset, not decoration.
- Use one canonical master composition.
- Keep critical artwork away from platform mask edges.
- Verify at small sizes.
- Avoid text too small to survive launcher/home-screen rendering.
- Generate platform-required variants from the approved master, not independent AI reinterpretations.
- If a real person/device image is canonical, do not alter their appearance or geometry without explicit approval.
