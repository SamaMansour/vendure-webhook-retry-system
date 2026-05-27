import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { DataSource } from 'typeorm';

import { InventoryReservation } from '../entities/inventory-reservation.entity';
import { INVENTORY_RELEASE_QUEUE, ReleaseReservationJobData } from '../queues/inventory.queue';

export const startInventoryReleaseWorker = (dataSource: DataSource) => {
    const connection = new IORedis({
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
        maxRetriesPerRequest: null,
    });

    const worker = new Worker<ReleaseReservationJobData>(
        INVENTORY_RELEASE_QUEUE,
        async job => {
            await dataSource.transaction(async manager => {
                const reservationRepo = manager.getRepository(InventoryReservation);
                const reservation = await reservationRepo
                    .createQueryBuilder('reservation')
                    .setLock('pessimistic_write')
                    .where('reservation.id = :reservationId', {
                        reservationId: job.data.reservationId,
                    })
                    .getOne();

                if (!reservation || reservation.status !== 'ACTIVE') {
                    return;
                }

                reservation.status = 'EXPIRED';
                await reservationRepo.save(reservation);
            });
        },
        {
            connection,
            concurrency: Number(process.env.INVENTORY_RELEASE_CONCURRENCY ?? 5),
        },
    );

    worker.on('failed', (job, error) => {
        console.error(
            `Inventory release job ${job?.id ?? 'unknown'} failed after ${job?.attemptsMade ?? 0} attempts`,
            error,
        );
    });

    return worker;
};
