import { DeepPartial, VendureEntity } from '@vendure/core';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class AuditLog extends VendureEntity {
    constructor(input?: DeepPartial<AuditLog>) {
        super(input);
    }

    @Index()
    @Column({ name: 'user_id' })
    userId: string;

    @Index()
    @Column({ name: 'action_type' })
    actionType: string;

    @Index()
    @Column({ name: 'entity_type' })
    entityType: string;

    @Index()
    @Column({ name: 'entity_id' })
    entityId: string;

    @Column({
        name: 'old_value',
        type: 'jsonb',
        nullable: true,
    })
    oldValue: Record<string, any> | null;

    @Column({
        name: 'new_value',
        type: 'jsonb',
        nullable: true,
    })
    newValue: Record<string, any> | null;

    @Column({
        name: 'ip_address',
        nullable: true,
    })
    ipAddress: string | null;
}
