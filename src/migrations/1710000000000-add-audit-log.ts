import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuditLog1710000000000
  implements MigrationInterface
{
  name = 'AddAuditLog1710000000000';

  public async up(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE audit_log (
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        action_type VARCHAR(255) NOT NULL,
        entity_type VARCHAR(255) NOT NULL,
        entity_id VARCHAR(255) NOT NULL,
        old_value JSONB,
        new_value JSONB,
        ip_address VARCHAR(255)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_audit_log_action_type
      ON audit_log(action_type);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_audit_log_entity_type
      ON audit_log(entity_type);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_audit_log_created_at
      ON audit_log("createdAt");
    `);
  }

  public async down(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.query(
      `DROP TABLE audit_log`,
    );
  }
}
