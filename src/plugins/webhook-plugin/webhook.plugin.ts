import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { OrderSubscriber } from './subscribers/order.subscriber';
import { WebhookService } from './services/webhook.service';
import { WebhookDelivery } from './entities/webhook-delivery.entity';

@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [
    OrderSubscriber,
    WebhookService,
  ],
  entities: [WebhookDelivery],

})
export class WebhookPlugin {}