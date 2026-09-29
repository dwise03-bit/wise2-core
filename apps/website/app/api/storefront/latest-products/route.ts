export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '3', 10);

    // Sample products - replace with actual database query or API call
    const sampleProducts = [
      {
        id: 'product-1',
        name: 'Premium Collection',
        price: 129.99,
        description: 'Handcrafted premium items',
        image_url: '/sencere-assets/blakkhail/sencere-creative-studio-hero.webp',
      },
      {
        id: 'product-2',
        name: 'Designer Series',
        price: 89.99,
        description: 'Limited edition designs',
        image_url: '/sencere-assets/blakkhail/sencere-distressed-red-01.webp',
      },
      {
        id: 'product-3',
        name: 'Artisan Craft',
        price: 159.99,
        description: 'Artisan-made creations',
        image_url: '/sencere-assets/blakkhail/sencere-piff-city-stone-01.webp',
      },
    ];

    // Return requested limit of products
    const products = sampleProducts.slice(0, limit);
    return Response.json(products);
  } catch (error) {
    console.error('Latest products error:', error);
    return Response.json(
      { error: 'Failed to fetch latest products' },
      { status: 500 }
    );
  }
}
