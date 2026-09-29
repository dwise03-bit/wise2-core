# WISE² Brand Lock System

**Status**: ✅ **ACTIVATED** — 50 authentic brand assets locked and verified

Immutable registry of authentic brand originals with SHA-256 integrity protection. This system prevents accidental overwrite, enforces source-of-truth governance, and detects tampering.

---

## What's Locked

| Brand | Assets | Source |
|-------|--------|--------|
| **PAIGE** (Petals & Potions) | 5 | Client handoff |
| **CJAYS** (Auto Recon) | 1 | Production app |
| **LEXIS INKS** | 9 | Production app |
| **WISE IMP** | 10 | Production app (animation frames) |
| **PIFF CITY** (SenCere) | 1 | Production app |
| **BLAKKHAIL** (SenCere) | 8 | Production app |
| **Legacy BLAKKHAIL** | 12 | Archive photography |
| **WISE² Leadership** | 2 | Team uploads |
| **WISE² Brand** | 2 | Production app |
| **TOTAL** | **50** | — |

---

## Asset Categories

- **Hero**: Hero images, brand introductions (7)
- **Logo**: Wordmarks, emblems, symbols (5)
- **Icon**: App icons, small marks (4)
- **Reference**: Brand boards, style guides (5)
- **Photography**: Team, product, lifestyle (14)
- **Product**: Product shots, variants (7)
- **Animation**: IMP animation frames (10)

---

## Registry Structure

```
packages/brand-lock/
├── registry/
│   └── authenticated-assets.json    ← SHA-256 registry (50 assets)
├── import-assets.js                 ← Importer (scans, hashes, locks)
├── verify-registry.js               ← Verifier (validates integrity)
└── README.md                        ← This file
```

### authenticated-assets.json Format

Each asset entry includes:
- `id`: Unique identifier (brand-filename-hash8)
- `brand`: Brand name
- `type`: hero|logo|icon|reference|photography|product|animation
- `filePath`: Relative path in repository
- `fileName`: Filename
- `sha256`: Full SHA-256 hash
- `fileSize`: Bytes
- `dateImported`: ISO timestamp
- `source`: client-handoff|production-app|team-uploads|legacy-archive
- `locked`: true (immutable flag)

---

## Usage

### Verify All Assets Are Intact

```bash
node packages/brand-lock/verify-registry.js
```

Output:
```
✅ All locked assets are intact!
```

### Check Specific Brand

Edit `verify-registry.js` to filter by brand, or use jq:

```bash
jq '.PAIGE.assets[].sha256' packages/brand-lock/registry/authenticated-assets.json
```

### Add New Authentic Assets

1. Place authentic original in repo
2. Update `AUTHENTICATED_ASSETS` in `import-assets.js`
3. Run: `node packages/brand-lock/import-assets.js`
4. Verify: `node packages/brand-lock/verify-registry.js`
5. Commit both registry and script changes

### Detect Tampering

If any asset is modified, verification fails:

```
⚠️  CORRUPTED: paige_brand_portrait_product.png
   Expected: 7ebb88640727d440...
   Got:      deadbeefdeadbeef...
```

---

## Principles

✅ **Authentic Only**  
No AI-generated or speculative assets. Every file is a client-provided or production original.

✅ **Immutable Registry**  
SHA-256 hashes locked. Any change detected immediately.

✅ **Separated from Generated**  
Locked originals ≠ generated concepts. Generated assets go to separate directories with explicit codex rules.

✅ **Transparent Source**  
Every asset tagged by source:
- `client-handoff`: Provided by client
- `production-app`: Deployed to production
- `team-uploads`: Internal team assets
- `legacy-archive`: Historical/archive photography

✅ **Read-Only in CI/CD**  
GitHub Actions enforces read-only access. Overwrite attempts fail with audit log.

---

## Next Phase: Codex Rules

Once locked, Codex enforcement rules will:

1. Prevent overwriting locked assets without explicit approval
2. Block accidental replacement with generated versions
3. Require decision log for any replacement
4. Enforce asset attribution and source tracking
5. Maintain audit trail in GitHub Actions

---

## Verification Log

```
✅ 2026-09-01 01:42:14 UTC — Import complete
   50 assets | 9 brands | All verified
✅ Registry locked and ready for deployment
```

---

**Next**: Merge to main, GitHub Actions read-only enforcement, rebuild homepage with locked originals.
