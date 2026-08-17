export async function POST(request: Request) {
  try {
    const data = await request.json();

    const { projectType, name, email, idea, goal } = data;

    if (!projectType || !name || !email || !idea) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return Response.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    console.log('Intake form submission received:', {
      projectType,
      name,
      email,
      idea: idea.substring(0, 100) + '...',
      goal: goal ? goal.substring(0, 100) + '...' : null,
      timestamp: new Date().toISOString(),
    });

    // TODO: Implement actual storage/notification:
    // 1. Save to database (Prisma)
    // 2. Send confirmation email to user
    // 3. Send notification email to team
    // 4. Log to analytics

    return Response.json({
      success: true,
      message: 'Submission received. We will review and contact you shortly.',
      submissionId: `WISE2-${Date.now()}`,
    });
  } catch (error) {
    console.error('Intake form error:', error);
    return Response.json(
      { error: 'Failed to process submission. Please try again.' },
      { status: 500 }
    );
  }
}
