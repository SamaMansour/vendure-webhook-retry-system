import { VendurePlugin, PluginCommonModule } from '@vendure/core';
import { Module } from '@nestjs/common';
import { InventoryReservation } from './entities/inventory-reservation.entity';
import { InventoryReservationResolver } from './api/inventory-reservation.resolver';
import { adminApiExtensions } from './api/api-extensions';
import { InventoryReservationService } from './services/inventory-reservation.service';
import { InventoryReleaseQueueHandler } from './queues/inventory.queue';
import { OrderSubscriber } from './subscribers/order.subscriber';

@VendurePlugin({
    imports: [PluginCommonModule],
    entities: [InventoryReservation],
    adminApiExtensions: {
        schema: adminApiExtensions as any,
        resolvers: [InventoryReservationResolver],
    },
    providers: [
        InventoryReservationService,
        InventoryReservationResolver,
        InventoryReleaseQueueHandler,
        OrderSubscriber,
    ],
    dashboard: './dashboard/index.tsx',
})
@Module({})
export class InventoryReservationPlugin {}
