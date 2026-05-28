import { DeepPartial, VendureEntity } from '@vendure/core';
import { Column, Entity, Index } from 'typeorm';

export type InventoryReservationStatus = 'ACTIVE' | 'EXPIRED' | 'COMPLETED' | 'CANCELLED';

@Entity()
export class InventoryReservation extends VendureEntity {
    constructor(input?: DeepPartial<InventoryReservation>) {
        super(input);
    }

    @Index()
    @Column()
    orderId: number;

    @Column()
    orderCode: string;

    @Index()
    @Column()
    productVariantId: number;

    @Column()
    productVariantName: string;

    @Column()
    quantity: number;

    @Column()
    expiresAt: Date;

    @Index()
    @Column({
        type: 'varchar',
        default: 'ACTIVE',
    })
    status: InventoryReservationStatus;
}
