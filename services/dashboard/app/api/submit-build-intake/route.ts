import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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
    const data = await req.json();

    // Validate data
    const validatedData = BuildIntakeSchema.parse(data);

    // Generate project ID
    const projectId = `WISE-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // TODO: Store in database (Supabase)
    // TODO: Send emails (Resend)
    // TODO: Track analytics (PostHog)

    console.log('✅ Form submission received:', {
      projectId,
      email: validatedData.email,
      company: validatedData.companyName,
      projectType: validatedData.projectType,
    });

    return NextResponse.json({
      success: true,
      projectId,
      message: 'We\'ll review your project and send you a customized strategy within 24 hours.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.flatten(),
        },
        { status: 400 }
      );
    }

    console.error('Form submission error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during submission',
      },
      { status: 500 }
    );
  }
}
