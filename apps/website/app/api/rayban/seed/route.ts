import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@wise2/db';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Clear existing data
    await prisma.rayBanAlert.deleteMany();
    await prisma.rayBanCapture.deleteMany();
    await prisma.rayBanSession.deleteMany();
    await prisma.rayBanDevice.deleteMany();

    // Create test devices
    const devices = await Promise.all([
      prisma.rayBanDevice.create({
        data: {
          serialNumber: 'RB-META-001',
          model: 'Ray-Ban Meta Gen 2',
          isConnected: true,
          lastSyncAt: new Date(),
        },
      }),
      prisma.rayBanDevice.create({
        data: {
          serialNumber: 'RB-META-002',
          model: 'Ray-Ban Meta Gen 2',
          isConnected: true,
          lastSyncAt: new Date(),
        },
      }),
      prisma.rayBanDevice.create({
        data: {
          serialNumber: 'RB-META-003',
          model: 'Ray-Ban Meta Gen 2',
          isConnected: false,
          lastSyncAt: new Date(Date.now() - 86400000),
        },
      }),
    ]);

    // Create test captures with different statuses
    const captures = await Promise.all([
      prisma.rayBanCapture.create({
        data: {
          deviceId: devices[0].id,
          jobId: 'job-hvac-001',
          contractorId: 'contractor-john-001',
          frameUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA',
          latitude: 40.7128,
          longitude: -74.006,
          status: 'PENDING',
          notes: 'HVAC unit compressor analysis - urgent',
        },
      }),
      prisma.rayBanCapture.create({
        data: {
          deviceId: devices[0].id,
          jobId: 'job-hvac-002',
          contractorId: 'contractor-jane-002',
          frameUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA',
          latitude: 40.7589,
          longitude: -73.9851,
          status: 'APPROVED',
          approvedBy: 'supervisor-001',
          approvedAt: new Date(Date.now() - 3600000),
          notes: 'Refrigerant lines inspection - approved',
        },
      }),
      prisma.rayBanCapture.create({
        data: {
          deviceId: devices[1].id,
          jobId: 'job-hvac-003',
          contractorId: 'contractor-mike-003',
          frameUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA',
          latitude: 40.7614,
          longitude: -73.9776,
          status: 'PENDING',
          notes: 'Thermostat installation - awaiting review',
        },
      }),
      prisma.rayBanCapture.create({
        data: {
          deviceId: devices[1].id,
          jobId: 'job-hvac-004',
          contractorId: 'contractor-john-001',
          frameUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA',
          latitude: 40.758,
          longitude: -73.9855,
          status: 'APPROVED',
          approvedBy: 'supervisor-001',
          approvedAt: new Date(Date.now() - 7200000),
          notes: 'Ductwork inspection - passed quality check',
        },
      }),
    ]);

    // Create test alerts
    await Promise.all([
      prisma.rayBanAlert.create({
        data: {
          deviceId: devices[0].id,
          title: '📸 Frame Captured',
          message: 'John captured frame for Job JOB-HVAC-001',
          severity: 'INFO',
          type: 'CAPTURE',
          jobId: 'job-hvac-001',
          contractorId: 'contractor-john-001',
        },
      }),
      prisma.rayBanAlert.create({
        data: {
          deviceId: devices[0].id,
          title: '✅ Frame Approved',
          message: 'Jane frame approved for Job JOB-HVAC-002',
          severity: 'INFO',
          type: 'APPROVAL',
          jobId: 'job-hvac-002',
          contractorId: 'contractor-jane-002',
          sentToDiscord: true,
        },
      }),
      prisma.rayBanAlert.create({
        data: {
          deviceId: devices[1].id,
          title: '⏳ Pending Review',
          message: '3 frames waiting for approval - 2 critical',
          severity: 'WARNING',
          type: 'WORKFLOW',
          sentToDiscord: true,
        },
      }),
      prisma.rayBanAlert.create({
        data: {
          deviceId: devices[2].id,
          title: '📡 Device Offline',
          message: 'RB-META-003 offline for 24 hours',
          severity: 'WARNING',
          type: 'DEVICE_STATUS',
        },
      }),
    ]);

    // Create test sessions
    const now = new Date();
    await Promise.all([
      prisma.rayBanSession.create({
        data: {
          deviceId: devices[0].id,
          jobId: 'job-hvac-001',
          contractorId: 'contractor-john-001',
          startTime: new Date(now.getTime() - 7200000), // 2 hours ago
          endTime: new Date(now.getTime() - 3600000), // 1 hour ago
          duration: 3600,
        },
      }),
      prisma.rayBanSession.create({
        data: {
          deviceId: devices[0].id,
          jobId: 'job-hvac-002',
          contractorId: 'contractor-john-001',
          startTime: new Date(now.getTime() - 1800000), // 30 min ago
          // Still active - no endTime
        },
      }),
      prisma.rayBanSession.create({
        data: {
          deviceId: devices[1].id,
          jobId: 'job-hvac-003',
          contractorId: 'contractor-jane-002',
          startTime: new Date(now.getTime() - 900000), // 15 min ago
          // Still active
        },
      }),
    ]);

    return NextResponse.json(
      { success: true, message: 'Test data seeded successfully' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
