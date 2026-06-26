import { VendurePlugin, PluginCommonModule } from '@vendure/core';
import { Module } from '@nestjs/common';
import { OrderSubscriber } from './subscribers/order.subscriber';
import { AuditLogService } from './services/audit-log.service';
import { InventoryReleaseQueueHandler } from '../inventory-reservations/queues/inventory.queue';
import { InventoryReservationService } from '../inventory-reservations/services/inventory-reservation.service';
import { adminApiExtensions } from '../inventory-reservations/api/api-extensions';
import { InventoryReservationResolver } from '../inventory-reservations/api/inventory-reservation.resolver';
import { InventoryReservation } from '../inventory-reservations/entities/inventory-reservation.entity';
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
