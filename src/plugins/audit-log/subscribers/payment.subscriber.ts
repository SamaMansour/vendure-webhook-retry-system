import { Injectable, OnModuleInit } from '@nestjs/common';
import {
    EventBus,
    PaymentStateTransitionEvent,
    RequestContext,
} from '@vendure/core';

import { AuditLogService } from '../services/audit-log.service';

@Injectable()
export class PaymentSubscriber implements OnModuleInit {
    constructor(
        private readonly eventBus: EventBus,
        private readonly auditLogService: AuditLogService,
    ) {}

    onModuleInit() {
        this.eventBus
            .ofType(PaymentStateTransitionEvent)
            .subscribe(async (event) => {
                await this.auditLogService.createLog({
                    userId: this.getUserId(event.ctx),

                    actionType: 'PAYMENT_STATE_CHANGED',

                    entityType: 'Payment',

                    entityId: String(event.payment.id),

                    oldValue: {
                        state: event.fromState,
                    },

                    newValue: {
                        state: event.toState,
                    },
                });
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