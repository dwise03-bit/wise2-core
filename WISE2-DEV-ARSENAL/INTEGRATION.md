# Application sequence for Codex / Claude

1. Pull wise2-core and run `python WISE2-DEV-ARSENAL/tools/sources.py`, then `--check`.
2. Use `--search "keyword" --limit 30` to choose services and connectors from the pinned catalogs. Record provider URL, price/limits verified on selection date, authentication needs and project fit. Catalog entries are discovery leads, not verified free subscriptions.
3. For OWL EYE collection, read `upstream/EasySpider/Readme.md`. Upstream directs desktop users to https://github.com/NaiboWang/EasySpider/releases. Choose the target OS release. Import a sample task from its Examples folder and test collection against a WISE²-owned fixture. Map exported records into Finder → Adapters → Evidence/Provenance before any scoring. Preserve source URL, retrieval time, task ID and raw evidence. Desktop binaries have not been installed here.
4. For security work, read `upstream/strix/README.md` and `pyproject.toml`. In a separate Python 3.12+ environment install the pinned checkout with `python -m pip install -e WISE2-DEV-ARSENAL/upstream/strix`. Run Docker, configure `STRIX_LLM` and `LLM_API_KEY` outside Git, then assess an owned local or staging app with `strix --target ./app-directory`. The README notes that the first run downloads a sandbox image. No scan is started by the source downloader. Model calls may cost money.
5. Choose individual MCP servers for the actual project and host. Read each selected server's upstream setup, required credentials and license, pin its version, then configure only that server. This repository is a directory of servers, not a universal connector installation.

## Source and license inventory

The exact commit and branch for each source are recorded in repositories.lock.json. Public APIs and Awesome MCP Servers declare MIT; EasySpider includes AGPL-3.0; Strix declares Apache-2.0. Free for Dev has no root license file in this pinned checkout; retain its attribution and link to the original catalog. This inventory does not determine the licenses or service terms of listed APIs and MCP servers. EasySpider's README describes commercial licensing options; review its terms before integrating modified code into a hosted product.

The Free for Dev checkout contains an AGENTS.md prohibiting AI-edited contributions to its upstream repository. Its source remains untouched; all WISE² additions are outside the submodules.

## Acceptance checks

- All five HEAD revisions match the lock and all five README files exist.
- Catalog search returns source paths and line numbers without executing listed software.
- EasySpider on the target PC exports a sample collection with evidence provenance.
- Strix on the target PC produces a report for the selected WISE² test app.
- Any selected MCP connector completes a read-only smoke test on its intended host.

The last three checks depend on target-host setup and have not been performed in this source-import change.
