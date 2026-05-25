import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class WebhookDelivery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  eventType: string;

  @Column()
  targetUrl: string;

  @Column('json')
  payload: any;

  @Column({
    default: 'pending',
  })
  status: string;

  @Column({
    default: 0,
  })
  retryCount: number;

  @Column({
    nullable: true,
  })
  lastError?: string;
}