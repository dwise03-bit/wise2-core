# WISE² Custom GPT Action

WISE² includes an importable Custom GPT Action definition at
`docs/openapi/wise2-custom-gpt.yaml`.

## Add it to a Custom GPT

1. Open the GPT editor and choose **Configure → Actions → Create new action**.
2. Paste the contents of `docs/openapi/wise2-custom-gpt.yaml` into the schema editor.
3. Keep authentication set to **None** only when the API is protected by a trusted private gateway.
4. For a public deployment, put the API behind an authenticated gateway and select **API key** or **OAuth** in the GPT editor. Do not put a WISE² token in the schema.
5. Test the read-only action with: “Check WISE² health.”
6. Keep write actions confirmation-gated: the GPT must restate the exact lead,
   follow-up, or estimate it is about to create and wait for explicit approval.

The action targets `https://api.wise2.net/api/v1/hermes/health`. Local addresses
such as `127.0.0.1`, `localhost`, or USB-reverse ADB ports cannot be reached by a
cloud Custom GPT; use the VPS HTTPS endpoint for cloud actions.
