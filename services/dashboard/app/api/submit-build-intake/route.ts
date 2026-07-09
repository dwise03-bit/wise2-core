import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { saveFormSubmission, sendConfirmationEmail } from '@/lib/services';

// ============================================================================
// VALIDATION SCHEMA — OPTIMIZED 2-STEP FORM
// ============================================================================
const BuildIntakeSchema = z.object({
  // STEP 1: Required fields (5)
  fullName: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Please enter a valid work email'),
  companyName: z.string().min(1, 'Please enter your company name'),
  projectType: z.string().min(1, 'Please select what you need'),
  projectDescription: z.string().min(10, 'Please describe your project briefly'),

  // STEP 2: Optional progressive profiling
  primaryGoal: z.string().optional(),
  preferredTimeline: z.string().optional(),
  budgetRange: z.string().optional(),
  preferredContactMethod: z.array(z.string()).optional(),

  // Conditional fields (optional)
  hasExistingWebsite: z.string().optional(),
  importantPlatforms: z.array(z.string()).optional(),
  processesToAutomate: z.array(z.string()).optional(),
  currentTools: z.string().optional(),
  brandAssetsAvailable: z.array(z.string()).optional(),

  // Optional fields
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  additionalInfo: z.string().optional(),
});

type BuildIntakeData = z.infer<typeof BuildIntakeSchema>;

// ============================================================================
// API ROUTE HANDLER
// ============================================================================
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    console.log('📨 Raw request body:', rawBody);

    let data: any;
    try {
      data = JSON.parse(rawBody);
    } catch (e) {
      console.error('❌ Failed to parse JSON:', e);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          details: String(e),
        },
        { status: 400 }
      );
    }

    console.log('📨 Parsed form data:', JSON.stringify(data, null, 2));

    // Validate data
    const validatedData = BuildIntakeSchema.parse(data);

    // Generate project ID
    const projectId = `WISE-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    console.log('✅ Form submission validated:', {
      projectId,
      email: validatedData.email,
      company: validatedData.companyName,
      projectType: validatedData.projectType,
    });

    // ========================================
    // 1. Save to Database (Supabase)
    // ========================================
    const dbResult = await saveFormSubmission({
      projectId,
      fullName: validatedData.fullName,
      email: validatedData.email,
      companyName: validatedData.companyName,
      projectType: validatedData.projectType,
      projectDescription: validatedData.projectDescription,
      primaryGoal: validatedData.primaryGoal,
      preferredTimeline: validatedData.preferredTimeline,
      budgetRange: validatedData.budgetRange,
      preferredContactMethod: validatedData.preferredContactMethod,
      phone: validatedData.phone,
      website: validatedData.website,
      additionalInfo: validatedData.additionalInfo,
    });

    // ========================================
    // 2. Send Confirmation Email (Resend)
    // ========================================
    const emailResult = await sendConfirmationEmail(
      validatedData.email,
      projectId,
      validatedData.fullName
    );

    // ========================================
    // 3. Track Analytics (PostHog)
    // ========================================
    // Analytics tracked client-side via posthog-js
    console.log('📊 Ready for client-side analytics tracking');

    return NextResponse.json({
      success: true,
      projectId,
      message: 'We\'ll review your project and send you a customized strategy within 24 hours.',
      metadata: {
        database: dbResult,
        email: emailResult,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Validation Error:', JSON.stringify(error.flatten(), null, 2));
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.flatten(),
        },
        { status: 400 }
      );
    }

    console.error('❌ Form submission error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during submission',
      },
      { status: 500 }
    );
  }
}
