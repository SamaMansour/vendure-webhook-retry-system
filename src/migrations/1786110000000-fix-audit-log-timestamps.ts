import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAuditLogTimestamps1786110000000 implements MigrationInterface {
    name = 'FixAuditLogTimestamps1786110000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'audit_log' AND column_name = 'created_at'
                ) AND NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'audit_log' AND column_name = 'createdAt'
                ) THEN
                    ALTER TABLE audit_log RENAME COLUMN created_at TO "createdAt";
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'audit_log' AND column_name = 'updated_at'
                ) AND NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'audit_log' AND column_name = 'updatedAt'
                ) THEN
                    ALTER TABLE audit_log RENAME COLUMN updated_at TO "updatedAt";
                END IF;
            END
            $$;
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_audit_log_created_at
            ON audit_log ("createdAt");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS idx_audit_log_created_at`);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'audit_log' AND column_name = 'createdAt'
                ) AND NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'audit_log' AND column_name = 'created_at'
                ) THEN
                    ALTER TABLE audit_log RENAME COLUMN "createdAt" TO created_at;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'audit_log' AND column_name = 'updatedAt'
                ) AND NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'audit_log' AND column_name = 'updated_at'
                ) THEN
                    ALTER TABLE audit_log RENAME COLUMN "updatedAt" TO updated_at;
                END IF;
            END
            $$;
        `);
    }
}
