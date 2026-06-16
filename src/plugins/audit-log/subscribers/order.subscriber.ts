import { Injectable, OnModuleInit } from '@nestjs/common';
import {
    EventBus,
    OrderEvent,
    RequestContext,
} from '@vendure/core';

import { AuditLogService } from '../services/audit-log.service';

@Injectable()
export class OrderSubscriber implements OnModuleInit {
    constructor(
        private readonly eventBus: EventBus,
        private readonly auditLogService: AuditLogService,
    ) {}

    onModuleInit() {
        this.eventBus
            .ofType(OrderEvent)
            .subscribe(async (event) => {
                await this.handleOrderEvent(event);
            });
    }

    private async handleOrderEvent(
        event: OrderEvent,
    ): Promise<void> {
        const ctx = event.ctx;

        await this.auditLogService.createLog({
            userId: this.getUserId(ctx),
            actionType: 'ORDER_UPDATED',
            entityType: 'Order',
            entityId: String(event.order.id),

            oldValue: undefined,

            newValue: {
                id: event.order.id,
                code: event.order.code,
                customerId: event.order.customerId,
                total: event.order.total,
                state: event.order.state,
            },
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