import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { approvedBy, action } = body;

    if (action === 'approve') {
      const capture = await prisma.rayBanCapture.update({
        where: { id: params.id },
        data: {
          status: 'APPROVED',
          approvedBy,
          approvedAt: new Date(),
        },
      });
      return NextResponse.json(capture);
    }

    if (action === 'reject') {
      const capture = await prisma.rayBanCapture.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          approvedBy,
          approvedAt: new Date(),
        },
      });
      return NextResponse.json(capture);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
