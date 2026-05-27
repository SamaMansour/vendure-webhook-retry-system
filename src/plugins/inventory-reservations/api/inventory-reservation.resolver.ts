import { Args, Query, Resolver } from '@nestjs/graphql';

import { Allow, Permission, RequestContext, Ctx } from '@vendure/core';

import { InventoryReservationStatus } from '../entities/inventory-reservation.entity';
import { InventoryReservationService } from '../services/inventory-reservation.service';

@Resolver()
export class InventoryReservationResolver {
    constructor(
        private readonly inventoryReservationService: InventoryReservationService,
    ) {}

    @Query()
    @Allow(Permission.SuperAdmin)
    async inventoryReservations(
        @Ctx() ctx: RequestContext,
        @Args() args: { options?: any; status?: InventoryReservationStatus },
    ) {
        return this.inventoryReservationService.findAll(
                ctx,
                args.options,
                args.status,
            );
    }
}
