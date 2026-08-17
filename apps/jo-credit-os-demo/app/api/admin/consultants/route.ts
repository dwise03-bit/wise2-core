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

// GET /api/admin/consultants - List all consultants
export async function GET(request: NextRequest) {
  try {
    // In production, add authentication check here
    // const session = await getServerSession();
    // if (!session?.user?.role?.includes('admin')) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // In production, query from database
    // const consultants = await db.consultant.findMany({
    //   where: { deletedAt: null },
    //   orderBy: { createdAt: 'desc' },
    // });

    return NextResponse.json({
      consultants: consultantsDb,
      count: consultantsDb.length,
    });
  } catch (error) {
    console.error('Error fetching consultants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consultants' },
      { status: 500 }
    );
  }
}

// POST /api/admin/consultants - Create new consultant
export async function POST(request: NextRequest) {
  try {
    // In production, add authentication check here
    const body = await request.json();
    const {
      name,
      email,
      bio,
      expertise,
      hourlyRate,
    } = body;

    // Validation
    if (!name || !email || !expertise.length || !hourlyRate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In production, check if email already exists
    const emailExists = consultantsDb.some((c) => c.email === email);
    if (emailExists) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    const newConsultant = {
      id: Date.now().toString(),
      name,
      email,
      bio: bio || '',
      expertise,
      hourlyRate: parseFloat(hourlyRate),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // In production, save to database
    // const consultant = await db.consultant.create({
    //   data: newConsultant,
    // });

    consultantsDb.push(newConsultant);

    return NextResponse.json(newConsultant, { status: 201 });
  } catch (error) {
    console.error('Error creating consultant:', error);
    return NextResponse.json(
      { error: 'Failed to create consultant' },
      { status: 500 }
    );
  }
}
