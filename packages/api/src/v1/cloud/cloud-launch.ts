import { ConfigService } from '@nestjs/config';
import { getCloudPlans } from './cloud.catalog';

export type LaunchGateStatus = 'pass' | 'fail' | 'manual';

export type LaunchGate = {
  id: string;
  label: string;
  status: LaunchGateStatus;
  detail: string;
};

export function evaluateLaunchGates(configService: ConfigService, providerOk: boolean): LaunchGate[] {
  const plans = getCloudPlans(configService);
  const testMode = ['fake', 'test'].includes(
    (configService.get<string>('CLOUD_STRIPE_MODE') || '').toLowerCase(),
  );
  const storefrontLive =
    (configService.get<string>('CLOUD_STOREFRONT_LIVE') || '').toLowerCase() === 'true';
  const cloudBaseUrl = configService.get<string>('CLOUD_BASE_URL') || 'https://cloud.wise2.net';
  const stripeKey = configService.get<string>('STRIPE_SECRET_KEY');
  const webhookSecret = configService.get<string>('STRIPE_WEBHOOK_SECRET');
  const sendgridKey = configService.get<string>('SENDGRID_API_KEY');

  const allPlansMapped = plans.every((plan) => Boolean(plan.twentyIPackageTypeId));
  const allStripePrices = testMode || plans.every((plan) => Boolean(plan.stripePriceId));
  const purchasable = testMode
    ? allPlansMapped
    : allPlansMapped && allStripePrices && Boolean(stripeKey);

  return [
    {
      id: 'branding',
      label: 'Branding',
      status: 'pass',
      detail: 'WISE² Cloud storefront and customer emails configured in code',
    },
    {
      id: 'domain',
      label: 'Domain',
      status: cloudBaseUrl.includes('cloud.wise2.net') ? 'manual' : 'fail',
      detail: `Sales URL target: ${cloudBaseUrl} — verify DNS A record to VPS`,
    },
    {
      id: 'ssl',
      label: 'SSL',
      status: 'manual',
      detail: 'Verify HTTPS certificate on cloud.wise2.net after DNS propagates',
    },
    {
      id: 'stripe',
      label: 'Stripe',
      status: purchasable ? 'pass' : 'fail',
      detail: purchasable
        ? testMode
          ? 'Test billing mode — Stripe checkout skipped'
          : 'Stripe secret and all plan price IDs configured'
        : 'Missing Stripe secret or plan price IDs',
    },
    {
      id: 'products',
      label: 'Products',
      status: allPlansMapped ? 'pass' : 'fail',
      detail: allPlansMapped
        ? 'Starter, Business, and Pro mapped to 20i package types'
        : 'One or more 20i package type IDs missing',
    },
    {
      id: 'provisioning',
      label: 'Provisioning',
      status: providerOk ? 'pass' : 'fail',
      detail: providerOk
        ? '20i reseller API reachable and package types listed'
        : '20i provider health check failed',
    },
    {
      id: 'portal',
      label: 'Customer Portal',
      status: stripeKey ? 'manual' : 'fail',
      detail: stripeKey
        ? 'Enable Stripe Customer Portal in Dashboard before launch'
        : 'Stripe not configured',
    },
    {
      id: 'emails',
      label: 'Emails',
      status: sendgridKey ? 'pass' : 'manual',
      detail: sendgridKey
        ? 'SendGrid configured for welcome emails'
        : 'Set SENDGRID_API_KEY for transactional email',
    },
    {
      id: 'policies',
      label: 'Policies',
      status: 'pass',
      detail: 'Terms, Privacy, AUP, and Refund pages linked from storefront',
    },
    {
      id: 'testPurchase',
      label: 'Test Purchase',
      status: 'manual',
      detail: 'Run one full test checkout before setting CLOUD_STOREFRONT_LIVE=true',
    },
    {
      id: 'security',
      label: 'Security',
      status: webhookSecret ? 'pass' : 'manual',
      detail: webhookSecret
        ? 'Stripe webhook secret configured'
        : 'Set STRIPE_WEBHOOK_SECRET after creating production webhook',
    },
    {
      id: 'storefront',
      label: 'Live Storefront',
      status: storefrontLive ? 'pass' : 'fail',
      detail: storefrontLive
        ? 'CLOUD_STOREFRONT_LIVE=true — checkout accepts real payments'
        : 'CLOUD_STOREFRONT_LIVE=false — checkout blocked until launch gates pass',
    },
  ];
}

export function isLaunchReady(gates: LaunchGate[]): boolean {
  const revenueCritical = [
    'stripe',
    'products',
    'provisioning',
    'policies',
    'security',
    'storefront',
  ];
  return revenueCritical.every((id) => {
    const gate = gates.find((candidate) => candidate.id === id);
    return gate?.status === 'pass';
  });
}
