# WISE² Developer Arsenal

The five repositories shown in the October 7, 23:00 recording are downloaded and registered as pinned Git submodules. They preserve upstream source, history and license files. The lock records the exact downloaded revisions; upstream changes do not silently update them.

## Use from the existing wise2-core checkout

```bash
git pull --ff-only
python WISE2-DEV-ARSENAL/tools/sources.py
python WISE2-DEV-ARSENAL/tools/sources.py --check
python WISE2-DEV-ARSENAL/tools/sources.py --search "weather"
python WISE2-DEV-ARSENAL/tools/sources.py --search "blender"
```

Windows can use `py` instead of `python`. Requires Git and Python 3. GitHub Download ZIP does not include submodule contents; use the script or clone with `--recurse-submodules`.

| Repository | WISE² use | Readiness |
|---|---|---|
| ripienaar/free-for-dev | Infrastructure, hosting and storage options | Searchable catalog; verify provider limits before selection |
| public-apis/public-apis | API discovery for OWL EYE, TRUCK WISER and EVERY DAY TRADER | Searchable catalog; individual APIs need their own accounts and terms |
| punkpeye/awesome-mcp-servers | Find connectors for coding, 3D and research workflows | Searchable catalog; listed servers are separate installations |
| NaiboWang/EasySpider | Visual web collection for OWL EYE | Source ready; desktop release or source build required |
| usestrix/strix | Security assessment of WISE² staging apps | Source ready; Python 3.12+, Docker and an LLM key required |

This adds source access and usable catalog search. It does not install desktop applications on your PC, activate every listed MCP server, or connect paid API services. See [INTEGRATION.md](INTEGRATION.md).
