export type SimulatedResult<T> = {
  ok: true;
  simulated: true;
  label: 'SIMULATED';
  data: T;
};

export type SimulatedFailure = {
  ok: false;
  simulated: true;
  label: 'SIMULATED';
  error: string;
};

export type ProviderResult<T> = SimulatedResult<T> | SimulatedFailure;

export type PhoneProvider = {
  placeCallback(input: {
    conversationId: string;
    to: string;
    purpose: string;
  }): Promise<ProviderResult<{ callId: string; status: string }>>;
  getCallMetadata(callId: string): Promise<ProviderResult<{ callId: string; durationSeconds: number }>>;
};

export type MessagingProvider = {
  prepareMessage(input: {
    conversationId: string;
    to: string;
    body: string;
  }): Promise<ProviderResult<{ draftId: string }>>;
  sendMessage(draftId: string): Promise<ProviderResult<{ messageId: string }>>;
};

export type CRMProvider = {
  getCustomer(customerId: string): Promise<ProviderResult<{ customerId: string; recordUrl: string }>>;
  updateJobContext(input: {
    customerId: string;
    conversationId: string;
    note: string;
  }): Promise<ProviderResult<{ jobId: string }>>;
};

export type SchedulerProvider = {
  queryAvailability(input: { date: string; trade: string }): Promise<
    ProviderResult<{ slots: string[] }>
  >;
  createBooking(input: {
    conversationId: string;
    slot: string;
    customerId: string;
  }): Promise<ProviderResult<{ bookingId: string }>>;
};

export type DispatchProvider = {
  queryTechnicians(): Promise<ProviderResult<{ technicians: Array<{ id: string; name: string }> }>>;
  createAssignment(input: {
    conversationId: string;
    technicianId: string;
  }): Promise<ProviderResult<{ assignmentId: string }>>;
};

export type EstimateProvider = {
  prepareEstimate(input: {
    conversationId: string;
    lowEstimate: number;
    highEstimate: number;
  }): Promise<ProviderResult<{ estimateId: string }>>;
  createEstimate(estimateId: string): Promise<ProviderResult<{ estimateId: string; status: string }>>;
};

export type IntegrationPorts = {
  phone: PhoneProvider;
  messaging: MessagingProvider;
  crm: CRMProvider;
  scheduler: SchedulerProvider;
  dispatch: DispatchProvider;
  estimate: EstimateProvider;
};
