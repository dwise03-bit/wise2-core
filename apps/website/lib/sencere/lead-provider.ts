// Adapter boundary between the SenCere quote form and wherever leads
// ultimately live (WISE² CRM). No WISE² lead-capture/CRM API currently
// exists in this repository (checked apps/website/app/api and
// packages/api/src for lead|crm|quote routes — none found), so this ships
// with a demo implementation. Swap DemoLeadProvider for a real
// implementation once a WISE² CRM endpoint exists — the form and API route
// only depend on this interface, not on how leads are stored.

export interface QuoteRequest {
  customer: {
    name: string;
    business: string;
    email: string;
    phone: string;
  };
  project: {
    service: string;
    product: string;
    quantity: string;
    description: string;
  };
  customization: string[];
  deadline: string;
  notes: string;
  artworkFileNames: string[];
}

export interface QuoteResponse {
  id: string;
  status: 'received';
  submittedAt: string;
}

export interface LeadProvider {
  submitQuote(data: QuoteRequest): Promise<QuoteResponse>;
}

class DemoLeadProvider implements LeadProvider {
  async submitQuote(data: QuoteRequest): Promise<QuoteResponse> {
    // Demo mode: log and echo back a synthetic confirmation rather than
    // persisting anywhere. Replace with a real WISE² CRM call when the
    // lead-capture endpoint is available.
    console.log('[sencere:demo-lead-provider] quote received', {
      customer: data.customer.email,
      service: data.project.service,
    });
    return {
      id: `demo-${Date.now()}`,
      status: 'received',
      submittedAt: new Date().toISOString(),
    };
  }
}

export const leadProvider: LeadProvider = new DemoLeadProvider();
