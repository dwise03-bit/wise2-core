import { NextRequest, NextResponse } from 'next/server';

// Mock data - will be replaced with real database calls
const mockProducts = [
  {
    id: 1,
    name: 'Personalized Drink Labels',
    price: 24.99,
    category: 'Labels',
    occasion: 'Birthday',
    image: '🥤',
    description: 'Custom drink labels for any celebration',
  },
  {
    id: 2,
    name: 'Chip Bags & Candy Wrappers',
    price: 19.99,
    category: 'Wrappers',
    occasion: 'Birthday',
    image: '🍿',
    description: 'Personalized snack packaging',
  },
  {
    id: 3,
    name: 'Water Bottle Labels',
    price: 16.99,
    category: 'Labels',
    occasion: 'Events',
    image: '💧',
    description: 'Hydration labels for guests',
  },
  {
    id: 4,
    name: 'Custom Party Package',
    price: 89.99,
    category: 'Packages',
    occasion: 'Birthday',
    image: '🎁',
    description: 'Complete party package with multiple items',
  },
  {
    id: 5,
    name: 'Memorial Bookmarks',
    price: 12.99,
    category: 'Keepsakes',
    occasion: 'Memorials',
    image: '📖',
    description: 'Lasting memories',
  },
  {
    id: 6,
    name: 'Graduation Certificates',
    price: 34.99,
    category: 'Certificates',
    occasion: 'Graduations',
    image: '🎓',
    description: 'Personalized achievement certificates',
  },
  {
    id: 7,
    name: 'Holiday Gift Tags',
    price: 14.99,
    category: 'Tags',
    occasion: 'Holidays',
    image: '🎄',
    description: 'Custom holiday tags',
  },
  {
    id: 8,
    name: 'Shower Invitation Set',
    price: 44.99,
    category: 'Invitations',
    occasion: 'Baby Shower',
    image: '👶',
    description: 'Complete invitation suite',
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const occasion = searchParams.get('occasion');
  const search = searchParams.get('search');

  let results = mockProducts;

  // Filter by category
  if (category) {
    results = results.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  // Filter by occasion
  if (occasion) {
    results = results.filter((p) => p.occasion.toLowerCase() === occasion.toLowerCase());
  }

  // Filter by search term
  if (search) {
    results = results.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  return NextResponse.json({
    success: true,
    data: results,
    count: results.length,
  });
}
