import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create Design Brief Handoff Schema
 *
 * Creates the database schema for ChatGPT → Claude design handoff integration.
 * Allows ChatGPT plugin to submit design briefs and assets to Claude for web design.
 *
 * Tables created:
 * - design_briefs: Design brief submissions from ChatGPT with status tracking
 * - design_brief_enums: Support enums for status and type
 */
export class CreateDesignBriefHandoff1727000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types for design briefs
    await queryRunner.query(`
      CREATE TYPE design_brief_status AS ENUM (
        'SUBMITTED',
        'ACKNOWLEDGED',
        'IN_PROGRESS',
        'REVIEW_REQUESTED',
        'COMPLETED',
        'REJECTED'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE design_type AS ENUM (
        'LANDING_PAGE',
        'DASHBOARD',
        'MOBILE_APP',
        'COMPONENT',
        'REDESIGN',
        'OTHER'
      )
    `);

    // Create design_briefs table
    await queryRunner.createTable(
      new Table({
        name: 'design_briefs',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'submittedBy',
            type: 'varchar',
            isNullable: true,
            comment: 'ChatGPT plugin identifier',
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'briefJson',
            type: 'jsonb',
            isNullable: true,
            comment: 'Full brief data from ChatGPT',
          },
          {
            name: 'designType',
            type: 'design_type',
            default: "'OTHER'",
            isNullable: false,
          },
          {
            name: 'status',
            type: 'design_brief_status',
            default: "'SUBMITTED'",
            isNullable: false,
          },
          {
            name: 'referenceImages',
            type: 'text[]',
            isNullable: true,
            comment: 'URLs to reference images',
          },
          {
            name: 'designAssets',
            type: 'text[]',
            isNullable: true,
            comment: 'URLs to design files',
          },
          {
            name: 'brandGuide',
            type: 'varchar',
            isNullable: true,
            comment: 'URL to brand guidelines',
          },
          {
            name: 'claudeNotes',
            type: 'text',
            isNullable: true,
            comment: 'Notes from Claude design work',
          },
          {
            name: 'claudeStatus',
            type: 'varchar',
            default: "'pending'",
            isNullable: true,
            comment: 'Who is working on it',
          },
          {
            name: 'claudeUrl',
            type: 'varchar',
            isNullable: true,
            comment: 'Link to Claude artifact/work',
          },
          {
            name: 'feedback',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'revision_count',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'completedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes on design_briefs table
    await queryRunner.createIndex(
      'design_briefs',
      new TableIndex({
        name: 'idx_design_briefs_userId',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createIndex(
      'design_briefs',
      new TableIndex({
        name: 'idx_design_briefs_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'design_briefs',
      new TableIndex({
        name: 'idx_design_briefs_designType',
        columnNames: ['designType'],
      }),
    );

    await queryRunner.createIndex(
      'design_briefs',
      new TableIndex({
        name: 'idx_design_briefs_created_at',
        columnNames: ['created_at'],
      }),
    );

    // Create foreign key for design_briefs
    await queryRunner.createForeignKey(
      'design_briefs',
      new TableForeignKey({
        name: 'fk_design_briefs_userId',
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    await queryRunner.dropForeignKey('design_briefs', 'fk_design_briefs_userId');

    // Drop indexes
    await queryRunner.dropIndex('design_briefs', 'idx_design_briefs_created_at');
    await queryRunner.dropIndex('design_briefs', 'idx_design_briefs_designType');
    await queryRunner.dropIndex('design_briefs', 'idx_design_briefs_status');
    await queryRunner.dropIndex('design_briefs', 'idx_design_briefs_userId');

    // Drop table
    await queryRunner.dropTable('design_briefs');

    // Drop enums
    await queryRunner.query(`DROP TYPE design_type`);
    await queryRunner.query(`DROP TYPE design_brief_status`);
  }
}
