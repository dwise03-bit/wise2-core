import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@wise2/db';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contractorId = searchParams.get('contractorId');
    const severity = searchParams.get('severity');
    const limit = searchParams.get('limit') || '50';

    const alerts = await prisma.rayBanAlert.findMany({
      where: {
        ...(contractorId && { contractorId }),
        ...(severity && { severity }),
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    });

    return NextResponse.json(alerts);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceId, title, message, severity, type, jobId, contractorId, customerId } = body;

    const alert = await prisma.rayBanAlert.create({
      data: {
        deviceId,
        title,
        message,
        severity: severity || 'INFO',
        type,
        jobId,
        contractorId,
        customerId,
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
