import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Save to waitlist (can be extended to save to database)
    // For now, log to console and return success
    console.log(`[WAITLIST] Email captured: ${email} at ${new Date().toISOString()}`);

    // TODO: Save to database
    // await db.waitlist.create({ email });

    return NextResponse.json(
      {
        success: true,
        message: "Email added to waitlist",
        email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[WAITLIST ERROR]", error);
    return NextResponse.json(
      { error: "Failed to add email to waitlist" },
      { status: 500 }
    );
  }
}
