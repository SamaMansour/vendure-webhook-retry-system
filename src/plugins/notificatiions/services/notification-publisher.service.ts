import { Injectable } from '@nestjs/common';

import { notificationQueue }
from '../queues/notification.queue';

@Injectable()
export class NotificationPublisherService {
  async publish(data: {
    template: string;

    recipient: string;

    payload: Record<string, unknown>;
  }) {
    await notificationQueue.add(
      'send-notification',

      data,

      {
        attempts: 5,

        backoff: {
          type: 'exponential',
          delay: 3000,
        },
      },
    );
  }
}