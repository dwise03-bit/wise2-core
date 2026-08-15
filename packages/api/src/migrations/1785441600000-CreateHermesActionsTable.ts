import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateHermesActionsTable1785441600000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'hermes_actions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          { name: 'tenant_user_id', type: 'uuid' },
          { name: 'mode', type: 'varchar', length: '32' },
          { name: 'kind', type: 'varchar', length: '80' },
          { name: 'risk', type: 'varchar', length: '16' },
          { name: 'status', type: 'varchar', length: '32' },
          { name: 'title', type: 'text' },
          { name: 'summary', type: 'text', isNullable: true },
          { name: 'evidence', type: 'jsonb', default: "'[]'::jsonb" },
          { name: 'payload', type: 'jsonb', default: "'{}'::jsonb" },
          { name: 'requires_approval', type: 'boolean', default: false },
          { name: 'approved_by', type: 'uuid', isNullable: true },
          { name: 'approved_at', type: 'timestamp', isNullable: true },
          { name: 'rejected_by', type: 'uuid', isNullable: true },
          { name: 'rejected_at', type: 'timestamp', isNullable: true },
          { name: 'decision_note', type: 'text', isNullable: true },
          { name: 'executed_at', type: 'timestamp', isNullable: true },
          { name: 'error_message', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'NOW()' },
          { name: 'updated_at', type: 'timestamp', default: 'NOW()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'hermes_actions',
      new TableForeignKey({
        name: 'fk_hermes_actions_tenant_user',
        columnNames: ['tenant_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'hermes_actions',
      new TableIndex({
        name: 'idx_hermes_actions_tenant_status_created',
        columnNames: ['tenant_user_id', 'status', 'created_at'],
      }),
    );
    await queryRunner.createIndex(
      'hermes_actions',
      new TableIndex({
        name: 'idx_hermes_actions_tenant_mode_created',
        columnNames: ['tenant_user_id', 'mode', 'created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('hermes_actions', true);
  }
}
