import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  EventBus,
  OrderPlacedEvent,
} from '@vendure/core';

import { WebhookService } from '../services/webhook.service';

@Injectable()
export class OrderSubscriber implements OnModuleInit {
  constructor(
    private eventBus: EventBus,
    private webhookService: WebhookService,
  ) {}

  onModuleInit() {
    this.eventBus
      .ofType(OrderPlacedEvent)
      .subscribe(async (event) => {
        console.log('Order placed event triggered');

        await this.webhookService.enqueueWebhook({
          type: 'order.placed',
          payload: {
            orderCode: event.order.code,
            total: event.order.total,
          },
        });
      });
  }
}