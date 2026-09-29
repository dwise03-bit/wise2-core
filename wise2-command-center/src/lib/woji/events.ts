import type { WojiEvent, WojiProjectRecord } from "./state";
import { addEvent } from "./state";

export function recordWojiEvent(record: WojiProjectRecord, input: Omit<WojiEvent, "id" | "projectId">): WojiProjectRecord {
  const event: WojiEvent = {
    ...input,
    id: `${record.projectId}:event:${record.events.length + 1}`,
    projectId: record.projectId,
  };
  return addEvent(record, event);
}

export function projectTimeline(record: WojiProjectRecord): string[] {
  return record.events.map((event) => `${event.at} | ${event.actor} | ${event.woji} | ${event.action} | ${event.result}`);
}
