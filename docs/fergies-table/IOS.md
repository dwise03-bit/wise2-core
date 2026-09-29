# Fergie's Table — iOS companion

Native iOS shell via **Capacitor**. The phone app opens Chef Fergie's Command (business OS), not the guest ordering table.

**Bundle ID:** `com.wise2.fergiestable`  
**Display name:** Fergie's Table  
**Start URL:** `https://wise2.net/fergies-table/business`

## What she can run from the phone

- Command dashboard (revenue, leads, kitchen load)
- Kitchen tickets (Confirmed → Preparing → Out → Completed)
- Booked calendar
- Lead pipeline
- Quotes, payments, menu board (sold out), settings, AI

Guest ordering is still in the same app under **More → Preview guest app**.

## First run

Keep the web app running:

```bash
pnpm --filter @wise2/fergies-table dev
```

Then:

```bash
cd apps/fergies-table
pnpm ios:icon
pnpm ios:sync
pnpm ios:open
```

In Xcode: select your team, pick a simulator or her iPhone, **Run**. The app loads the live Command dashboard from wise2.net.

## App Store

See [`APP_STORE.md`](./APP_STORE.md) for listing copy, privacy URL, and archive steps. Paid Apple Developer Program is required to upload.

## After icon or config changes

```bash
pnpm ios:icon
pnpm ios:sync
```
