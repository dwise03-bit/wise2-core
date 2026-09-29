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
  score: number;
  summary: string;
  opportunities: AuditOpportunity[];
  nextStep: string;
};

export function buildAuditResult(input: AuditInput, id = `audit-${Date.now()}`): AuditResult {
  const problem = input.primaryProblem.toLowerCase();
  const workflow = input.priorityWorkflow.toLowerCase();
  const tools = input.currentTools.toLowerCase();
  let score = 42;

  if (input.teamSize === '6-20') score += 10;
  if (input.teamSize === '21-50') score += 16;
  if (input.teamSize === '50+') score += 22;
  if (input.revenueRange === '$250k-$1m') score += 8;
  if (input.revenueRange === '$1m+') score += 14;
  if (!tools || tools.includes('spreadsheet') || tools.includes('manual')) score += 12;
  if (problem.includes('lead') || problem.includes('follow')) score += 8;
  if (problem.includes('customer') || problem.includes('support')) score += 6;
  if (workflow.includes('schedule') || workflow.includes('invoice')) score += 6;

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

  score = Math.min(96, score);
  const roundedScore = Math.max(38, Math.round(score));

  return {
    id,
    score: roundedScore,
    summary:
      roundedScore >= 70
        ? 'Your business has visible workflow gaps where focused automation could create near-term leverage.'
        : 'Your business has a workable foundation, with a few focused systems likely to create the fastest improvement.',
    opportunities: opportunities.slice(0, 3),
    nextStep: roundedScore >= 70 ? 'Book the $149 deep-dive audit' : 'Talk through your first automation win',
  };
}