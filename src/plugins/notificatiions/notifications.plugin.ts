import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { OrderSubscriber } from './subscribers/order.subscriber';
import { NotificationPublisherService } from './services/notification-publisher.service';

@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [
    OrderSubscriber,
    NotificationPublisherService,
  ],

})
export class NotificationPlugin {}