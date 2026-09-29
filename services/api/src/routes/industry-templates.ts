/**
 * Industry Templates Routes
 * Phase 15: Industry-specific templates, pricing rules, and service catalogs
 */

import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../database';
import { logger } from '../logger';
import { authenticate } from '../middlewares/auth';
import { tenantGuard, requireRole, scopedWhere } from '../middlewares/tenant-guard';

const router = Router();

router.use(authenticate);
router.use(tenantGuard);

/**
 * Industry templates (loaded at tenant provisioning)
 * Each vertical has predefined: estimate packages, job types, service catalog
 */
const INDUSTRY_TEMPLATES: Record<string, any> = {
  HVAC: {
    displayName: 'HVAC & Heating',
    serviceTypes: [
      { id: 'ac-repair', name: 'AC Repair', description: 'Air conditioning repair and diagnostics' },
      { id: 'ac-install', name: 'AC Installation', description: 'New air conditioning system installation' },
      { id: 'heating-repair', name: 'Heating Repair', description: 'Furnace and heating system repair' },
      { id: 'heating-install', name: 'Heating Installation', description: 'New furnace/heating installation' },
      { id: 'maintenance', name: 'Preventive Maintenance', description: 'Annual maintenance and checkups' },
      { id: 'duct-cleaning', name: 'Duct Cleaning', description: 'HVAC duct system cleaning' },
    ],
    estimatePackages: [
      {
        level: 'GOOD',
        name: 'Basic Repair',
        description: 'Diagnostic and repair for existing system',
        basePrice: 150,
        services: ['Diagnostic', 'Repair', '1-year warranty'],
      },
      {
        level: 'BETTER',
        name: 'Full Service',
        description: 'Repair with cleaning and maintenance',
        basePrice: 350,
        services: ['Diagnostic', 'Repair', 'Cleaning', 'Filter change', '2-year warranty'],
      },
      {
        level: 'BEST',
        name: 'Premium Package',
        description: 'Complete system upgrade with extended coverage',
        basePrice: 800,
        services: ['System assessment', 'Repair/Upgrade', 'Full cleaning', 'Maintenance plan', '5-year warranty', 'Priority support'],
      },
    ],
    pricingRules: [
      { trigger: 'serviceType', value: 'ac-repair', multiplier: 1.0 },
      { trigger: 'serviceType', value: 'ac-install', multiplier: 2.5 },
      { trigger: 'season', value: 'summer', multiplier: 1.2 },
      { trigger: 'season', value: 'winter', multiplier: 1.3 },
      { trigger: 'emergency', value: 'true', multiplier: 1.5 },
    ],
  },

  PLUMBING: {
    displayName: 'Plumbing Services',
    serviceTypes: [
      { id: 'drain-cleaning', name: 'Drain Cleaning', description: 'Unclog drains and pipes' },
      { id: 'pipe-repair', name: 'Pipe Repair', description: 'Fix leaking or burst pipes' },
      { id: 'toilet-repair', name: 'Toilet Repair', description: 'Toilet installation and repair' },
      { id: 'water-heater', name: 'Water Heater Service', description: 'Water heater repair and replacement' },
      { id: 'inspection', name: 'System Inspection', description: 'Full plumbing system inspection' },
      { id: 'new-install', name: 'New Installation', description: 'New plumbing installation' },
    ],
    estimatePackages: [
      {
        level: 'GOOD',
        name: 'Basic Repair',
        description: 'Service call and single repair',
        basePrice: 120,
        services: ['Service call', 'Diagnosis', 'Basic repair'],
      },
      {
        level: 'BETTER',
        name: 'Full Service',
        description: 'Complete repair with preventive maintenance',
        basePrice: 300,
        services: ['Service call', 'Diagnosis', 'Repair', 'Cleaning', 'Maintenance'],
      },
      {
        level: 'BEST',
        name: 'Premium Protection',
        description: 'Full service with extended warranty and support',
        basePrice: 600,
        services: ['Service call', 'Diagnosis', 'Repair', 'Cleaning', 'Inspection', 'Annual maintenance', '3-year warranty'],
      },
    ],
    pricingRules: [
      { trigger: 'emergency', value: 'true', multiplier: 2.0 },
      { trigger: 'afterHours', value: 'true', multiplier: 1.5 },
      { trigger: 'serviceType', value: 'new-install', multiplier: 3.0 },
    ],
  },

  PRESSURE_WASHING: {
    displayName: 'Pressure Washing',
    serviceTypes: [
      { id: 'home-exterior', name: 'Home Exterior Cleaning', description: 'House and siding pressure washing' },
      { id: 'driveway', name: 'Driveway Cleaning', description: 'Driveway and concrete cleaning' },
      { id: 'roof', name: 'Roof Cleaning', description: 'Roof pressure washing and treatment' },
      { id: 'commercial', name: 'Commercial Cleaning', description: 'Building facade and commercial cleaning' },
      { id: 'gutter', name: 'Gutter Cleaning', description: 'Gutter and downspout cleaning' },
    ],
    estimatePackages: [
      {
        level: 'GOOD',
        name: 'Basic Wash',
        description: 'Single surface pressure washing',
        basePrice: 200,
        services: ['Pressure washing', '1 area'],
      },
      {
        level: 'BETTER',
        name: 'Full Property',
        description: 'Complete property exterior cleaning',
        basePrice: 500,
        services: ['Pressure washing', 'All exterior surfaces', 'Sealant application'],
      },
      {
        level: 'BEST',
        name: 'Premium Package',
        description: 'Complete cleaning with protective treatments',
        basePrice: 1000,
        services: ['Pressure washing', 'All surfaces', 'Protective sealant', 'Quarterly maintenance plan'],
      },
    ],
    pricingRules: [
      { trigger: 'squareFeet', value: '1000', multiplier: 0.8 },
      { trigger: 'squareFeet', value: '5000', multiplier: 0.6 },
      { trigger: 'season', value: 'spring', multiplier: 0.9 },
      { trigger: 'recurring', value: 'true', multiplier: 0.7 },
    ],
  },

  ELECTRICAL: {
    displayName: 'Electrical Services',
    serviceTypes: [
      { id: 'repair', name: 'Electrical Repair', description: 'Troubleshoot and repair electrical issues' },
      { id: 'installation', name: 'New Installation', description: 'Install new electrical systems' },
      { id: 'panel-upgrade', name: 'Panel Upgrade', description: 'Electrical panel upgrade/replacement' },
      { id: 'lighting', name: 'Lighting Installation', description: 'Install new lighting systems' },
      { id: 'safety-inspection', name: 'Safety Inspection', description: 'Electrical system safety inspection' },
    ],
    estimatePackages: [
      {
        level: 'GOOD',
        name: 'Basic Service',
        description: 'Repair and small upgrade',
        basePrice: 200,
        services: ['Service call', 'Diagnosis', 'Repair', 'Safety check'],
      },
      {
        level: 'BETTER',
        name: 'Standard Service',
        description: 'Comprehensive repair and upgrade',
        basePrice: 500,
        services: ['Service call', 'Diagnosis', 'Repair', 'Upgrade', 'Testing'],
      },
      {
        level: 'BEST',
        name: 'Premium Service',
        description: 'Full system upgrade with warranty',
        basePrice: 1500,
        services: ['System assessment', 'Panel upgrade', 'Wiring upgrade', 'Full testing', '5-year warranty', 'Priority support'],
      },
    ],
    pricingRules: [
      { trigger: 'licensing', value: 'master-electrician', multiplier: 1.2 },
      { trigger: 'emergency', value: 'true', multiplier: 2.0 },
      { trigger: 'commercial', value: 'true', multiplier: 1.8 },
    ],
  },

  CLEANING: {
    displayName: 'Cleaning Services',
    serviceTypes: [
      { id: 'residential', name: 'Residential Cleaning', description: 'House and apartment cleaning' },
      { id: 'commercial', name: 'Commercial Cleaning', description: 'Office and commercial space cleaning' },
      { id: 'post-construction', name: 'Post-Construction Cleanup', description: 'Post-construction site cleaning' },
      { id: 'deep-clean', name: 'Deep Cleaning', description: 'Thorough deep cleaning service' },
      { id: 'recurring', name: 'Recurring Service', description: 'Regular recurring cleaning' },
    ],
    estimatePackages: [
      {
        level: 'GOOD',
        name: 'Basic Cleaning',
        description: 'Standard cleaning service',
        basePrice: 100,
        services: ['Standard cleaning', '2-3 hours'],
      },
      {
        level: 'BETTER',
        name: 'Deep Cleaning',
        description: 'Thorough deep clean',
        basePrice: 250,
        services: ['Deep cleaning', 'All surfaces', '4-5 hours'],
      },
      {
        level: 'BEST',
        name: 'Premium Service',
        description: 'Complete service with monthly recurring',
        basePrice: 400,
        services: ['Deep cleaning', 'All surfaces', 'Monthly recurring', 'Flexible scheduling'],
      },
    ],
    pricingRules: [
      { trigger: 'recurring', value: 'true', multiplier: 0.75 },
      { trigger: 'squareFeet', value: '5000', multiplier: 0.7 },
      { trigger: 'commercial', value: 'true', multiplier: 1.3 },
    ],
  },
};

/**
 * GET /api/v1/crm/tenants/:tenantId/industry-templates
 * List available industry templates
 */
router.get('/tenants/:tenantId/industry-templates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = await db.tenant.findUnique({
      where: { id: req.tenant!.tenantId },
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Tenant not found' },
      });
    }

    const industry = tenant.vertical as keyof typeof INDUSTRY_TEMPLATES;
    const template = INDUSTRY_TEMPLATES[industry];

    if (!template) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `No template found for industry: ${industry}` },
      });
    }

    res.json({
      success: true,
      data: {
        industry,
        displayName: template.displayName,
        serviceTypes: template.serviceTypes,
        estimatePackages: template.estimatePackages,
        pricingRules: template.pricingRules,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/crm/tenants/:tenantId/pricing-rules
 * List active pricing rules for tenant
 */
router.get('/tenants/:tenantId/pricing-rules', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = await db.tenant.findUnique({
      where: { id: req.tenant!.tenantId },
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Tenant not found' },
      });
    }

    const industry = tenant.vertical as keyof typeof INDUSTRY_TEMPLATES;
    const template = INDUSTRY_TEMPLATES[industry];

    if (!template) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `No template found for industry: ${industry}` },
      });
    }

    res.json({
      success: true,
      data: {
        industry,
        pricingRules: template.pricingRules,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/crm/tenants/:tenantId/pricing-rules/calculate
 * Calculate price for estimate based on rules and service details
 */
router.post(
  '/tenants/:tenantId/pricing-rules/calculate',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { basePrice, serviceType, squareFeet, season, emergency, afterHours, recurring } = req.body;

      if (!basePrice) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'basePrice is required' },
        });
      }

      const tenant = await db.tenant.findUnique({
        where: { id: req.tenant!.tenantId },
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Tenant not found' },
        });
      }

      const industry = tenant.vertical as keyof typeof INDUSTRY_TEMPLATES;
      const template = INDUSTRY_TEMPLATES[industry];

      if (!template) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `No template found for industry: ${industry}` },
        });
      }

      // Apply pricing rules
      let multiplier = 1.0;
      const appliedRules: any[] = [];

      for (const rule of template.pricingRules) {
        let applies = false;

        if (rule.trigger === 'serviceType' && serviceType === rule.value) {
          applies = true;
        } else if (rule.trigger === 'season' && season === rule.value) {
          applies = true;
        } else if (rule.trigger === 'emergency' && emergency === (rule.value === 'true')) {
          applies = true;
        } else if (rule.trigger === 'afterHours' && afterHours === (rule.value === 'true')) {
          applies = true;
        } else if (rule.trigger === 'recurring' && recurring === (rule.value === 'true')) {
          applies = true;
        } else if (rule.trigger === 'squareFeet' && squareFeet) {
          const ruleValue = parseInt(rule.value);
          if (squareFeet >= ruleValue) {
            applies = true;
          }
        } else if (rule.trigger === 'commercial' && (rule.value === 'true') === true) {
          applies = true;
        }

        if (applies) {
          multiplier *= rule.multiplier;
          appliedRules.push(rule);
        }
      }

      const finalPrice = basePrice * multiplier;

      res.json({
        success: true,
        data: {
          basePrice,
          multiplier,
          finalPrice,
          appliedRules,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/crm/tenants/:tenantId/service-catalog
 * Get service catalog for tenant's industry
 */
router.get('/tenants/:tenantId/service-catalog', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = await db.tenant.findUnique({
      where: { id: req.tenant!.tenantId },
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Tenant not found' },
      });
    }

    const industry = tenant.vertical as keyof typeof INDUSTRY_TEMPLATES;
    const template = INDUSTRY_TEMPLATES[industry];

    if (!template) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `No template found for industry: ${industry}` },
      });
    }

    res.json({
      success: true,
      data: {
        industry,
        displayName: template.displayName,
        serviceTypes: template.serviceTypes,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
