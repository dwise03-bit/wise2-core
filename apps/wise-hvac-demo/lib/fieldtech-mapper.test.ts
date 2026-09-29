import test from 'node:test';
import assert from 'node:assert/strict';
import { mapApiJobToField, mapApiStatusToWeb, mapWebStatusToApi } from './fieldtech-mapper.ts';

test('maps WISE² fieldtech statuses to web job statuses', () => {
  assert.equal(mapApiStatusToWeb('SCHEDULED'), 'DISPATCHED');
  assert.equal(mapApiStatusToWeb('ARRIVED'), 'ON_SITE');
  assert.equal(mapApiStatusToWeb('COMPLETE'), 'COMPLETED');
  assert.equal(mapWebStatusToApi('IN_PROGRESS'), 'DIAGNOSING');
});

test('maps API jobs without inventing equipment facts', () => {
  const job = mapApiJobToField({
    id: 'job-1',
    customerName: 'Acme Clinic',
    customerPhone: '3365550100',
    address: '100 Main St',
    appointmentAtEpochMillis: Date.parse('2026-08-29T12:00:00.000Z'),
    technicianId: 'tech-1',
    complaint: 'No cooling',
    status: 'DIAGNOSING',
    priority: 'HIGH',
    notes: '',
    updatedAtEpochMillis: Date.parse('2026-08-29T12:30:00.000Z'),
  });

  assert.equal(job.customerName, 'Acme Clinic');
  assert.equal(job.status, 'IN_PROGRESS');
  assert.equal(job.equipment.manufacturer, 'Unknown');
  assert.equal(job.serviceHistory.length, 0);
});
