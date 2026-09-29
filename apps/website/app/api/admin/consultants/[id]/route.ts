import { NextRequest, NextResponse } from 'next/server';

// Mock database - replace with real database calls
let consultantsDb: any[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    bio: 'Product strategy and scaling expert with 10+ years in SaaS',
    expertise: ['Product', 'Strategy', 'Operations'],
    hourlyRate: 250,
    isActive: true,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    email: 'marcus@example.com',
    bio: 'Full-stack engineer specializing in scalable systems',
    expertise: ['Engineering', 'DevOps', 'AI/ML'],
    hourlyRate: 300,
    isActive: true,
    createdAt: '2024-06-05T00:00:00Z',
    updatedAt: '2024-06-05T00:00:00Z',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily@example.com',
    bio: 'Marketing strategist focused on GTM and growth',
    expertise: ['Marketing', 'Sales', 'Strategy'],
    hourlyRate: 200,
    isActive: true,
    createdAt: '2024-06-10T00:00:00Z',
    updatedAt: '2024-06-10T00:00:00Z',
  },
];

// PUT /api/admin/consultants/[id] - Update consultant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In production, add authentication check here
    const { id } = params;
    const body = await request.json();
    const {
      name,
      email,
      bio,
      expertise,
      hourlyRate,
      isActive,
    } = body;

    // Find consultant
    const consultantIndex = consultantsDb.findIndex((c) => c.id === id);
    if (consultantIndex === -1) {
      return NextResponse.json(
        { error: 'Consultant not found' },
        { status: 404 }
      );
    }

    // Validation
    if (!name || !email || !expertise.length || hourlyRate === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if new email already exists (and it's not the same consultant)
    const emailExists = consultantsDb.some(
      (c) => c.email === email && c.id !== id
    );
    if (emailExists) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // Update consultant
    const updatedConsultant = {
      ...consultantsDb[consultantIndex],
      name,
      email,
      bio: bio || '',
      expertise,
      hourlyRate: parseFloat(hourlyRate),
      isActive: isActive !== undefined ? isActive : consultantsDb[consultantIndex].isActive,
      updatedAt: new Date().toISOString(),
    };

    consultantsDb[consultantIndex] = updatedConsultant;

    // In production, update in database
    // const consultant = await db.consultant.update({
    //   where: { id },
    //   data: updatedConsultant,
    // });

    return NextResponse.json(updatedConsultant);
  } catch (error) {
    console.error('Error updating consultant:', error);
    return NextResponse.json(
      { error: 'Failed to update consultant' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/consultants/[id] - Deactivate consultant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In production, add authentication check here
    const { id } = params;

    // Find consultant
    const consultantIndex = consultantsDb.findIndex((c) => c.id === id);
    if (consultantIndex === -1) {
      return NextResponse.json(
        { error: 'Consultant not found' },
        { status: 404 }
      );
    }

    // Deactivate (soft delete)
    consultantsDb[consultantIndex] = {
      ...consultantsDb[consultantIndex],
      isActive: false,
      updatedAt: new Date().toISOString(),
    };

    // In production, soft delete from database
    // await db.consultant.update({
    //   where: { id },
    //   data: { isActive: false, updatedAt: new Date() },
    // });

    return NextResponse.json({
      success: true,
      message: 'Consultant deactivated',
    });
  } catch (error) {
    console.error('Error deactivating consultant:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate consultant' },
      { status: 500 }
    );
  }
}

// GET /api/admin/consultants/[id] - Get single consultant
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In production, add authentication check here
    const { id } = params;

    const consultant = consultantsDb.find((c) => c.id === id);
    if (!consultant) {
      return NextResponse.json(
        { error: 'Consultant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(consultant);
  } catch (error) {
    console.error('Error fetching consultant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consultant' },
      { status: 500 }
    );
  }
}
