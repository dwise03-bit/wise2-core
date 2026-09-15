import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@wise2/db';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');
    const contractorId = searchParams.get('contractorId');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || '20';

    const captures = await prisma.rayBanCapture.findMany({
      where: {
        ...(jobId && { jobId }),
        ...(contractorId && { contractorId }),
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    });

    return NextResponse.json(captures);
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
    const { deviceId, jobId, contractorId, frameUrl, latitude, longitude, notes } = body;

    const capture = await prisma.rayBanCapture.create({
      data: {
        deviceId,
        jobId,
        contractorId,
        frameUrl,
        latitude,
        longitude,
        notes,
        status: 'PENDING',
      },
    });

    return NextResponse.json(capture, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
