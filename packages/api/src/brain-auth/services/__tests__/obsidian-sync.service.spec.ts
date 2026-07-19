import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { ObsidianSyncService } from '../obsidian-sync.service';
import { KnowledgeEntry } from '../../schemas/knowledge-entry.schema';
import { ObsidianVault } from '../../schemas/obsidian-vault.schema';
import { Types } from 'mongoose';

describe('ObsidianSyncService - Performance & N+1 Query Fixes', () => {
  let service: ObsidianSyncService;
  let mockEntryModel: any;
  let mockVaultModel: any;

  const mockWorkspaceId = new Types.ObjectId().toString();
  const mockVaultId = new Types.ObjectId().toString();
  const mockUserId = new Types.ObjectId().toString();

  beforeEach(async () => {
    mockEntryModel = {
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      updateMany: jest.fn(),
    };

    mockVaultModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObsidianSyncService,
        {
          provide: getModelToken(KnowledgeEntry.name),
          useValue: mockEntryModel,
        },
        {
          provide: getModelToken(ObsidianVault.name),
          useValue: mockVaultModel,
        },
      ],
    }).compile();

    service = module.get<ObsidianSyncService>(ObsidianSyncService);
  });

  describe('Workspace Validation - SECURITY FIX', () => {
    describe('getVault', () => {
      it('should require workspace validation', async () => {
        const mockVault = {
          _id: new Types.ObjectId(mockVaultId),
          workspaceId: new Types.ObjectId(mockWorkspaceId),
          name: 'My Vault',
        };

        mockVaultModel.findOne.mockResolvedValue(mockVault);

        const result = await service.getVault(mockVaultId, mockWorkspaceId);

        expect(mockVaultModel.findOne).toHaveBeenCalledWith({
          _id: new Types.ObjectId(mockVaultId),
          workspaceId: new Types.ObjectId(mockWorkspaceId),
        });
        expect(result).toEqual(mockVault);
      });

      it('should return null for mismatched workspace', async () => {
        const differentWorkspaceId = new Types.ObjectId().toString();

        mockVaultModel.findOne.mockResolvedValue(null);

        const result = await service.getVault(mockVaultId, differentWorkspaceId);

        expect(result).toBeNull();
        expect(mockVaultModel.findOne).toHaveBeenCalledWith({
          _id: new Types.ObjectId(mockVaultId),
          workspaceId: new Types.ObjectId(differentWorkspaceId),
        });
      });
    });
  });

  describe('N+1 Query Fix - Bulk Operations', () => {
    describe('updateLinks', () => {
      it('should use bulk updateMany instead of loop saves (PERFORMANCE FIX)', async () => {
        const entry = {
          _id: new Types.ObjectId(),
          workspaceId: new Types.ObjectId(mockWorkspaceId),
          content: 'This references [[entry-1]] and [[entry-2]]',
          backlinks: [],
          slug: 'my-entry',
          save: jest.fn().mockResolvedValue({}),
          previousVersions: [],
        };

        mockEntryModel.findById.mockResolvedValue(entry);
        mockEntryModel.updateMany.mockResolvedValue({ modifiedCount: 2 });

        await service.updateLinks(entry._id.toString(), mockWorkspaceId);

        // Verify backlinks were extracted
        expect(entry.backlinks).toContain('entry-1');
        expect(entry.backlinks).toContain('entry-2');

        // CRITICAL: Verify bulk operation was used, not loop
        expect(mockEntryModel.updateMany).toHaveBeenCalledWith(
          {
            workspaceId: new Types.ObjectId(mockWorkspaceId),
            slug: { $in: expect.arrayContaining(['entry-1', 'entry-2']) },
          },
          {
            $addToSet: { forwardlinks: 'my-entry' },
          },
        );

        // Verify no loop-based individual saves
        expect(mockEntryModel.find).not.toHaveBeenCalled();
      });

      it('should handle empty backlinks', async () => {
        const entry = {
          _id: new Types.ObjectId(),
          workspaceId: new Types.ObjectId(mockWorkspaceId),
          content: 'No references here',
          backlinks: [],
          slug: 'no-links',
          save: jest.fn().mockResolvedValue({}),
          previousVersions: [],
        };

        mockEntryModel.findById.mockResolvedValue(entry);

        await service.updateLinks(entry._id.toString(), mockWorkspaceId);

        // Should not call updateMany with empty array
        expect(mockEntryModel.updateMany).not.toHaveBeenCalled();
      });

      it('should extract wikilinks correctly [[slug|display text]]', async () => {
        const entry = {
          _id: new Types.ObjectId(),
          workspaceId: new Types.ObjectId(mockWorkspaceId),
          content: 'See [[my-note|click here]] and [[other-note]]',
          backlinks: [],
          slug: 'current',
          save: jest.fn().mockResolvedValue({}),
          previousVersions: [],
        };

        mockEntryModel.findById.mockResolvedValue(entry);
        mockEntryModel.updateMany.mockResolvedValue({});

        await service.updateLinks(entry._id.toString(), mockWorkspaceId);

        expect(entry.backlinks).toContain('my-note');
        expect(entry.backlinks).toContain('other-note');

        // Verify $addToSet is used (prevents duplicates)
        const call = mockEntryModel.updateMany.mock.calls[0];
        expect(call[1].$addToSet).toBeDefined();
      });

      it('should use $addToSet to prevent duplicate forward links', async () => {
        const entry = {
          _id: new Types.ObjectId(),
          workspaceId: new Types.ObjectId(mockWorkspaceId),
          content: '[[target]] [[target]]', // Duplicate
          backlinks: [],
          slug: 'current',
          save: jest.fn().mockResolvedValue({}),
          previousVersions: [],
        };

        mockEntryModel.findById.mockResolvedValue(entry);
        mockEntryModel.updateMany.mockResolvedValue({});

        await service.updateLinks(entry._id.toString(), mockWorkspaceId);

        // Backlinks should not have duplicates
        expect(entry.backlinks.length).toBe(1);
        expect(entry.backlinks[0]).toBe('target');

        // $addToSet prevents duplicate forward links
        const call = mockEntryModel.updateMany.mock.calls[0];
        expect(call[1].$addToSet).toBeDefined();
      });

      it('should throw when entry not found', async () => {
        mockEntryModel.findById.mockResolvedValue(null);

        await expect(
          service.updateLinks(new Types.ObjectId().toString(), mockWorkspaceId),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('Wikilink Extraction', () => {
    it('should extract single backlinks', async () => {
      const entry = {
        _id: new Types.ObjectId(),
        workspaceId: new Types.ObjectId(mockWorkspaceId),
        content: 'Reference to [[important-note]]',
        backlinks: [],
        slug: 'my-entry',
        save: jest.fn(),
        previousVersions: [],
      };

      mockEntryModel.findById.mockResolvedValue(entry);
      mockEntryModel.updateMany.mockResolvedValue({});

      await service.updateLinks(entry._id.toString(), mockWorkspaceId);

      expect(entry.backlinks).toContain('important-note');
    });

    it('should extract multiple backlinks', async () => {
      const entry = {
        _id: new Types.ObjectId(),
        workspaceId: new Types.ObjectId(mockWorkspaceId),
        content: 'See [[note-a]] and [[note-b]] and [[note-c]]',
        backlinks: [],
        slug: 'multi',
        save: jest.fn(),
        previousVersions: [],
      };

      mockEntryModel.findById.mockResolvedValue(entry);
      mockEntryModel.updateMany.mockResolvedValue({});

      await service.updateLinks(entry._id.toString(), mockWorkspaceId);

      expect(entry.backlinks).toEqual(
        expect.arrayContaining(['note-a', 'note-b', 'note-c']),
      );
    });

    it('should handle wikilink with display text', async () => {
      const entry = {
        _id: new Types.ObjectId(),
        workspaceId: new Types.ObjectId(mockWorkspaceId),
        content: 'Click [[target-note|here]] for more info',
        backlinks: [],
        slug: 'with-display',
        save: jest.fn(),
        previousVersions: [],
      };

      mockEntryModel.findById.mockResolvedValue(entry);
      mockEntryModel.updateMany.mockResolvedValue({});

      await service.updateLinks(entry._id.toString(), mockWorkspaceId);

      expect(entry.backlinks).toContain('target-note');
      expect(entry.backlinks).not.toContain('here');
    });

    it('should normalize slug format', async () => {
      const entry = {
        _id: new Types.ObjectId(),
        workspaceId: new Types.ObjectId(mockWorkspaceId),
        content: 'See [[My Important Note]] and [[UPPER CASE]]',
        backlinks: [],
        slug: 'test',
        save: jest.fn(),
        previousVersions: [],
      };

      mockEntryModel.findById.mockResolvedValue(entry);
      mockEntryModel.updateMany.mockResolvedValue({});

      await service.updateLinks(entry._id.toString(), mockWorkspaceId);

      expect(entry.backlinks).toContain('my-important-note');
      expect(entry.backlinks).toContain('upper-case');
    });
  });

  describe('Forward Links Management', () => {
    it('should update forward links via bulk operation', async () => {
      const entry = {
        _id: new Types.ObjectId(),
        workspaceId: new Types.ObjectId(mockWorkspaceId),
        content: 'See [[target-1]] and [[target-2]]',
        backlinks: [],
        slug: 'source-entry',
        save: jest.fn().mockResolvedValue({}),
        previousVersions: [],
      };

      mockEntryModel.findById.mockResolvedValue(entry);
      mockEntryModel.updateMany.mockResolvedValue({ modifiedCount: 2 });

      await service.updateLinks(entry._id.toString(), mockWorkspaceId);

      expect(mockEntryModel.updateMany).toHaveBeenCalledWith(
        {
          workspaceId: new Types.ObjectId(mockWorkspaceId),
          slug: { $in: ['target-1', 'target-2'] },
        },
        {
          $addToSet: { forwardlinks: 'source-entry' },
        },
      );
    });
  });

  describe('Performance Characteristics', () => {
    it('should have O(1) database queries for updateLinks', async () => {
      const entry = {
        _id: new Types.ObjectId(),
        workspaceId: new Types.ObjectId(mockWorkspaceId),
        content: '[[a]] [[b]] [[c]] [[d]] [[e]] [[f]] [[g]] [[h]]',
        backlinks: [],
        slug: 'many-links',
        save: jest.fn().mockResolvedValue({}),
        previousVersions: [],
      };

      mockEntryModel.findById.mockResolvedValue(entry);
      mockEntryModel.updateMany.mockResolvedValue({ modifiedCount: 8 });

      await service.updateLinks(entry._id.toString(), mockWorkspaceId);

      // Should only call:
      // 1. findById for entry
      // 2. save for entry
      // 3. updateMany for all forward links (ONE QUERY)
      expect(mockEntryModel.findById).toHaveBeenCalledTimes(1);
      expect(entry.save).toHaveBeenCalledTimes(1);
      expect(mockEntryModel.updateMany).toHaveBeenCalledTimes(1); // NOT 8!
    });
  });

  describe('Edge Cases', () => {
    it('should handle entries with no backlinks initially', async () => {
      const entry = {
        _id: new Types.ObjectId(),
        workspaceId: new Types.ObjectId(mockWorkspaceId),
        content: 'No wikilinks here',
        slug: 'no-links',
        save: jest.fn().mockResolvedValue({}),
        previousVersions: [],
      };

      mockEntryModel.findById.mockResolvedValue(entry);

      await service.updateLinks(entry._id.toString(), mockWorkspaceId);

      expect(entry.backlinks).toEqual([]);
    });

    it('should handle workspace-scoped backlink updates', async () => {
      const workspaceA = new Types.ObjectId().toString();
      const workspaceB = new Types.ObjectId().toString();

      const entry = {
        _id: new Types.ObjectId(),
        workspaceId: new Types.ObjectId(workspaceA),
        content: '[[shared-name]]',
        backlinks: [],
        slug: 'entry',
        save: jest.fn().mockResolvedValue({}),
        previousVersions: [],
      };

      mockEntryModel.findById.mockResolvedValue(entry);
      mockEntryModel.updateMany.mockResolvedValue({});

      await service.updateLinks(entry._id.toString(), workspaceA);

      // Verify workspace isolation
      expect(mockEntryModel.updateMany).toHaveBeenCalledWith(
        {
          workspaceId: new Types.ObjectId(workspaceA),
          slug: { $in: ['shared-name'] },
        },
        expect.anything(),
      );
    });
  });
});
