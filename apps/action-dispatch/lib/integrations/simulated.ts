import type {
  CRMProvider,
  DispatchProvider,
  EstimateProvider,
  IntegrationPorts,
  MessagingProvider,
  PhoneProvider,
  ProviderResult,
  SchedulerProvider,
  SimulatedResult,
} from './ports.ts';

function ok<T>(data: T): SimulatedResult<T> {
  return { ok: true, simulated: true, label: 'SIMULATED', data };
}

function fail(error: string): ProviderResult<never> {
  return { ok: false, simulated: true, label: 'SIMULATED', error };
}

const phone: PhoneProvider = {
  async placeCallback(input) {
    if (!input.to) return fail('Destination phone is unavailable.');
    return ok({ callId: `sim-call-${input.conversationId}`, status: 'queued' });
  },
  async getCallMetadata(callId) {
    return ok({ callId, durationSeconds: 0 });
  },
};

const messaging: MessagingProvider = {
  async prepareMessage(input) {
    if (!input.to) return fail('Destination phone is unavailable.');
    return ok({ draftId: `sim-sms-${input.conversationId}` });
  },
  async sendMessage(draftId) {
    return ok({ messageId: draftId.replace('draft', 'msg') });
  },
};

const crm: CRMProvider = {
  async getCustomer(customerId) {
    return ok({ customerId, recordUrl: `simulated://crm/customers/${customerId}` });
  },
  async updateJobContext(input) {
    return ok({ jobId: `sim-job-${input.conversationId}` });
  },
};

const scheduler: SchedulerProvider = {
  async queryAvailability() {
    return ok({ slots: ['2026-08-30T18:00:00.000Z', '2026-08-30T20:00:00.000Z'] });
  },
  async createBooking(input) {
    return ok({ bookingId: `sim-book-${input.conversationId}` });
  },
};

const dispatch: DispatchProvider = {
  async queryTechnicians() {
    return ok({
      technicians: [
        { id: 'tech-rivera', name: 'Maya Rivera' },
        { id: 'tech-owens', name: 'Chris Owens' },
      ],
    });
  },
  async createAssignment(input) {
    if (!input.technicianId) return fail('No technician selected.');
    return ok({ assignmentId: `sim-dispatch-${input.conversationId}` });
  },
};

const estimate: EstimateProvider = {
  async prepareEstimate(input) {
    return ok({ estimateId: `sim-est-${input.conversationId}` });
  },
  async createEstimate(estimateId) {
    return ok({ estimateId, status: 'draft_sent' });
  },
};

export const simulatedPorts: IntegrationPorts = {
  phone,
  messaging,
  crm,
  scheduler,
  dispatch,
  estimate,
};

export { ok as simulatedOk, fail as simulatedFail };
