import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { OrderSubscriber } from './subscribers/order.subscriber';
import { WebhookService } from './services/webhook.service';


@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [
    OrderSubscriber,
    WebhookService,
  ],
})
export class WebhookPlugin {}