import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addServiceVisit,
  createBaselineReadings,
  getServiceHistoryStats,
  loadCustomerMessages,
  loadServiceHistory,
  resetFieldTechLocalStores,
  sendCustomerMessage,
  tickSimulatedReadings,
  unreadCustomerCount,
} from './field-tech-local.ts';

test('service history persists visits and computes analytics', () => {
  resetFieldTechLocalStores();
  addServiceVisit({
    id: 'visit-1',
    jobId: 'job-a',
    diagnosis: 'Low airflow',
    resolution: 'Cleaned filter',
    partsCost: 25,
    laborHours: 1,
    customerRating: 5,
  });
  addServiceVisit({
    id: 'visit-2',
    jobId: 'job-b',
    diagnosis: 'Capacitor weak',
    resolution: 'Replaced capacitor',
    partsCost: 40,
    laborHours: 1.5,
    customerRating: 4,
  });

  const history = loadServiceHistory();
  assert.equal(history.length, 2);
  assert.equal(history[0].id, 'visit-2');

  const stats = getServiceHistoryStats(history);
  assert.equal(stats.totalJobs, 2);
  assert.equal(stats.avgRating, 4.5);
  assert.equal(stats.totalRevenue, 25 + 85 + 40 + 1.5 * 85);
});

test('customer messages are job-scoped and count unread customer rows', () => {
  resetFieldTechLocalStores();
  sendCustomerMessage('job-a', 'On the way', true, 'm1');
  sendCustomerMessage('job-a', 'Gate code is 1234', false, 'm2');
  sendCustomerMessage('job-b', 'Different job', true, 'm3');

  const forJob = loadCustomerMessages('job-a');
  assert.equal(forJob.length, 2);
  assert.equal(unreadCustomerCount('job-a'), 1);
  assert.equal(unreadCustomerCount('job-b'), 0);
});

test('demo live readings stay labeled simulated and tick deterministically', () => {
  const baseline = createBaselineReadings(new Date('2026-08-29T12:00:00.000Z'));
  assert.equal(baseline.simulated, true);

  const next = tickSimulatedReadings(
    baseline,
    () => 1,
    new Date('2026-08-29T12:00:01.000Z'),
  );
  assert.equal(next.simulated, true);
  assert.equal(next.updatedAt, '2026-08-29T12:00:01.000Z');
  assert.equal(next.pressureLow, Number((68.4 + 0.5 * 2).toFixed(1)));
  assert.equal(next.pressureHigh, Number((248.7 + 0.5 * 6).toFixed(1)));
});
