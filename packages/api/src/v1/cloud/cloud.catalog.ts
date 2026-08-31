import { ConfigService } from '@nestjs/config';
import { CloudPlan, CloudPlanId } from './cloud.types';

const PLAN_FEATURES: Record<CloudPlanId, string[]> = {
  starter: ['1 website', 'Free SSL', 'Email mailboxes', 'Weekly backups'],
  business: ['Up to 5 websites', 'Free SSL', 'Email mailboxes', 'Daily backups', 'Uptime monitoring'],
  pro: ['Unlimited websites', 'Free SSL', 'Email mailboxes', 'Daily backups', 'Priority support', 'Staging tools'],
};

export function getCloudPlans(configService: ConfigService): CloudPlan[] {
  const mapping: Array<{
    id: CloudPlanId;
    name: string;
    priceMonthly: number;
    envKey: string;
    labelEnvKey: string;
    stripeEnvKey: string;
    highlight?: boolean;
  }> = [
    {
      id: 'starter',
      name: 'Starter',
      priceMonthly: 19,
      envKey: 'TWENTYI_PACKAGE_TYPE_STARTER',
      labelEnvKey: 'TWENTYI_PACKAGE_LABEL_STARTER',
      stripeEnvKey: 'STRIPE_CLOUD_STARTER_PRICE_ID',
    },
    {
      id: 'business',
      name: 'Business',
      priceMonthly: 39,
      envKey: 'TWENTYI_PACKAGE_TYPE_BUSINESS',
      labelEnvKey: 'TWENTYI_PACKAGE_LABEL_BUSINESS',
      stripeEnvKey: 'STRIPE_CLOUD_BUSINESS_PRICE_ID',
      highlight: true,
    },
    {
      id: 'pro',
      name: 'Pro',
      priceMonthly: 59,
      envKey: 'TWENTYI_PACKAGE_TYPE_PRO',
      labelEnvKey: 'TWENTYI_PACKAGE_LABEL_PRO',
      stripeEnvKey: 'STRIPE_CLOUD_PRO_PRICE_ID',
    },
  ];

  return mapping.map((plan) => ({
    id: plan.id,
    name: plan.name,
    priceMonthly: plan.priceMonthly,
    twentyIPackageTypeId: configService.get<string>(plan.envKey) ?? '',
    twentyIPackageLabel: configService.get<string>(plan.labelEnvKey) ?? plan.name,
    stripePriceId: configService.get<string>(plan.stripeEnvKey) || undefined,
    features: PLAN_FEATURES[plan.id],
    highlight: plan.highlight,
  }));
}

export function getCloudPlan(configService: ConfigService, planId: string): CloudPlan | undefined {
  return getCloudPlans(configService).find((plan) => plan.id === planId);
}
