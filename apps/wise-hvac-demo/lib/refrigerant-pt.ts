/**
 * Compact P-T approximation tables for field-calculated saturation temperatures.
 * These are NOT manufacturer ratings. Out-of-range pressures stay unavailable.
 */

export type KnownRefrigerant = 'R-410A' | 'R-22' | 'R-32' | 'R-134a';

const TABLES: Record<KnownRefrigerant, Array<[number, number]>> = {
  'R-410A': [
    [80, 20], [100, 32], [118, 41], [130, 47], [150, 55], [180, 66], [200, 73],
    [230, 82], [250, 88], [280, 96], [300, 101], [325, 107], [350, 113],
    [400, 124], [450, 134], [500, 144],
  ],
  'R-22': [
    [40, 16], [58, 32], [70, 41], [85, 50], [100, 59], [120, 70], [150, 84],
    [180, 96], [200, 101], [226, 110], [250, 118], [278, 125],
  ],
  'R-32': [
    [80, 21], [100, 33], [120, 43], [150, 55], [180, 66], [210, 76], [250, 88],
    [300, 102], [350, 114], [400, 125], [450, 135],
  ],
  'R-134a': [
    [12, 10], [22, 24], [35, 40], [45, 49], [57, 60], [70, 70], [86, 80],
    [104, 90], [124, 100], [147, 110], [185, 124],
  ],
};

export function normalizeRefrigerant(value?: string | null): KnownRefrigerant | null {
  if (!value) return null;
  const compact = value.toUpperCase().replace(/[\s_\-]/g, '');
  if (compact === 'R410A' || compact === '410A') return 'R-410A';
  if (compact === 'R22' || compact === '22') return 'R-22';
  if (compact === 'R32' || compact === '32') return 'R-32';
  if (compact === 'R134A' || compact === '134A') return 'R-134a';
  return null;
}

export function saturationTempF(refrigerant: string | null | undefined, psig: number | null): number | null {
  const kind = normalizeRefrigerant(refrigerant);
  if (!kind || psig === null || !Number.isFinite(psig)) return null;
  const table = TABLES[kind];
  const first = table[0];
  const last = table[table.length - 1];
  if (!first || !last || psig < first[0] || psig > last[0]) return null;
  for (let i = 1; i < table.length; i += 1) {
    const [p1, t1] = table[i - 1];
    const [p2, t2] = table[i];
    if (psig <= p2) {
      const ratio = (psig - p1) / (p2 - p1);
      return Number((t1 + ratio * (t2 - t1)).toFixed(1));
    }
  }
  return null;
}

export function superheatF(
  refrigerant: string | null | undefined,
  suctionPsig: number | null,
  suctionLineTempF: number | null,
): number | null {
  const sat = saturationTempF(refrigerant, suctionPsig);
  if (sat === null || suctionLineTempF === null || !Number.isFinite(suctionLineTempF)) return null;
  return Number((suctionLineTempF - sat).toFixed(1));
}

export function subcoolingF(
  refrigerant: string | null | undefined,
  liquidPsig: number | null,
  liquidLineTempF: number | null,
): number | null {
  const sat = saturationTempF(refrigerant, liquidPsig);
  if (sat === null || liquidLineTempF === null || !Number.isFinite(liquidLineTempF)) return null;
  return Number((sat - liquidLineTempF).toFixed(1));
}
