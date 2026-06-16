import { Injectable, OnModuleInit } from '@nestjs/common';
import {
    EventBus,
    ProductEvent,
    RequestContext,
} from '@vendure/core';

import { AuditLogService } from '../services/audit-log.service';

@Injectable()
export class ProductSubscriber implements OnModuleInit {
    constructor(
        private readonly eventBus: EventBus,
        private readonly auditLogService: AuditLogService,
    ) {}

    onModuleInit() {
        this.eventBus
            .ofType(ProductEvent)
            .subscribe(async (event) => {
                await this.handleProductEvent(event);
            });
    }

    private async handleProductEvent(
        event: ProductEvent,
    ): Promise<void> {
        const ctx = event.ctx;

        const actionType = this.getActionType(event);

        await this.auditLogService.createLog({
            userId: this.getUserId(ctx),
            actionType,
            entityType: 'Product',
            entityId: String(event.product.id),

            oldValue: undefined,

            newValue: {
                id: event.product.id,
                name:
                    event.product.translations?.[0]
                        ?.name,
                slug:
                    event.product.translations?.[0]
                        ?.slug,
                enabled:
                    event.product.enabled,
            },

            ipAddress:
                ctx.req?.ip ??
                ctx.req?.headers?.[
                    'x-forwarded-for'
                ]?.toString(),
        });
    }

    private getActionType(
        event: ProductEvent,
    ): string {
        switch (event.type) {
            case 'created':
                return 'PRODUCT_CREATED';

            case 'updated':
                return 'PRODUCT_UPDATED';

            case 'deleted':
                return 'PRODUCT_DELETED';

            default:
                return 'PRODUCT_CHANGED';
        }
    }

    private getUserId(
        ctx: RequestContext,
    ): string {
        return ctx.activeUserId
            ? String(ctx.activeUserId)
            : 'system';
    }
}