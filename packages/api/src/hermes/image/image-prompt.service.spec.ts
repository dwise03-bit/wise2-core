import { Test, TestingModule } from '@nestjs/testing';
import { ImagePromptService } from './image-prompt.service';
import type { ImageReferenceAsset } from './image.types';

describe('ImagePromptService', () => {
  let service: ImagePromptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImagePromptService],
    }).compile();

    service = module.get<ImagePromptService>(ImagePromptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('build', () => {
    it('builds a prompt with four sections: TASK, LOCKED, EDITABLE, RULES', () => {
      const instruction = 'Add blue gauges to the dashboard';
      const refs: ImageReferenceAsset[] = [
        {
          id: 'master',
          url: 'https://x/master.png',
          role: 'LOCKED',
          kind: 'approved-art',
          label: 'HVAC visual',
        },
        {
          id: 'gauge',
          url: 'https://x/gauge.png',
          role: 'EDITABLE',
          kind: 'other',
          label: 'gauge template',
        },
      ];

      const result = service.build(instruction, refs);

      expect(result.prompt).toContain('TASK:');
      expect(result.prompt).toContain('LOCKED:');
      expect(result.prompt).toContain('EDITABLE:');
      expect(result.prompt).toContain('RULES:');

      // Verify sections are separated by newlines
      const sections = result.prompt.split('\n');
      expect(sections.length).toBe(4);
    });

    it('includes locked asset IDs in the result', () => {
      const refs: ImageReferenceAsset[] = [
        {
          id: 'lock1',
          url: 'https://x/l1.png',
          role: 'LOCKED',
        },
        {
          id: 'lock2',
          url: 'https://x/l2.png',
          role: 'LOCKED',
        },
        {
          id: 'edit1',
          url: 'https://x/e1.png',
          role: 'EDITABLE',
        },
      ];

      const result = service.build('test instruction', refs);
      expect(result.lockedAssetIds).toEqual(['lock1', 'lock2']);
    });

    it('includes labels in LOCKED section when available', () => {
      const refs: ImageReferenceAsset[] = [
        {
          id: 'person1',
          url: 'https://x/p.png',
          role: 'LOCKED',
          kind: 'person',
          label: 'Operator',
        },
      ];

      const result = service.build('test', refs);
      expect(result.prompt).toContain('Operator');
    });

    it('falls back to kind if label is missing', () => {
      const refs: ImageReferenceAsset[] = [
        {
          id: 'car1',
          url: 'https://x/c.png',
          role: 'LOCKED',
          kind: 'hardware',
        },
      ];

      const result = service.build('test', refs);
      expect(result.prompt).toContain('hardware');
    });

    it('handles empty references', () => {
      const result = service.build('test instruction', []);
      expect(result.prompt).toContain('TASK: test instruction');
      expect(result.prompt).toContain('LOCKED: none');
      expect(result.prompt).toContain('EDITABLE: scene/new elements only');
      expect(result.lockedAssetIds).toEqual([]);
    });

    it('includes preservation RULES in every prompt', () => {
      const result = service.build('test', []);
      expect(result.prompt).toContain('Preserve LOCKED assets exactly');
      expect(result.prompt).toContain('Do not redraw');
      expect(result.prompt).toContain('Do not reinterpret');
      expect(result.prompt).toContain(
        'If exact preservation is unsupported, return an error',
      );
    });
  });
});
