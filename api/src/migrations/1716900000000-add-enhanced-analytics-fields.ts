import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEnhancedAnalyticsFields1716900000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to analytics table for enhanced tracking
    await queryRunner.query(`
      ALTER TABLE analytics
      ADD COLUMN IF NOT EXISTS country VARCHAR,
      ADD COLUMN IF NOT EXISTS city VARCHAR,
      ADD COLUMN IF NOT EXISTS source VARCHAR,
      ADD COLUMN IF NOT EXISTS browser VARCHAR,
      ADD COLUMN IF NOT EXISTS os VARCHAR,
      ADD COLUMN IF NOT EXISTS device VARCHAR
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert by dropping the added columns
    await queryRunner.query(`
      ALTER TABLE analytics
      DROP COLUMN IF EXISTS country,
      DROP COLUMN IF EXISTS city,
      DROP COLUMN IF EXISTS source,
      DROP COLUMN IF EXISTS browser,
      DROP COLUMN IF EXISTS os,
      DROP COLUMN IF EXISTS device
    `);
  }
}
