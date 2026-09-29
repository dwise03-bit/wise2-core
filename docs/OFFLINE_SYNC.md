# Offline-First & Sync

## Flow

```
Technician action (status change, note, reading, report save, new job)
    ↓
Written to Room immediately, marked pendingSync = true
    ↓
Immediate best-effort network call
    ├─ succeeds → pendingSync = false
    └─ fails → PendingSyncEntity enqueued (data/local/entity/Entities.kt)
                    ↓
            SyncWorker (data/sync/SyncWorker.kt), WorkManager periodic (15 min, network-constrained)
                    ↓
            Replays each queued item against the real API
                    ├─ succeeds → dequeued, pendingSync cleared
                    └─ fails → attemptCount incremented, stays queued, retried next run
```

Nothing is ever discarded on failure — a failed sync attempt just stays in `pending_sync` and
is retried on the next `SyncWorker` run or the next explicit trigger.

## UI indication

`ui/components/SharedComponents.kt`'s `ConnectivityBanner` shows **OFFLINE — CHANGES SAVED
LOCALLY** when `ConnectivityObserver` reports no network, or **SYNCING N CHANGES…** when online
with a non-zero `pending_sync` row count (observed via `PendingSyncDao.observeCount()`).

## Known limitation: offline-created job IDs

A job created while offline gets a local placeholder ID (`local-<uuid>`) so it's usable
immediately (spec §17 requires the UI to keep working, not block on connectivity). When
`SyncWorker` successfully replays the `CREATE` and the server returns its real ID, only the
`FieldTechJob`/`Job` row itself is replaced (`SyncWorker.kt`) — **any readings, diagnostic
sessions, or report drafts already saved against the local placeholder ID before the sync
completed are not remapped to the new server ID.** In practice this only matters if a
technician does significant work on a brand-new job while fully offline for an extended period;
completing the same job online, or letting sync catch up before doing readings/diagnostics,
avoids it entirely. Fixing this properly means either deferring server ID assignment until
first sync (complex) or a dedicated ID-remapping pass across every child table when a job's ID
changes — flagged here rather than silently shipped as "solved."

## What's covered vs. not in this build

| Covered | Not covered |
|---|---|
| Job status/notes/photo-path updates | Equipment edits (equipment refresh is read-through only, no offline equipment mutation queue) |
| New job creation | Report `finalize` while offline (queued as a job-level sync entry only; the finalize call itself is not separately queued — see `ReportRepository.finalize`) |
| Reading capture | |
| Report draft saves | |

Extending the queue to additional entity types follows the same shape: add an `entityType`
branch in `SyncWorker.doWork()`, matching how `"job"` `UPDATE`/`CREATE` are already handled.
