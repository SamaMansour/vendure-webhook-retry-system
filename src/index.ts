import { bootstrap, runMigrations } from '@vendure/core';
import { config } from './vendure-config';
import { startWebhookWorker } from './plugins/webhook-plugin/processors/webhook.processor';
import { DataSource } from 'typeorm/data-source/DataSource';

runMigrations(config)
    .then(() => bootstrap(config))
    .then(app => {
        startWebhookWorker(app.get(DataSource));
    })
    .catch(err => {
        console.log(err);
    });
