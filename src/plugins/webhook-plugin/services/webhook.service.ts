import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  private readonly queue: Queue;

  constructor() {
    const connection = new IORedis({
      host: 'localhost',
      port: 6379,
    });

    this.queue = new Queue('webhook-queue', {
      connection,
    });
  }

  async enqueueWebhook(data: {
    type: string;
    payload: any;
  }) {
    this.logger.log(`Enqueue webhook: ${data.type}`);

    await this.queue.add(
      'send-webhook',
      {
        ...data,
        targetUrl: 'http://localhost:4000/webhook',
      },
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
        removeOnComplete: true,
      },
    );
  }
}