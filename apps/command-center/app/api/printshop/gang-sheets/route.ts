import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface ArtworkItem {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
  copies: number;
  rotation: number;
  x: number;
  y: number;
}

interface GangSheetLayout {
  sheetWidth: number;
  sheetHeight: number;
  dpi: number;
  spacing: number;
  margin: number;
  items: ArtworkItem[];
}

function calculateUsedArea(layout: GangSheetLayout): number {
  const totalSheetArea = layout.sheetWidth * layout.sheetHeight;
  let usedArea = 0;
  for (const item of layout.items) {
    usedArea += item.width * item.height * item.copies;
  }
  return Math.min((usedArea / totalSheetArea) * 100, 100);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sheetWidth, sheetHeight, dpi, items, orderId } = body;

    if (!sheetWidth || !sheetHeight || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'sheetWidth, sheetHeight, and items array are required' },
        { status: 400 },
      );
    }

    const layout: GangSheetLayout = {
      sheetWidth,
      sheetHeight,
      dpi: dpi || 300,
      spacing: 0.25,
      margin: 0.125,
      items: items as ArtworkItem[],
    };

    const usedAreaPercent = calculateUsedArea(layout);

    const gangSheet = {
      id: `gs-${Date.now()}`,
      orderId: orderId || null,
      sheetWidth: layout.sheetWidth,
      sheetHeight: layout.sheetHeight,
      dpi: layout.dpi,
      layoutData: layout,
      artworkManifest: items.map((item: ArtworkItem, index: number) => ({
        index,
        id: item.id,
        width: item.width,
        height: item.height,
        copies: item.copies,
        rotation: item.rotation,
        position: { x: item.x, y: item.y },
      })),
      usedAreaPercent,
      artworkCount: items.length,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ gangSheet }, { status: 201 });
  } catch (error) {
    console.error('PrintShop gang sheet error:', error);
    return NextResponse.json({ error: 'Failed to create gang sheet' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    standardSizes: [
      { label: '12" x 16"', width: 12, height: 16 },
      { label: '22" x 16"', width: 22, height: 16 },
      { label: '22" x 32"', width: 22, height: 32 },
      { label: '22" x 48"', width: 22, height: 48 },
    ],
    defaults: {
      dpi: 300,
      spacing: 0.25,
      margin: 0.125,
    },
  });
}
