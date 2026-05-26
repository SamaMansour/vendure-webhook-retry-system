import { VendurePlugin, PluginCommonModule } from '@vendure/core';
import { Module } from '@nestjs/common';
import { InventoryReservation } from './entities/inventory-reservation.entity';

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [],
    exports: [],
    entities: [InventoryReservation]
})
@Module({})
export class InventoryReservationPlugin {}