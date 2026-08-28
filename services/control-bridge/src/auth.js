import { timingSafeEqual } from 'node:crypto';

export function authorize(header, expectedToken) {
  if (!header || !expectedToken || !header.startsWith('Bearer ')) return false;
  const supplied = Buffer.from(header.slice(7));
  const expected = Buffer.from(expectedToken);
  if (supplied.length !== expected.length) return false;
  return timingSafeEqual(supplied, expected);
}
