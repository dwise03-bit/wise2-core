import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BuildIntakeSchema = z.object({
  fullName: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid work email"),
  companyName: z.string().min(1, "Please enter your company name"),
  projectType: z.string().min(1, "Please select what you need"),
  projectDescription: z
    .string()
    .min(10, "Please describe your project briefly"),
  primaryGoal: z.string().optional(),
  preferredTimeline: z.string().optional(),
  budgetRange: z.string().optional(),
  preferredContactMethod: z.array(z.string()).optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  additionalInfo: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("📨 Form data received:", data);

    const validatedData = BuildIntakeSchema.parse(data);

    const projectId = `WISE-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    console.log("✅ Form submission validated:", {
      projectId,
      email: validatedData.email,
      company: validatedData.companyName,
    });

    return NextResponse.json({
      success: true,
      projectId,
      message:
        "We'll review your project and send you a customized strategy within 24 hours.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Validation Error:", error.flatten());
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.flatten(),
        },
        { status: 400 },
      );
    }

    console.error("❌ Form submission error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred during submission",
      },
      { status: 500 },
    );
  }
}
