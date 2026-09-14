import { stackCategories, quickWins, retireTools, monthlyCostTiers } from '../stack-data';

describe('WISE² AI stack command map', () => {
  test('exposes the nine canonical stack categories in display order', () => {
    expect(stackCategories.map((category) => category.title)).toEqual([
      'AI Models & Platforms',
      'Code & Agents',
      'MCP Servers & Tools',
      'Automation & Workflows',
      'Design & UI/UX',
      'Media & Content Gen',
      'Observability & Monitoring',
      'Infrastructure & DevOps',
      'Business Apps & Integrations',
    ]);
  });

  test('keeps local-first AI routing and n8n as the primary automation path', () => {
    const ai = stackCategories.find((category) => category.title === 'AI Models & Platforms');
    const automation = stackCategories.find((category) => category.title === 'Automation & Workflows');

    expect(ai?.status).toContain('Local');
    expect(ai?.items[0]).toMatch(/Ollama/i);
    expect(automation?.items[0]).toMatch(/n8n/i);
  });

  test('publishes current execution priorities and cost guardrails', () => {
    expect(quickWins).toHaveLength(8);
    expect(quickWins[0]).toMatch(/Audit live VPS vs GitHub/i);
    expect(retireTools).toContain('Duplicate automation platforms');
    expect(monthlyCostTiers.map((tier) => tier.range)).toEqual([
      '$25–$50',
      '$50–$150',
      '$150–$300+',
    ]);
  });
});
