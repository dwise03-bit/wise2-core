export type AuditInput = {
  businessName: string;
  contactName: string;
  email: string;
  website: string;
  industry: string;
  teamSize: string;
  revenueRange: string;
  primaryProblem: string;
  currentTools: string;
  priorityWorkflow: string;
};

export type AuditOpportunity = {
  title: string;
  category: string;
  capability: string;
  priority: 'NOW' | 'NEXT' | 'LATER';
  rationale: string;
};

export type AuditResult = {
  id: string;
  score: number | null;
  scoreStatus: 'UNSCORED';
  summary: string;
  opportunities: AuditOpportunity[];
  nextStep: string;
};

export function buildAuditResult(input: AuditInput, id = `audit-${Date.now()}`): AuditResult {
  const problem = input.primaryProblem.toLowerCase();
  const workflow = input.priorityWorkflow.toLowerCase();
  const tools = input.currentTools.toLowerCase();
  // Intake responses identify opportunities; they are not verified audit evidence.
  // Never infer a numerical business-health score from team size or revenue.
  const opportunities: AuditOpportunity[] = [];
  if (problem.includes('lead') || problem.includes('sales') || workflow.includes('follow')) {
    opportunities.push({
      title: 'Recover leads before they go cold',
      category: 'Sales & follow-up',
      capability: 'CRM and follow-up automation',
      priority: 'NOW',
      rationale: 'A structured response and follow-up path can turn missed conversations into trackable opportunities.',
    });
  }
  if (workflow.includes('schedule') || problem.includes('admin') || problem.includes('time')) {
    opportunities.push({
      title: 'Remove repetitive scheduling work',
      category: 'Operations',
      capability: 'Workflow automation and scheduling',
      priority: 'NOW',
      rationale: 'Automating handoffs, reminders, and status changes can give the team back operating time.',
    });
  }
  if (problem.includes('customer') || problem.includes('support') || workflow.includes('phone')) {
    opportunities.push({
      title: 'Make every customer request answerable',
      category: 'Customer service',
      capability: 'AI phone and service workflows',
      priority: 'NEXT',
      rationale: 'Consistent intake and response workflows reduce missed calls and make service quality easier to scale.',
    });
  }
  if (opportunities.length < 3) {
    opportunities.push({
      title: 'Create one operating view of the business',
      category: 'Business intelligence',
      capability: 'Operational dashboard and reporting',
      priority: 'NEXT',
      rationale: 'A shared view of pipeline, work, and revenue makes the next investment easier to prioritize.',
    });
  }

  return {
    id,
    score: null,
    scoreStatus: 'UNSCORED',
    summary: 'This is an intake-based opportunity snapshot, not a verified business audit. A numerical score requires documented evidence and a review.',
    opportunities: opportunities.slice(0, 3),
    nextStep: 'Book an evidence-based business audit',
  };
}