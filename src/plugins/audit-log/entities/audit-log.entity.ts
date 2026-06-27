import { DeepPartial, VendureEntity } from '@vendure/core';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class AuditLog extends VendureEntity {
    constructor(input?: DeepPartial<AuditLog>) {
        super(input);
    }

    @Column()
    userId: string;

    @Column()
    actionType: string;

    @Column()
    entityType: string;

    @Column()
    entityId: string;

   @Column({
    type: 'jsonb',
    nullable: true,
})
oldValue: Record<string, any> | null;

@Column({
    type: 'jsonb',
    nullable: true,
})
newValue: Record<string, any> | null;
    @Column({
        nullable: true,
    })
    ipAddress: string;
}
