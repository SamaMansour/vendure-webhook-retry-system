import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInventoryReservation1764210000000 implements MigrationInterface {
    name = 'AddInventoryReservation1764210000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "inventory_reservation" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "id" SERIAL NOT NULL,
                "orderId" integer NOT NULL,
                "orderCode" character varying NOT NULL,
                "productVariantId" integer NOT NULL,
                "productVariantName" character varying NOT NULL,
                "quantity" integer NOT NULL,
                "expiresAt" TIMESTAMP NOT NULL,
                "status" character varying NOT NULL DEFAULT 'ACTIVE',
                CONSTRAINT "PK_inventory_reservation_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_inventory_reservation_order_id"
            ON "inventory_reservation" ("orderId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_inventory_reservation_product_variant_id"
            ON "inventory_reservation" ("productVariantId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_inventory_reservation_status"
            ON "inventory_reservation" ("status")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_inventory_reservation_status"`);
        await queryRunner.query(`DROP INDEX "IDX_inventory_reservation_product_variant_id"`);
        await queryRunner.query(`DROP INDEX "IDX_inventory_reservation_order_id"`);
        await queryRunner.query(`DROP TABLE "inventory_reservation"`);
    }
}
