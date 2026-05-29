import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  EventBus,
  OrderPlacedEvent,
} from '@vendure/core';
    
import { NotificationPublisherService } from '../services/notification-publisher.service';
@Injectable()
export class OrderSubscriber implements OnModuleInit {
  constructor(
    private eventBus: EventBus,
    private notificationPublisherService: NotificationPublisherService,
  ) {}

  onModuleInit() {
    this.eventBus
      .ofType(OrderPlacedEvent)
      .subscribe(async (event) => {
        console.log('Order placed event triggered');

        await this.notificationPublisherService.publish({
          template: 'order.placed',

          recipient:
            event.order.customer?.emailAddress ??
            'sma302000@gmail.com',

          payload: {
            customerName:
              event.order.customer?.firstName,

            orderNumber:
              event.order.code,
          },
        });
      });
  }
}