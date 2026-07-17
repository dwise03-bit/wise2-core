import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    console.log('Intake form submitted:', {
      timestamp: new Date().toISOString(),
      fullName: formData.fullName,
      companyName: formData.companyName,
      email: formData.email,
      phone: formData.phone,
      projectDescription: formData.projectDescription,
      services: formData.services,
      fileUrls: formData.fileUrls,
      agreement: formData.agreement,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you! Your intake form has been received.',
        submissionId: `intake-${Date.now()}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Intake submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Submission failed' },
      { status: 500 }
    );
  }
}
