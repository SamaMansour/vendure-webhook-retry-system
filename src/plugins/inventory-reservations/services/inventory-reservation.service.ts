import { Injectable } from '@nestjs/common';
import {
    ListQueryOptions,
    ListQueryBuilder,
    PaginatedList,
    RequestContext,
    StockLevel,
    TransactionalConnection,
} from '@vendure/core';

import {
    InventoryReservation,
    InventoryReservationStatus,
} from '../entities/inventory-reservation.entity';

export interface ReserveStockInput {
    ctx: RequestContext;
    orderId: number;
    orderCode: string;
    productVariantId: number;
    productVariantName: string;
    quantity: number;
    ttlMs?: number;
}

@Injectable()
export class InventoryReservationService {
    constructor(
        private readonly connection: TransactionalConnection,
        private readonly listQueryBuilder: ListQueryBuilder,
    ) {}

    async reserveStock(input: ReserveStockInput): Promise<InventoryReservation> {
        const ttlMs = input.ttlMs ?? 15 * 60 * 1000;

        return this.connection.withTransaction(input.ctx, async ctx => {
            const stockRepo = this.connection.getRepository(ctx, StockLevel);
            const reservationRepo = this.connection.getRepository(ctx, InventoryReservation);

            const stockLevels = await stockRepo
                .createQueryBuilder('stockLevel')
                .setLock('pessimistic_write')
                .where('stockLevel.productVariantId = :productVariantId', {
                    productVariantId: input.productVariantId,
                })
                .getMany();

            const saleableStock = stockLevels.reduce(
                (total, stockLevel) => total + stockLevel.stockOnHand - stockLevel.stockAllocated,
                0,
            );

            const activeReservations = await reservationRepo
                .createQueryBuilder('reservation')
                .select('COALESCE(SUM(reservation.quantity), 0)', 'quantity')
                .where('reservation.productVariantId = :productVariantId', {
                    productVariantId: input.productVariantId,
                })
                .andWhere('reservation.status = :status', {
                    status: 'ACTIVE',
                })
                .getRawOne<{ quantity: string }>();

            const availableStock = saleableStock - Number(activeReservations?.quantity ?? 0);

            if (availableStock < input.quantity) {
                throw new Error(
                    `Insufficient stock available for ProductVariant ${input.productVariantId}`,
                );
            }

            return reservationRepo.save(
                new InventoryReservation({
                    orderId: input.orderId,
                    orderCode: input.orderCode,
                    productVariantId: input.productVariantId,
                    productVariantName: input.productVariantName,
                    quantity: input.quantity,
                    expiresAt: new Date(Date.now() + ttlMs),
                    status: 'ACTIVE',
                }),
            );
        });
    }

    async releaseReservation(ctx: RequestContext, reservationId: number): Promise<void> {
        await this.connection.withTransaction(ctx, async txCtx => {
            const reservationRepo = this.connection.getRepository(txCtx, InventoryReservation);
            const reservation = await reservationRepo
                .createQueryBuilder('reservation')
                .setLock('pessimistic_write')
                .where('reservation.id = :reservationId', { reservationId })
                .getOne();

            if (!reservation || reservation.status !== 'ACTIVE') {
                return;
            }

            reservation.status = 'EXPIRED';
            await reservationRepo.save(reservation);
        });
    }

    async completeReservationsForOrder(ctx: RequestContext, orderId: number): Promise<void> {
        await this.connection.withTransaction(ctx, async txCtx => {
            await this.connection
                .getRepository(txCtx, InventoryReservation)
                .createQueryBuilder()
                .update(InventoryReservation)
                .set({ status: 'COMPLETED' })
                .where('orderId = :orderId', { orderId })
                .andWhere('status = :status', { status: 'ACTIVE' })
                .execute();
        });
    }

    async findAll(
        ctx: RequestContext,
        options?: ListQueryOptions<InventoryReservation>,
        status?: InventoryReservationStatus,
    ): Promise<PaginatedList<InventoryReservation>> {
        const [items, totalItems] = await this.listQueryBuilder
            .build(InventoryReservation, options, {
                ctx,
                where: status ? { status } : undefined,
                orderBy: { createdAt: 'DESC' },
            })
            .getManyAndCount();

        return { items, totalItems };
    }
}
