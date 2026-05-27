import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBus, OrderPlacedEvent, PaymentStateTransitionEvent } from '@vendure/core';

import { InventoryReleaseQueueHandler } from '../queues/inventory.queue';
import { InventoryReservationService } from '../services/inventory-reservation.service';

@Injectable()
export class OrderSubscriber implements OnModuleInit {
  constructor(
    private eventBus: EventBus,
    private inventoryReservationService: InventoryReservationService,
    private inventoryReleaseQueueHandler: InventoryReleaseQueueHandler,
  ) {}

  onModuleInit() {
    this.eventBus
      .ofType(OrderPlacedEvent)
      .subscribe(async (event) => {
        for (const line of event.order.lines) {
          const reservation = await this.inventoryReservationService.reserveStock({
            ctx: event.ctx,
            orderId: Number(event.order.id),
            orderCode: event.order.code,
            productVariantId: Number(line.productVariant.id),
            productVariantName: line.productVariant.name,
            quantity: line.quantity,
          });

          await this.inventoryReleaseQueueHandler.addReleaseJob(
            reservation.id as number,
            Math.max(reservation.expiresAt.getTime() - Date.now(), 0),
          );
        }
      });

    this.eventBus
      .ofType(PaymentStateTransitionEvent)
      .subscribe(async event => {
        if (event.toState !== 'Settled') {
          return;
        }

        await this.inventoryReservationService.completeReservationsForOrder(
          event.ctx,
          Number(event.order.id),
        );
      });
  }
}
