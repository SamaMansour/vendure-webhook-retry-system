import { VendurePlugin, PluginCommonModule } from '@vendure/core';
import { Module } from '@nestjs/common';
import { OrderSubscriber } from './subscribers/order.subscriber';
import { AuditLog } from './entities/audit-log.entity';
import { AuditLogService } from './services/audit-log.service';
import { ProductSubscriber } from './subscribers/product.subscriber';
import { PaymentSubscriber } from './subscribers/payment.subscriber';
import { StockSubscriber } from './subscribers/stock.subscriber';
import { adminApiExtensions } from './api/api-extensions';
import { AuditLogResolver } from './api/audit-log.resolver';
import { AuditLogController } from './api/audit-log.controller';

@VendurePlugin({
    imports: [PluginCommonModule],
    entities: [AuditLog],
    adminApiExtensions: {
        schema: adminApiExtensions as any,
        resolvers: [AuditLogResolver],
    },
    controllers: [AuditLogController],
    providers: [
        AuditLogService,
        AuditLogResolver,
        OrderSubscriber,
        ProductSubscriber,
        PaymentSubscriber,
        StockSubscriber,
    ],
    dashboard: './dashboard/index.tsx',
})
@Module({})
export class AuditLogPlugin {}
