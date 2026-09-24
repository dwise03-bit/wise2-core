import type { WojiProjectState } from "./index";
import type { WojiCheckpoint, WojiProjectRecord } from "./state";
import { addCheckpoint } from "./state";

export function createCheckpoint(record: WojiProjectRecord, reason: string, protectedCheckpoint = false, now = new Date().toISOString()): WojiProjectRecord {
  const checkpoint: WojiCheckpoint = {
    id: `${record.projectId}:${record.checkpoints.length + 1}`,
    projectId: record.projectId,
    at: now,
    reason,
    state: snapshot(record),
    protected: protectedCheckpoint,
  };
  return addCheckpoint(record, checkpoint);
}

export function restoreCheckpoint(record: WojiProjectRecord, checkpointId?: string): WojiProjectRecord {
  const checkpoint = checkpointId
    ? record.checkpoints.find((item) => item.id === checkpointId)
    : [...record.checkpoints].reverse().find((item) => item.protected) ?? record.checkpoints.at(-1);
  if (!checkpoint) throw new Error("checkpoint_not_found");
  return { ...record, ...structuredClone(checkpoint.state), updatedAt: new Date().toISOString() };
}

function snapshot(record: WojiProjectRecord): WojiProjectState {
  return {
    projectId: record.projectId,
    target: record.target,
    progress: record.progress,
    locks: [...record.locks],
    missing: [...record.missing],
    blockers: [...record.blockers],
    activeWork: [...record.activeWork],
    tests: record.tests.map((test) => ({ ...test })),
    handoffReady: record.handoffReady,
    nextAction: record.nextAction,
  };
}
