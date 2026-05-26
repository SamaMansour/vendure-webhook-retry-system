import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBus, OrderPlacedEvent } from '@vendure/core';
import { InventoryReservationService } from '../services/inventory-reservation.service';

@Injectable()
export class OrderSubscriber implements OnModuleInit {
  constructor(
    private eventBus: EventBus,
    private inventoryReservationService: InventoryReservationService,
  ) {}

  onModuleInit() {
    this.eventBus
      .ofType(OrderPlacedEvent)
      .subscribe(async (event) => {
        for (const line of event.order.lines) {
          await this.inventoryReservationService.reserveStock(
            String(line.productVariant.id),
            line.quantity
          );
        }
      });
  }
}