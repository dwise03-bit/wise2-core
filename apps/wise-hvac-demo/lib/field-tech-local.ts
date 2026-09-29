/**
 * Local Field Tech helpers for service history, demo live readings, and customer messages.
 * Customer messaging stays on-device until a backend chat API exists.
 */

export type ServiceVisitRecord = {
  id: string;
  jobId: string;
  date: string;
  diagnosis: string;
  resolution: string;
  partsCost: number;
  laborHours: number;
  customerRating: number | null;
};

export type LiveReadingSnapshot = {
  pressureLow: number;
  pressureHigh: number;
  tempEvap: number;
  tempCond: number;
  voltage: number;
  current: number;
  superheat: number;
  subcooling: number;
  simulated: boolean;
  updatedAt: string;
};

export type CustomerChatMessage = {
  id: string;
  jobId: string;
  message: string;
  timestamp: string;
  isFromTech: boolean;
};

const HISTORY_KEY = 'wise2.fieldtech.serviceHistory';
const MESSAGES_KEY = 'wise2.fieldtech.customerMessages';

/** In-memory fallback for SSR / Node tests when localStorage is unavailable. */
const memoryStore = new Map<string, string>();

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw =
      typeof window !== 'undefined' && window.localStorage
        ? window.localStorage.getItem(key)
        : memoryStore.get(key) ?? null;
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  const serialized = JSON.stringify(value);
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(key, serialized);
  }
  memoryStore.set(key, serialized);
}

/** Test helper: wipe both memory and browser stores. */
export function resetFieldTechLocalStores() {
  memoryStore.clear();
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(HISTORY_KEY);
    window.localStorage.removeItem(MESSAGES_KEY);
  }
}

export function loadServiceHistory(): ServiceVisitRecord[] {
  return readJson<ServiceVisitRecord[]>(HISTORY_KEY, []);
}

export function addServiceVisit(
  visit: Omit<ServiceVisitRecord, 'id' | 'date'> & { date?: string; id?: string },
): ServiceVisitRecord {
  const record: ServiceVisitRecord = {
    id: visit.id || crypto.randomUUID(),
    date: visit.date || new Date().toISOString(),
    jobId: visit.jobId,
    diagnosis: visit.diagnosis,
    resolution: visit.resolution,
    partsCost: visit.partsCost,
    laborHours: visit.laborHours,
    customerRating: visit.customerRating,
  };
  const next = [record, ...loadServiceHistory()];
  writeJson(HISTORY_KEY, next);
  return record;
}

export function getServiceHistoryStats(history: ServiceVisitRecord[] = loadServiceHistory()) {
  const totalJobs = history.length;
  const ratings = history
    .map((row) => row.customerRating)
    .filter((value): value is number => typeof value === 'number');
  const avgRating = ratings.length
    ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length
    : 0;
  const totalRevenue = history.reduce(
    (sum, row) => sum + row.partsCost + row.laborHours * 85,
    0,
  );
  return { totalJobs, avgRating, totalRevenue };
}

export function loadCustomerMessages(jobId?: string): CustomerChatMessage[] {
  const all = readJson<CustomerChatMessage[]>(MESSAGES_KEY, []);
  return jobId ? all.filter((row) => row.jobId === jobId) : all;
}

export function sendCustomerMessage(
  jobId: string,
  message: string,
  isFromTech = true,
  id?: string,
): CustomerChatMessage {
  const entry: CustomerChatMessage = {
    id: id || crypto.randomUUID(),
    jobId,
    message,
    timestamp: new Date().toISOString(),
    isFromTech,
  };
  const next = [...loadCustomerMessages(), entry];
  writeJson(MESSAGES_KEY, next);
  return entry;
}

export function unreadCustomerCount(jobId?: string): number {
  return loadCustomerMessages(jobId).filter((row) => !row.isFromTech).length;
}

export function createBaselineReadings(now = new Date()): LiveReadingSnapshot {
  return {
    pressureLow: 68.4,
    pressureHigh: 248.7,
    tempEvap: 48.2,
    tempCond: 108.6,
    voltage: 120.4,
    current: 7.63,
    superheat: 11.2,
    subcooling: 8.6,
    simulated: true,
    updatedAt: now.toISOString(),
  };
}

export function tickSimulatedReadings(
  previous: LiveReadingSnapshot,
  random: () => number = Math.random,
  now = new Date(),
): LiveReadingSnapshot {
  const jitter = (value: number, span: number) =>
    Number((value + (random() - 0.5) * span).toFixed(1));
  return {
    pressureLow: jitter(previous.pressureLow, 2),
    pressureHigh: jitter(previous.pressureHigh, 6),
    tempEvap: jitter(previous.tempEvap, 1.5),
    tempCond: jitter(previous.tempCond, 2),
    voltage: jitter(previous.voltage, 1),
    current: jitter(previous.current, 0.3),
    superheat: jitter(previous.superheat, 0.8),
    subcooling: jitter(previous.subcooling, 0.6),
    simulated: true,
    updatedAt: now.toISOString(),
  };
}
