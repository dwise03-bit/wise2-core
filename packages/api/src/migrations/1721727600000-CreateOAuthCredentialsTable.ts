import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateOAuthCredentialsTable1721727600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ENUM type for OAuth providers
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'oauth_provider_enum'
        ) THEN
          CREATE TYPE oauth_provider_enum AS ENUM ('google', 'github', 'microsoft');
        END IF;
      END
      $$;
    `);

    // Create OAuth Credentials table
    await queryRunner.createTable(
      new Table({
        name: 'oauth_credentials',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'provider',
            type: 'oauth_provider_enum',
            isNullable: false,
          },
          {
            name: 'access_token',
            type: 'text',
            isNullable: false,
            comment: 'OAuth access token for API access',
          },
          {
            name: 'refresh_token',
            type: 'text',
            isNullable: true,
            comment: 'OAuth refresh token for token renewal',
          },
          {
            name: 'token_type',
            type: 'varchar',
            isNullable: true,
            comment: 'Token type (usually Bearer)',
          },
          {
            name: 'scopes',
            type: 'text',
            isNullable: true,
            comment: 'Space-separated OAuth scopes granted',
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
            comment: 'When the access token expires',
          },
          {
            name: 'provider_account_id',
            type: 'varchar',
            isNullable: true,
            comment: 'OAuth provider account ID/sub',
          },
          {
            name: 'account_name',
            type: 'varchar',
            isNullable: true,
            comment: 'Name of the connected account (e.g., email)',
          },
          {
            name: 'is_active',
            type: 'boolean',
            isNullable: false,
            default: true,
            comment: 'Whether this credential is active/valid',
          },
          {
            name: 'last_used_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'When the credential was last used',
          },
          {
            name: 'error_message',
            type: 'varchar',
            isNullable: true,
            comment: 'Error message if credential became invalid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'NOW()',
            isNullable: false,
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          }),
        ],
      }),
      true
    );

    // Create indexes for performance and unique constraint
    await queryRunner.createIndex(
      'oauth_credentials',
      new TableIndex({
        name: 'idx_oauth_credentials_user_provider',
        columnNames: ['user_id', 'provider'],
        isUnique: true,
      })
    );

    await queryRunner.createIndex(
      'oauth_credentials',
      new TableIndex({
        name: 'idx_oauth_credentials_provider',
        columnNames: ['provider'],
      })
    );

    await queryRunner.createIndex(
      'oauth_credentials',
      new TableIndex({
        name: 'idx_oauth_credentials_expires_at',
        columnNames: ['expires_at'],
      })
    );

    await queryRunner.createIndex(
      'oauth_credentials',
      new TableIndex({
        name: 'idx_oauth_credentials_is_active',
        columnNames: ['is_active'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop table
    await queryRunner.dropTable('oauth_credentials', true);

    // Drop ENUM type
    await queryRunner.query('DROP TYPE IF EXISTS oauth_provider_enum;');
  }
}
