import { BadRequestException, NotFoundException } from '@nestjs/common';
import { HermesAction } from './hermes-action.entity';
import { HermesService } from './hermes.service';

function action(overrides: Partial<HermesAction> = {}): HermesAction {
  return {
    id: '850e8400-e29b-41d4-a716-446655440000',
    tenantUserId: 'tenant-a',
    mode: 'executive',
    kind: 'send-email',
    risk: 'high',
    status: 'pending_approval',
    title: 'Send follow-up',
    summary: null,
    evidence: [],
    payload: {},
    requiresApproval: true,
    approvedBy: null,
    approvedAt: null,
    rejectedBy: null,
    rejectedAt: null,
    decisionNote: null,
    executedAt: null,
    errorMessage: null,
    createdAt: new Date('2026-07-30T12:00:00Z'),
    updatedAt: new Date('2026-07-30T12:00:00Z'),
    ...overrides,
  };
}

describe('HermesService', () => {
  const repository = {
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => value),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
  };

  const prisma = {
    project: { findMany: jest.fn() },
    soundLabsProject: { findMany: jest.fn() },
    galleryAsset: { count: jest.fn() },
    customer: { findMany: jest.fn() },
    booking: { findMany: jest.fn() },
    consultingAuditSession: { findMany: jest.fn() },
  };

  let service: HermesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new HermesService(repository as any, prisma as any);
  });

  it('forces high-risk actions into the approval queue', async () => {
    const result = await service.createAction('tenant-a', {
      mode: 'sales',
      kind: 'send-email',
      risk: 'high',
      title: 'Send proposal',
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantUserId: 'tenant-a',
        status: 'pending_approval',
        requiresApproval: true,
      }),
    );
    expect(result.status).toBe('pending_approval');
  });

  it('queues low-risk work without pretending it executed', async () => {
    const result = await service.createAction('tenant-a', {
      mode: 'projects',
      kind: 'summarize',
      risk: 'low',
      title: 'Summarize project',
    });

    expect(result.status).toBe('queued');
    expect(result.requiresApproval).toBe(false);
  });

  it('never returns another tenant action', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(
      service.getAction(
        'tenant-b',
        '850e8400-e29b-41d4-a716-446655440000',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: {
        id: '850e8400-e29b-41d4-a716-446655440000',
        tenantUserId: 'tenant-b',
      },
    });
  });

  it('records an explicit human approval', async () => {
    repository.findOne.mockResolvedValue(action());

    const result = await service.approveAction(
      'tenant-a',
      '850e8400-e29b-41d4-a716-446655440000',
      { note: 'Reviewed evidence' },
    );

    expect(result.status).toBe('approved');
    expect(result.approvedBy).toBe('tenant-a');
    expect(result.approvedAt).toBeInstanceOf(Date);
    expect(result.decisionNote).toBe('Reviewed evidence');
  });

  it('prevents a second decision on an action', async () => {
    repository.findOne.mockResolvedValue(action({ status: 'approved' }));

    await expect(
      service.rejectAction(
        'tenant-a',
        '850e8400-e29b-41d4-a716-446655440000',
        {},
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('builds a scoped brief and discloses the unscoped prospect gap', async () => {
    prisma.project.findMany.mockResolvedValue([
      {
        id: 'p1',
        title: 'Launch',
        status: 'EXECUTE',
        updatedAt: new Date(),
      },
    ]);
    prisma.soundLabsProject.findMany.mockResolvedValue([]);
    prisma.galleryAsset.count.mockResolvedValue(3);
    prisma.customer.findMany.mockResolvedValue([
      {
        id: 'c1',
        businessName: 'Customer',
        status: 'ACTIVE',
        mrr: 250,
        updatedAt: new Date(),
      },
    ]);
    prisma.booking.findMany.mockResolvedValue([]);
    prisma.consultingAuditSession.findMany.mockResolvedValue([]);
    repository.count.mockResolvedValue(2);
    repository.find.mockResolvedValue([]);

    const brief = await service.getDailyBrief('tenant-a');

    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'tenant-a' } }),
    );
    expect(brief.headline.monthlyRecurringRevenue).toBe(250);
    expect(brief.headline.pendingApprovals).toBe(2);
    expect(brief.accessIssues).toContainEqual(
      expect.objectContaining({ source: 'prisma.Prospect' }),
    );
  });

  it('reports a partial brief instead of replacing source failure with zero', async () => {
    prisma.project.findMany.mockRejectedValue(new Error('database unavailable'));
    prisma.soundLabsProject.findMany.mockResolvedValue([]);
    prisma.galleryAsset.count.mockResolvedValue(0);
    prisma.customer.findMany.mockResolvedValue([]);
    prisma.booking.findMany.mockResolvedValue([]);
    prisma.consultingAuditSession.findMany.mockResolvedValue([]);
    repository.count.mockResolvedValue(0);
    repository.find.mockResolvedValue([]);

    const brief = await service.getDailyBrief('tenant-a');

    expect(brief.status).toBe('partial');
    expect(brief.headline.activeProjects).toBeNull();
    expect(brief.accessIssues).toContainEqual({
      source: 'projects',
      reason: 'database unavailable',
    });
  });
});
