import { Injectable, OnModuleInit } from '@nestjs/common';
import {
    EventBus,
    StockMovementEvent,
    RequestContext,
} from '@vendure/core';

import { AuditLogService } from '../services/audit-log.service';

@Injectable()
export class StockSubscriber implements OnModuleInit {
    constructor(
        private readonly eventBus: EventBus,
        private readonly auditLogService: AuditLogService,
    ) {}

    onModuleInit() {
        this.eventBus
            .ofType(StockMovementEvent)
            .subscribe(async (event) => {
                for (const movement of event.stockMovements) {
                    await this.auditLogService.createLog({
                        userId: this.getUserId(event.ctx),

                        actionType: 'INVENTORY_UPDATED',

                        entityType: 'ProductVariant',

                        entityId: String(
                            movement.productVariant,
                        ),

                        oldValue: undefined,

                        newValue: {
                            stockMovementId: movement.id,
                            type: movement.type,
                            quantity: movement.quantity,
                            productVariantId:
                                movement.productVariant,
                        },
                    });
                }
            });
    }

    private getUserId(
        ctx: RequestContext,
    ): string {
        return ctx.activeUserId
            ? String(ctx.activeUserId)
            : 'system';
    }
}