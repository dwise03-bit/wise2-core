# WISE² PixelRAG Visual Audit Adapter

Experimental, opt-in integration for WISE TOUCH™ and OWL EYE™. Captures screenshots of public pages using the official PixelRAG `pixelshot` CLI. Does **not** yet score sites, use vision models, crawl whole domains, or build a retrieval index.

Upstream: https://github.com/StarTrail-org/PixelRAG (Apache-2.0).

## Install (Python 3.10+)

Keep Python dependencies outside the Node monorepo environment:

```sh
python -m venv .venv-pixelrag
. .venv-pixelrag/bin/activate
python -m pip install -r tools/pixelrag/requirements.txt
pixelshot --help
python tools/pixelrag/capture.py https://example.com
```

On Windows activate with `.venv-pixelrag\\Scripts\\activate`. The PixelRAG screenshot tool requires Chrome/Chromium; consult upstream instructions for platform-specific browser setup. Output is written under `artifacts/pixelrag/` and **must not** be committed.

## Claude Code plugin (install locally, not on GitHub)

```sh
uv tool install pixelrag
claude plugin marketplace add StarTrail-org/PixelRAG
claude plugin install pixelbrowse@pixelrag-plugins
```

The Claude plugin and `pixelshot` run on the developer machine or VPS. GitHub storing these files does not install executables on that machine.

## Future pipeline

Authorized URL -> pixelshot screenshots -> metadata/evidence store -> vision audit -> human review -> WISE TOUCH design brief / OWL EYE scoring. Preserve original URL, capture time, and evidence. Add throttling, robots/terms review, SSRF-safe egress, access controls and output retention before exposing this to arbitrary users or making it unattended. This wrapper only rejects obvious local targets; DNS can still resolve to private addresses, so **do not run it as a public URL-fetching service**.

## Optional full visual retrieval

PixelRAG's embeddings, FAISS indexing and API serving are separate, hardware-intensive stages. Follow upstream documentation for `pixelrag[index]` and `pixelrag[serve]` after sizing the deployment. No giant pretrained indexes are vendored into this repo.
