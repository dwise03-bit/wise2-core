import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function generateQuoteNumber(): string {
  const date = new Date();
  const prefix = 'QT';
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${dateStr}-${rand}`;
}

interface QuoteLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: string;
}

interface ThreeDQuoteInput {
  material: string;
  estimatedWeightGrams: number;
  estimatedPrintHours: number;
  quantity: number;
  rushOrder: boolean;
  designAssistance: boolean;
  supportRemoval: boolean;
}

interface DtfQuoteInput {
  widthInches: number;
  heightInches: number;
  quantity: number;
  artworkCleanup: boolean;
  backgroundRemoval: boolean;
  isGangSheet: boolean;
  gangSheetSizeInches?: { width: number; height: number };
}

/** Per-material rates. Keyed by lowercase material name. */
interface MaterialPricing {
  perGram: number;
  setupFee: number;
  minOrder: number;
}

const DEFAULT_MATERIAL = 'pla';

const THREE_D_MATERIALS: Record<string, MaterialPricing> = {
  pla: { perGram: 0.08, setupFee: 5.0, minOrder: 10.0 },
  petg: { perGram: 0.10, setupFee: 5.0, minOrder: 12.0 },
  abs: { perGram: 0.09, setupFee: 5.0, minOrder: 12.0 },
  tpu: { perGram: 0.15, setupFee: 8.0, minOrder: 15.0 },
};

const PRICING = {
  '3d': {
    // Materials are nested so the map stays a homogeneous Record<string, MaterialPricing>
    // and the scalar rates below don't have to be filtered out at lookup time.
    materials: THREE_D_MATERIALS,
    machineHourRate: 3.50,
    designFeePerHour: 45.0,
    supportRemovalFee: 5.0,
    rushMultiplier: 1.5,
    failureAllowance: 0.10,
  },
  dtf: {
    perSquareInch: 0.12,
    minTransferPrice: 3.0,
    artworkCleanupFee: 15.0,
    backgroundRemovalFee: 10.0,
    gangSheetPricing: {
      '12x16': 18.0,
      '22x16': 28.0,
      '22x32': 48.0,
      '22x48': 65.0,
    } as Record<string, number>,
    rushMultiplier: 1.5,
  },
  shipping: {
    standard: 8.99,
    express: 18.99,
    overnight: 34.99,
  },
  taxRate: 0.0,
};

function calculate3DQuote(input: ThreeDQuoteInput): { lineItems: QuoteLineItem[]; totals: Record<string, number> } {
  const materialKey = input.material.toLowerCase();
  const materialConfig: MaterialPricing =
    PRICING['3d'].materials[materialKey] ?? PRICING['3d'].materials[DEFAULT_MATERIAL];

  const lineItems: QuoteLineItem[] = [];

  const materialCost = Math.max(input.estimatedWeightGrams * materialConfig.perGram * input.quantity, materialConfig.minOrder);
  lineItems.push({ description: `${input.material.toUpperCase()} Material (${input.estimatedWeightGrams}g x ${input.quantity})`, quantity: input.quantity, unitPrice: input.estimatedWeightGrams * materialConfig.perGram, total: materialCost, category: 'material' });

  const machineCost = input.estimatedPrintHours * PRICING['3d'].machineHourRate * input.quantity;
  lineItems.push({ description: `Machine Time (${input.estimatedPrintHours}hr x ${input.quantity})`, quantity: input.quantity, unitPrice: input.estimatedPrintHours * PRICING['3d'].machineHourRate, total: machineCost, category: 'machine' });

  lineItems.push({ description: 'Setup Fee', quantity: 1, unitPrice: materialConfig.setupFee, total: materialConfig.setupFee, category: 'setup' });

  if (input.designAssistance) {
    const designFee = PRICING['3d'].designFeePerHour;
    lineItems.push({ description: 'Design Assistance (1hr minimum)', quantity: 1, unitPrice: designFee, total: designFee, category: 'design' });
  }

  if (input.supportRemoval) {
    const removalFee = PRICING['3d'].supportRemovalFee * input.quantity;
    lineItems.push({ description: 'Support Removal & Cleanup', quantity: input.quantity, unitPrice: PRICING['3d'].supportRemovalFee, total: removalFee, category: 'labor' });
  }

  let subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const failureAllowance = subtotal * PRICING['3d'].failureAllowance;
  lineItems.push({ description: 'Failure Allowance (10%)', quantity: 1, unitPrice: failureAllowance, total: failureAllowance, category: 'allowance' });
  subtotal += failureAllowance;

  let rushFee = 0;
  if (input.rushOrder) {
    rushFee = subtotal * (PRICING['3d'].rushMultiplier - 1);
    lineItems.push({ description: 'Rush Order (50% surcharge)', quantity: 1, unitPrice: rushFee, total: rushFee, category: 'rush' });
    subtotal += rushFee;
  }

  return {
    lineItems,
    totals: { materialCost, machineCost, setupFee: materialConfig.setupFee, rushFee, subtotal },
  };
}

function calculateDtfQuote(input: DtfQuoteInput): { lineItems: QuoteLineItem[]; totals: Record<string, number> } {
  const lineItems: QuoteLineItem[] = [];

  if (input.isGangSheet && input.gangSheetSizeInches) {
    const sizeKey = `${input.gangSheetSizeInches.width}x${input.gangSheetSizeInches.height}`;
    const sheetPrice = PRICING.dtf.gangSheetPricing[sizeKey] || (input.gangSheetSizeInches.width * input.gangSheetSizeInches.height * PRICING.dtf.perSquareInch);
    lineItems.push({ description: `Gang Sheet (${sizeKey}")`, quantity: input.quantity, unitPrice: sheetPrice, total: sheetPrice * input.quantity, category: 'transfer' });
  } else {
    const area = input.widthInches * input.heightInches;
    const transferPrice = Math.max(area * PRICING.dtf.perSquareInch, PRICING.dtf.minTransferPrice);
    lineItems.push({ description: `DTF Transfer (${input.widthInches}" x ${input.heightInches}")`, quantity: input.quantity, unitPrice: transferPrice, total: transferPrice * input.quantity, category: 'transfer' });
  }

  if (input.artworkCleanup) {
    lineItems.push({ description: 'Artwork Cleanup', quantity: 1, unitPrice: PRICING.dtf.artworkCleanupFee, total: PRICING.dtf.artworkCleanupFee, category: 'design' });
  }

  if (input.backgroundRemoval) {
    lineItems.push({ description: 'Background Removal', quantity: 1, unitPrice: PRICING.dtf.backgroundRemovalFee, total: PRICING.dtf.backgroundRemovalFee, category: 'design' });
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);

  return { lineItems, totals: { subtotal } };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quoteType, customerEmail, customerName, input, shippingMethod } = body;

    if (!quoteType || !customerEmail || !customerName) {
      return NextResponse.json(
        { error: 'quoteType, customerEmail, and customerName are required' },
        { status: 400 },
      );
    }

    let result;
    if (quoteType === '3d') {
      result = calculate3DQuote(input as ThreeDQuoteInput);
    } else if (quoteType === 'dtf') {
      result = calculateDtfQuote(input as DtfQuoteInput);
    } else {
      return NextResponse.json({ error: 'Invalid quoteType. Use "3d" or "dtf"' }, { status: 400 });
    }

    const shipping = shippingMethod ? (PRICING.shipping as Record<string, number>)[shippingMethod] || 0 : 0;
    const subtotal = result.totals.subtotal;
    const taxAmount = subtotal * PRICING.taxRate;
    const totalPrice = subtotal + shipping + taxAmount;

    const quote = {
      id: `quote-${Date.now()}`,
      quoteNumber: generateQuoteNumber(),
      status: 'DRAFT',
      customerEmail,
      customerName,
      lineItems: result.lineItems,
      subtotal,
      shippingCost: shipping,
      taxAmount,
      totalPrice,
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ quote }, { status: 201 });
  } catch (error) {
    console.error('PrintShop quote error:', error);
    return NextResponse.json({ error: 'Failed to generate quote' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    pricing: {
      '3d': {
        materials: Object.keys(PRICING['3d'].materials).map(m => m.toUpperCase()),
        note: 'Prices are WISE² starting baselines. Final pricing determined after preflight analysis.',
      },
      dtf: {
        gangSheetSizes: Object.keys(PRICING.dtf.gangSheetPricing),
        note: 'Gang sheet pricing varies by size. Custom sizes quoted on request.',
      },
      shipping: PRICING.shipping,
    },
  });
}
