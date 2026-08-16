import { Router, Request, Response, Express } from 'express';
import { PrismaClient } from '@prisma/client';

const router: ReturnType<typeof Router> = Router();
const prisma = new PrismaClient();

// ===== CLIENTS =====

// Create consulting client
router.post('/clients', async (req: Request, res: Response) => {
  try {
    const { workspaceId, companyName, industry, employees, revenue, website, primaryContact, primaryContactEmail, primaryContactPhone } = req.body;

    const client = await prisma.consultingClient.create({
      data: {
        workspaceId,
        companyName,
        industry,
        employees,
        revenue,
        website,
        primaryContact,
        primaryContactEmail,
        primaryContactPhone,
        status: 'INTAKE',
        auditScore: 0,
      },
    });

    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get client
router.get('/clients/:clientId', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;

    const client = await prisma.consultingClient.findUnique({
      where: { id: clientId },
      include: {
        contacts: true,
        sessions: { include: { recordings: true } },
        consultingFindings: true,
        tasks: true,
        research: true,
        plan: { include: { phases: true } },
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// List clients
router.get('/workspaces/:workspaceId/clients', async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;

    const clients = await prisma.consultingClient.findMany({
      where: { workspaceId },
      include: {
        contacts: true,
        sessions: true,
        consultingFindings: true,
        tasks: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Update client
router.patch('/clients/:clientId', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const updates = req.body;

    const client = await prisma.consultingClient.update({
      where: { id: clientId },
      data: updates,
    });

    res.json(client);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Update audit score
router.patch('/clients/:clientId/audit-score', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const { score } = req.body;

    const client = await prisma.consultingClient.update({
      where: { id: clientId },
      data: { auditScore: Math.min(100, Math.max(0, score)) },
    });

    res.json(client);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ===== INTAKE =====

// Submit intake response
router.post('/clients/:clientId/intake', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const { responses } = req.body;

    const response = await prisma.consultingIntakeResponse.create({
      data: {
        clientId,
        responses,
        submittedAt: new Date(),
      },
    });

    // Update client status
    await prisma.consultingClient.update({
      where: { id: clientId },
      data: { status: 'PRE_MEETING_RESEARCH' },
    });

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get intake responses
router.get('/clients/:clientId/intake', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;

    const responses = await prisma.consultingIntakeResponse.findMany({
      where: { clientId },
      orderBy: { submittedAt: 'desc' },
    });

    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ===== SESSIONS / MEETINGS =====

// Create session
router.post('/clients/:clientId/sessions', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const { bookingId, clientName, auditTopic } = req.body;

    const session = await prisma.consultingAuditSession.create({
      data: {
        bookingId,
        clientId,
        clientName,
        auditTopic,
        status: 'SCHEDULED',
      },
      include: { recordings: true },
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get session
router.get('/sessions/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: {
        recordings: { orderBy: { recordedAt: 'desc' } },
        booking: true,
        client: true,
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Start session
router.post('/sessions/:sessionId/start', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.consultingAuditSession.update({
      where: { id: sessionId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// End session
router.post('/sessions/:sessionId/end', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.consultingAuditSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ===== RECORDINGS =====

// Create recording
router.post('/sessions/:sessionId/recordings', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { filename, type, duration, fileSize, s3Url, s3Key } = req.body;

    const recording = await prisma.consultingRecording.create({
      data: {
        sessionId,
        filename,
        type: type || 'AUDIO',
        duration,
        fileSize,
        s3Url,
        s3Key,
        uploadStatus: 'COMPLETED',
        transcriptionStatus: 'PENDING',
      },
    });

    res.status(201).json(recording);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get session recordings
router.get('/sessions/:sessionId/recordings', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const recordings = await prisma.consultingRecording.findMany({
      where: { sessionId },
      orderBy: { recordedAt: 'desc' },
    });

    res.json(recordings);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Update recording with transcription
router.patch('/recordings/:recordingId/transcript', async (req: Request, res: Response) => {
  try {
    const { recordingId } = req.params;
    const { transcript } = req.body;

    const recording = await prisma.consultingRecording.update({
      where: { id: recordingId },
      data: {
        transcript,
        transcriptionStatus: 'COMPLETED',
        transcribedAt: new Date(),
      },
    });

    res.json(recording);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ===== FINDINGS =====

// Create finding
router.post('/clients/:clientId/findings', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const { title, description, category, severity, source, confidence, estimatedValue } = req.body;

    const finding = await prisma.consultingFinding.create({
      data: {
        clientId,
        title,
        description,
        category,
        severity: severity || 'MEDIUM',
        source,
        confidence: confidence || 100,
        estimatedValue,
        status: 'PENDING_APPROVAL',
      },
    });

    res.status(201).json(finding);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get client findings
router.get('/clients/:clientId/findings', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;

    const findings = await prisma.consultingFinding.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(findings);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Approve finding
router.post('/findings/:findingId/approve', async (req: Request, res: Response) => {
  try {
    const { findingId } = req.params;
    const { approvedBy } = req.body;

    const finding = await prisma.consultingFinding.update({
      where: { id: findingId },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
    });

    res.json(finding);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ===== TASKS =====

// Create task
router.post('/clients/:clientId/tasks', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const { title, description, findingId, owner, priority, estimatedHours, estimatedCost, dueDate } = req.body;

    const task = await prisma.consultingTask.create({
      data: {
        clientId,
        title,
        description,
        findingId,
        owner,
        priority: priority || 'MEDIUM',
        status: 'TODO',
        estimatedHours,
        estimatedCost,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get client tasks
router.get('/clients/:clientId/tasks', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;

    const tasks = await prisma.consultingTask.findMany({
      where: { clientId },
      orderBy: { dueDate: 'asc' },
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Update task status
router.patch('/tasks/:taskId/status', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await prisma.consultingTask.update({
      where: { id: taskId },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ===== RESEARCH =====

// Create research item
router.post('/clients/:clientId/research', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const { title, content, category, source, relevance, confidence, suggestedAction } = req.body;

    const research = await prisma.consultingResearchItem.create({
      data: {
        clientId,
        title,
        content,
        category,
        source,
        relevance: relevance || 100,
        confidence: confidence || 100,
        suggestedAction,
        accessedAt: new Date(),
      },
    });

    res.status(201).json(research);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get client research
router.get('/clients/:clientId/research', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;

    const research = await prisma.consultingResearchItem.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(research);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ===== IMPLEMENTATION PLAN =====

// Create plan
router.post('/clients/:clientId/plan', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const { title, description, startDate, targetDate, totalEstimatedCost, estimatedROI, paybackPeriod } = req.body;

    const plan = await prisma.consultingImplementationPlan.create({
      data: {
        clientId,
        title,
        description,
        startDate: new Date(startDate),
        targetDate: targetDate ? new Date(targetDate) : undefined,
        totalEstimatedCost,
        estimatedROI,
        paybackPeriod,
        status: 'DRAFT',
      },
    });

    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get client plan
router.get('/clients/:clientId/plan', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;

    const plan = await prisma.consultingImplementationPlan.findUnique({
      where: { clientId },
      include: { phases: { orderBy: { order: 'asc' } } },
    });

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Approve plan
router.post('/plans/:planId/approve', async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;
    const { approvedBy } = req.body;

    const plan = await prisma.consultingImplementationPlan.update({
      where: { id: planId },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
    });

    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ===== SESSION SUMMARY =====

// Update session summary
router.patch('/sessions/:sessionId/summary', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { summary, status } = req.body;

    const session = await prisma.consultingAuditSession.update({
      where: { id: sessionId },
      data: {
        summary,
        summaryStatus: status || 'GENERATING',
      },
    });

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Approve summary
router.post('/sessions/:sessionId/approve-summary', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { approvedBy } = req.body;

    const session = await prisma.consultingAuditSession.update({
      where: { id: sessionId },
      data: {
        summaryStatus: 'APPROVED',
        summaryApprovedBy: approvedBy,
        summaryApprovedAt: new Date(),
      },
    });

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ===== TIMELINE =====

// Get audit timeline
router.get('/clients/:clientId/timeline', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;

    const client = await prisma.consultingClient.findUnique({
      where: { id: clientId },
      include: {
        intakeResponses: true,
        sessions: { include: { recordings: true } },
        consultingFindings: true,
        tasks: true,
        research: true,
        plan: { include: { phases: true } },
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Compile timeline
    const timeline: any[] = [];

    client.intakeResponses.forEach((intake) => {
      timeline.push({
        type: 'INTAKE_SUBMITTED',
        timestamp: intake.submittedAt || intake.createdAt,
        data: intake,
      });
    });

    client.research.forEach((item) => {
      timeline.push({
        type: 'RESEARCH_ADDED',
        timestamp: item.createdAt,
        data: item,
      });
    });

    client.sessions.forEach((session) => {
      if (session.startedAt) {
        timeline.push({
          type: 'MEETING_STARTED',
          timestamp: session.startedAt,
          data: session,
        });
      }

      if (session.completedAt) {
        timeline.push({
          type: 'MEETING_COMPLETED',
          timestamp: session.completedAt,
          data: session,
        });
      }

      session.recordings.forEach((recording) => {
        timeline.push({
          type: `RECORDING_${recording.type}`,
          timestamp: recording.recordedAt || recording.createdAt,
          data: recording,
        });
      });

      if (session.summaryApprovedAt) {
        timeline.push({
          type: 'SUMMARY_APPROVED',
          timestamp: session.summaryApprovedAt,
          data: { sessionId: session.id },
        });
      }
    });

    client.consultingFindings.forEach((finding) => {
      if (finding.approvedAt) {
        timeline.push({
          type: 'FINDING_APPROVED',
          timestamp: finding.approvedAt,
          data: finding,
        });
      }
    });

    client.tasks.forEach((task) => {
      if (task.completedAt) {
        timeline.push({
          type: 'TASK_COMPLETED',
          timestamp: task.completedAt,
          data: task,
        });
      }
    });

    if (client.plan?.approvedAt) {
      timeline.push({
        type: 'PLAN_APPROVED',
        timestamp: client.plan.approvedAt,
        data: client.plan,
      });
    }

    const sortedTimeline = timeline.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    res.json(sortedTimeline);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router;
