import type { WojiProjectState } from "./index";

export type WojiLockLevel = 1 | 2 | 3;
export interface WojiLock { id:string; decision:string; reason:string; scope:string; level:WojiLockLevel; source:string; createdAt:string; }
export interface WojiEvent { id:string; projectId:string; at:string; actor:string; woji:string; action:string; result:string; checkpointId?:string; }
export interface WojiCheckpoint { id:string; projectId:string; at:string; reason:string; state:WojiProjectState; protected:boolean; }
export interface WojiProjectRecord extends WojiProjectState { name:string; contractVersion:string; locksDetailed:WojiLock[]; events:WojiEvent[]; checkpoints:WojiCheckpoint[]; updatedAt:string; }

export interface WojiRegistry {
  get(projectId:string): Promise<WojiProjectRecord | null>;
  save(record:WojiProjectRecord): Promise<void>;
  list(): Promise<WojiProjectRecord[]>;
}

export class MemoryWojiRegistry implements WojiRegistry {
  private records = new Map<string,WojiProjectRecord>();
  async get(id:string){ return this.records.get(id) ?? null; }
  async save(record:WojiProjectRecord){ this.records.set(record.projectId, structuredClone(record)); }
  async list(){ return [...this.records.values()].map(structuredClone); }
}

export function addEvent(record:WojiProjectRecord,event:WojiEvent):WojiProjectRecord {
  return {...record,events:[...record.events,event],updatedAt:event.at};
}
export function addCheckpoint(record:WojiProjectRecord,checkpoint:WojiCheckpoint):WojiProjectRecord {
  return {...record,checkpoints:[...record.checkpoints,checkpoint],updatedAt:checkpoint.at};
}
export function lockConflict(record:WojiProjectRecord,scope:string):WojiLock[] {
  return record.locksDetailed.filter(l => l.scope === scope && l.level >= 2);
}
