import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ITEMS_DIR = path.join(process.cwd(), '../../data/goody-jar');

interface GoodyJarItem {
  id: string;
  title: string;
  category: 'artifact' | 'decision' | 'achievement' | 'treasure';
  content: string;
  createdAt: string;
  updatedAt: string;
  owner: string;
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Read all items from data layer
    const itemsPath = path.join(ITEMS_DIR, 'items.json');

    try {
      const data = await fs.readFile(itemsPath, 'utf-8');
      const items: GoodyJarItem[] = JSON.parse(data);
      return NextResponse.json(items);
    } catch {
      // File doesn't exist yet
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Failed to fetch items:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { title, category, content } = body;

    if (!title || !category || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create new item
    const newItem: GoodyJarItem = {
      id: `item-${Date.now()}`,
      title,
      category,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: 'WISE² Guardian', // In real app, get from session
    };

    // Read existing items
    const itemsPath = path.join(ITEMS_DIR, 'items.json');
    let items: GoodyJarItem[] = [];

    try {
      const data = await fs.readFile(itemsPath, 'utf-8');
      items = JSON.parse(data);
    } catch {
      // File doesn't exist, start fresh
    }

    // Add new item
    items.push(newItem);

    // Ensure directory exists
    await fs.mkdir(ITEMS_DIR, { recursive: true });

    // Write back
    await fs.writeFile(itemsPath, JSON.stringify(items, null, 2));

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Failed to create item:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
