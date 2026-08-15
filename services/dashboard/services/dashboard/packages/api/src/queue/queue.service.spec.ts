import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { QueueService, JobType } from './queue.service'

describe('QueueService', () => {
  let service: QueueService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => undefined),
          },
        },
      ],
    }).compile()

    service = module.get<QueueService>(QueueService)
    configService = module.get<ConfigService>(ConfigService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('enqueueJob', () => {
    it('should enqueue a job', async () => {
      const jobId = await service.enqueueJob(JobType.SEND_EMAIL, {
        to: 'test@example.com',
        subject: 'Test',
      })

      expect(jobId).toBeDefined()
      expect(typeof jobId).toBe('string')
      expect(jobId).toContain('job-')
    })

    it('should accept custom priority', async () => {
      const jobId = await service.enqueueJob(JobType.SEND_EMAIL, {}, { priority: 90 })
      const job = service.getJobStatus(jobId)
      expect(job?.priority).toBe(90)
    })

    it('should accept custom maxRetries', async () => {
      const jobId = await service.enqueueJob(JobType.SEND_EMAIL, {}, { maxRetries: 5 })
      const job = service.getJobStatus(jobId)
      expect(job?.maxRetries).toBe(5)
    })
  })

  describe('getJobStatus', () => {
    it('should return job status', async () => {
      const jobId = await service.enqueueJob(JobType.SEND_EMAIL, {})
      const job = service.getJobStatus(jobId)

      expect(job).toBeDefined()
      expect(job?.id).toBe(jobId)
      expect(job?.status).toBe('pending')
      expect(job?.type).toBe(JobType.SEND_EMAIL)
    })

    it('should return null for non-existent job', () => {
      const job = service.getJobStatus('non-existent-job')
      expect(job).toBeNull()
    })
  })

  describe('getStats', () => {
    it('should return queue statistics', async () => {
      await service.enqueueJob(JobType.SEND_EMAIL, {})
      await service.enqueueJob(JobType.PROCESS_INVOICE, {})
      await service.enqueueJob(JobType.CLEANUP_SESSIONS, {})

      const stats = service.getStats()
      expect(stats.total).toBe(3)
      expect(stats.pending).toBe(3)
      expect(stats.processing).toBe(0)
      expect(stats.completed).toBe(0)
      expect(stats.failed).toBe(0)
    })
  })

  describe('job types', () => {
    it('should support all job types', async () => {
      const jobTypes = Object.values(JobType)

      for (const jobType of jobTypes) {
        const jobId = await service.enqueueJob(jobType, {})
        const job = service.getJobStatus(jobId)
        expect(job?.type).toBe(jobType)
      }
    })
  })

  describe('priority-based processing', () => {
    it('should respect job priority', async () => {
      const lowPriorityId = await service.enqueueJob(
        JobType.SEND_EMAIL,
        {},
        { priority: 10 }
      )
      const highPriorityId = await service.enqueueJob(
        JobType.SEND_EMAIL,
        {},
        { priority: 90 }
      )

      const stats = service.getStats()
      expect(stats.total).toBe(2)
      expect(stats.pending).toBe(2)
    })
  })
})
