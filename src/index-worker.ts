import { bootstrapWorker } from '@vendure/core';
import { config } from './vendure-config';
import { DataSource } from 'typeorm';
import { startInventoryReleaseWorker } from './plugins/inventory-reservations/processors/inventory.processor';

bootstrapWorker(config)
    .then(async worker => {
        startInventoryReleaseWorker(worker.app.get(DataSource));
        return worker.startJobQueue();
    })
    .catch(err => {
        console.log(err);
    });
