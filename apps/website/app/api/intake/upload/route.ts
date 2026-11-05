import { NextRequest, NextResponse } from 'next/server';

/**
 * Intake upload safety gate.
 *
 * This endpoint previously returned success and a fabricated /uploads URL
 * without persisting the bytes. Never acknowledge an upload until a durable
 * object-store write and metadata record have both been verified.
 *
 * TODO: Connect the approved persistent storage provider and tenant-scoped
 * metadata transaction, then replace this explicit unavailable response.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'File uploads are temporarily unavailable because durable storage is not configured. Your file was not saved. Keep the original and retry later.',
      code: 'DURABLE_STORAGE_NOT_CONFIGURED',
      retryable: false,
    },
    {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
