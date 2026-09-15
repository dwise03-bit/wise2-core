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

export async function GET(req: NextRequest) {
  try {
    const totalCaptures = await prisma.rayBanCapture.count();
    const pendingApprovals = await prisma.rayBanCapture.count({
      where: { status: 'PENDING' },
    });
    const activeSessions = await prisma.rayBanSession.findMany({
      where: { endTime: null },
    });
    const devices = await prisma.rayBanDevice.findMany({
      where: { isConnected: true },
    });
    const recentAlerts = await prisma.rayBanAlert.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      stats: {
        totalCaptures,
        pendingApprovals,
        activeSessions: activeSessions.length,
        connectedDevices: devices.length,
      },
      recentAlerts,
      topContractors: [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
