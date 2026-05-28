import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

export interface ReleaseReservationJobData {
    reservationId: number;
}

export const INVENTORY_RELEASE_QUEUE = 'inventory-release-queue';

@Injectable()
export class InventoryReleaseQueueHandler implements OnModuleDestroy {
    private readonly logger = new Logger(InventoryReleaseQueueHandler.name);
    private readonly connection = new IORedis({
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
        maxRetriesPerRequest: null,
    });
    private readonly queue = new Queue<ReleaseReservationJobData>(INVENTORY_RELEASE_QUEUE, {
        connection: this.connection,
    });

    async addReleaseJob(reservationId: number, delayMs = 15 * 60 * 1000) {
        await this.queue.add(
            'release-reservation',
            { reservationId },
            {
                delay: delayMs,
                attempts: 5,
                backoff: {
                    type: 'exponential',
                    delay: 3000,
                },
                removeOnComplete: true,
            },
        );

        this.logger.log(`Release job added for reservation ${reservationId}`);
    }

    async onModuleDestroy() {
        await this.queue.close();
        await this.connection.quit();
    }
}
