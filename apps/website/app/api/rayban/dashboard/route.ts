import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@wise2/db';

const prisma = new PrismaClient();

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
