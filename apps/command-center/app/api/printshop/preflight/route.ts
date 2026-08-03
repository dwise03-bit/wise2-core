import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BUILD_VOLUME = { x: 260, y: 260, z: 260 };

interface MeshPreflightResult {
  fileId: string;
  status: 'PASSED' | 'PASSED_WITH_WARNINGS' | 'FAILED' | 'MANUAL_REVIEW';
  dimensions: { x: number; y: number; z: number } | null;
  units: string;
  triangleCount: number | null;
  vertexCount: number | null;
  isWatertight: boolean | null;
  isManifold: boolean | null;
  shellCount: number | null;
  estimatedVolume: number | null;
  fitsVolume: boolean;
  errors: string[];
  warnings: string[];
}

interface ImagePreflightResult {
  fileId: string;
  status: 'PASSED' | 'PASSED_WITH_WARNINGS' | 'FAILED';
  pixelWidth: number | null;
  pixelHeight: number | null;
  dpi: number | null;
  effectiveDpi: number | null;
  colorMode: string | null;
  hasTransparency: boolean | null;
  embeddedProfile: string | null;
  errors: string[];
  warnings: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId, fileType, metadata } = body;

    if (!fileId || !fileType) {
      return NextResponse.json(
        { error: 'fileId and fileType are required' },
        { status: 400 },
      );
    }

    if (fileType === '3d') {
      const dimensions = metadata?.dimensions || null;
      const errors: string[] = [];
      const warnings: string[] = [];

      let fitsVolume = true;
      if (dimensions) {
        if (dimensions.x > BUILD_VOLUME.x || dimensions.y > BUILD_VOLUME.y || dimensions.z > BUILD_VOLUME.z) {
          fitsVolume = false;
          errors.push(`Model exceeds build volume (${BUILD_VOLUME.x}x${BUILD_VOLUME.y}x${BUILD_VOLUME.z}mm)`);
        }
        if (dimensions.x > 200 || dimensions.y > 200 || dimensions.z > 200) {
          warnings.push('Large print — may require longer print time and more material');
        }
      }

      if (metadata?.isWatertight === false) {
        warnings.push('Mesh is not watertight — may cause printing artifacts');
      }
      if (metadata?.isManifold === false) {
        errors.push('Mesh is not manifold — repair required before printing');
      }
      if (metadata?.shellCount && metadata.shellCount > 1) {
        warnings.push(`Multiple shells detected (${metadata.shellCount}) — verify this is intentional`);
      }

      let status: MeshPreflightResult['status'] = 'PASSED';
      if (errors.length > 0) status = 'FAILED';
      else if (warnings.length > 0) status = 'PASSED_WITH_WARNINGS';

      const result: MeshPreflightResult = {
        fileId,
        status,
        dimensions,
        units: 'mm',
        triangleCount: metadata?.triangleCount || null,
        vertexCount: metadata?.vertexCount || null,
        isWatertight: metadata?.isWatertight ?? null,
        isManifold: metadata?.isManifold ?? null,
        shellCount: metadata?.shellCount || null,
        estimatedVolume: metadata?.estimatedVolume || null,
        fitsVolume,
        errors,
        warnings,
      };

      return NextResponse.json({ preflight: result });
    }

    if (fileType === 'dtf') {
      const errors: string[] = [];
      const warnings: string[] = [];

      const dpi = metadata?.dpi || null;
      const requestedWidth = metadata?.requestedWidthInches || null;
      const requestedHeight = metadata?.requestedHeightInches || null;

      let effectiveDpi = dpi;
      if (dpi && requestedWidth && metadata?.pixelWidth) {
        effectiveDpi = Math.round(metadata.pixelWidth / requestedWidth);
      }

      if (effectiveDpi && effectiveDpi < 150) {
        errors.push(`Resolution too low (${effectiveDpi} DPI). Minimum 150 DPI required for acceptable quality.`);
      } else if (effectiveDpi && effectiveDpi < 300) {
        warnings.push(`Resolution below optimal (${effectiveDpi} DPI). 300 DPI recommended for best quality.`);
      }

      if (metadata?.hasTransparency === false) {
        warnings.push('No transparency detected — background may print as solid color');
      }

      if (metadata?.colorMode && metadata.colorMode !== 'RGBA' && metadata.colorMode !== 'RGB') {
        warnings.push(`Color mode is ${metadata.colorMode} — convert to RGB/RGBA for best results`);
      }

      let status: ImagePreflightResult['status'] = 'PASSED';
      if (errors.length > 0) status = 'FAILED';
      else if (warnings.length > 0) status = 'PASSED_WITH_WARNINGS';

      const result: ImagePreflightResult = {
        fileId,
        status,
        pixelWidth: metadata?.pixelWidth || null,
        pixelHeight: metadata?.pixelHeight || null,
        dpi,
        effectiveDpi,
        colorMode: metadata?.colorMode || null,
        hasTransparency: metadata?.hasTransparency ?? null,
        embeddedProfile: metadata?.embeddedProfile || null,
        errors,
        warnings,
      };

      return NextResponse.json({ preflight: result });
    }

    return NextResponse.json(
      { error: 'Invalid fileType. Use "3d" or "dtf"' },
      { status: 400 },
    );
  } catch (error) {
    console.error('PrintShop preflight error:', error);
    return NextResponse.json({ error: 'Failed to run preflight' }, { status: 500 });
  }
}
