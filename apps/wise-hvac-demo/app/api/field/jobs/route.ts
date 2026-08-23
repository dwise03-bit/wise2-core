import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/field/jobs
 * List jobs assigned to the authenticated technician
 * TODO: Add proper authentication when NextAuth is configured
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Verify authenticated user and filter jobs by technician
    // For now, return all sample jobs

    // TODO: Replace with real database query
    // For now, return sample data that matches the database structure
    const jobs = [
      {
        id: 'job-4471',
        technicianId: 'tech-001',
        customerName: 'Miller Residence',
        customerPhone: '(336) 555-0103',
        address: '214 Birchwood Dr, Springfield, IL 62701',
        appointmentAt: new Date(Date.now() + 3600000).toISOString(),
        complaint: 'AC unit not cooling properly',
        equipment: {
          id: 'eq-001',
          manufacturer: 'Carrier',
          model: '25HCB548A001',
          serial: 'ABC123456',
          tonnage: 5.0,
        },
        status: 'DISPATCHED',
        priority: 'NORMAL',
        notes: 'Customer prefers afternoon appointments',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'job-4472',
        technicianId: 'tech-001',
        customerName: 'Greensboro Family Dental',
        customerPhone: '(336) 555-0145',
        address: '88 Pinnacle Ct, Ste 200, Springfield, IL 62701',
        appointmentAt: new Date(Date.now() + 7200000).toISOString(),
        complaint: 'Preventive Maintenance',
        equipment: {
          id: 'eq-002',
          manufacturer: 'Trane',
          model: 'XB1200',
          serial: 'DEF789012',
          tonnage: 3.0,
        },
        status: 'IN_PROGRESS',
        priority: 'NORMAL',
        notes: 'Commercial unit, busy schedule - work after 6 PM preferred',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'job-4470',
        technicianId: 'tech-001',
        customerName: 'Thompson Residence',
        customerPhone: '(336) 555-0198',
        address: '502 Sedgefield Rd, Springfield, IL 62701',
        appointmentAt: new Date(Date.now() - 3600000).toISOString(),
        complaint: 'Heat pump repair',
        equipment: {
          id: 'eq-003',
          manufacturer: 'Lennox',
          model: 'XC25',
          serial: 'GHI345678',
          tonnage: 2.5,
        },
        status: 'COMPLETED',
        priority: 'HIGH',
        notes: 'Completed successfully. New compressor installed.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Field jobs API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
