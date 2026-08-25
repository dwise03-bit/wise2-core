import { Test, TestingModule } from '@nestjs/testing';
import { ImageLockService } from './image-lock.service';
import type { ImageReferenceAsset } from './image.types';

describe('ImageLockService', () => {
  let service: ImageLockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageLockService],
    }).compile();

    service = module.get<ImageLockService>(ImageLockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('normalizeReferences', () => {
    it('defaults people, logos, hardware, screenshots and approved art to LOCKED', () => {
      const refs: ImageReferenceAsset[] = [
        { id: 'p1', url: 'https://x/p.png', kind: 'person' },
        { id: 'l1', url: 'https://x/l.png', kind: 'logo' },
        { id: 'h1', url: 'https://x/h.png', kind: 'hardware' },
        { id: 's1', url: 'https://x/s.png', kind: 'screenshot' },
        { id: 'a1', url: 'https://x/a.png', kind: 'approved-art' },
      ];

      const normalized = service.normalizeReferences(refs);
      expect(normalized.map((x) => x.role)).toEqual([
        'LOCKED',
        'LOCKED',
        'LOCKED',
        'LOCKED',
        'LOCKED',
      ]);
    });

    it('defaults unknown kind to EDITABLE', () => {
      const refs: ImageReferenceAsset[] = [
        { id: 'x1', url: 'https://x/x.png', kind: 'other' },
      ];

      const normalized = service.normalizeReferences(refs);
      expect(normalized[0].role).toBe('EDITABLE');
    });

    it('honors an explicit EDITABLE role', () => {
      const refs: ImageReferenceAsset[] = [
        {
          id: 'x',
          url: 'https://x/a.png',
          kind: 'other',
          role: 'EDITABLE',
        },
      ];

      const [ref] = service.normalizeReferences(refs);
      expect(ref.role).toBe('EDITABLE');
    });

    it('honors an explicit NEW role', () => {
      const refs: ImageReferenceAsset[] = [
        { id: 'x', url: 'https://x/a.png', role: 'NEW' },
      ];

      const [ref] = service.normalizeReferences(refs);
      expect(ref.role).toBe('NEW');
    });

    it('preserves other fields when normalizing', () => {
      const refs: ImageReferenceAsset[] = [
        {
          id: 'test-id',
          url: 'https://x/a.png',
          kind: 'person',
          label: 'Operator',
        },
      ];

      const [normalized] = service.normalizeReferences(refs);
      expect(normalized.id).toBe('test-id');
      expect(normalized.url).toBe('https://x/a.png');
      expect(normalized.label).toBe('Operator');
      expect(normalized.role).toBe('LOCKED');
    });

    it('handles empty array', () => {
      const normalized = service.normalizeReferences([]);
      expect(normalized).toEqual([]);
    });

    it('handles undefined references', () => {
      const normalized = service.normalizeReferences(undefined);
      expect(normalized).toEqual([]);
    });
  });
});
