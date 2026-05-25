import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import axios from 'axios';
import { DataSource } from 'typeorm';

import { WebhookDelivery } from '../entities/webhook-delivery.entity';

export const startWebhookWorker = (dataSource: DataSource) => {
  const connection = new IORedis({
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: null,
  });

  const worker = new Worker(
    'webhook-queue',
    async (job) => {
      const repo = dataSource.getRepository(WebhookDelivery);

      const webhook = await repo.findOneBy({
        id: job.data.webhookId,
      });

      if (!webhook) {
        return;
      }

      try {
        console.log('Sending webhook');

        await axios.post(
          webhook.targetUrl,
          webhook.payload,
        );

        webhook.status = 'success';

        await repo.save(webhook);

        console.log('Webhook success');
      } catch (error: any) {
        webhook.retryCount += 1;
        webhook.lastError = error.message;
        webhook.status = 'failed';

        await repo.save(webhook);

        console.log('Webhook failed');

        throw error;
      }
    },
    {
      connection,
    },
  );

  worker.on('failed', (job) => {
    console.log('Retrying webhook...', job?.attemptsMade);
  });
};