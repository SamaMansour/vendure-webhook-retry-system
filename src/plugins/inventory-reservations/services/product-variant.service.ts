import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    ProductVariant,
    RequestContext,
    TransactionalConnection,
    StockLevel
} from '@vendure/core';
import { Repository } from 'typeorm';

import { InventoryReservation } from '../entities/inventory-reservation.entity';

@Injectable()
export class ProductVariantService {
    constructor(
        @InjectRepository(InventoryReservation)
        private readonly reservationRepository: Repository<InventoryReservation>,

        private readonly connection: TransactionalConnection,
    ) {}

    async getStockOnHand(
        ctx: RequestContext,
        productVariantId: number,
    ): Promise<number> {
        const variant = await this.connection
            .getRepository(ctx, StockLevel)
            .findOne({
                where: {
                    productVariantId: productVariantId,
                },
            });

        if (!variant) {
            throw new Error(
                `ProductVariant ${productVariantId} not found`,
            );
        }

        return variant.stockOnHand;
    }

    async getReservedQuantity(
        ctx: RequestContext,
        productVariantId: number,
    ): Promise<number> {
        const result = await this.reservationRepository
            .createQueryBuilder('reservation')
            .select('SUM(reservation.quantity)', 'total')
            .where(
                'reservation.productVariantId = :productVariantId',
                {
                    productVariantId,
                },
            )
            .andWhere('reservation.status = :status', {
                status: 'ACTIVE',
            })
            .getRawOne();

        return Number(result?.total || 0);
    }

     async completeReservation(
        reservationId: number,
    ): Promise<void> {
        await this.reservationRepository.update(
            {
                id: reservationId,
            },
            {
                status: 'COMPLETED',
            },
        );
    }

     async getAvailableStock(
        ctx: RequestContext,
        productVariantId: number,
    ): Promise<number> {
        const stockOnHand = await this.getStockOnHand(
            ctx,
            productVariantId,
        );

        const reservedQuantity =
            await this.getReservedQuantity(
                ctx,
                productVariantId,
            );

        return stockOnHand - reservedQuantity;
    }

   async validateAvailableStock(
        ctx: RequestContext,
        productVariantId: number,
        requestedQty: number,

        ): Promise<void> {
            const availableStock = await this.getAvailableStock(
                ctx,
                productVariantId,
        );
        if (availableStock < requestedQty) {
            throw new Error('Insufficient stock available');
        }


    }

    async releaseReservation(
        reservationId: number,
    ): Promise<void> {
        const reservation =
            await this.reservationRepository.findOne({
                where: {
                    id: reservationId,
                },
            });

        if (!reservation) {
            throw new Error(
                `Reservation ${reservationId} not found`,
            );
        }

        if (reservation.status !== 'ACTIVE') {
            return;
        }

        reservation.status = 'EXPIRED';

        await this.reservationRepository.save(
            reservation,
        );
    }


    async getActiveReservations(ctx: RequestContext) {
        return this.reservationRepository.find({
            where: {
                status: 'ACTIVE',
            },
            order: {
                createdAt: 'DESC',
            },
        });
    }

     
}
