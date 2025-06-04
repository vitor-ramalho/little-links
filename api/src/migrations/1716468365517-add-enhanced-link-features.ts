import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEnhancedLinkFeatures1716468365517
  implements MigrationInterface
{
  name = 'AddEnhancedLinkFeatures1716468365517';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if columns exist before adding them
    const checkColumnExists = async (
      tableName: string,
      columnName: string,
    ): Promise<boolean> => {
      const columns = (await queryRunner.query(
        'SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2',
        [tableName, columnName],
      )) as { column_name: string }[];
      return Array.isArray(columns) && columns.length > 0;
    };

    // Add custom_slug column if it doesn't exist
    if (!(await checkColumnExists('links', 'custom_slug'))) {
      await queryRunner.query(
        'ALTER TABLE "links" ADD "custom_slug" character varying',
      );
    }

    // Add expires_at column if it doesn't exist
    if (!(await checkColumnExists('links', 'expires_at'))) {
      await queryRunner.query('ALTER TABLE "links" ADD "expires_at" TIMESTAMP');
    }

    // Add max_clicks column if it doesn't exist
    if (!(await checkColumnExists('links', 'max_clicks'))) {
      await queryRunner.query('ALTER TABLE "links" ADD "max_clicks" integer');
    }

    // Add password column if it doesn't exist
    if (!(await checkColumnExists('links', 'password'))) {
      await queryRunner.query(
        'ALTER TABLE "links" ADD "password" character varying',
      );
    }

    // Add tags column if it doesn't exist
    if (!(await checkColumnExists('links', 'tags'))) {
      await queryRunner.query('ALTER TABLE "links" ADD "tags" text');
    }

    // Add qr_code_path column if it doesn't exist
    if (!(await checkColumnExists('links', 'qr_code_path'))) {
      await queryRunner.query(
        'ALTER TABLE "links" ADD "qr_code_path" character varying',
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove all added columns
    await queryRunner.query('ALTER TABLE "links" DROP COLUMN "qr_code_path"');
    await queryRunner.query('ALTER TABLE "links" DROP COLUMN "tags"');
    await queryRunner.query('ALTER TABLE "links" DROP COLUMN "password"');
    await queryRunner.query('ALTER TABLE "links" DROP COLUMN "max_clicks"');
    await queryRunner.query('ALTER TABLE "links" DROP COLUMN "expires_at"');
    await queryRunner.query('ALTER TABLE "links" DROP COLUMN "custom_slug"');
  }
}
