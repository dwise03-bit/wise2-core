# Testing

Run `pnpm --dir apps/website type-check` (currently reports unrelated repository-wide casing and legacy API errors), then run the website build in the deployment environment. For the controller, run the package build and verify bridge status, transport, pad events, and disconnected state with the real device attached.
